import type { NodeModel } from '@/generated/prisma/models/Node';
import type { ExecutionContext } from './context';
import { NodeType, CredentialType } from '@/generated/prisma/enums';
import ky from 'ky';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { interpolate, interpolateObject } from './templating';
import { resolveCredential } from './credentials';

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

// Execute GOOGLE_FORM_TRIGGER node
const executeGoogleFormTrigger: NodeExecutor = async (node, context) => {
  // Return the form response data from the trigger
  const triggerData = context.triggerData;

  if (!triggerData || triggerData.type !== 'google-form') {
    // If not triggered by a form submission, return empty data
    return {
      triggered: false,
      message: 'Not triggered by Google Form submission',
      timestamp: new Date().toISOString(),
    };
  }

  return {
    triggered: true,
    formResponse: triggerData.formResponse,
    timestamp: triggerData.timestamp,
  };
};

// Execute STRIPE_TRIGGER node
const executeStripeTrigger: NodeExecutor = async (node, context) => {
  const triggerData = context.triggerData;

  if (!triggerData || triggerData.type !== 'stripe' || !triggerData.stripeEvent) {
    // If not triggered by a Stripe webhook, return empty data
    return {
      triggered: false,
      message: 'Not triggered by a Stripe event',
      timestamp: new Date().toISOString(),
    };
  }

  const { id, type, created, data } = triggerData.stripeEvent;

  // The event filter is enforced by the webhook route before the workflow is
  // queued, so by the time we get here the event is one this node wants.
  return {
    triggered: true,
    eventId: id,
    eventType: type,
    created,
    // `object` is the resource the event is about (session, invoice, ...)
    object: data.object,
    timestamp: triggerData.timestamp,
  };
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

// ---------------------------------------------------------------------------
// AI nodes
// ---------------------------------------------------------------------------

interface AiNodeData extends BaseNodeData {
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
}

// Sensible defaults if the node was never configured with a model
const DEFAULT_MODELS = {
  [NodeType.OPENAI]: 'gpt-4o-mini',
  [NodeType.ANTHROPIC]: 'claude-sonnet-5',
  [NodeType.GOOGLE_GEMINI]: 'gemini-2.5-flash',
} as const;

const AI_CREDENTIAL_TYPES = {
  [NodeType.OPENAI]: CredentialType.OPENAI,
  [NodeType.ANTHROPIC]: CredentialType.ANTHROPIC,
  [NodeType.GOOGLE_GEMINI]: CredentialType.GOOGLE_GEMINI,
} as const;

type AiNodeType = keyof typeof DEFAULT_MODELS;

/**
 * All three providers share the AI SDK's `generateText`, so only the model
 * factory differs. Keys come from the user's own credentials — the app's env
 * keys are never used for a user's workflow run.
 */
function makeAiExecutor(nodeType: AiNodeType): NodeExecutor {
  return async (node, context) => {
    const data = node.data as AiNodeData;
    const templateContext = context.getAllOutputs();

    const apiKey = await resolveCredential(
      nodeType,
      node.credentialId,
      context.userId,
      AI_CREDENTIAL_TYPES[nodeType]
    );

    const userPrompt = interpolate(data.userPrompt || '', templateContext);
    if (!userPrompt.trim()) {
      throw new NodeValidationError(nodeType, 'userPrompt', 'Prompt is required');
    }

    const systemPrompt = data.systemPrompt
      ? interpolate(data.systemPrompt, templateContext)
      : undefined;

    const modelId = data.model?.trim() || DEFAULT_MODELS[nodeType];

    const model =
      nodeType === NodeType.OPENAI
        ? createOpenAI({ apiKey })(modelId)
        : nodeType === NodeType.ANTHROPIC
          ? createAnthropic({ apiKey })(modelId)
          : createGoogleGenerativeAI({ apiKey })(modelId);

    try {
      const result = await generateText({
        model,
        system: systemPrompt,
        prompt: userPrompt,
      });

      return {
        text: result.text,
        model: modelId,
        usage: result.usage,
        finishReason: result.finishReason,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`${nodeType} request failed: ${message}`);
    }
  };
}

// ---------------------------------------------------------------------------
// Messaging nodes
// ---------------------------------------------------------------------------

interface MessagingNodeData extends BaseNodeData {
  message?: string;
  // Discord only; Slack takes the name from the webhook configuration
  username?: string;
}

/**
 * Discord and Slack incoming webhooks are both "POST JSON to a secret URL".
 * Only the body key differs, so the shape is shared.
 */
function makeWebhookMessageExecutor(
  nodeType: typeof NodeType.DISCORD | typeof NodeType.SLACK
): NodeExecutor {
  const credentialType =
    nodeType === NodeType.DISCORD
      ? CredentialType.DISCORD_WEBHOOK
      : CredentialType.SLACK_WEBHOOK;

  return async (node, context) => {
    const data = node.data as MessagingNodeData;
    const templateContext = context.getAllOutputs();

    const webhookUrl = await resolveCredential(
      nodeType,
      node.credentialId,
      context.userId,
      credentialType
    );

    const message = interpolate(data.message || '', templateContext);
    if (!message.trim()) {
      throw new NodeValidationError(nodeType, 'message', 'Message is required');
    }

    const body =
      nodeType === NodeType.DISCORD
        ? {
            content: message,
            ...(data.username ? { username: data.username } : {}),
          }
        : { text: message };

    try {
      const response = await ky.post(webhookUrl, { json: body, timeout: 15000 });

      return {
        delivered: true,
        status: response.status,
        message,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`${nodeType} message failed: ${message}`);
    }
  };
}

// Executor registry
const executors: Record<NodeType, NodeExecutor> = {
  [NodeType.INITIAL]: executeInitial,
  [NodeType.MANUAL_TRIGGER]: executeManualTrigger,
  [NodeType.GOOGLE_FORM_TRIGGER]: executeGoogleFormTrigger,
  [NodeType.STRIPE_TRIGGER]: executeStripeTrigger,
  [NodeType.HTTP_REQUEST]: executeHttpRequest,
  [NodeType.OPENAI]: makeAiExecutor(NodeType.OPENAI),
  [NodeType.ANTHROPIC]: makeAiExecutor(NodeType.ANTHROPIC),
  [NodeType.GOOGLE_GEMINI]: makeAiExecutor(NodeType.GOOGLE_GEMINI),
  [NodeType.DISCORD]: makeWebhookMessageExecutor(NodeType.DISCORD),
  [NodeType.SLACK]: makeWebhookMessageExecutor(NodeType.SLACK),
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
