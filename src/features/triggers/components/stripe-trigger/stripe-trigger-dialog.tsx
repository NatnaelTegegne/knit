'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useReactFlow } from '@xyflow/react';
import { useSetAtom } from 'jotai';
import { hasUnsavedChangesAtom } from '@/features/editor/store/atoms';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  isValidVariableName,
  isUniqueVariableName,
} from '@/features/editor/lib/variables';
import {
  STRIPE_ANY_EVENT,
  STRIPE_EVENT_TYPES,
  type StripeTriggerData,
} from '@/features/triggers/lib/stripe-events';

interface StripeTriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
}

export function StripeTriggerDialog({
  open,
  onOpenChange,
  nodeId,
}: StripeTriggerDialogProps) {
  const { getNode, setNodes, getNodes } = useReactFlow();
  const setHasUnsavedChanges = useSetAtom(hasUnsavedChangesAtom);
  const params = useParams<{ workflowId: string }>();
  const node = getNode(nodeId);
  const data = (node?.data || {}) as StripeTriggerData;

  const [variableName, setVariableName] = useState(data.variableName || '');
  const [eventType, setEventType] = useState(
    data.eventType || STRIPE_ANY_EVENT
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens
  useEffect(() => {
    if (open && node) {
      const nodeData = node.data as StripeTriggerData;
      setVariableName(nodeData.variableName || '');
      setEventType(nodeData.eventType || STRIPE_ANY_EVENT);
      setErrors({});
    }
  }, [open, node]);

  // The endpoint to paste into the Stripe dashboard's webhook settings
  const webhookUrl = params?.workflowId
    ? `${typeof window === 'undefined' ? '' : window.location.origin}/api/webhooks/stripe/${params.workflowId}`
    : '';

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (variableName && !isValidVariableName(variableName)) {
      newErrors.variableName =
        'Must start with a letter and contain only letters, numbers, and underscores';
    }

    if (variableName && !isUniqueVariableName(variableName, getNodes(), nodeId)) {
      newErrors.variableName = 'Variable name must be unique';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              variableName: variableName || undefined,
              eventType,
            },
          };
        }
        return n;
      })
    );

    setHasUnsavedChanges(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Stripe Trigger Settings</DialogTitle>
          <DialogDescription>
            Run this workflow when Stripe sends a webhook event. Add the
            endpoint below to your Stripe dashboard under Developers →
            Webhooks.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="variableName">Variable Name</Label>
            <Input
              id="variableName"
              value={variableName}
              onChange={(e) => setVariableName(e.target.value)}
              placeholder="stripeEvent"
            />
            {errors.variableName && (
              <p className="text-sm text-destructive">{errors.variableName}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Used to reference the event in other nodes (e.g.,{' '}
              <code className="bg-muted px-1 rounded">
                {'{{'}stripeEvent.data.object.id{'}}'}
              </code>
              )
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="eventType">Event</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger id="eventType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={STRIPE_ANY_EVENT}>Any event</SelectItem>
                {STRIPE_EVENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Events that don&apos;t match are acknowledged and ignored.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="webhookUrl">Webhook Endpoint</Label>
            <Input
              id="webhookUrl"
              value={webhookUrl}
              readOnly
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              In local development, expose this through an ngrok tunnel and set{' '}
              <code className="bg-muted px-1 rounded">
                STRIPE_WEBHOOK_SECRET
              </code>{' '}
              to the signing secret Stripe shows for the endpoint.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
