import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProvider } from "@/types";

export const geminiProvider: AIProvider = {
  async generateResponse(messages, systemPrompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set in .env");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
    });

    // Gemini requires strictly alternating user/model turns
    // Build a clean alternating history from all but the last message
    const raw = messages.slice(0, -1);
    const alternating: { role: "user" | "model"; parts: { text: string }[] }[] = [];
    for (const m of raw) {
      const role = m.role === "assistant" ? "model" : "user";
      const last = alternating[alternating.length - 1];
      if (last && last.role === role) {
        // Merge consecutive same-role messages
        last.parts.push({ text: m.content });
      } else {
        alternating.push({ role, parts: [{ text: m.content }] });
      }
    }

    // Gemini history must start with a user turn
    const history = alternating[0]?.role === "user" ? alternating : [];

    const lastMessage = messages[messages.length - 1];
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage?.content ?? "");
    return result.response.text();
  },
};
