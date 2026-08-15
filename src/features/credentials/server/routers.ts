import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import prisma from '@/lib/db';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/config/constants';
import { CredentialType } from '@/generated/prisma/enums';
import { encrypt, decrypt, maskSecret } from '@/lib/cryptor';

/**
 * Credential values are write-only from the browser's point of view: they go in
 * encrypted and never come back out. Every read path here selects explicit
 * fields rather than the whole row, so `value` can't leak by accident.
 */
const SAFE_FIELDS = {
  id: true,
  name: true,
  type: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const credentialsRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z.number().default(DEFAULT_PAGE_SIZE),
        search: z.string().default(''),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = {
        userId: ctx.auth.user.id,
        ...(input.search
          ? { name: { contains: input.search, mode: 'insensitive' as const } }
          : {}),
      };

      const [items, total] = await Promise.all([
        prisma.credential.findMany({
          where,
          select: SAFE_FIELDS,
          orderBy: { updatedAt: 'desc' },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
        }),
        prisma.credential.count({ where }),
      ]);

      return {
        items,
        total,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil(total / input.pageSize),
      };
    }),

  // Used by node config dialogs to populate the credential dropdown
  getByType: protectedProcedure
    .input(z.object({ type: z.enum(CredentialType) }))
    .query(async ({ ctx, input }) => {
      return prisma.credential.findMany({
        where: { userId: ctx.auth.user.id, type: input.type },
        select: SAFE_FIELDS,
        orderBy: { name: 'asc' },
      });
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const credential = await prisma.credential.findUnique({
        where: { id: input.id, userId: ctx.auth.user.id },
        select: {
          ...SAFE_FIELDS,
          value: true,
          _count: { select: { nodes: true } },
        },
      });

      if (!credential) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Credential not found' });
      }

      const { value, _count, ...rest } = credential;

      // Show a hint of the stored secret, never the secret itself
      let hint: string;
      try {
        hint = maskSecret(decrypt(value));
      } catch {
        hint = 'unreadable — encryption key may have changed';
      }

      return { ...rest, hint, nodeCount: _count.nodes };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required').max(100),
        type: z.enum(CredentialType),
        value: z.string().min(1, 'Value is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const credential = await prisma.credential.create({
        data: {
          name: input.name,
          type: input.type,
          value: encrypt(input.value),
          userId: ctx.auth.user.id,
        },
        select: SAFE_FIELDS,
      });

      return credential;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        // Omit to keep the existing secret; supply to rotate it
        value: z.string().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.credential.findUnique({
        where: { id: input.id, userId: ctx.auth.user.id },
        select: { id: true },
      });

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Credential not found' });
      }

      return prisma.credential.update({
        where: { id: input.id },
        data: {
          ...(input.name ? { name: input.name } : {}),
          ...(input.value ? { value: encrypt(input.value) } : {}),
        },
        select: SAFE_FIELDS,
      });
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.credential.findUnique({
        where: { id: input.id, userId: ctx.auth.user.id },
        select: { id: true },
      });

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Credential not found' });
      }

      // Nodes referencing this credential have credentialId set to null
      // (onDelete: SetNull) and will fail at run time with a clear message.
      await prisma.credential.delete({ where: { id: input.id } });

      return { success: true };
    }),
});
