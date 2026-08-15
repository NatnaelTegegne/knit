'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, ExternalLinkIcon } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ExecutionStatusBadge } from './execution-status-badge';
import { ExecutionStatus } from '@/generated/prisma/enums';

export function ExecutionDetail({ executionId }: { executionId: string }) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.executions.getOne.queryOptions({ id: executionId })
  );

  const outputs = (data.output ?? {}) as Record<string, unknown>;
  const outputEntries = Object.entries(outputs);

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/workflows/executions">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Executions
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{data.workflow.name}</h1>
          <p className="text-muted-foreground">
            {format(data.startedAt, 'PPpp')}
            {data.triggerType ? ` · triggered by ${data.triggerType}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExecutionStatusBadge status={data.status} />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/workflows/${data.workflow.id}`}>
              Open workflow
              <ExternalLinkIcon className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {data.status === ExecutionStatus.FAILED && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-mono text-sm text-destructive">{data.error}</p>
            {data.stack && (
              <details>
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Stack trace
                </summary>
                <pre className="mt-2 overflow-x-auto rounded bg-muted p-3 text-xs">
                  {data.stack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Node output{outputEntries.length === 1 ? '' : 's'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {outputEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No output recorded
              {data.status === ExecutionStatus.RUNNING ? ' yet.' : '.'}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {outputEntries.map(([key, value]) => (
                <div key={key}>
                  <p className="mb-1 font-mono text-xs font-medium text-muted-foreground">
                    {key}
                  </p>
                  <pre className="overflow-x-auto rounded bg-muted p-3 text-xs">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
