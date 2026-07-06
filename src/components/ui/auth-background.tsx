"use client";

import { cn } from "@/lib/utils";

interface AuthBackgroundProps {
  className?: string;
}

/**
 * Decorative background with gradient blur circles for auth pages.
 */
export function AuthBackground({ className }: AuthBackgroundProps) {
  return (
    <div
      className={cn("pointer-events-none fixed inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[120px]" />
    </div>
  );
}
