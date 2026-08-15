'use client';

import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { SparklesIcon, BotIcon, BrainIcon } from 'lucide-react';
import { CredentialType } from '@/generated/prisma/enums';
import { AiNode } from './ai-node';

export const OpenAiNode = memo(function OpenAiNode(props: NodeProps) {
  return (
    <AiNode
      {...props}
      icon={<SparklesIcon className="h-5 w-5 text-emerald-600" />}
      providerLabel="OpenAI"
      credentialType={CredentialType.OPENAI}
      defaultModel="gpt-4o-mini"
    />
  );
});

export const AnthropicNode = memo(function AnthropicNode(props: NodeProps) {
  return (
    <AiNode
      {...props}
      icon={<BotIcon className="h-5 w-5 text-orange-600" />}
      providerLabel="Anthropic"
      credentialType={CredentialType.ANTHROPIC}
      defaultModel="claude-sonnet-5"
    />
  );
});

export const GeminiNode = memo(function GeminiNode(props: NodeProps) {
  return (
    <AiNode
      {...props}
      icon={<BrainIcon className="h-5 w-5 text-blue-600" />}
      providerLabel="Gemini"
      credentialType={CredentialType.GOOGLE_GEMINI}
      defaultModel="gemini-2.5-flash"
    />
  );
});
