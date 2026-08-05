import type { NodeTypes } from '@xyflow/react';
import { NodeType } from '@/generated/prisma/enums';
import { InitialNode } from '@/components/react-flow/initial-node';
import { PlaceholderNode } from '@/components/react-flow/placeholder-node';

// Node type to display name mapping
export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  [NodeType.INITIAL]: 'Initial',
  [NodeType.MANUAL_TRIGGER]: 'Manual Trigger',
  [NodeType.HTTP_REQUEST]: 'HTTP Request',
};

// Node type to description mapping
export const NODE_TYPE_DESCRIPTIONS: Record<NodeType, string> = {
  [NodeType.INITIAL]: 'Starting point of the workflow',
  [NodeType.MANUAL_TRIGGER]: 'Manually trigger the workflow',
  [NodeType.HTTP_REQUEST]: 'Make an HTTP request',
};

// Categories for node selector
export const NODE_CATEGORIES = {
  triggers: [NodeType.MANUAL_TRIGGER],
  actions: [NodeType.HTTP_REQUEST],
} as const;

// Node types registry for React Flow
export const nodeTypes: NodeTypes = {
  INITIAL: InitialNode,
  MANUAL_TRIGGER: PlaceholderNode,
  HTTP_REQUEST: PlaceholderNode,
};
