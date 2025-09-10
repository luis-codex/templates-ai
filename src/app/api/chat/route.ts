import { google } from "@ai-sdk/google";
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";
import { readFile } from "fs/promises";

export const maxDuration = 30;
let systemPrompt: string | null = null;

export async function POST(req: Request) {
  systemPrompt = !systemPrompt
    ? await readFile(new URL("./promt.txt", import.meta.url), "utf8")
    : systemPrompt;

  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}