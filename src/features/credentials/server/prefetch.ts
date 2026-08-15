import 'server-only';

import { getQueryClient, trpc } from '@/trpc/server';

interface CredentialsParams {
  page: number;
  pageSize: number;
  search: string;
}

export async function prefetchCredentials(params: CredentialsParams) {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(trpc.credentials.getAll.queryOptions(params));
  return queryClient;
}

export async function prefetchCredential(id: string) {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(trpc.credentials.getOne.queryOptions({ id }));
  return queryClient;
}
