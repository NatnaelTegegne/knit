import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from '@xyflow/react';
import type { NodeModel } from '@/generated/prisma/models/Node';
import type { ConnectionModel } from '@/generated/prisma/models/Connection';
import type { NodeType } from '@/generated/prisma/enums';

// DB Node -> React Flow Node
export function dbNodeToReactFlowNode(node: NodeModel): ReactFlowNode {
  return {
    id: node.id,
    type: node.type,
    position: { x: node.positionX, y: node.positionY },
    data: node.data as Record<string, unknown>,
  };
}

// React Flow Node -> DB Node shape (for create/update)
export function reactFlowNodeToDbNode(
  node: ReactFlowNode,
  workflowId: string
): {
  id: string;
  type: NodeType;
  positionX: number;
  positionY: number;
  data: Record<string, unknown>;
  workflowId: string;
} {
  return {
    id: node.id,
    type: node.type as NodeType,
    positionX: node.position.x,
    positionY: node.position.y,
    data: (node.data || {}) as Record<string, unknown>,
    workflowId,
  };
}

// DB Connection -> React Flow Edge
export function dbConnectionToReactFlowEdge(connection: ConnectionModel): ReactFlowEdge {
  return {
    id: connection.id,
    source: connection.sourceNodeId,
    sourceHandle: connection.sourceHandle || undefined,
    target: connection.targetNodeId,
    targetHandle: connection.targetHandle || undefined,
  };
}

// React Flow Edge -> DB Connection shape (for create/update)
export function reactFlowEdgeToDbConnection(
  edge: ReactFlowEdge,
  workflowId: string
): {
  id: string;
  sourceNodeId: string;
  sourceHandle: string | null;
  targetNodeId: string;
  targetHandle: string | null;
  workflowId: string;
} {
  return {
    id: edge.id,
    sourceNodeId: edge.source,
    sourceHandle: edge.sourceHandle || null,
    targetNodeId: edge.target,
    targetHandle: edge.targetHandle || null,
    workflowId,
  };
}

// Batch convert DB nodes to React Flow nodes
export function mapNodesToReactFlow(nodes: NodeModel[]): ReactFlowNode[] {
  return nodes.map(dbNodeToReactFlowNode);
}

// Batch convert DB connections to React Flow edges
export function mapConnectionsToReactFlow(connections: ConnectionModel[]): ReactFlowEdge[] {
  return connections.map(dbConnectionToReactFlowEdge);
}
