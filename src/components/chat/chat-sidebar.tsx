"use client";

import { cn } from "@/lib/utils";
import { MessageSquare, Plus, Trash2, Clock, Sparkles } from "lucide-react";
import { useState } from "react";

// ───────────────────────────────────────────────────────────────
//  Types
// ───────────────────────────────────────────────────────────────

interface Session {
  id: string;
  title: string;
  timestamp: Date;
  messageCount: number;
}

interface ChatSidebarProps {
  sessions?: Session[];
  activeSessionId?: string;
  onNewSession?: () => void;
  onSelectSession?: (id: string) => void;
  onDeleteSession?: (id: string) => void;
  className?: string;
}

// ───────────────────────────────────────────────────────────────
//  ChatSidebar — vertical workflow sidebar listing past chat
//  sessions with quick actions. Collapses on narrow viewports
//  into a toggleable drawer.
// ───────────────────────────────────────────────────────────────

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

const DEMO_SESSIONS: Session[] = [
  {
    id: "s1",
    title: "Top products analysis",
    timestamp: new Date(Date.now() - 2 * 60000),
    messageCount: 4,
  },
  {
    id: "s2",
    title: "Electronics under $200",
    timestamp: new Date(Date.now() - 3600000),
    messageCount: 2,
  },
  {
    id: "s3",
    title: "Best-rated accessories",
    timestamp: new Date(Date.now() - 86400000),
    messageCount: 6,
  },
];

export function ChatSidebar({
  sessions = DEMO_SESSIONS,
  activeSessionId,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  className,
}: ChatSidebarProps) {
  const [open, setOpen] = useState(true);

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "absolute top-3 left-3 z-30 flex h-8 w-8 items-center justify-center rounded-lg",
          "bg-white/80 shadow-sm ring-1 ring-zinc-200 backdrop-blur-xl",
          "dark:bg-zinc-900/80 dark:ring-zinc-800",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
          "lg:hidden"
        )}
        aria-label={open ? "Close sidebar" : "Open sidebar"}
      >
        <MessageSquare className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
      </button>

      {/* Overlay on mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        data-lenis-prevent
        className={cn(
          "flex h-full w-64 flex-col border-r border-zinc-200/60",
          "bg-white/60 backdrop-blur-xl",
          "dark:border-zinc-800/60 dark:bg-zinc-950/60",
          // Mobile overlay
          "fixed inset-y-0 left-0 z-20 transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
          // Desktop static
          "lg:static lg:translate-x-0",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200/60 px-4 py-3 dark:border-zinc-800/60">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Sessions
            </span>
          </div>
          <button
            type="button"
            onClick={onNewSession}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="New session"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Session list */}
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <li key={session.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectSession?.(session.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectSession?.(session.id);
                      }
                    }}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 cursor-pointer",
                      isActive
                        ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200/50 dark:from-indigo-950/40 dark:to-purple-950/40 dark:text-indigo-300 dark:ring-indigo-800/40"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                    )}
                  >
                    <MessageSquare
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-zinc-400 dark:text-zinc-500"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">
                        {session.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-[9px] text-zinc-400 dark:text-zinc-500">
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {formatTime(session.timestamp)}
                        </span>
                        <span>&middot;</span>
                        <span>{session.messageCount} msgs</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession?.(session.id);
                      }}
                      className="shrink-0 rounded-lg p-1 text-zinc-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:text-zinc-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                      aria-label={`Delete ${session.title}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer hint */}
        <div className="border-t border-zinc-200/60 px-4 py-2.5 dark:border-zinc-800/60">
          <p className="text-center text-[9px] text-zinc-400 dark:text-zinc-600">
            Chat history is stored locally
          </p>
        </div>
      </aside>
    </>
  );
}
