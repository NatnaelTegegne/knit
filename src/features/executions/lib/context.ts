// A Stripe event envelope as forwarded by the Stripe webhook route
export interface StripeEventPayload {
  id: string;
  type: string;
  created: number;
  data: { object: unknown };
}

// Trigger data from webhooks
export interface TriggerData {
  type: string;
  formResponse?: unknown;
  stripeEvent?: StripeEventPayload;
  timestamp: string;
}

// Execution context shared between nodes during workflow execution
export interface ExecutionContext {
  // Workflow metadata
  workflowId: string;
  userId: string;

  // Trigger data (for webhook-triggered workflows)
  triggerData?: TriggerData;

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
  userId: string,
  triggerData?: TriggerData
): ExecutionContext {
  const nodeOutputs: Record<string, unknown> = {};

  return {
    workflowId,
    userId,
    triggerData,
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
