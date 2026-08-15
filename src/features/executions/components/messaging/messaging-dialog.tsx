'use client';

import { useState, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useSetAtom } from 'jotai';
import { hasUnsavedChangesAtom } from '@/features/editor/store/atoms';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  isValidVariableName,
  isUniqueVariableName,
} from '@/features/editor/lib/variables';
import { CredentialSelect } from '@/features/credentials/components/credential-select';
import type { CredentialType } from '@/generated/prisma/enums';

export interface MessagingNodeData {
  variableName?: string;
  credentialId?: string | null;
  message?: string;
  username?: string;
}

interface MessagingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  platformLabel: string;
  credentialType: CredentialType;
  /** Discord webhooks accept a username override; Slack does not */
  supportsUsername: boolean;
}

export function MessagingDialog({
  open,
  onOpenChange,
  nodeId,
  platformLabel,
  credentialType,
  supportsUsername,
}: MessagingDialogProps) {
  const { getNode, setNodes, getNodes } = useReactFlow();
  const setHasUnsavedChanges = useSetAtom(hasUnsavedChangesAtom);
  const node = getNode(nodeId);
  const data = (node?.data || {}) as MessagingNodeData;

  const [variableName, setVariableName] = useState(data.variableName || '');
  const [credentialId, setCredentialId] = useState<string | null>(
    data.credentialId ?? null
  );
  const [message, setMessage] = useState(data.message || '');
  const [username, setUsername] = useState(data.username || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && node) {
      const nodeData = node.data as MessagingNodeData;
      setVariableName(nodeData.variableName || '');
      setCredentialId(nodeData.credentialId ?? null);
      setMessage(nodeData.message || '');
      setUsername(nodeData.username || '');
      setErrors({});
    }
  }, [open, node]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (variableName && !isValidVariableName(variableName)) {
      newErrors.variableName =
        'Must start with a letter and contain only letters, numbers, and underscores';
    }
    if (variableName && !isUniqueVariableName(variableName, getNodes(), nodeId)) {
      newErrors.variableName = 'Variable name must be unique';
    }
    if (!credentialId) {
      newErrors.credentialId = `Select the ${platformLabel} webhook to post to`;
    }
    if (!message.trim()) {
      newErrors.message = 'A message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                variableName: variableName || undefined,
                credentialId,
                message,
                ...(supportsUsername
                  ? { username: username.trim() || undefined }
                  : {}),
              },
            }
          : n
      )
    );

    setHasUnsavedChanges(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{platformLabel} Settings</DialogTitle>
          <DialogDescription>
            Post a message to a {platformLabel} channel through an incoming webhook.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="variableName">Variable Name</Label>
            <Input
              id="variableName"
              value={variableName}
              onChange={(e) => setVariableName(e.target.value)}
              placeholder="notification"
            />
            {errors.variableName && (
              <p className="text-sm text-destructive">{errors.variableName}</p>
            )}
          </div>

          <CredentialSelect
            type={credentialType}
            value={credentialId}
            onChange={setCredentialId}
            error={errors.credentialId}
          />

          {supportsUsername && (
            <div className="grid gap-2">
              <Label htmlFor="username">Display name (optional)</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Knit"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={'New signup: {{formResponse.email}}'}
              rows={4}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Use{' '}
              <code className="rounded bg-muted px-1">
                {'{{'}variableName.field{'}}'}
              </code>{' '}
              to include output from earlier nodes.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
