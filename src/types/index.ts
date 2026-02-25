export interface FormatDefinition {
  id: string;
  name: string;
  pattern: string;
  prefix: string;
  description: string;
  isBuiltIn: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  rawContent: string;
  formattedContent: string;
  formatId?: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  formatId: string;
  format: FormatDefinition;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsData {
  mostUsedFormat: { name: string; count: number } | null;
  formatDistribution: { name: string; value: number }[];
  weeklyTrend: { date: string; count: number }[];
  heatmap: { day: string; hour: number; count: number }[];
  totalChats: number;
  totalMessages: number;
  favoriteFormat: string | null;
}

export interface AIProvider {
  generateResponse(
    messages: { role: string; content: string }[],
    systemPrompt: string
  ): Promise<string>;
}
