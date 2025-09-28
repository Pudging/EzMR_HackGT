"use server";
import { Agent } from "@mastra/core";
import { google } from "@ai-sdk/google";
import { env } from "@/env";

function getTextFromMastraResult(result: unknown): string {
  if (!result || typeof result !== "object") return "";
  const r = result as Record<string, unknown>;
  // Common shapes: { text }, { output: { text } }, { message: { content } }
  if (typeof r.text === "string") return r.text;
  const output = r.output as Record<string, unknown> | undefined;
  if (output && typeof output.text === "string") return output.text;
  const message = r.message as Record<string, unknown> | undefined;
  if (message && typeof message.content === "string") return message.content;
  return "";
}

export async function runMastraGenerate(
  prompt: string,
  modelName: string,
): Promise<string> {
  const AgentCtor = Agent as unknown as new (config: unknown) => unknown;

  if (!AgentCtor) {
    throw new Error("Mastra Agent not available");
  }

  const config = {
    name: "EMR Agent",
    instructions:
      "You are an EMR parsing and categorization agent. Always return strict JSON.",
    model: google(modelName),
  };

  const agent = new Agent(config);

  let result: unknown;
  if (typeof agent.generate === "function") {
    result = await agent.generateVNext(prompt);
    // }
    //  else if (typeof agent.run === "function") {
    //   result = await agent.run({ input: prompt });
  } else {
    throw new Error("Mastra Agent has no callable generate/run method");
  }

  const text = getTextFromMastraResult(result);
  if (!text) {
    throw new Error("Mastra Agent returned empty output");
  }
  return text;
}
