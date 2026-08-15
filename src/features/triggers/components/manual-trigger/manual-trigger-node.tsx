'use client';

import { memo } from 'react';
import { useAtomValue } from 'jotai';
import type { NodeProps } from '@xyflow/react';
import { BaseTriggerNode } from '@/components/react-flow/base-trigger-node';
import { PlayIcon } from 'lucide-react';
import { nodeStatusesAtom } from '@/features/editor/store/atoms';

export const ManualTriggerNode = memo(function ManualTriggerNode({
  id,
  selected,
}: NodeProps) {
  const nodeStatuses = useAtomValue(nodeStatusesAtom);
  const status = nodeStatuses[id] || 'idle';

  return (
    <BaseTriggerNode
      selected={selected}
      icon={<PlayIcon className="h-5 w-5 text-primary" />}
      label="Manual Trigger"
      description="Run manually"
      status={status}
    />
  );
});
