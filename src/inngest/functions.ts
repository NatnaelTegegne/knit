import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "@/features/executions/lib/topological-sort";
import { createExecutionContext, type TriggerData } from "@/features/executions/lib/context";
import { executeNode } from "@/features/executions/lib/executors";

// Define event types
type ExecuteWorkflowEvent = {
  name: "workflow/execute";
  data: {
    workflowId: string;
    userId: string;
    triggerData?: TriggerData;
  };
};

// Base node data interface for extracting variable name
interface BaseNodeData {
  variableName?: string;
}

// Get the context key for a node (variable name or fallback to node ID)
function getContextKey(node: { id: string; data: unknown }): string {
  const data = node.data as BaseNodeData;
  return data.variableName || node.id;
}

// Execute a workflow
export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: 0, // Don't retry failed executions automatically
    triggers: [{ event: "workflow/execute" }],
  },
  async ({ event, step }: { event: ExecuteWorkflowEvent; step: any }) => {
    const { workflowId, userId, triggerData } = event.data;

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

    // Execute each node in order, accumulating results
    // Results are stored by variable name (or node ID as fallback)
    const results: Record<string, unknown> = {};

    for (const node of sortedNodes) {
      // Create a fresh context for each step with accumulated results
      // This is necessary because Inngest serializes state between steps
      const context = createExecutionContext(workflowId, userId, triggerData);

      // Restore previous outputs to the context
      for (const [key, value] of Object.entries(results)) {
        context.setOutput(key, value);
      }

      const output = await step.run(`execute-${node.type}-${node.id}`, async () => {
        return executeNode(node, context);
      });

      // Store result using variable name as key
      const contextKey = getContextKey(node);
      results[contextKey] = output;
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
