'use client';

import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import type { CredentialType } from '@/generated/prisma/enums';
import { CREDENTIAL_TYPE_LABELS } from '../lib/credential-types';

interface CredentialSelectProps {
  type: CredentialType;
  value: string | null;
  onChange: (credentialId: string) => void;
  error?: string;
}

/**
 * Credential picker for node config dialogs. Lists only the current user's
 * credentials of the matching type; the secret itself never reaches the client.
 */
export function CredentialSelect({
  type,
  value,
  onChange,
  error,
}: CredentialSelectProps) {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.credentials.getByType.queryOptions({ type })
  );

  const credentials = data ?? [];
  const hasNone = !isLoading && credentials.length === 0;

  return (
    <div className="grid gap-2">
      <Label htmlFor="credential">Credential</Label>
      <Select
        value={value ?? ''}
        onValueChange={onChange}
        disabled={isLoading || hasNone}
      >
        <SelectTrigger id="credential">
          <SelectValue
            placeholder={
              isLoading
                ? 'Loading…'
                : hasNone
                  ? `No ${CREDENTIAL_TYPE_LABELS[type]} saved`
                  : 'Select a credential'
            }
          />
        </SelectTrigger>
        <SelectContent>
          {credentials.map((credential) => (
            <SelectItem key={credential.id} value={credential.id}>
              {credential.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {hasNone && (
        <p className="text-xs text-muted-foreground">
          Add a {CREDENTIAL_TYPE_LABELS[type]} under{' '}
          <Link href="/workflows/credentials" className="underline">
            Credentials
          </Link>{' '}
          first.
        </p>
      )}
    </div>
  );
}
