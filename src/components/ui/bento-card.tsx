"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

interface BentoCardProps {
  /** Card content */
  children: ReactNode;
  /** Optional icon at the top */
  icon?: LucideIcon;
  /** Card title */
  title?: string;
  /** Card description */
  description?: string;
  /** Column span (1-4) */
  colSpan?: 1 | 2 | 3 | 4;
  /** Row span (1-3) */
  rowSpan?: 1 | 2 | 3;
  /** Visual variant */
  variant?: "default" | "gradient" | "accent";
  /** Additional class names */
  className?: string;
  /** Optional action to render in the top-right */
  action?: ReactNode;
}

const colSpanClasses: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-1 md:col-span-2",
  3: "col-span-1 md:col-span-3",
  4: "col-span-1 md:col-span-2 lg:col-span-4",
};

const rowSpanClasses: Record<number, string> = {
  1: "row-span-1",
  2: "row-span-1 md:row-span-2",
  3: "row-span-1 md:row-span-3",
};

const variantClasses = {
  default:
    "bg-white/70 dark:bg-zinc-900/70 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50",
  gradient:
    "bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40 ring-1 ring-indigo-200/30 dark:ring-indigo-800/30",
  accent:
    "bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/40 dark:to-orange-950/40 ring-1 ring-amber-200/30 dark:ring-amber-800/30",
};

export function BentoCard({
  children,
  icon: Icon,
  title,
  description,
  colSpan = 1,
  rowSpan = 1,
  variant = "default",
  className,
  action,
}: BentoCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl p-5",
        "backdrop-blur-xl shadow-sm",
        "transition-all duration-300 ease-out",
        "hover:shadow-md hover:scale-[1.01]",
        colSpanClasses[colSpan],
        rowSpanClasses[rowSpan],
        variantClasses[variant],
        className
      )}
    >
      {/* Header */}
      {(Icon || title || action) && (
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <Icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {description}
                </p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      {/* Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
