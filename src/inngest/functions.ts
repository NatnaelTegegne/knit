// src/inngest/functions.ts
import prisma from "@/lib/db";
import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";


const google = createGoogleGenerativeAI();
const openai = createOpenAI();
const anthropic = createAnthropic();



export const execute = inngest.createFunction(
  { id: "execute-ai", triggers: { event: "execute/ai" } },
  async ({ event, step }) => {
 const { steps: googleSteps } = await step.ai.wrap("gemini-generate-text", generateText,
  {
    model: google("gemini-2.5-flash"),
    system: "You are a helpful assistant.",
    prompt: "What is 2 + 2?"
  });

  const { steps: openaiSteps } = await step.ai.wrap("openai-generate-text", generateText,
  {
    model: openai("gpt-3.5-turbo"),
    system: "You are a helpful assistant.",
    prompt: "What is 2 + 2?"
  });
  
  const { steps: anthropicSteps } = await step.ai.wrap("anthropic-generate-text", generateText,
  {
    model: anthropic("claude-3-5-sonnet-20240620"),
    system: "You are a helpful assistant.",
    prompt: "What is 2 + 2?"
  });

  return {
    googleSteps,
    openaiSteps,
    anthropicSteps
  };
},

);