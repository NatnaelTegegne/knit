// Node execution status types
export type NodeStatus = 'idle' | 'loading' | 'success' | 'error';

export interface NodeStatusUpdate {
  nodeId: string;
  status: NodeStatus;
  output?: unknown;
  error?: string;
  timestamp: string;
}
