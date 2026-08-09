import { NodeType } from '@/generated/prisma/enums';
import type { Node as ReactFlowNode } from '@xyflow/react';

// Default variable name prefixes for each node type
const VARIABLE_PREFIXES: Record<NodeType, string> = {
  [NodeType.INITIAL]: 'initial',
  [NodeType.MANUAL_TRIGGER]: 'trigger',
  [NodeType.GOOGLE_FORM_TRIGGER]: 'formResponse',
  [NodeType.HTTP_REQUEST]: 'httpResponse',
};

/**
 * Generate a unique variable name for a new node
 * Format: prefix_N where N is a counter to avoid collisions
 */
export function generateVariableName(
  nodeType: NodeType,
  existingNodes: ReactFlowNode[]
): string {
  const prefix = VARIABLE_PREFIXES[nodeType];

  // Get all existing variable names of the same type
  const existingNames = new Set(
    existingNodes
      .filter((node) => node.type === nodeType)
      .map((node) => (node.data as { variableName?: string }).variableName)
      .filter(Boolean)
  );

  // If no existing nodes of this type, use the plain prefix
  if (existingNames.size === 0) {
    return prefix;
  }

  // Find the next available number
  let counter = 1;
  while (existingNames.has(`${prefix}_${counter}`)) {
    counter++;
  }

  return `${prefix}_${counter}`;
}

/**
 * Validate that a variable name is valid
 * - Must start with a letter
 * - Can only contain letters, numbers, and underscores
 * - Cannot be empty
 */
export function isValidVariableName(name: string): boolean {
  if (!name || name.length === 0) return false;
  return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(name);
}

/**
 * Check if a variable name is unique among existing nodes
 */
export function isUniqueVariableName(
  name: string,
  existingNodes: ReactFlowNode[],
  excludeNodeId?: string
): boolean {
  return !existingNodes.some((node) => {
    if (excludeNodeId && node.id === excludeNodeId) return false;
    return (node.data as { variableName?: string }).variableName === name;
  });
}
