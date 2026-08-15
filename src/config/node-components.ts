import type { NodeTypes } from '@xyflow/react';
import { NodeType } from '@/generated/prisma/enums';
import { InitialNode } from '@/components/react-flow/initial-node';
import { ManualTriggerNode } from '@/features/triggers/components/manual-trigger/manual-trigger-node';
import { GoogleFormTriggerNode } from '@/features/triggers/components/google-form-trigger/google-form-trigger-node';
import { StripeTriggerNode } from '@/features/triggers/components/stripe-trigger/stripe-trigger-node';
import { HttpRequestNode } from '@/features/executions/components/http-request/http-request-node';

// Node type to display name mapping
export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  [NodeType.INITIAL]: 'Initial',
  [NodeType.MANUAL_TRIGGER]: 'Manual Trigger',
  [NodeType.GOOGLE_FORM_TRIGGER]: 'Google Form',
  [NodeType.STRIPE_TRIGGER]: 'Stripe',
  [NodeType.HTTP_REQUEST]: 'HTTP Request',
};

// Node type to description mapping
export const NODE_TYPE_DESCRIPTIONS: Record<NodeType, string> = {
  [NodeType.INITIAL]: 'Starting point of the workflow',
  [NodeType.MANUAL_TRIGGER]: 'Manually trigger the workflow',
  [NodeType.GOOGLE_FORM_TRIGGER]: 'Triggered when form is submitted',
  [NodeType.STRIPE_TRIGGER]: 'Triggered by a Stripe webhook event',
  [NodeType.HTTP_REQUEST]: 'Make an HTTP request',
};

// Categories for node selector
export const NODE_CATEGORIES = {
  triggers: [
    NodeType.MANUAL_TRIGGER,
    NodeType.GOOGLE_FORM_TRIGGER,
    NodeType.STRIPE_TRIGGER,
  ],
  actions: [NodeType.HTTP_REQUEST],
} as const;

// Node types registry for React Flow
export const nodeTypes: NodeTypes = {
  INITIAL: InitialNode,
  MANUAL_TRIGGER: ManualTriggerNode,
  GOOGLE_FORM_TRIGGER: GoogleFormTriggerNode,
  STRIPE_TRIGGER: StripeTriggerNode,
  HTTP_REQUEST: HttpRequestNode,
};
