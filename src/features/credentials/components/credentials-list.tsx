'use client';

import { useState } from 'react';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from '@/components/ui/card';
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
import { PlusIcon, TrashIcon, Loader2Icon, PencilIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useEntitySearch } from '@/hooks/use-entity-search';
import { credentialsSearchParams } from '../params';
import { CREDENTIAL_TYPE_LABELS } from '../lib/credential-types';
import { CredentialDialog } from './credential-dialog';
import type { CredentialType } from '@/generated/prisma/enums';

type EditTarget = { id: string; name: string; type: CredentialType } | null;

export function CredentialsList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { search, page, pageSize, onSearchChange, setPage } =
    useEntitySearch(credentialsSearchParams);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EditTarget>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data } = useSuspenseQuery(
    trpc.credentials.getAll.queryOptions({ page, pageSize, search })
  );

  const deleteMutation = useMutation(
    trpc.credentials.remove.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.credentials.getAll.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.credentials.getByType.queryKey() });
        setDeleteId(null);
        toast.success('Credential deleted');
      },
      onError: (error) => toast.error(error.message),
    })
  );

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (credential: EditTarget) => {
    setEditing(credential);
    setDialogOpen(true);
  };

  return (
    <EntityContainer>
      <EntityHeader
        title="Credentials"
        description="API keys and webhook URLs your workflow nodes can use"
        action={
          <Button onClick={openCreate}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Credential
          </Button>
        }
      />

      <EntitySearch
        value={search}
        onChange={onSearchChange}
        placeholder="Search credentials..."
      />

      {data.items.length === 0 ? (
        <EntityEmpty
          message={
            search
              ? `No credentials found matching "${search}"`
              : 'No credentials yet. Add one so your AI and messaging nodes can authenticate.'
          }
        />
      ) : (
        <>
          <EntityList>
            {data.items.map((credential) => (
              <Card key={credential.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {credential.name}
                  </CardTitle>
                  <CardDescription className="flex flex-col gap-1.5">
                    <Badge variant="secondary" className="w-fit font-normal">
                      {CREDENTIAL_TYPE_LABELS[credential.type]}
                    </Badge>
                    <span>
                      Updated{' '}
                      {formatDistanceToNow(credential.updatedAt, { addSuffix: true })}
                    </span>
                  </CardDescription>
                  <CardAction>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${credential.name}`}
                        onClick={() =>
                          openEdit({
                            id: credential.id,
                            name: credential.name,
                            type: credential.type,
                          })
                        }
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${credential.name}`}
                        onClick={() => setDeleteId(credential.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
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

      <CredentialDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Credential</AlertDialogTitle>
            <AlertDialogDescription>
              Any node using this credential will stop working and will report a
              missing-credential error the next time it runs. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </EntityContainer>
  );
}
