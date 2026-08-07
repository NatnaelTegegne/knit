// Execution context shared between nodes during workflow execution
export interface ExecutionContext {
  // Workflow metadata
  workflowId: string;
  userId: string;

  // Node outputs stored by node ID
  nodeOutputs: Record<string, unknown>;

  // Add output from a node
  setOutput: (nodeId: string, output: unknown) => void;

  // Get output from a previous node
  getOutput: (nodeId: string) => unknown;
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
    setOutput: (nodeId: string, output: unknown) => {
      nodeOutputs[nodeId] = output;
    },
    getOutput: (nodeId: string) => {
      return nodeOutputs[nodeId];
    },
  };
}
