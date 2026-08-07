// Execution context shared between nodes during workflow execution
export interface ExecutionContext {
  // Workflow metadata
  workflowId: string;
  userId: string;

  // Node outputs stored by variable name (or node ID as fallback)
  nodeOutputs: Record<string, unknown>;

  // Add output from a node using its variable name
  setOutput: (key: string, output: unknown) => void;

  // Get output from a previous node by variable name
  getOutput: (key: string) => unknown;

  // Get all outputs (for templating)
  getAllOutputs: () => Record<string, unknown>;
}

export function createExecutionContext(
  workflowId: string,
  userId: string
): ExecutionContext {
  const nodeOutputs: Record<string, unknown> = {};

  return {
    workflowId,
    userId,
    nodeOutputs,
    setOutput: (key: string, output: unknown) => {
      nodeOutputs[key] = output;
    },
    getOutput: (key: string) => {
      return nodeOutputs[key];
    },
    getAllOutputs: () => ({ ...nodeOutputs }),
  };
}
