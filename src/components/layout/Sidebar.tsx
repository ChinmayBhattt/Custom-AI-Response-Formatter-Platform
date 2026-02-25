"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import ThemeToggle from "@/components/ui/ThemeToggle";

type ChatSummary = {
  id: string;
  title: string;
};

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [chats, setChats] = useState<ChatSummary[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/chat");
        if (!res.ok) return;
        const data = await res.json();
        const list = (data.chats ?? []).map((c: any) => ({
          id: c.id,
          title: c.title,
        }));
        setChats(list);
      } catch {
        // ignore
      }
    };

    load();
  }, []);

  const navItem = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          active
            ? "bg-surface-hover text-foreground"
            : "text-muted hover:text-foreground hover:bg-surface"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 border-r border-border bg-background p-4 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <Link href="/chat" className="font-bold text-foreground text-lg">
          AI Format<span className="text-primary">Hub</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="space-y-1">
        {navItem("/chat", "Chat")}
        {navItem("/dashboard", "Dashboard")}
        {navItem("/formats", "Formats")}
      </div>

      <div className="mt-6">
        <div className="text-xs uppercase tracking-wider text-muted mb-2">
          Recent Chats
        </div>
        <div className="space-y-1 max-h-[45vh] overflow-auto pr-1">
          {chats.length === 0 ? (
            <div className="text-sm text-muted">No chats yet</div>
          ) : (
            chats.map((c) => (
              <Link
                key={c.id}
                href={`/chat/${c.id}`}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname === `/chat/${c.id}`
                    ? "bg-surface-hover text-foreground"
                    : "text-muted hover:text-foreground hover:bg-surface"
                }`}
                title={c.title}
              >
                <span className="block truncate">{c.title}</span>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-border">
        <div className="text-sm text-muted mb-2">
          Signed in as <span className="text-foreground">{session?.user?.email}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-surface hover:bg-surface-hover text-foreground transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
