import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import ChatWindow from "@/components/chat/ChatWindow";
import type { ChatMessage } from "@/types";

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const userId = (session.user as { id: string }).id;

  const chat = await prisma.chat.findFirst({
    where: { id, userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!chat) redirect("/chat");

  const messages: ChatMessage[] = chat.messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    rawContent: m.rawContent,
    formattedContent: m.formattedContent,
    formatId: m.formatId ?? undefined,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <ChatWindow
      chatId={chat.id}
      initialMessages={messages}
      initialFormatId={chat.formatId}
    />
  );
}
