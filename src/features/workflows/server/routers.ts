import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import prisma from '@/lib/db';
import { z } from 'zod';
import { generateSlug } from 'random-word-slugs';
import { TRPCError } from '@trpc/server';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/config/constants';
import { mapNodesToReactFlow, mapConnectionsToReactFlow } from '@/features/editor/lib/mapping';
import { inngest } from '@/inngest/client';
import { NodeType } from '@/generated/prisma/enums';

export const workflowsRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(DEFAULT_PAGE),
        pageSize: z.number().min(1).max(100).default(DEFAULT_PAGE_SIZE),
        search: z.string().default(''),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;
      const skip = (page - 1) * pageSize;

      const where = {
        userId: ctx.auth.user.id,
        ...(search && {
          name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }),
      };

      const [workflows, total] = await Promise.all([
        prisma.workflow.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
        }),
        prisma.workflow.count({ where }),
      ]);

      return {
        workflows,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const workflow = await prisma.workflow.findUnique({
        where: { id: input.id },
        include: {
          nodes: true,
          connections: true,
        },
      });

      if (!workflow) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow not found' });
      }

      if (workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
      }

      return {
        ...workflow,
        nodes: mapNodesToReactFlow(workflow.nodes),
        edges: mapConnectionsToReactFlow(workflow.connections),
      };
    }),

  create: protectedProcedure.mutation(async ({ ctx }) => {
    const name = generateSlug(3, { format: 'kebab' });

    return prisma.workflow.create({
      data: {
        name,
        userId: ctx.auth.user.id,
      },
    });
  }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const workflow = await prisma.workflow.findUnique({
        where: { id: input.id },
      });

      if (!workflow) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow not found' });
      }

      if (workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
      }

      return prisma.workflow.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const workflow = await prisma.workflow.findUnique({
        where: { id: input.id },
      });

      if (!workflow) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow not found' });
      }

      if (workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
      }

      await prisma.workflow.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  saveCanvas: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nodes: z.array(
          z.object({
            id: z.string(),
            // Derived from the Prisma enum so new node types don't need a second edit here
            type: z.enum(NodeType),
            positionX: z.number(),
            positionY: z.number(),
            data: z.record(z.string(), z.unknown()),
            credentialId: z.string().nullable().default(null),
          })
        ),
        connections: z.array(
          z.object({
            id: z.string(),
            sourceNodeId: z.string(),
            sourceHandle: z.string().nullable(),
            targetNodeId: z.string(),
            targetHandle: z.string().nullable(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workflow = await prisma.workflow.findUnique({
        where: { id: input.id },
      });

      if (!workflow) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow not found' });
      }

      if (workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
      }

      // Reject credential IDs the caller doesn't own before they reach the DB.
      // resolveCredential() also scopes by userId at run time, but failing here
      // means a tampered ID never gets persisted in the first place.
      const requestedCredentialIds = [
        ...new Set(
          input.nodes
            .map((node) => node.credentialId)
            .filter((id): id is string => typeof id === 'string')
        ),
      ];

      if (requestedCredentialIds.length > 0) {
        const owned = await prisma.credential.count({
          where: {
            id: { in: requestedCredentialIds },
            userId: ctx.auth.user.id,
          },
        });

        if (owned !== requestedCredentialIds.length) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'One or more selected credentials do not exist',
          });
        }
      }

      // Use a transaction to update nodes and connections atomically
      await prisma.$transaction(async (tx) => {
        // Delete existing nodes (connections cascade)
        await tx.node.deleteMany({
          where: { workflowId: input.id },
        });

        // Create new nodes
        if (input.nodes.length > 0) {
          await tx.node.createMany({
            data: input.nodes.map((node) => ({
              id: node.id,
              type: node.type,
              positionX: node.positionX,
              positionY: node.positionY,
              data: node.data as object,
              credentialId: node.credentialId,
              workflowId: input.id,
            })),
          });
        }

        // Create new connections
        if (input.connections.length > 0) {
          await tx.connection.createMany({
            data: input.connections.map((conn) => ({
              id: conn.id,
              sourceNodeId: conn.sourceNodeId,
              sourceHandle: conn.sourceHandle,
              targetNodeId: conn.targetNodeId,
              targetHandle: conn.targetHandle,
              workflowId: input.id,
            })),
          });
        }

        // Update workflow timestamp
        await tx.workflow.update({
          where: { id: input.id },
          data: { updatedAt: new Date() },
        });
      });

      return { success: true };
    }),

  execute: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const workflow = await prisma.workflow.findUnique({
        where: { id: input.id },
        include: { nodes: true },
      });

      if (!workflow) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow not found' });
      }

      if (workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
      }

      if (workflow.nodes.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Workflow has no nodes to execute' });
      }

      // Send event to Inngest to execute the workflow
      await inngest.send({
        name: 'workflow/execute',
        data: {
          workflowId: workflow.id,
          userId: ctx.auth.user.id,
        },
      });

      return { success: true, workflowId: workflow.id };
    }),
});
