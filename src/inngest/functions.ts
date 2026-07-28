// src/inngest/functions.ts
import prisma from "@/lib/db";
import { inngest } from "./client";

export const processTask = inngest.createFunction(
  { id: "process-task", triggers: { event: "app/task.created" } },
  async ({ event, step }) => {
    const result = await step.run("handle-task", async () => {
      return { processed: true, id: event.data.id };
    });

    await step.sleep("fetching", "5s");
    await step.sleep("transcribing", "5s");

    await step.sleep("sending-to-ai", "5s");
    await step.run("create-workflow", () => {
      return prisma.workflow.create({
        data: {
          name: "test-workflow",
        },
      });
    })

    return { message: `Task ${event.data.id} complete`, result };
  }
);