'use client';

import { memo, useState } from 'react';
import { useAtomValue } from 'jotai';
import type { NodeProps } from '@xyflow/react';
import { BaseExecutionNode } from '@/components/react-flow/base-execution-node';
import { GlobeIcon } from 'lucide-react';
import { HttpRequestDialog } from './http-request-dialog';
import { nodeStatusesAtom } from '@/features/editor/store/atoms';
import { hasTemplateExpressions } from '../lib/templating';

interface HttpRequestData {
  variableName?: string;
  method?: string;
  url?: string;
}

export const HttpRequestNode = memo(function HttpRequestNode({
  id,
  selected,
  data,
}: NodeProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const nodeStatuses = useAtomValue(nodeStatusesAtom);
  const status = nodeStatuses[id] || 'idle';
  const nodeData = data as HttpRequestData;

  // Show configured URL or default description
  // For template URLs, show a simplified version
  let description = 'Double-click to configure';
  if (nodeData.url) {
    if (hasTemplateExpressions(nodeData.url)) {
      description = `${nodeData.method || 'GET'} (templated)`;
    } else {
      try {
        description = `${nodeData.method || 'GET'} ${new URL(nodeData.url).hostname}`;
      } catch {
        description = `${nodeData.method || 'GET'} ${nodeData.url}`;
      }
    }
  }

  return (
    <>
      <div onDoubleClick={() => setDialogOpen(true)}>
        <BaseExecutionNode
          selected={selected}
          icon={<GlobeIcon className="h-5 w-5 text-muted-foreground" />}
          label={nodeData.variableName || 'HTTP Request'}
          description={description}
          status={status}
        />
      </div>

      <HttpRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={id}
      />
    </>
  );
});
