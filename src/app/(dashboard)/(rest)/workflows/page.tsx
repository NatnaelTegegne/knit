import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { prefetchWorkflows } from '@/features/workflows/server/prefetch';
import { WorkflowsList } from '@/features/workflows/components/workflows-list';
import { workflowsSearchParamsCache } from '@/features/workflows/params';
import type { SearchParams } from 'nuqs/server';

interface WorkflowsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function WorkflowsPage({ searchParams }: WorkflowsPageProps) {
  const params = await workflowsSearchParamsCache.parse(searchParams);
  const queryClient = await prefetchWorkflows(params);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<WorkflowsLoading />}>
        <WorkflowsList />
      </Suspense>
    </HydrationBoundary>
  );
}

function WorkflowsLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-10 w-full animate-pulse rounded bg-muted" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border bg-muted" />
        ))}
      </div>
    </div>
  );
}
