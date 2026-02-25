import type { AIProvider } from "@/types";

export const geminiProvider: AIProvider = {
  async generateResponse() {
    throw new Error(
      "Gemini provider not implemented yet. Add Gemini SDK integration here."
    );
  },
};
