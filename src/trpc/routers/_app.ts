import { inngest } from '@/inngest/client';
import { createTRPCRouter, protectedProcedure } from '../init';
import prisma from '@/lib/db';

export const appRouter = createTRPCRouter({
  // the protectedProcedure is a baseProcedure that checks if the user is authenticated and throws an error if not
  getWorkflows: protectedProcedure.query(({ ctx }) => {
    // console.log({ userId: ctx.auth.user.id}) 
      return prisma.workflow.findMany();
    }),
    createWorkflow: protectedProcedure.mutation(async () => {
      // create a new workflow in the database
      await inngest.send({
        name: "app/task.created",
        data: {
          id: "123",
        },
      });
      return {onSuccess: true, message: "Workflow created" };
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;