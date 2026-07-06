"use client";

import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type GridColumns = 1 | 2 | 3 | 4 | 6 | 12;

interface BentoGridProps {
  children: ReactNode;
  /** Number of grid columns */
  columns?: GridColumns;
  /** Gap between items */
  gap?: "sm" | "md" | "lg" | "xl";
  /** Padding around the grid */
  padded?: boolean;
  /** Additional class names */
  className?: string;
}

const columnClasses: Record<GridColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  6: "grid-cols-1 md:grid-cols-3 lg:grid-cols-6",
  12: "grid-cols-1 md:grid-cols-4 lg:grid-cols-12",
};

const gapClasses = {
  sm: "gap-2 md:gap-3",
  md: "gap-3 md:gap-4",
  lg: "gap-4 md:gap-5",
  xl: "gap-5 md:gap-6",
};

/**
 * Bento Box grid — an auto-flow CSS grid where children
 * define their own span using col-span-{N} and row-span-{N}.
 *
 * @example
 * <BentoGrid columns={4}>
 *   <BentoCard colSpan={2} ...>Big card</BentoCard>
 *   <BentoCard colSpan={1} ...>Small card</BentoCard>
 * </BentoGrid>
 */
export function BentoGrid({
  children,
  columns = 4,
  gap = "md",
  padded = true,
  className,
}: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-auto",
        columnClasses[columns],
        gapClasses[gap],
        padded && "p-4 md:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
