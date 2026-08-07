import type { NodeModel } from '@/generated/prisma/models/Node';
import type { ExecutionContext } from './context';
import { NodeType } from '@/generated/prisma/enums';
import ky from 'ky';
import { interpolate, interpolateObject } from './templating';

// Executor function type
export type NodeExecutor = (
  node: NodeModel,
  context: ExecutionContext
) => Promise<unknown>;

// Base node data shape with variable name
interface BaseNodeData {
  variableName?: string;
}

// HTTP Request node data shape
interface HttpRequestData extends BaseNodeData {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: string;
}

// Get the context key for a node (variable name or fallback to node ID)
function getContextKey(node: NodeModel): string {
  const data = node.data as BaseNodeData;
  return data.variableName || node.id;
}

// Validation error class
class NodeValidationError extends Error {
  constructor(nodeType: string, field: string, message: string) {
    super(`${nodeType}: ${field} - ${message}`);
    this.name = 'NodeValidationError';
  }
}

// Execute INITIAL node (just passes through)
const executeInitial: NodeExecutor = async (node, context) => {
  return { started: true, timestamp: new Date().toISOString() };
};

// Execute MANUAL_TRIGGER node
const executeManualTrigger: NodeExecutor = async (node, context) => {
  return { triggered: true, timestamp: new Date().toISOString() };
};

// Validate HTTP Request required fields (after interpolation)
function validateHttpRequestUrl(url: string): void {
  if (!url || url.trim() === '') {
    throw new NodeValidationError('HTTP_REQUEST', 'url', 'URL is required');
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    throw new NodeValidationError('HTTP_REQUEST', 'url', `Invalid URL format: ${url}`);
  }
}

// Execute HTTP_REQUEST node
const executeHttpRequest: NodeExecutor = async (node, context) => {
  const data = node.data as HttpRequestData;

  // Get all outputs for templating
  const templateContext = context.getAllOutputs();

  // Interpolate URL with template values
  const rawUrl = data.url || '';
  const url = interpolate(rawUrl, templateContext);

  // Validate URL after interpolation
  validateHttpRequestUrl(url);

  const method = (data.method || 'GET').toUpperCase();

  // Interpolate headers
  const rawHeaders = data.headers || {};
  const headers = interpolateObject(rawHeaders, templateContext);

  // Interpolate body
  const rawBody = data.body || '';
  const body = rawBody ? interpolate(rawBody, templateContext) : undefined;

  try {
    const response = await ky(url, {
      method,
      headers,
      body: body && method !== 'GET' ? body : undefined,
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
    if (error instanceof NodeValidationError) {
      throw error;
    }
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

  // Store output using variable name (or node ID as fallback)
  const contextKey = getContextKey(node);
  context.setOutput(contextKey, output);

  return output;
}
