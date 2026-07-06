"use client";

import { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Send, Square } from "lucide-react";

// ───────────────────────────────────────────────────────────────
//  Types
// ───────────────────────────────────────────────────────────────

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (value: string) => void;
  onStop: () => void;
  isLoading: boolean;
  placeholder?: string;
  className?: string;
}

// ───────────────────────────────────────────────────────────────
//  ChatInput — Fixed sticky input bar at the bottom of the chat
//  sandbox. Grows vertically to accommodate longer messages.
//  Auto-focuses on mount.
// ───────────────────────────────────────────────────────────────

export function ChatInput({
  input,
  setInput,
  onSubmit,
  onStop,
  isLoading,
  placeholder = "Ask about products...",
  className,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-resize the textarea on content change
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  return (
    <div
      data-lenis-prevent
      className={cn(
        "sticky bottom-0 z-20 w-full",
        "border-t border-zinc-200/60 bg-white/80 backdrop-blur-xl",
        "dark:border-zinc-800/60 dark:bg-zinc-950/80",
        className
      )}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() && !isLoading) {
            onSubmit(input.trim());
            setInput("");
            // Reset textarea height after clear
            if (textareaRef.current) {
              textareaRef.current.style.height = "auto";
            }
          }
        }}
        className="mx-auto flex w-full max-w-4xl items-end gap-3 px-4 py-3"
      >
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustHeight();
            }}
            onKeyDown={(e) => {
              // Submit on Enter (without Shift)
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const form = e.currentTarget.form;
                if (form) form.requestSubmit();
              }
            }}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className={cn(
              "w-full resize-none rounded-2xl border bg-white px-4 py-3 text-sm transition-all",
              "placeholder:text-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
              "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-indigo-500",
              isLoading && "opacity-50"
            )}
          />
          {/* Bottom gradient shadow */}
          <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        </div>

        {isLoading ? (
          <button
            type="button"
            onClick={onStop}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white transition-all hover:bg-red-600 active:scale-95"
            aria-label="Stop generation"
          >
            <Square className="h-4 w-4 fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all",
              "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md",
              "hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-indigo-500/25",
              "active:scale-95",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            )}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </form>

      <p className="pb-2 text-center text-[10px] text-zinc-400 dark:text-zinc-500">
        Powered by OpenAI &middot; Responses are AI-generated
      </p>
    </div>
  );
}
