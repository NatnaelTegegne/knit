'use client';

import { memo } from 'react';
import { Position, type NodeProps } from '@xyflow/react';
import { BaseNode } from './base-node';
import { BaseHandle } from './base-handle';
import { CircleIcon } from 'lucide-react';

export const PlaceholderNode = memo(function PlaceholderNode({
  selected,
  data,
}: NodeProps) {
  const label = (data as { label?: string })?.label || 'Node';

  return (
    <BaseNode selected={selected}>
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
          <CircleIcon className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="font-medium">{label}</span>
      </div>
      <BaseHandle type="target" position={Position.Left} />
      <BaseHandle type="source" position={Position.Right} />
    </BaseNode>
  );
});
