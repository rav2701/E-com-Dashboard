"use client";

import { useEffect, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, WifiOff } from "lucide-react";

// ───────────────────────────────────────────────────────────────
//  Types
// ───────────────────────────────────────────────────────────────

export interface HistoryMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Extra content rendered inside the assistant bubble (tool results, etc.) */
  extra?: ReactNode;
}

interface ChatHistoryProps {
  messages: HistoryMessage[];
  /** External scroll container ref (from useChatScroll) */
  scrollRef: RefObject<HTMLDivElement | null>;
  /** Called when message content changes (for streaming scroll) */
  onContentChange?: () => void;
  /** Renders a single chat entry given a message and its render index */
  renderMessage: (message: HistoryMessage, index: number) => ReactNode;
  /** Children rendered when messages array is empty (welcome screen) */
  welcome?: ReactNode;
  /** Whether the assistant is currently streaming */
  isStreaming?: boolean;
  /** Error banner to render above the input */
  error?: ReactNode;
  /** Whether the current session is using offline/mock data */
  offline?: boolean;
  className?: string;
}

// ───────────────────────────────────────────────────────────────
//  ChatHistory — Scrollable message viewport with Lenis isolation
//  (`data-lenis-prevent`). Uses an externally provided scroll ref
//  so the parent can orchestrate smart auto-scroll via the
//  `useChatScroll` hook.
// ───────────────────────────────────────────────────────────────

export function ChatHistory({
  messages,
  scrollRef,
  onContentChange,
  renderMessage,
  welcome,
  isStreaming,
  error,
  offline,
  className,
}: ChatHistoryProps) {
  // Notify parent when message content changes during streaming
  useEffect(() => {
    if (messages.length > 0) {
      onContentChange?.();
    }
    // Only trigger on content changes (streaming updates)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages[messages.length - 1]?.content, onContentChange]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isStreaming || messages.length === 0) return;
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={scrollRef}
      data-lenis-prevent
      className={cn(
        "flex-1 overflow-y-auto",
        "custom-scrollbar",
        className
      )}
    >
      <div className="mx-auto flex min-h-full max-w-3xl flex-col px-4 py-6">
        {/* Offline mode badge */}
        {offline && (
          <div className="mb-4 flex items-center justify-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50/80 px-3 py-1.5 text-[11px] font-medium tracking-wide text-amber-700 ring-1 ring-amber-200/60 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-800/30">
              <WifiOff className="h-3 w-3" />
              OFFLINE MODE
              <span className="ml-0.5 rounded-full bg-amber-200/60 px-1.5 py-0.5 text-[10px] text-amber-600 dark:bg-amber-800/40 dark:text-amber-300">
                demo data
              </span>
            </div>
          </div>
        )}
        {/* Welcome screen for empty state */}
        {messages.length === 0 && welcome && (
          <div className="flex flex-1 items-center justify-center">
            {welcome}
          </div>
        )}

        {/* Message list */}
        <div className="space-y-4">
          {messages.map((message, idx) => (
            <div key={message.id}>{renderMessage(message, idx)}</div>
          ))}
        </div>

        {/* Streaming indicator when content is empty but streaming */}
        {isStreaming && messages[messages.length - 1]?.content === "" && (
          <div className="flex items-start gap-3 mt-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800">
              <Sparkles className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl bg-white/50 px-4 py-3 ring-1 ring-zinc-200/50 dark:bg-zinc-900/50 dark:ring-zinc-800/50">
              <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && <div className="mt-4">{error}</div>}
      </div>
    </div>
  );
}
