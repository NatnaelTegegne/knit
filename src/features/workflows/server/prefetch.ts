import 'server-only';

import { getQueryClient, trpc } from '@/trpc/server';

interface WorkflowsParams {
  page: number;
  pageSize: number;
  search: string;
}

export async function prefetchWorkflows(params: WorkflowsParams) {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(trpc.workflows.getAll.queryOptions(params));
  return queryClient;
}
