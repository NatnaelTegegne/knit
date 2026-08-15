import type { NodeTypes } from '@xyflow/react';
import { NodeType } from '@/generated/prisma/enums';
import { InitialNode } from '@/components/react-flow/initial-node';
import { ManualTriggerNode } from '@/features/triggers/components/manual-trigger/manual-trigger-node';
import { GoogleFormTriggerNode } from '@/features/triggers/components/google-form-trigger/google-form-trigger-node';
import { StripeTriggerNode } from '@/features/triggers/components/stripe-trigger/stripe-trigger-node';
import { HttpRequestNode } from '@/features/executions/components/http-request/http-request-node';
import {
  OpenAiNode,
  AnthropicNode,
  GeminiNode,
} from '@/features/executions/components/ai/provider-nodes';
import {
  DiscordNode,
  SlackNode,
} from '@/features/executions/components/messaging/messaging-nodes';

// Node type to display name mapping
export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  [NodeType.INITIAL]: 'Initial',
  [NodeType.MANUAL_TRIGGER]: 'Manual Trigger',
  [NodeType.GOOGLE_FORM_TRIGGER]: 'Google Form',
  [NodeType.STRIPE_TRIGGER]: 'Stripe',
  [NodeType.HTTP_REQUEST]: 'HTTP Request',
  [NodeType.OPENAI]: 'OpenAI',
  [NodeType.ANTHROPIC]: 'Anthropic',
  [NodeType.GOOGLE_GEMINI]: 'Gemini',
  [NodeType.DISCORD]: 'Discord',
  [NodeType.SLACK]: 'Slack',
};

// Node type to description mapping
export const NODE_TYPE_DESCRIPTIONS: Record<NodeType, string> = {
  [NodeType.INITIAL]: 'Starting point of the workflow',
  [NodeType.MANUAL_TRIGGER]: 'Manually trigger the workflow',
  [NodeType.GOOGLE_FORM_TRIGGER]: 'Triggered when form is submitted',
  [NodeType.STRIPE_TRIGGER]: 'Triggered by a Stripe webhook event',
  [NodeType.HTTP_REQUEST]: 'Make an HTTP request',
  [NodeType.OPENAI]: 'Generate text with an OpenAI model',
  [NodeType.ANTHROPIC]: 'Generate text with a Claude model',
  [NodeType.GOOGLE_GEMINI]: 'Generate text with a Gemini model',
  [NodeType.DISCORD]: 'Post a message to Discord',
  [NodeType.SLACK]: 'Post a message to Slack',
};

// Categories for node selector
export const NODE_CATEGORIES = {
  triggers: [
    NodeType.MANUAL_TRIGGER,
    NodeType.GOOGLE_FORM_TRIGGER,
    NodeType.STRIPE_TRIGGER,
  ],
  actions: [NodeType.HTTP_REQUEST],
  ai: [NodeType.OPENAI, NodeType.ANTHROPIC, NodeType.GOOGLE_GEMINI],
  messaging: [NodeType.DISCORD, NodeType.SLACK],
} as const;

// Node types registry for React Flow
export const nodeTypes: NodeTypes = {
  INITIAL: InitialNode,
  MANUAL_TRIGGER: ManualTriggerNode,
  GOOGLE_FORM_TRIGGER: GoogleFormTriggerNode,
  STRIPE_TRIGGER: StripeTriggerNode,
  HTTP_REQUEST: HttpRequestNode,
  OPENAI: OpenAiNode,
  ANTHROPIC: AnthropicNode,
  GOOGLE_GEMINI: GeminiNode,
  DISCORD: DiscordNode,
  SLACK: SlackNode,
};
