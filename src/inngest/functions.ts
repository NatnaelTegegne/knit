import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { inngest } from "./client";

const google = createGoogleGenerativeAI();
const openai = createOpenAI();
const anthropic = createAnthropic();

export const execute = inngest.createFunction(
  {
    id: "execute-ai",
    retries: 2,
    triggers: { event: "execute/ai" },
  },
  async ({ step }) => {
    const options = {
      system: "You are a helpful assistant.",
      prompt: "What is 2 + 2? Answer with just the number.",
      experimental_telemetry: { isEnabled: true },
    } as const;

    const googleResult = await step.ai.wrap(
      "gemini-generate-text",
      generateText,
      { ...options, model: google("gemini-2.5-flash") },
    );
    const openaiResult = await step.ai.wrap(
      "openai-generate-text",
      generateText,
      { ...options, model: openai("gpt-4o-mini") },
    );
    const anthropicResult = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      { ...options, model: anthropic("claude-3-5-sonnet-latest") },
    );

    return {
      google: googleResult.text,
      openai: openaiResult.text,
      anthropic: anthropicResult.text,
    };
  },
);
