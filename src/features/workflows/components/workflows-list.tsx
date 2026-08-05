'use client';

import { useState } from 'react';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  EntityContainer,
  EntityHeader,
  EntitySearch,
  EntityList,
  EntityPagination,
  EntityEmpty,
} from '@/components/entity-components';
import { PlusIcon, TrashIcon, Loader2Icon } from 'lucide-react';
import Link from 'next/link';
import { useWorkflowsSearch } from '../hooks/use-workflows-search';
import { formatDistanceToNow } from 'date-fns';

export function WorkflowsList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { search, page, pageSize, onSearchChange, setPage } = useWorkflowsSearch();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data } = useSuspenseQuery(
    trpc.workflows.getAll.queryOptions({ page, pageSize, search })
  );

  const createMutation = useMutation(
    trpc.workflows.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.workflows.getAll.queryKey() });
      },
    })
  );

  const deleteMutation = useMutation(
    trpc.workflows.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.workflows.getAll.queryKey() });
        setDeleteId(null);
      },
    })
  );

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate({ id: deleteId });
    }
  };

  return (
    <EntityContainer>
      <EntityHeader
        title="Workflows"
        description="Create and manage your automation workflows"
        action={
          <Button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlusIcon className="mr-2 h-4 w-4" />
            )}
            New Workflow
          </Button>
        }
      />

      <EntitySearch
        value={search}
        onChange={onSearchChange}
        placeholder="Search workflows..."
      />

      {data.workflows.length === 0 ? (
        <EntityEmpty
          message={
            search
              ? `No workflows found matching "${search}"`
              : 'No workflows yet. Create your first workflow to get started.'
          }
        />
      ) : (
        <>
          <EntityList>
            {data.workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <CardTitle>
                    <Link
                      href={`/workflows/${workflow.id}`}
                      className="hover:underline"
                    >
                      {workflow.name}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    Updated {formatDistanceToNow(workflow.updatedAt, { addSuffix: true })}
                  </CardDescription>
                  <CardAction>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteId(workflow.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </CardAction>
                </CardHeader>
              </Card>
            ))}
          </EntityList>

          {data.totalPages > 1 && (
            <EntityPagination
              page={data.page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workflow? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </EntityContainer>
  );
}
