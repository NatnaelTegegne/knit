import 'server-only';

import { getQueryClient, trpc } from '@/trpc/server';

export async function prefetchWorkflows() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(trpc.workflows.getAll.queryOptions());
  return queryClient;
}
