'use client';

import { memo } from 'react';
import { useAtomValue } from 'jotai';
import type { NodeProps } from '@xyflow/react';
import { BaseTriggerNode } from '@/components/react-flow/base-trigger-node';
import { FileSpreadsheetIcon } from 'lucide-react';
import { nodeStatusesAtom } from '@/features/editor/store/atoms';

export const GoogleFormTriggerNode = memo(function GoogleFormTriggerNode({
  id,
  selected,
}: NodeProps) {
  const nodeStatuses = useAtomValue(nodeStatusesAtom);
  const status = nodeStatuses[id] || 'idle';

  return (
    <BaseTriggerNode
      selected={selected}
      icon={<FileSpreadsheetIcon className="h-5 w-5 text-green-600" />}
      label="Google Form"
      description="Triggered on form submit"
      status={status}
    />
  );
});
