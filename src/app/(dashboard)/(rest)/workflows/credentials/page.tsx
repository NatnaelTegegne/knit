import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { prefetchCredentials } from '@/features/credentials/server/prefetch';
import { CredentialsList } from '@/features/credentials/components/credentials-list';
import { credentialsSearchParamsCache } from '@/features/credentials/params';
import { EntityLoading } from '@/components/entity-components';
import type { SearchParams } from 'nuqs/server';

interface CredentialsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function CredentialsPage({ searchParams }: CredentialsPageProps) {
  const params = await credentialsSearchParamsCache.parse(searchParams);
  const queryClient = await prefetchCredentials(params);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<EntityLoading />}>
        <CredentialsList />
      </Suspense>
    </HydrationBoundary>
  );
}
