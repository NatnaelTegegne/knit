import type { NodeModel } from '@/generated/prisma/models/Node';
import type { ExecutionContext } from './context';
import { NodeType } from '@/generated/prisma/enums';
import ky from 'ky';

// Executor function type
export type NodeExecutor = (
  node: NodeModel,
  context: ExecutionContext
) => Promise<unknown>;

// HTTP Request node data shape
interface HttpRequestData {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: string;
}

// Execute INITIAL node (just passes through)
const executeInitial: NodeExecutor = async (node, context) => {
  return { started: true, timestamp: new Date().toISOString() };
};

// Execute MANUAL_TRIGGER node
const executeManualTrigger: NodeExecutor = async (node, context) => {
  return { triggered: true, timestamp: new Date().toISOString() };
};

// Execute HTTP_REQUEST node
const executeHttpRequest: NodeExecutor = async (node, context) => {
  const data = node.data as HttpRequestData;

  if (!data.url) {
    throw new Error('HTTP Request node requires a URL');
  }

  const method = (data.method || 'GET').toUpperCase();
  const url = data.url;
  const headers = data.headers || {};

  try {
    const response = await ky(url, {
      method,
      headers,
      body: data.body && method !== 'GET' ? data.body : undefined,
      timeout: 30000,
    });

    const contentType = response.headers.get('content-type') || '';
    let responseData: unknown;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`HTTP Request failed: ${error.message}`);
    }
    throw error;
  }
};

// Executor registry
const executors: Record<NodeType, NodeExecutor> = {
  [NodeType.INITIAL]: executeInitial,
  [NodeType.MANUAL_TRIGGER]: executeManualTrigger,
  [NodeType.HTTP_REQUEST]: executeHttpRequest,
};

// Get executor for a node type
export function getExecutor(type: NodeType): NodeExecutor {
  const executor = executors[type];
  if (!executor) {
    throw new Error(`No executor found for node type: ${type}`);
  }
  return executor;
}

// Execute a single node
export async function executeNode(
  node: NodeModel,
  context: ExecutionContext
): Promise<unknown> {
  const executor = getExecutor(node.type);
  const output = await executor(node, context);
  context.setOutput(node.id, output);
  return output;
}
