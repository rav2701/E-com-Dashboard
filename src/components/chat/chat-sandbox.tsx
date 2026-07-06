"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Sparkles, WifiOff } from "lucide-react";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { ChatSidebar } from "./chat-sidebar";
import { ChatHistory } from "./chat-history";
import type { HistoryMessage } from "./chat-history";
import { ChatInput } from "./chat-input";
import { ChatBubble } from "./chat-bubble";
import { ProductShowcase, ProductShowcaseSkeleton } from "./product-showcase";
import type { ProductShowcaseData } from "./product-showcase";

// ───────────────────────────────────────────────────────────────
//  Types
// ───────────────────────────────────────────────────────────────

interface ToolResultEntry {
  toolCallId: string;
  toolName: string;
  result: ProductShowcaseData | null;
}

interface InternalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolResults?: ToolResultEntry[];
}

// ───────────────────────────────────────────────────────────────
//  SSE Parser
// ───────────────────────────────────────────────────────────────

type ChunkHandler = {
  onText?: (text: string) => void;
  onToolInput?: (toolCallId: string, toolName: string) => void;
  onToolOutput?: (toolCallId: string, output: unknown) => void;
  onDone?: () => void;
  onError?: (err: string) => void;
  onOffline?: () => void;
};

async function parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  handlers: ChunkHandler
): Promise<void> {
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (!jsonStr) continue;

      try {
        const chunk = JSON.parse(jsonStr);
        switch (chunk.type) {
          case "text-delta":
            handlers.onText?.(chunk.delta);
            break;
          case "tool-input-available":
          case "tool-input-start":
            handlers.onToolInput?.(chunk.toolCallId, chunk.toolName);
            break;
          case "tool-output-available":
            handlers.onToolOutput?.(chunk.toolCallId, chunk.output);
            break;
          case "offline-mode":
            handlers.onOffline?.();
            break;
          case "error":
            handlers.onError?.(chunk.errorText);
            break;
        }
      } catch {
        // skip malformed JSON lines
      }
    }
  }
  handlers.onDone?.();
}

// ───────────────────────────────────────────────────────────────
//  ID Generator
// ───────────────────────────────────────────────────────────────

let counter = 0;
function nextId() {
  counter += 1;
  return `msg-${Date.now()}-${counter}`;
}

// ───────────────────────────────────────────────────────────────
//  Suggested prompts
// ───────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "Show me your top products",
  "What electronics are under $200?",
  "Compare our best-rated items",
  "Show me the most popular accessories",
];

// ───────────────────────────────────────────────────────────────
//  ChatSandbox
// ───────────────────────────────────────────────────────────────

interface ChatSandboxProps {
  className?: string;
}

export function ChatSandbox({ className }: ChatSandboxProps) {
  // ── State ────────────────────────────────────────────────
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // ── Lenis-safe scroll management ────────────────────────
  const {
    scrollRef,
    smartAutoScroll,
  } = useChatScroll();

  // ── Send Message ─────────────────────────────────────────
  const sendMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim() || isLoading) return;

      setStreamError(null);
      setIsOffline(false);
      const userMsg: InternalMessage = {
        id: nextId(),
        role: "user",
        content: userText,
      };
      const assistantId = nextId();
      const assistantMsg: InternalMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
      };

      const currentMessages = messagesRef.current;

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setIsLoading(true);

      const controller = new AbortController();
      abortRef.current = controller;

      const pendingToolCalls = new Map<
        string,
        { toolCallId: string; toolName: string }
      >();
      let accumulatedText = "";

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...currentMessages, userMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const err = await response
            .json()
            .catch(() => ({ error: "Request failed" }));
          throw new Error(err.error || `HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        await parseSSEStream(reader, {
          onOffline: () => {
            setIsOffline(true);
          },
          onText: (delta) => {
            accumulatedText += delta;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: accumulatedText } : m
              )
            );
          },
          onToolInput: (toolCallId, toolName) => {
            pendingToolCalls.set(toolCallId, { toolCallId, toolName });
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId &&
                !(m.toolResults ?? []).some(
                  (tr) => tr.toolCallId === toolCallId
                )
                  ? {
                      ...m,
                      toolResults: [
                        ...(m.toolResults ?? []),
                        {
                          toolCallId,
                          toolName,
                          result: null,
                        } as ToolResultEntry,
                      ],
                    }
                  : m
              )
            );
          },
          onToolOutput: (toolCallId, output) => {
            const pending = pendingToolCalls.get(toolCallId);
            if (pending && output) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        toolResults: (m.toolResults ?? []).map((tr) =>
                          tr.toolCallId === toolCallId
                            ? {
                                ...tr,
                                result: output as ProductShowcaseData,
                              }
                            : tr
                        ),
                      }
                    : m
                )
              );
            }
          },
          onError: (errText) => {
            setStreamError(errText);
          },
          onDone: () => {
            setIsLoading(false);
          },
        });
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const msg =
          err instanceof Error ? err.message : "An error occurred";
        setStreamError(msg);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId && m.content === ""
              ? { ...m, content: "(Error generating response)" }
              : m
          )
        );
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [isLoading]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  const handleSuggestion = useCallback(
    (suggestion: string) => {
      setInput(suggestion);
      requestAnimationFrame(() => {
        sendMessage(suggestion);
      });
    },
    [sendMessage]
  );

  // Abort stream on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // ── Render helpers ───────────────────────────────────────

  const renderToolResult = (
    result: ProductShowcaseData | null,
    toolCallId: string
  ) => {
    if (!result) {
      return <ProductShowcaseSkeleton key={toolCallId} />;
    }
    return <ProductShowcase key={toolCallId} data={result} />;
  };

  const messagesAsHistory: HistoryMessage[] = messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    extra:
      m.role === "assistant" && m.toolResults && m.toolResults.length > 0 ? (
        <div className="mt-3 space-y-3">
          {m.toolResults.map((tr) => renderToolResult(tr.result, tr.toolCallId))}
        </div>
      ) : undefined,
  }));

  const isStreaming = isLoading && messages[messages.length - 1]?.role === "assistant";

  // ── Welcome screen ───────────────────────────────────────
  const welcomeScreen = (
    <div className="flex flex-col items-center justify-center pt-8 pb-4">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
        <Sparkles className="h-7 w-7 text-white" />
      </div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
        AI Product Assistant
      </h2>
      <p className="mt-1 max-w-sm text-center text-xs text-zinc-500 dark:text-zinc-400">
        Ask me about products, compare items, filter by price, or get
        recommendations from your catalog.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handleSuggestion(s)}
            disabled={isLoading}
            className="rounded-xl border border-zinc-200/60 bg-white/50 px-3 py-1.5 text-[11px] font-medium text-zinc-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50 dark:border-zinc-700/50 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );

  // ── Error banner ─────────────────────────────────────────
  const errorBanner = streamError ? (
    <div className="flex items-center gap-2 rounded-xl bg-red-50/80 px-4 py-3 text-xs font-medium text-red-600 ring-1 ring-red-200/50 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-800/30">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{streamError}</span>
    </div>
  ) : undefined;

  // ── Render ───────────────────────────────────────────────
  return (
    <div className={cn("flex h-full overflow-hidden", className)}>
      {/* Workflow sidebar */}
      <ChatSidebar />

      {/* Main chat area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <ChatHistory
          scrollRef={scrollRef}
          onContentChange={smartAutoScroll}
          messages={messagesAsHistory}
          renderMessage={(msg) => (
            <ChatBubble
              role={msg.role}
              content={msg.content}
              isStreaming={
                msg.role === "assistant" &&
                isStreaming &&
                msg.id ===
                  messagesAsHistory[messagesAsHistory.length - 1]?.id
              }
            >
              {msg.extra}
            </ChatBubble>
          )}
          welcome={welcomeScreen}
          isStreaming={isStreaming}
          error={errorBanner}
          offline={isOffline}
        />

        <ChatInput
          input={input}
          setInput={setInput}
          onSubmit={sendMessage}
          onStop={stopGeneration}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
