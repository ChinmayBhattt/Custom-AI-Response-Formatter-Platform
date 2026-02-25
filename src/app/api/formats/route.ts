import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const formats = await prisma.format.findMany({
    where: {
      OR: [{ isBuiltIn: true }, { userId }],
    },
    orderBy: [{ isBuiltIn: "desc" }, { name: "asc" }],
  });

  return NextResponse.json({ formats });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const body = await req.json();
  const { name, pattern, prefix, description } = body as {
    name?: string;
    pattern?: string;
    prefix?: string;
    description?: string;
  };

  if (!name || !pattern) {
    return NextResponse.json(
      { error: "Name and pattern are required" },
      { status: 400 }
    );
  }

  const format = await prisma.format.create({
    data: {
      name,
      pattern,
      prefix: prefix ?? "",
      description: description ?? "",
      isBuiltIn: false,
      userId,
    },
  });

  return NextResponse.json({ format });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing format id" }, { status: 400 });
  }

  const format = await prisma.format.findUnique({ where: { id } });
  if (!format || format.isBuiltIn || format.userId !== userId) {
    return NextResponse.json({ error: "Cannot delete" }, { status: 403 });
  }

  await prisma.format.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
