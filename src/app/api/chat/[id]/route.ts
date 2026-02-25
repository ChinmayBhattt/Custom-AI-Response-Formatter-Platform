import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const chat = await prisma.chat.findFirst({
    where: { id, userId },
    include: { format: true, messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  return NextResponse.json({ chat });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  await prisma.chat.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}
