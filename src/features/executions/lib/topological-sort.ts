import type { NodeModel } from '@/generated/prisma/models/Node';
import type { ConnectionModel } from '@/generated/prisma/models/Connection';

interface NodeWithConnections {
  node: NodeModel;
  incomingCount: number;
  outgoingNodeIds: string[];
}

/**
 * Topological sort using Kahn's algorithm
 * Returns nodes in execution order (respecting dependencies)
 */
export function topologicalSort(
  nodes: NodeModel[],
  connections: ConnectionModel[]
): NodeModel[] {
  if (nodes.length === 0) return [];

  // Build adjacency map
  const nodeMap = new Map<string, NodeWithConnections>();

  // Initialize all nodes
  for (const node of nodes) {
    nodeMap.set(node.id, {
      node,
      incomingCount: 0,
      outgoingNodeIds: [],
    });
  }

  // Count incoming edges and build outgoing edges
  for (const conn of connections) {
    const source = nodeMap.get(conn.sourceNodeId);
    const target = nodeMap.get(conn.targetNodeId);

    if (source && target) {
      source.outgoingNodeIds.push(conn.targetNodeId);
      target.incomingCount++;
    }
  }

  // Start with nodes that have no incoming edges
  const queue: string[] = [];
  for (const [id, data] of nodeMap) {
    if (data.incomingCount === 0) {
      queue.push(id);
    }
  }

  const result: NodeModel[] = [];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const data = nodeMap.get(nodeId)!;
    result.push(data.node);

    // Reduce incoming count for all outgoing nodes
    for (const outId of data.outgoingNodeIds) {
      const outData = nodeMap.get(outId)!;
      outData.incomingCount--;

      if (outData.incomingCount === 0) {
        queue.push(outId);
      }
    }
  }

  // If we didn't process all nodes, there's a cycle
  if (result.length !== nodes.length) {
    throw new Error('Workflow contains a cycle');
  }

  return result;
}
