'use client';

import { memo, type ReactNode } from 'react';
import { Position } from '@xyflow/react';
import { BaseNode } from './base-node';
import { BaseHandle } from './base-handle';

interface BaseTriggerNodeProps {
  selected?: boolean;
  icon: ReactNode;
  label: string;
  description?: string;
}

export const BaseTriggerNode = memo(function BaseTriggerNode({
  selected,
  icon,
  label,
  description,
}: BaseTriggerNodeProps) {
  return (
    <BaseNode selected={selected} className="min-w-[200px]">
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
    </BaseNode>
  );
});
