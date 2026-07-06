"use client";

import { useRef, useCallback } from "react";

// ───────────────────────────────────────────────────────────────
//  useChatScroll — Lenis-safe scroll management for chat viewports
// ───────────────────────────────────────────────────────────────
//
//  - Provides a ref to attach to the scroll container
//  - `scrollToBottom()` always snaps to the latest message
//  - `isNearBottom()` checks if the user is within a threshold
//    of the bottom — used to decide whether auto-scroll should
//    fire during streaming
//  - `preservePosition()` saves the current scroll state and
//    re-applies it after a synchronous DOM mutation (zero CLS)
//  - The scroll container uses `data-lenis-prevent` so Lenis
//    smooth scroll never captures wheel/touch events inside it
// ───────────────────────────────────────────────────────────────

const SCROLL_THRESHOLD_PX = 80;

export function useChatScroll() {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  /** True when the user is at or near the bottom of the viewport */
  const isNearBottom = useCallback((): boolean => {
    const el = scrollRef.current;
    if (!el) return true;
    const { scrollTop, scrollHeight, clientHeight } = el;
    return scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD_PX;
  }, []);

  /** Snap the viewport to the bottom immediately */
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "instant") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  /**
   * Smooth auto-scroll if the user is already near the bottom.
   * Call this after every state update that adds/changes content.
   */
  const smartAutoScroll = useCallback(() => {
    if (isNearBottom()) {
      scrollToBottom("smooth");
    }
  }, [isNearBottom, scrollToBottom]);

  /**
   * Preserves scroll position across a synchronous mutation.
   * Call before the mutation, then call the returned restore function
   * after the mutation. This prevents CLS during streaming updates.
   *
   * @example
   * const restore = preservePosition();
   * mutateDOM();
   * restore();
   */
  const preservePosition = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return () => {};

    const prevScrollHeight = el.scrollHeight;
    const prevScrollTop = el.scrollTop;
    const prevChildCount = el.children.length;

    return () => {
      if (!scrollRef.current) return;
      // If content was added at the bottom, adjust scroll to keep
      // the user's current viewport position stable
      if (scrollRef.current.children.length > prevChildCount) {
        const newScrollHeight = scrollRef.current.scrollHeight;
        scrollRef.current.scrollTop =
          prevScrollTop + (newScrollHeight - prevScrollHeight);
      }
    };
  }, []);

  return {
    scrollRef,
    isNearBottom,
    scrollToBottom,
    smartAutoScroll,
    preservePosition,
  };
}
