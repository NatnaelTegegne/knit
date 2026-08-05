'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card';
import { PlusIcon, TrashIcon, Loader2Icon } from 'lucide-react';
import Link from 'next/link';

export function WorkflowsList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: workflows } = useSuspenseQuery(trpc.workflows.getAll.queryOptions());

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
      },
    })
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Workflows</h1>
          <p className="text-muted-foreground">
            Create and manage your automation workflows
          </p>
        </div>
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
      </div>

      {workflows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No workflows yet. Create your first workflow to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => (
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
                  Created {new Date(workflow.createdAt).toLocaleDateString()}
                </CardDescription>
                <CardAction>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => deleteMutation.mutate({ id: workflow.id })}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                    ) : (
                      <TrashIcon className="h-4 w-4" />
                    )}
                  </Button>
                </CardAction>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
