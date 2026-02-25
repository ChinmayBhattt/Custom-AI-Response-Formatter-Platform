import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProvider } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export const geminiProvider: AIProvider = {
  async generateResponse(messages, systemPrompt) {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
    });

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage?.content ?? "");
    return result.response.text();
  },
};
