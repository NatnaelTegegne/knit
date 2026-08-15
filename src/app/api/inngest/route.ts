import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { functions } from "@/inngest/functions";

// Inngest calls this route once per step.run, so a single invocation only has to
// outlast the slowest step (the HTTP node caps ky at 30s). 60 is the Vercel Hobby
// ceiling; raise to 300 on Pro if a step ever needs longer.
export const maxDuration = 60;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
