'use client';

import { memo, useState, type ReactNode } from 'react';
import { useAtomValue } from 'jotai';
import type { NodeProps } from '@xyflow/react';
import { BaseExecutionNode } from '@/components/react-flow/base-execution-node';
import { nodeStatusesAtom } from '@/features/editor/store/atoms';
import { MessageSquareIcon, HashIcon } from 'lucide-react';
import { CredentialType } from '@/generated/prisma/enums';
import { MessagingDialog, type MessagingNodeData } from './messaging-dialog';

interface MessagingNodeProps extends NodeProps {
  icon: ReactNode;
  platformLabel: string;
  credentialType: CredentialType;
  supportsUsername: boolean;
}

function MessagingNode({
  id,
  selected,
  data,
  icon,
  platformLabel,
  credentialType,
  supportsUsername,
}: MessagingNodeProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const nodeStatuses = useAtomValue(nodeStatusesAtom);
  const status = nodeStatuses[id] || 'idle';
  const nodeData = data as MessagingNodeData;

  let description = 'Double-click to configure';
  if (!nodeData.credentialId) {
    description = 'No webhook selected';
  } else if (nodeData.message) {
    description = `${nodeData.message.slice(0, 30)}${
      nodeData.message.length > 30 ? '…' : ''
    }`;
  }

  return (
    <>
      <div onDoubleClick={() => setDialogOpen(true)}>
        <BaseExecutionNode
          selected={selected}
          icon={icon}
          label={nodeData.variableName || platformLabel}
          description={description}
          status={status}
        />
      </div>

      <MessagingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={id}
        platformLabel={platformLabel}
        credentialType={credentialType}
        supportsUsername={supportsUsername}
      />
    </>
  );
}

export const DiscordNode = memo(function DiscordNode(props: NodeProps) {
  return (
    <MessagingNode
      {...props}
      icon={<MessageSquareIcon className="h-5 w-5 text-indigo-500" />}
      platformLabel="Discord"
      credentialType={CredentialType.DISCORD_WEBHOOK}
      supportsUsername
    />
  );
});

export const SlackNode = memo(function SlackNode(props: NodeProps) {
  return (
    <MessagingNode
      {...props}
      icon={<HashIcon className="h-5 w-5 text-rose-500" />}
      platformLabel="Slack"
      credentialType={CredentialType.SLACK_WEBHOOK}
      supportsUsername={false}
    />
  );
});
