import 'server-only';

import { getQueryClient, trpc } from '@/trpc/server';

interface ExecutionsParams {
  page: number;
  pageSize: number;
  search: string;
}

export async function prefetchExecutions(params: ExecutionsParams) {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(trpc.executions.getAll.queryOptions(params));
  return queryClient;
}

export async function prefetchExecution(id: string) {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(trpc.executions.getOne.queryOptions({ id }));
  return queryClient;
}
