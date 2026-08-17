import {
  PlayIcon,
  FileSpreadsheetIcon,
  CreditCardIcon,
  GlobeIcon,
  SparklesIcon,
  BotIcon,
  BrainIcon,
  MessageSquareIcon,
  HashIcon,
  type LucideIcon,
} from 'lucide-react';

/**
 * Everything named here is a node type that actually exists in the product.
 * Keep it that way — if a node is removed from NodeType, remove it here too.
 */
interface NodeEntry {
  label: string;
  description: string;
  icon: LucideIcon;
  className: string;
}

interface NodeGroup {
  title: string;
  blurb: string;
  nodes: NodeEntry[];
}

export const NODE_GROUPS: NodeGroup[] = [
  {
    title: 'Triggers',
    blurb: 'What starts a run.',
    nodes: [
      {
        label: 'Manual',
        description: 'Run it yourself from the editor',
        icon: PlayIcon,
        className: 'text-primary',
      },
      {
        label: 'Google Form',
        description: 'Fires on every form submission',
        icon: FileSpreadsheetIcon,
        className: 'text-purple-600',
      },
      {
        label: 'Stripe',
        description: 'Fires on a signed Stripe event',
        icon: CreditCardIcon,
        className: 'text-indigo-600',
      },
    ],
  },
  {
    title: 'Actions',
    blurb: 'Talk to anything with an API.',
    nodes: [
      {
        label: 'HTTP Request',
        description: 'Any method, headers and body',
        icon: GlobeIcon,
        className: 'text-sky-600',
      },
    ],
  },
  {
    title: 'AI',
    blurb: 'Bring your own key.',
    nodes: [
      {
        label: 'OpenAI',
        description: 'Generate text with a GPT model',
        icon: SparklesIcon,
        className: 'text-emerald-600',
      },
      {
        label: 'Anthropic',
        description: 'Generate text with a Claude model',
        icon: BotIcon,
        className: 'text-orange-600',
      },
      {
        label: 'Gemini',
        description: 'Generate text with a Gemini model',
        icon: BrainIcon,
        className: 'text-blue-600',
      },
    ],
  },
  {
    title: 'Messaging',
    blurb: 'Tell someone what happened.',
    nodes: [
      {
        label: 'Discord',
        description: 'Post to a channel webhook',
        icon: MessageSquareIcon,
        className: 'text-indigo-500',
      },
      {
        label: 'Slack',
        description: 'Post to a channel webhook',
        icon: HashIcon,
        className: 'text-rose-500',
      },
    ],
  },
];

interface Feature {
  title: string;
  body: string;
}

/** Each of these describes behaviour that is implemented today. */
export const FEATURES: Feature[] = [
  {
    title: 'Runs in the background',
    body: 'Every workflow executes as a queued job, so a slow API call never blocks a request or times out mid-run. Steps retry on failure.',
  },
  {
    title: 'Data flows between nodes',
    body: 'Give a node a variable name and reference its output anywhere downstream with {{ name.field }} — in a URL, a request body, or a prompt.',
  },
  {
    title: 'Your keys, encrypted',
    body: 'Credentials are encrypted with AES-256-GCM before they are stored, decrypted only on the server at run time, and never sent back to the browser.',
  },
  {
    title: 'Every run is recorded',
    body: 'Execution history keeps each node’s output, and the error and stack trace when something fails — so a failure at 3am is still there in the morning.',
  },
  {
    title: 'Watch it happen',
    body: 'Node indicators update live on the canvas as a run progresses, so you can see exactly which step is working and which one broke.',
  },
  {
    title: 'Webhooks are verified',
    body: 'Incoming Stripe events are signature-checked with a replay window before anything runs. Unsigned requests never reach your workflow.',
  },
];

/** The example rendered in the hero — mirrors a workflow you could really build. */
export const PREVIEW_NODES = [
  {
    label: 'Google Form',
    caption: 'on submit',
    icon: FileSpreadsheetIcon,
    className: 'text-purple-600',
  },
  {
    label: 'HTTP Request',
    caption: 'GET /customers',
    icon: GlobeIcon,
    className: 'text-sky-600',
  },
  {
    label: 'Gemini',
    caption: 'summarise reply',
    icon: BrainIcon,
    className: 'text-blue-600',
  },
  {
    label: 'Slack',
    caption: 'post to #leads',
    icon: HashIcon,
    className: 'text-rose-500',
  },
];
