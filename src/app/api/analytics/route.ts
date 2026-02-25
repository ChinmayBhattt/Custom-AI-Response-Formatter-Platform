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

  // Format usage distribution
  const usages = await prisma.formatUsage.findMany({
    where: { userId },
    include: { format: true },
  });

  const formatCounts: Record<string, number> = {};
  for (const u of usages) {
    const name = u.format.name;
    formatCounts[name] = (formatCounts[name] || 0) + 1;
  }

  const formatDistribution = Object.entries(formatCounts).map(
    ([name, value]) => ({ name, value })
  );

  // Most used
  const sorted = [...formatDistribution].sort((a, b) => b.value - a.value);
  const mostUsedFormat = sorted[0] ?? null;

  // Weekly trend (last 7 days)
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentUsages = usages.filter(
    (u) => new Date(u.usedAt) >= weekAgo
  );

  const weeklyTrend: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    weeklyTrend[key] = 0;
  }
  for (const u of recentUsages) {
    const key = new Date(u.usedAt).toISOString().slice(0, 10);
    if (key in weeklyTrend) weeklyTrend[key]++;
  }
  const weeklyTrendArr = Object.entries(weeklyTrend).map(([date, count]) => ({
    date,
    count,
  }));

  // Heatmap (day x hour)
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const heatmap: { day: string; hour: number; count: number }[] = [];
  const heatCounts: Record<string, number> = {};
  for (const u of usages) {
    const d = new Date(u.usedAt);
    const key = `${days[d.getDay()]}-${d.getHours()}`;
    heatCounts[key] = (heatCounts[key] || 0) + 1;
  }
  for (const day of days) {
    for (let h = 0; h < 24; h++) {
      heatmap.push({ day, hour: h, count: heatCounts[`${day}-${h}`] || 0 });
    }
  }

  // Total stats
  const totalChats = await prisma.chat.count({ where: { userId } });
  const totalMessages = await prisma.message.count({
    where: { chat: { userId } },
  });

  return NextResponse.json({
    mostUsedFormat,
    formatDistribution,
    weeklyTrend: weeklyTrendArr,
    heatmap,
    totalChats,
    totalMessages,
    favoriteFormat: mostUsedFormat?.name ?? null,
  });
}
