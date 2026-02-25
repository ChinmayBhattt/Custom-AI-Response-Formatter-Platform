"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#06b6d4"];

type AnalyticsResponse = {
  mostUsedFormat: { name: string; value: number } | null;
  formatDistribution: { name: string; value: number }[];
  weeklyTrend: { date: string; count: number }[];
  heatmap: { day: string; hour: number; count: number }[];
  totalChats: number;
  totalMessages: number;
  favoriteFormat: string | null;
};

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="p-8">
        <div className="text-muted">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted text-sm mt-1">
          Understand how formats are being used over time.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="text-muted text-sm">Total Chats</div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {data.totalChats}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="text-muted text-sm">Total Messages</div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {data.totalMessages}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="text-muted text-sm">Favorite Format</div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {data.favoriteFormat || "—"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Format usage distribution */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-3">Format Usage</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.formatDistribution}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                >
                  {data.formatDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly trend */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-3">Weekly Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.weeklyTrend}>
                <XAxis dataKey="date" hide />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most used formats bar */}
        <div className="bg-surface border border-border rounded-xl p-6 col-span-2">
          <h3 className="font-semibold text-foreground mb-3">Most Used Formats</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.formatDistribution}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heatmap */}
        <div className="bg-surface border border-border rounded-xl p-6 col-span-2">
          <h3 className="font-semibold text-foreground mb-3">Weekly Heatmap</h3>
          <p className="text-muted text-sm mb-4">
            Usage activity by day and hour.
          </p>
          <div className="overflow-auto">
            <div className="min-w-[900px] grid" style={{ gridTemplateColumns: "80px repeat(24, 1fr)" }}>
              <div />
              {Array.from({ length: 24 }).map((_, h) => (
                <div key={h} className="text-xs text-muted text-center pb-2">
                  {h}
                </div>
              ))}

              {[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ].map((day) => (
                <>
                  <div className="text-xs text-muted flex items-center">{day}</div>
                  {Array.from({ length: 24 }).map((_, h) => {
                    const cell = data.heatmap.find((c) => c.day === day && c.hour === h);
                    const count = cell?.count ?? 0;
                    const intensity = Math.min(1, count / 5);
                    return (
                      <div
                        key={`${day}-${h}`}
                        title={`${day} ${h}:00 — ${count}`}
                        className="h-6 m-0.5 rounded"
                        style={{
                          background: `rgba(99, 102, 241, ${0.1 + intensity * 0.8})`,
                        }}
                      />
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
