import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { prefetchExecutions } from '@/features/executions/server/prefetch';
import { ExecutionsList } from '@/features/executions/components/executions-list';
import { executionsSearchParamsCache } from '@/features/executions/params';
import { EntityLoading } from '@/components/entity-components';
import type { SearchParams } from 'nuqs/server';

interface ExecutionsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ExecutionsPage({ searchParams }: ExecutionsPageProps) {
  const params = await executionsSearchParamsCache.parse(searchParams);
  const queryClient = await prefetchExecutions(params);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<EntityLoading />}>
        <ExecutionsList />
      </Suspense>
    </HydrationBoundary>
  );
}
