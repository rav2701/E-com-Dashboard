"use client";

import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { type ReactNode } from "react";

// ───────────────────────────────────────────────────────────────
//  Types
// ───────────────────────────────────────────────────────────────

export type BubbleRole = "user" | "assistant";

interface ChatBubbleProps {
  role: BubbleRole;
  content: string;
  /** Optional extra content rendered below the text (e.g. tool results) */
  children?: ReactNode;
  /** Whether this is a streaming message (shows subtle pulse indicator) */
  isStreaming?: boolean;
  className?: string;
}



export function ChatBubble({
  role,
  content,
  children,
  isStreaming = false,
  className,
}: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-3",
        isUser && "flex-row-reverse",
        className
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-gradient-to-br from-indigo-500 to-purple-600"
            : "bg-zinc-200 dark:bg-zinc-800"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "min-w-0 max-w-[85%] space-y-2",
          isUser && "flex flex-col items-end"
        )}
      >
        {/* Text bubble */}
        {content && (
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
              isUser
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                : "bg-white/70 backdrop-blur-xl text-zinc-800 ring-1 ring-zinc-200/50 dark:bg-zinc-900/70 dark:text-zinc-200 dark:ring-zinc-800/50"
            )}
          >
            <p>{content}</p>
            {/* Streaming indicator */}
            {isStreaming && (
              <span className="inline-flex gap-0.5 ml-0.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 dark:bg-zinc-500" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 dark:bg-zinc-500 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 dark:bg-zinc-500 [animation-delay:300ms]" />
              </span>
            )}
          </div>
        )}

        {/* Children (tool results, attachments, etc.) */}
        {children && <div className="w-full">{children}</div>}
      </div>
    </div>
  );
}
