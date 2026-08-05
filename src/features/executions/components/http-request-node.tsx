'use client';

import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseExecutionNode } from '@/components/react-flow/base-execution-node';
import { GlobeIcon } from 'lucide-react';

export const HttpRequestNode = memo(function HttpRequestNode({
  selected,
}: NodeProps) {
  return (
    <BaseExecutionNode
      selected={selected}
      icon={<GlobeIcon className="h-5 w-5 text-muted-foreground" />}
      label="HTTP Request"
      description="Make API call"
    />
  );
});
