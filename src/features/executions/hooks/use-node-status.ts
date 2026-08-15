'use client';

import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { ExecutionStatus } from '@/generated/prisma/enums';
import type { NodeStatus } from '../lib/node-status';

interface UseNodeStatusOptions {
  workflowId: string;
  enabled?: boolean;
}

// How often to re-check while a run is in flight
const POLL_INTERVAL_MS = 1000;

const VALID_STATUSES: NodeStatus[] = ['idle', 'loading', 'success', 'error'];

// Guard rather than cast: these values come out of a Json column, so a bad
// payload shouldn't be able to put the UI into an impossible state.
function isValidStatus(value: unknown): value is NodeStatus {
  return typeof value === 'string' && VALID_STATUSES.includes(value as NodeStatus);
}

/**
 * Live per-node execution status for the editor canvas.
 *
 * Polls the workflow's most recent Execution row while it is RUNNING and stops
 * once it settles. This replaces the Inngest realtime subscription: as of
 * @inngest/realtime 0.4.7 that package still depends on inngest@^3, which is
 * incompatible with the inngest@4 client this app uses.
 */
export function useNodeStatus({ workflowId, enabled = true }: UseNodeStatusOptions) {
  const trpc = useTRPC();

  const { data } = useQuery({
    ...trpc.executions.getLatestForWorkflow.queryOptions({ workflowId }),
    enabled,
    // Only keep polling while the latest run is still going
    refetchInterval: (query) =>
      query.state.data?.status === ExecutionStatus.RUNNING ? POLL_INTERVAL_MS : false,
  });

  const statuses = useMemo(() => {
    const raw = (data?.nodeStatuses ?? {}) as Record<string, unknown>;
    const result: Record<string, NodeStatus> = {};

    for (const [nodeId, status] of Object.entries(raw)) {
      if (isValidStatus(status)) {
        result[nodeId] = status;
      }
    }

    return result;
  }, [data?.nodeStatuses]);

  const getNodeStatus = useCallback(
    (nodeId: string): NodeStatus => statuses[nodeId] || 'idle',
    [statuses]
  );

  return {
    statuses,
    executionId: data?.id ?? null,
    executionStatus: data?.status ?? null,
    error: data?.error ?? null,
    isRunning: data?.status === ExecutionStatus.RUNNING,
    getNodeStatus,
  };
}
