import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "@/features/executions/lib/topological-sort";
import { createExecutionContext } from "@/features/executions/lib/context";
import { executeNode } from "@/features/executions/lib/executors";

// Define event types
type ExecuteWorkflowEvent = {
  name: "workflow/execute";
  data: {
    workflowId: string;
    userId: string;
  };
};

// Execute a workflow
export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: 0, // Don't retry failed executions automatically
    triggers: [{ event: "workflow/execute" }],
  },
  async ({ event, step }: { event: ExecuteWorkflowEvent; step: any }) => {
    const { workflowId, userId } = event.data;

    // Fetch workflow with nodes and connections
    const workflow = await step.run("fetch-workflow", async () => {
      const wf = await prisma.workflow.findUnique({
        where: { id: workflowId },
        include: {
          nodes: true,
          connections: true,
        },
      });

      if (!wf) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      if (wf.userId !== userId) {
        throw new Error("Not authorized to execute this workflow");
      }

      return wf;
    });

    // Sort nodes topologically
    const sortedNodes = await step.run("sort-nodes", async () => {
      return topologicalSort(workflow.nodes, workflow.connections);
    });

    // Create execution context
    const context = createExecutionContext(workflowId, userId);

    // Execute each node in order
    const results: Record<string, unknown> = {};

    for (const node of sortedNodes) {
      const output = await step.run(`execute-${node.type}-${node.id}`, async () => {
        return executeNode(node, context);
      });

      results[node.id] = output;
      // Update context for subsequent nodes
      context.setOutput(node.id, output);
    }

    return {
      workflowId,
      executedNodes: sortedNodes.length,
      results,
    };
  }
);

// Export all functions for Inngest serve
export const functions = [executeWorkflow];
