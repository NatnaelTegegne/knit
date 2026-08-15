'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2Icon } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

// Declared here rather than imported from lib/social-providers, which is
// server-only — this type is needed by client components.
export type SocialProvider = 'github' | 'google';

const PROVIDER_META: Record<SocialProvider, { label: string; logo: string }> = {
  github: { label: 'GitHub', logo: '/logos/github.svg' },
  google: { label: 'Google', logo: '/logos/google.svg' },
};

interface SocialAuthButtonsProps {
  /** Providers with credentials configured; empty renders nothing */
  providers: SocialProvider[];
  disabled?: boolean;
}

export function SocialAuthButtons({
  providers,
  disabled = false,
}: SocialAuthButtonsProps) {
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null);

  if (providers.length === 0) return null;

  const handleSignIn = async (provider: SocialProvider) => {
    setPendingProvider(provider);

    // On success the browser is redirected to the provider, so this promise
    // only settles when something has gone wrong.
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: '/workflows',
    });

    if (error) {
      toast.error(
        error.message || `Could not continue with ${PROVIDER_META[provider].label}`
      );
      setPendingProvider(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {providers.map((provider) => {
        const { label, logo } = PROVIDER_META[provider];
        const isPending = pendingProvider === provider;

        return (
          <Button
            key={provider}
            // type="button" matters: these render inside the credentials <form>,
            // and without it a click submits that form instead.
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleSignIn(provider)}
            disabled={disabled || pendingProvider !== null}
          >
            {isPending ? (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Image
                src={logo}
                alt=""
                width={20}
                height={20}
                className="mr-2"
              />
            )}
            Continue with {label}
          </Button>
        );
      })}

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>
    </div>
  );
}
