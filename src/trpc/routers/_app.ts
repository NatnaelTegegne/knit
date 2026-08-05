import { inngest } from '@/inngest/client';
import { createTRPCRouter, protectedProcedure } from '../init';
import { workflowsRouter } from '@/features/workflows/server/routers';

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,

  testAi: protectedProcedure.mutation(async () => {
    const { ids } = await inngest.send({
      name: "execute/ai",
    });

    return {
      onSuccess: true,
      message: "AI job queued",
      eventIds: ids,
    };
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
