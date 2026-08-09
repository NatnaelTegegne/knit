'use client';

import { useState, useCallback } from 'react';
import type { NodeStatus } from '../lib/node-status';

interface UseNodeStatusOptions {
  workflowId: string;
  enabled?: boolean;
}

/**
 * Hook for tracking node execution statuses
 *
 * Note: Real-time updates require additional Inngest realtime setup.
 * Currently provides manual status tracking that can be updated by
 * components during execution.
 */
export function useNodeStatus({ workflowId, enabled = true }: UseNodeStatusOptions) {
  const [statuses, setStatuses] = useState<Record<string, NodeStatus>>({});
  const [outputs, setOutputs] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setNodeStatus = useCallback(
    (nodeId: string, status: NodeStatus, output?: unknown, error?: string) => {
      setStatuses((prev) => ({ ...prev, [nodeId]: status }));
      if (output !== undefined) {
        setOutputs((prev) => ({ ...prev, [nodeId]: output }));
      }
      if (error !== undefined) {
        setErrors((prev) => ({ ...prev, [nodeId]: error }));
      }
    },
    []
  );

  const getNodeStatus = useCallback(
    (nodeId: string): NodeStatus => {
      return statuses[nodeId] || 'idle';
    },
    [statuses]
  );

  const getNodeOutput = useCallback(
    (nodeId: string): unknown => {
      return outputs[nodeId];
    },
    [outputs]
  );

  const getNodeError = useCallback(
    (nodeId: string): string | undefined => {
      return errors[nodeId];
    },
    [errors]
  );

  const resetStatuses = useCallback(() => {
    setStatuses({});
    setOutputs({});
    setErrors({});
  }, []);

  return {
    statuses,
    outputs,
    errors,
    isConnected: false, // Not connected to realtime
    getNodeStatus,
    getNodeOutput,
    getNodeError,
    setNodeStatus,
    resetStatuses,
  };
}
