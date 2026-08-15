'use client';

import { memo, useState } from 'react';
import { useAtomValue } from 'jotai';
import type { NodeProps } from '@xyflow/react';
import { BaseTriggerNode } from '@/components/react-flow/base-trigger-node';
import { CreditCardIcon } from 'lucide-react';
import { nodeStatusesAtom } from '@/features/editor/store/atoms';
import { StripeTriggerDialog } from './stripe-trigger-dialog';
import {
  STRIPE_ANY_EVENT,
  type StripeTriggerData,
} from '@/features/triggers/lib/stripe-events';

export const StripeTriggerNode = memo(function StripeTriggerNode({
  id,
  selected,
  data,
}: NodeProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const nodeStatuses = useAtomValue(nodeStatusesAtom);
  const status = nodeStatuses[id] || 'idle';
  const nodeData = data as StripeTriggerData;

  const eventType = nodeData.eventType;
  const description =
    !eventType || eventType === STRIPE_ANY_EVENT
      ? 'Triggered on any Stripe event'
      : `On ${eventType}`;

  return (
    <>
      <div onDoubleClick={() => setDialogOpen(true)}>
        <BaseTriggerNode
          selected={selected}
          icon={<CreditCardIcon className="h-5 w-5 text-indigo-600" />}
          label={nodeData.variableName || 'Stripe'}
          description={description}
          status={status}
        />
      </div>

      <StripeTriggerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={id}
      />
    </>
  );
});
