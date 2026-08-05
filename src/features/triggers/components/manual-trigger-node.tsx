'use client';

import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseTriggerNode } from '@/components/react-flow/base-trigger-node';
import { PlayIcon } from 'lucide-react';

export const ManualTriggerNode = memo(function ManualTriggerNode({
  selected,
}: NodeProps) {
  return (
    <BaseTriggerNode
      selected={selected}
      icon={<PlayIcon className="h-5 w-5 text-primary" />}
      label="Manual Trigger"
      description="Run manually"
    />
  );
});
