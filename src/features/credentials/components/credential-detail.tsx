'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { CREDENTIAL_TYPE_LABELS } from '../lib/credential-types';

export function CredentialDetail({ credentialId }: { credentialId: string }) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.credentials.getOne.queryOptions({ id: credentialId })
  );

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/workflows/credentials">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Credentials
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-semibold">{data.name}</h1>
        <p className="text-muted-foreground">
          {CREDENTIAL_TYPE_LABELS[data.type]}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stored secret</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-muted-foreground">Value</span>
            <code className="rounded bg-muted px-2 py-1 font-mono">{data.hint}</code>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-muted-foreground">Used by</span>
            <span>
              {data.nodeCount} {data.nodeCount === 1 ? 'node' : 'nodes'}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-muted-foreground">Created</span>
            <span>{format(data.createdAt, 'PPp')}</span>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-muted-foreground">Last updated</span>
            <span>{format(data.updatedAt, 'PPp')}</span>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Only a masked hint is shown. The full secret is decrypted on the server at
        run time and never sent to the browser.
      </p>
    </div>
  );
}
