import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { prefetchCredential } from '@/features/credentials/server/prefetch';
import { CredentialDetail } from '@/features/credentials/components/credential-detail';
import { EntityLoading } from '@/components/entity-components';

interface PageProps {
  params: Promise<{ credentialId: string }>;
}

export default async function CredentialDetailPage({ params }: PageProps) {
  const { credentialId } = await params;
  const queryClient = await prefetchCredential(credentialId);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<EntityLoading count={1} />}>
        <CredentialDetail credentialId={credentialId} />
      </Suspense>
    </HydrationBoundary>
  );
}
