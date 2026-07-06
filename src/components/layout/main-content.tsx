"use client";

import { useSidebarStore } from "@/stores/sidebar-store";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface MainContentProps {
  children: ReactNode;
  className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
  const collapsed = useSidebarStore((state) => state.collapsed);

  return (
    <main
      className={cn(
        "min-h-screen pt-14 lg:pt-0 transition-all duration-300 ease-in-out",
        collapsed ? "lg:ml-[72px]" : "lg:ml-64",
        className
      )}
    >
      {children}
    </main>
  );
}
