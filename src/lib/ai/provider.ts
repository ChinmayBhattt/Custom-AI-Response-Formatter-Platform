import type { AIProvider } from "@/types";

export type AIProviderType = "openai" | "gemini";

const providers: Record<AIProviderType, () => Promise<AIProvider>> = {
  openai: () => import("./openai").then((m) => m.openaiProvider),
  gemini: () => import("./gemini").then((m) => m.geminiProvider),
};

export async function getAIProvider(
  type: AIProviderType = "openai"
): Promise<AIProvider> {
  const loader = providers[type];
  if (!loader) throw new Error(`Unknown AI provider: ${type}`);
  return loader();
}
