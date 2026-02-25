import OpenAI from "openai";
import type { AIProvider } from "@/types";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const openaiProvider: AIProvider = {
  async generateResponse(messages, systemPrompt) {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    return response.choices[0]?.message?.content ?? "";
  },
};
