'use client';

import { memo } from 'react';
import { Position, type NodeProps } from '@xyflow/react';
import { BaseNode } from './base-node';
import { BaseHandle } from './base-handle';
import { PlayIcon } from 'lucide-react';

export const InitialNode = memo(function InitialNode({ selected }: NodeProps) {
  return (
    <BaseNode selected={selected}>
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
          <PlayIcon className="h-4 w-4 text-primary" />
        </div>
        <span className="font-medium">Start</span>
      </div>
      <BaseHandle type="source" position={Position.Right} />
    </BaseNode>
  );
});
