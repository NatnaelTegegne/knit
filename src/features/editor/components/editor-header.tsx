'use client';

import { useState, useRef, useEffect } from 'react';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeftIcon, CheckIcon, XIcon, PencilIcon, Loader2Icon, PlayIcon } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface EditorHeaderProps {
  workflowId: string;
}

export function EditorHeader({ workflowId }: EditorHeaderProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: workflow } = useSuspenseQuery(
    trpc.workflows.getOne.queryOptions({ id: workflowId })
  );

  const updateMutation = useMutation(
    trpc.workflows.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.workflows.getOne.queryKey({ id: workflowId }) });
        setIsEditing(false);
        toast.success('Workflow name updated');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const executeMutation = useMutation(
    trpc.workflows.execute.mutationOptions({
      onSuccess: () => {
        toast.success('Workflow execution started');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEditing = () => {
    setEditName(workflow.name);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editName.trim() && editName !== workflow.name) {
      updateMutation.mutate({ id: workflowId, name: editName.trim() });
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(workflow.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleExecute = () => {
    executeMutation.mutate({ id: workflowId });
  };

  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/workflows">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="h-8 w-64"
              disabled={updateMutation.isPending}
            />
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2Icon className="h-3 w-3 animate-spin" />
              ) : (
                <CheckIcon className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleCancel}
              disabled={updateMutation.isPending}
            >
              <XIcon className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <button
            onClick={handleStartEditing}
            className="group flex items-center gap-2 rounded px-2 py-1 hover:bg-muted"
          >
            <span className="font-medium">{workflow.name}</span>
            <PencilIcon className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleExecute}
          disabled={executeMutation.isPending}
          size="sm"
        >
          {executeMutation.isPending ? (
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PlayIcon className="mr-2 h-4 w-4" />
          )}
          Execute
        </Button>
      </div>
    </header>
  );
}
