'use client';

import { memo, type ReactNode } from 'react';
import { Position } from '@xyflow/react';
import { BaseNode } from './base-node';
import { BaseHandle } from './base-handle';
import { NodeStatusIndicator, type NodeStatus } from './node-status-indicator';

interface BaseTriggerNodeProps {
  selected?: boolean;
  icon: ReactNode;
  label: string;
  description?: string;
  status?: NodeStatus;
}

export const BaseTriggerNode = memo(function BaseTriggerNode({
  selected,
  icon,
  label,
  description,
  status = 'idle',
}: BaseTriggerNodeProps) {
  return (
    <BaseNode selected={selected} className="relative min-w-[200px]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          {icon}
        </div>
        <div>
          <div className="font-medium">{label}</div>
          {description && (
            <div className="text-xs text-muted-foreground">{description}</div>
          )}
        </div>
      </div>
      {/* Triggers only have source handle (output) */}
      <BaseHandle type="source" position={Position.Right} />
      <NodeStatusIndicator status={status} />
    </BaseNode>
  );
});
