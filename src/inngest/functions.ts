import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "@/features/executions/lib/topological-sort";
import { createExecutionContext, type TriggerData } from "@/features/executions/lib/context";
import { executeNode } from "@/features/executions/lib/executors";
import { ExecutionStatus } from "@/generated/prisma/enums";

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

    // Per-node progress, mirrored onto the Execution row so the editor can show
    // live status by polling. Kept in memory and written on each transition.
    const nodeStatuses: Record<string, string> = {};

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

    // Open an execution record so the run is visible in history while it runs
    const execution = await step.run("create-execution", async () => {
      return prisma.execution.create({
        data: {
          workflowId,
          userId,
          status: ExecutionStatus.RUNNING,
          triggerType: triggerData?.type ?? "manual",
        },
        select: { id: true },
      });
    });

    // Write the current progress map. Never let a status write break the run —
    // the execution's own status/output remain the source of truth.
    const writeStatuses = async (label: string) => {
      try {
        await step.run(label, async () => {
          await prisma.execution.update({
            where: { id: execution.id },
            data: { nodeStatuses: { ...nodeStatuses } },
            select: { id: true },
          });
          return null;
        });
      } catch (statusError) {
        console.warn("Failed to write node statuses", statusError);
      }
    };

    // Sort nodes topologically
    const sortedNodes = await step.run("sort-nodes", async () => {
      return topologicalSort(workflow.nodes, workflow.connections);
    });

    // Execute each node in order, accumulating results
    // Results are stored by variable name (or node ID as fallback)
    const results: Record<string, unknown> = {};

    // Tracks which node was in flight when a throw happened, so the editor can
    // mark that specific node as failed rather than leaving it spinning.
    let currentNodeId: string | null = null;

    try {
      for (const node of sortedNodes) {
        // Create a fresh context for each step with accumulated results
        // This is necessary because Inngest serializes state between steps
        const context = createExecutionContext(workflowId, userId, triggerData);

        // Restore previous outputs to the context
        for (const [key, value] of Object.entries(results)) {
          context.setOutput(key, value);
        }

        currentNodeId = node.id;
        nodeStatuses[node.id] = "loading";
        await writeStatuses(`status-loading-${node.id}`);

        const output = await step.run(`execute-${node.type}-${node.id}`, async () => {
          return executeNode(node, context);
        });

        nodeStatuses[node.id] = "success";
        await writeStatuses(`status-success-${node.id}`);

        // Store result using variable name as key
        const contextKey = getContextKey(node);
        results[contextKey] = output;
      }
    } catch (error) {
      // Record the failure before letting Inngest mark the run as failed.
      // Without this the only trace of a failed run is the Inngest dashboard.
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;

      if (currentNodeId) {
        nodeStatuses[currentNodeId] = "error";
      }

      await step.run("record-failure", async () => {
        return prisma.execution.update({
          where: { id: execution.id },
          data: {
            status: ExecutionStatus.FAILED,
            error: message,
            stack: stack ?? null,
            output: results as object,
            nodeStatuses: { ...nodeStatuses },
            completedAt: new Date(),
          },
          select: { id: true },
        });
      });

      throw error;
    }

    await step.run("record-success", async () => {
      return prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: ExecutionStatus.SUCCESS,
          output: results as object,
          nodeStatuses: { ...nodeStatuses },
          completedAt: new Date(),
        },
        select: { id: true },
      });
    });

    return {
      workflowId,
      executionId: execution.id,
      executedNodes: sortedNodes.length,
      results,
    };
  }
);

// Export all functions for Inngest serve
export const functions = [executeWorkflow];
