import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import prisma from '@/lib/db';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/config/constants';

export const executionsRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z.number().default(DEFAULT_PAGE_SIZE),
        search: z.string().default(''),
        // Optional filter for the "runs of this workflow" view
        workflowId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = {
        userId: ctx.auth.user.id,
        ...(input.workflowId ? { workflowId: input.workflowId } : {}),
        ...(input.search
          ? {
              workflow: {
                name: { contains: input.search, mode: 'insensitive' as const },
              },
            }
          : {}),
      };

      const [items, total] = await Promise.all([
        prisma.execution.findMany({
          where,
          select: {
            id: true,
            status: true,
            triggerType: true,
            error: true,
            startedAt: true,
            completedAt: true,
            workflowId: true,
            workflow: { select: { name: true } },
          },
          orderBy: { startedAt: 'desc' },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
        }),
        prisma.execution.count({ where }),
      ]);

      return {
        items,
        total,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil(total / input.pageSize),
      };
    }),

  /**
   * Most recent run of one workflow, used by the editor to drive live node
   * status. Deliberately small — it's polled while a run is in flight.
   */
  getLatestForWorkflow: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .query(async ({ ctx, input }) => {
      const execution = await prisma.execution.findFirst({
        where: { workflowId: input.workflowId, userId: ctx.auth.user.id },
        select: {
          id: true,
          status: true,
          nodeStatuses: true,
          error: true,
          startedAt: true,
        },
        orderBy: { startedAt: 'desc' },
      });

      return execution;
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const execution = await prisma.execution.findUnique({
        where: { id: input.id, userId: ctx.auth.user.id },
        include: { workflow: { select: { id: true, name: true } } },
      });

      if (!execution) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Execution not found' });
      }

      return execution;
    }),
});
