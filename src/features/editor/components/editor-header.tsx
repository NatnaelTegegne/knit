'use client';

import { useState, useRef, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeftIcon, CheckIcon, XIcon, PencilIcon, Loader2Icon, SaveIcon } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { editorInstanceAtom, hasUnsavedChangesAtom } from '../store/atoms';
import { reactFlowNodeToDbNode, reactFlowEdgeToDbConnection } from '../lib/mapping';

interface EditorHeaderProps {
  workflowId: string;
}

export function EditorHeader({ workflowId }: EditorHeaderProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const editorInstance = useAtomValue(editorInstanceAtom);
  const hasUnsavedChanges = useAtomValue(hasUnsavedChangesAtom);
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

  const saveMutation = useMutation(
    trpc.workflows.saveCanvas.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.workflows.getOne.queryKey({ id: workflowId }) });
        toast.success('Workflow saved');
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

  const handleSaveName = () => {
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
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleSaveCanvas = () => {
    if (!editorInstance) return;

    const nodes = editorInstance.getNodes();
    const edges = editorInstance.getEdges();

    saveMutation.mutate({
      id: workflowId,
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type as 'INITIAL' | 'MANUAL_TRIGGER' | 'HTTP_REQUEST',
        positionX: node.position.x,
        positionY: node.position.y,
        data: (node.data || {}) as Record<string, unknown>,
      })),
      connections: edges.map((edge) => ({
        id: edge.id,
        sourceNodeId: edge.source,
        sourceHandle: edge.sourceHandle || null,
        targetNodeId: edge.target,
        targetHandle: edge.targetHandle || null,
      })),
    });
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
              onBlur={handleSaveName}
              className="h-8 w-64"
              disabled={updateMutation.isPending}
            />
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleSaveName}
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
          onClick={handleSaveCanvas}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <SaveIcon className="mr-2 h-4 w-4" />
          )}
          Save
        </Button>
      </div>
    </header>
  );
}
