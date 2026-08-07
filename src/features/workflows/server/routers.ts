import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import prisma from '@/lib/db';
import { z } from 'zod';
import { generateSlug } from 'random-word-slugs';
import { TRPCError } from '@trpc/server';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/config/constants';
import { mapNodesToReactFlow, mapConnectionsToReactFlow } from '@/features/editor/lib/mapping';
import { inngest } from '@/inngest/client';

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
