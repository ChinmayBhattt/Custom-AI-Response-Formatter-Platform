import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { getAIProvider } from "@/lib/ai/provider";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { enforceFormat } from "@/lib/format-engine/engine";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const chats = await prisma.chat.findMany({
    where: { userId },
    include: { format: true, messages: { take: 1, orderBy: { createdAt: "desc" } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ chats });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const body = await req.json();
  const { message, formatId, chatId } = body as {
    message: string;
    formatId: string;
    chatId?: string;
  };

  if (!message || !formatId) {
    return NextResponse.json({ error: "Missing message or formatId" }, { status: 400 });
  }

  const format = await prisma.format.findUnique({ where: { id: formatId } });
  if (!format) {
    return NextResponse.json({ error: "Format not found" }, { status: 404 });
  }

  // Create or reuse chat
  let chat;
  if (chatId) {
    chat = await prisma.chat.findUnique({
      where: { id: chatId, userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }
  } else {
    const title = message.length > 50 ? message.slice(0, 50) + "..." : message;
    chat = await prisma.chat.create({
      data: { title, userId, formatId },
      include: { messages: true },
    });
  }

  // Save user message
  const userMsg = await prisma.message.create({
    data: {
      chatId: chat.id,
      role: "user",
      rawContent: message,
      formattedContent: message,
    },
  });

  // Build conversation history for AI
  const history = chat.messages.map((m) => ({
    role: m.role,
    content: m.rawContent,
  }));
  history.push({ role: "user", content: message });

  // Get AI response
  const systemPrompt = buildSystemPrompt(format.name, format.pattern);

  let rawAIResponse: string;
  try {
    const provider = await getAIProvider("openai");
    rawAIResponse = await provider.generateResponse(history, systemPrompt);
  } catch {
    // Fallback mock response when API key not set
    rawAIResponse =
      "This is a sample response. AI integration requires a valid OpenAI API key. The format engine will still transform this response. Check your .env file for OPENAI_API_KEY.";
  }

  // Apply format engine post-processing
  const mode = format.name === "One-line" ? "one-line" : format.name === "Paragraph" ? "paragraph" : "list";
  const formattedResponse = enforceFormat({
    raw: rawAIResponse,
    pattern: format.pattern,
    prefix: format.prefix,
    mode,
  });

  // Save assistant message
  const assistantMsg = await prisma.message.create({
    data: {
      chatId: chat.id,
      role: "assistant",
      rawContent: rawAIResponse,
      formattedContent: formattedResponse,
      formatId: format.id,
    },
  });

  // Track format usage
  await prisma.formatUsage.create({
    data: { userId, formatId: format.id },
  });

  // Update chat timestamp
  await prisma.chat.update({
    where: { id: chat.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({
    chatId: chat.id,
    userMessage: userMsg,
    assistantMessage: assistantMsg,
  });
}
