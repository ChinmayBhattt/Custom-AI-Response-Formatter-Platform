"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import FormatSelector from "@/components/format/FormatSelector";
import type { ChatMessage, FormatDefinition } from "@/types";

type Props = {
  chatId?: string;
  initialMessages?: ChatMessage[];
  initialFormatId?: string;
};

export default function ChatWindow({ chatId: initialChatId, initialMessages = [], initialFormatId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(initialChatId);
  const [formatId, setFormatId] = useState(initialFormatId ?? "arrow");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      rawContent: input,
      formattedContent: input,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, formatId, chatId }),
      });
      const data = await res.json();
      if (data.chatId) setChatId(data.chatId);

      // Replace temp user msg with real one, add assistant msg
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== userMessage.id);
        return [
          ...filtered,
          {
            id: data.userMessage.id,
            role: "user",
            rawContent: data.userMessage.rawContent,
            formattedContent: data.userMessage.formattedContent,
            createdAt: data.userMessage.createdAt,
          },
          {
            id: data.assistantMessage.id,
            role: "assistant",
            rawContent: data.assistantMessage.rawContent,
            formattedContent: data.assistantMessage.formattedContent,
            formatId: data.assistantMessage.formatId,
            createdAt: data.assistantMessage.createdAt,
          },
        ];
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          rawContent: "Sorry, something went wrong.",
          formattedContent: "Sorry, something went wrong.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleExport = () => {
    const text = messages
      .map((m) =>
        m.role === "user"
          ? `You: ${m.rawContent}`
          : `AI: ${m.formattedContent}`
      )
      .join("\n\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat-export.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <FormatSelector
          selectedId={formatId}
          onSelect={(f: FormatDefinition) => setFormatId(f.id)}
        />
        <button
          onClick={handleExport}
          className="px-3 py-1.5 text-sm text-muted hover:text-foreground bg-surface hover:bg-surface-hover rounded-lg transition-colors"
          title="Export chat as TXT"
        >
          Export
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Start a Conversation
            </h2>
            <p className="text-muted max-w-md">
              Select a format above and ask anything. The AI will respond strictly
              in your chosen format.
            </p>
          </div>
        )}

        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-white rounded-br-md"
                    : "bg-surface text-foreground rounded-bl-md"
                }`}
              >
                <pre className="whitespace-pre-wrap text-sm font-sans">
                  {msg.role === "assistant"
                    ? msg.formattedContent
                    : msg.rawContent}
                </pre>
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-surface rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-muted rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-muted rounded-full typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="px-5 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
