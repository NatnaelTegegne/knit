'use client';

import { useState, type ReactNode } from 'react';
import { useAtomValue } from 'jotai';
import type { NodeProps } from '@xyflow/react';
import { BaseExecutionNode } from '@/components/react-flow/base-execution-node';
import { nodeStatusesAtom } from '@/features/editor/store/atoms';
import { AiDialog, type AiNodeData } from './ai-dialog';
import type { CredentialType } from '@/generated/prisma/enums';

interface AiNodeProps extends NodeProps {
  icon: ReactNode;
  providerLabel: string;
  credentialType: CredentialType;
  defaultModel: string;
}

/**
 * Shared body for the OpenAI / Anthropic / Gemini nodes — they differ only in
 * branding, credential type, and default model.
 */
export function AiNode({
  id,
  selected,
  data,
  icon,
  providerLabel,
  credentialType,
  defaultModel,
}: AiNodeProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const nodeStatuses = useAtomValue(nodeStatusesAtom);
  const status = nodeStatuses[id] || 'idle';
  const nodeData = data as AiNodeData;

  let description = 'Double-click to configure';
  if (!nodeData.credentialId) {
    description = 'No credential selected';
  } else if (nodeData.userPrompt) {
    const model = nodeData.model || defaultModel;
    description = `${model} · ${nodeData.userPrompt.slice(0, 28)}${
      nodeData.userPrompt.length > 28 ? '…' : ''
    }`;
  }

  return (
    <>
      <div onDoubleClick={() => setDialogOpen(true)}>
        <BaseExecutionNode
          selected={selected}
          icon={icon}
          label={nodeData.variableName || providerLabel}
          description={description}
          status={status}
        />
      </div>

      <AiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={id}
        providerLabel={providerLabel}
        credentialType={credentialType}
        defaultModel={defaultModel}
      />
    </>
  );
}
