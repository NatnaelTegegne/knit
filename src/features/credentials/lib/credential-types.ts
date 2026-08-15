import { CredentialType, NodeType } from '@/generated/prisma/enums';

export const CREDENTIAL_TYPE_LABELS: Record<CredentialType, string> = {
  [CredentialType.OPENAI]: 'OpenAI API Key',
  [CredentialType.ANTHROPIC]: 'Anthropic API Key',
  [CredentialType.GOOGLE_GEMINI]: 'Google Gemini API Key',
  [CredentialType.DISCORD_WEBHOOK]: 'Discord Webhook URL',
  [CredentialType.SLACK_WEBHOOK]: 'Slack Webhook URL',
  [CredentialType.API_KEY]: 'Generic API Key',
};

export const CREDENTIAL_TYPE_HINTS: Record<CredentialType, string> = {
  [CredentialType.OPENAI]: 'Starts with sk-. From platform.openai.com → API keys.',
  [CredentialType.ANTHROPIC]: 'Starts with sk-ant-. From console.anthropic.com.',
  [CredentialType.GOOGLE_GEMINI]: 'From Google AI Studio → Get API key.',
  [CredentialType.DISCORD_WEBHOOK]:
    'Channel → Edit Channel → Integrations → Webhooks → Copy Webhook URL.',
  [CredentialType.SLACK_WEBHOOK]:
    'api.slack.com/apps → your app → Incoming Webhooks → Add New Webhook.',
  [CredentialType.API_KEY]: 'Any secret you want to reference from a node.',
};

/** Which credential type a given node type consumes, if any. */
export const NODE_CREDENTIAL_TYPE: Partial<Record<NodeType, CredentialType>> = {
  [NodeType.OPENAI]: CredentialType.OPENAI,
  [NodeType.ANTHROPIC]: CredentialType.ANTHROPIC,
  [NodeType.GOOGLE_GEMINI]: CredentialType.GOOGLE_GEMINI,
  [NodeType.DISCORD]: CredentialType.DISCORD_WEBHOOK,
  [NodeType.SLACK]: CredentialType.SLACK_WEBHOOK,
};
