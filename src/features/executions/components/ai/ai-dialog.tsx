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

export interface AiNodeData {
  variableName?: string;
  credentialId?: string | null;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
}

interface AiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  providerLabel: string;
  credentialType: CredentialType;
  defaultModel: string;
}

export function AiDialog({
  open,
  onOpenChange,
  nodeId,
  providerLabel,
  credentialType,
  defaultModel,
}: AiDialogProps) {
  const { getNode, setNodes, getNodes } = useReactFlow();
  const setHasUnsavedChanges = useSetAtom(hasUnsavedChangesAtom);
  const node = getNode(nodeId);
  const data = (node?.data || {}) as AiNodeData;

  const [variableName, setVariableName] = useState(data.variableName || '');
  const [credentialId, setCredentialId] = useState<string | null>(
    data.credentialId ?? null
  );
  const [model, setModel] = useState(data.model || '');
  const [systemPrompt, setSystemPrompt] = useState(data.systemPrompt || '');
  const [userPrompt, setUserPrompt] = useState(data.userPrompt || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && node) {
      const nodeData = node.data as AiNodeData;
      setVariableName(nodeData.variableName || '');
      setCredentialId(nodeData.credentialId ?? null);
      setModel(nodeData.model || '');
      setSystemPrompt(nodeData.systemPrompt || '');
      setUserPrompt(nodeData.userPrompt || '');
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
      newErrors.credentialId = 'Select a credential so this node can authenticate';
    }
    if (!userPrompt.trim()) {
      newErrors.userPrompt = 'A prompt is required';
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
                model: model.trim() || undefined,
                systemPrompt: systemPrompt || undefined,
                userPrompt,
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
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>{providerLabel} Settings</DialogTitle>
          <DialogDescription>
            Prompts support{' '}
            <code className="rounded bg-muted px-1 text-xs">
              {'{{'}variableName.field{'}}'}
            </code>{' '}
            to pull in output from earlier nodes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[60vh] gap-4 overflow-y-auto py-4">
          <div className="grid gap-2">
            <Label htmlFor="variableName">Variable Name</Label>
            <Input
              id="variableName"
              value={variableName}
              onChange={(e) => setVariableName(e.target.value)}
              placeholder="aiResponse"
            />
            {errors.variableName && (
              <p className="text-sm text-destructive">{errors.variableName}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Reference the reply elsewhere as{' '}
              <code className="rounded bg-muted px-1">
                {'{{'}
                {variableName || 'aiResponse'}.text{'}}'}
              </code>
            </p>
          </div>

          <CredentialSelect
            type={credentialType}
            value={credentialId}
            onChange={setCredentialId}
            error={errors.credentialId}
          />

          <div className="grid gap-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={defaultModel}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to use {defaultModel}.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <Textarea
              id="systemPrompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are a helpful assistant."
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="userPrompt">Prompt</Label>
            <Textarea
              id="userPrompt"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder={'Summarise this: {{httpResponse.data}}'}
              rows={5}
            />
            {errors.userPrompt && (
              <p className="text-sm text-destructive">{errors.userPrompt}</p>
            )}
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
