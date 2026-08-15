import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { prefetchExecution } from '@/features/executions/server/prefetch';
import { ExecutionDetail } from '@/features/executions/components/execution-detail';
import { EntityLoading } from '@/components/entity-components';

interface PageProps {
  params: Promise<{ executionId: string }>;
}

export default async function ExecutionDetailPage({ params }: PageProps) {
  const { executionId } = await params;
  const queryClient = await prefetchExecution(executionId);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<EntityLoading count={1} />}>
        <ExecutionDetail executionId={executionId} />
      </Suspense>
    </HydrationBoundary>
  );
}
