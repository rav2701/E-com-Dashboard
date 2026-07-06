"use client";

import { ChatSandbox } from "@/components/chat/chat-sandbox";

export default function ChatPage() {
  return (
    <div
      data-lenis-prevent
      className="flex h-[calc(100vh-var(--sidebar-width-diff,0px))] w-full lg:h-screen"
    >
      <ChatSandbox className="flex-1" />
    </div>
  );
}
