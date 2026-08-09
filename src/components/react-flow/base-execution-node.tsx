'use client';

import { memo, type ReactNode } from 'react';
import { Position } from '@xyflow/react';
import { BaseNode } from './base-node';
import { BaseHandle } from './base-handle';
import { NodeStatusIndicator, type NodeStatus } from './node-status-indicator';

interface BaseExecutionNodeProps {
  selected?: boolean;
  icon: ReactNode;
  label: string;
  description?: string;
  status?: NodeStatus;
}

export const BaseExecutionNode = memo(function BaseExecutionNode({
  selected,
  icon,
  label,
  description,
  status = 'idle',
}: BaseExecutionNodeProps) {
  return (
    <BaseNode selected={selected} className="relative min-w-[200px]">
      {/* Execution nodes have both target (input) and source (output) handles */}
      <BaseHandle type="target" position={Position.Left} />
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
          {icon}
        </div>
        <div>
          <div className="font-medium">{label}</div>
          {description && (
            <div className="text-xs text-muted-foreground">{description}</div>
          )}
        </div>
      </div>
      <BaseHandle type="source" position={Position.Right} />
      <NodeStatusIndicator status={status} />
    </BaseNode>
  );
});
