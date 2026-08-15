import 'server-only';

import type { SocialProvider } from '../components/social-auth-buttons';

export const SOCIAL_PROVIDERS = ['github', 'google'] as const satisfies readonly SocialProvider[];

const ENV_KEYS: Record<SocialProvider, { id: string; secret: string }> = {
  github: { id: 'GITHUB_CLIENT_ID', secret: 'GITHUB_CLIENT_SECRET' },
  google: { id: 'GOOGLE_CLIENT_ID', secret: 'GOOGLE_CLIENT_SECRET' },
};

function isConfigured(provider: SocialProvider): boolean {
  const { id, secret } = ENV_KEYS[provider];
  return Boolean(process.env[id] && process.env[secret]);
}

/**
 * Which social providers actually have credentials set.
 *
 * The auth pages use this to decide which buttons to render, so a provider that
 * hasn't been set up doesn't show a button that fails on click. Server-only —
 * it reads raw env vars and must never reach the browser.
 */
export function getEnabledSocialProviders(): SocialProvider[] {
  return SOCIAL_PROVIDERS.filter(isConfigured);
}
