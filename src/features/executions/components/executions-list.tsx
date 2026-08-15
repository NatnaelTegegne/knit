'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card';
import {
  EntityContainer,
  EntityHeader,
  EntitySearch,
  EntityPagination,
  EntityEmpty,
} from '@/components/entity-components';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useEntitySearch } from '@/hooks/use-entity-search';
import { executionsSearchParams } from '../params';
import { ExecutionStatusBadge } from './execution-status-badge';
import { ExecutionStatus } from '@/generated/prisma/enums';

function formatDuration(startedAt: Date, completedAt: Date | null): string {
  if (!completedAt) return 'in progress';
  const ms = completedAt.getTime() - startedAt.getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function ExecutionsList() {
  const trpc = useTRPC();
  const { search, page, pageSize, onSearchChange, setPage } =
    useEntitySearch(executionsSearchParams);

  const { data } = useSuspenseQuery(
    trpc.executions.getAll.queryOptions({ page, pageSize, search })
  );

  return (
    <EntityContainer>
      <EntityHeader
        title="Executions"
        description="Every workflow run, with its output or failure"
      />

      <EntitySearch
        value={search}
        onChange={onSearchChange}
        placeholder="Search by workflow name..."
      />

      {data.items.length === 0 ? (
        <EntityEmpty
          message={
            search
              ? `No executions found for workflows matching "${search}"`
              : 'No executions yet. Run a workflow and it will show up here.'
          }
        />
      ) : (
        <>
          {/* One per row rather than a grid — these are log entries, read top to bottom */}
          <div className="flex flex-col gap-3">
            {data.items.map((execution) => (
              <Card key={execution.id}>
                <CardHeader>
                  <CardTitle>
                    <Link
                      href={`/workflows/executions/${execution.id}`}
                      className="hover:underline"
                    >
                      {execution.workflow.name}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    Started{' '}
                    {formatDistanceToNow(execution.startedAt, { addSuffix: true })}
                    {' · '}
                    {formatDuration(execution.startedAt, execution.completedAt)}
                    {execution.triggerType ? ` · ${execution.triggerType}` : ''}
                    {execution.status === ExecutionStatus.FAILED && execution.error && (
                      <span className="mt-1 block truncate text-destructive">
                        {execution.error}
                      </span>
                    )}
                  </CardDescription>
                  <CardAction>
                    <ExecutionStatusBadge status={execution.status} />
                  </CardAction>
                </CardHeader>
              </Card>
            ))}
          </div>

          {data.totalPages > 1 && (
            <EntityPagination
              page={data.page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </EntityContainer>
  );
}
