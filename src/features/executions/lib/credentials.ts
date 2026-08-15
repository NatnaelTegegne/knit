import 'server-only';

import prisma from '@/lib/db';
import { decrypt } from '@/lib/cryptor';
import type { CredentialType } from '@/generated/prisma/enums';

export class MissingCredentialError extends Error {
  constructor(nodeType: string) {
    super(
      `${nodeType}: no credential selected. Open the node and choose one, or add it under Credentials.`
    );
    this.name = 'MissingCredentialError';
  }
}

/**
 * Load and decrypt the credential a node is configured to use.
 *
 * `ownerUserId` comes from the workflow's owner, never from the node data, so a
 * tampered `credentialId` can't reach another user's secrets: the lookup is
 * scoped by userId and simply finds nothing.
 */
export async function resolveCredential(
  nodeType: string,
  credentialId: string | null | undefined,
  ownerUserId: string,
  expectedType: CredentialType
): Promise<string> {
  if (!credentialId) {
    throw new MissingCredentialError(nodeType);
  }

  const credential = await prisma.credential.findUnique({
    where: { id: credentialId, userId: ownerUserId },
    select: { value: true, type: true },
  });

  if (!credential) {
    // Either it never existed, was deleted (onDelete: SetNull), or belongs to
    // someone else. All three are the same thing from here: unusable.
    throw new MissingCredentialError(nodeType);
  }

  if (credential.type !== expectedType) {
    throw new Error(
      `${nodeType}: selected credential is a ${credential.type}, but this node needs a ${expectedType}.`
    );
  }

  return decrypt(credential.value);
}
