"use client";

import { cn } from "@/lib/utils";

// ───────────────────────────────────────────────────────────────
//  Base Skeleton
// ───────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A pulsing placeholder element. Use it to compose larger skeleton
 * layouts that mirror the shape and spacing of the live content.
 */
export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-200/70 dark:bg-zinc-800/50",
        className
      )}
      style={style}
      aria-hidden="true"
    />
  );
}

// ───────────────────────────────────────────────────────────────
//  KPI Card Skeleton
// ───────────────────────────────────────────────────────────────

/**
 * Matches the layout of a single KPI bento card (icon row, metric
 * value, detail chips) while data is loading.
 */
export function SkeletonKpiCard() {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl p-5 md:p-6",
        "bg-white/60 dark:bg-zinc-900/50",
        "ring-1 ring-zinc-200/30 dark:ring-zinc-800/30",
        "backdrop-blur-xl shadow-sm"
      )}
    >
      {/* Accent bar */}
      <Skeleton className="absolute top-0 left-6 right-6 h-0.5 rounded-full" />

      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-2.5 w-28 rounded" />
          </div>
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>

      {/* Primary metric */}
      <Skeleton className="h-8 w-32 rounded mb-4" />

      {/* Detail chips */}
      <div className="mt-auto flex flex-wrap gap-2">
        <Skeleton className="h-6 w-24 rounded-lg" />
        <Skeleton className="h-6 w-28 rounded-lg" />
        <Skeleton className="h-6 w-20 rounded-lg" />
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
//  KPI Grid Skeleton (4 cards)
// ───────────────────────────────────────────────────────────────

export function SkeletonKpiGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonKpiCard key={i} />
      ))}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
//  Timeline Bar Skeleton
// ───────────────────────────────────────────────────────────────

/**
 * A placeholder for the revenue sparkline / bar chart area. Renders
 * a set of skeleton bars that mimic the actual data bars.
 */
export function SkeletonTimelineBars() {
  const heights = [32, 45, 38, 52, 48, 62, 70, 55, 60, 75, 82, 90];
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1.5 h-24">
        {heights.map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-sm"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <Skeleton className="h-3 w-full rounded" />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
//  Product Row Skeleton
// ───────────────────────────────────────────────────────────────

/**
 * A single row in the top-products list while data is loading.
 */
export function SkeletonProductRow() {
  return (
    <div className="flex items-center gap-3 py-2.5 px-4">
      <div className="flex-1 space-y-1 min-w-0">
        <Skeleton className="h-3.5 w-3/5 rounded" />
        <Skeleton className="h-3 w-2/5 rounded" />
      </div>
      <Skeleton className="h-4 w-16 rounded shrink-0" />
      <Skeleton className="h-4 w-14 rounded shrink-0" />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
//  Full Page Loading State
// ───────────────────────────────────────────────────────────────

/**
 * Dashboard-wide loading placeholder that mirrors the full bento
 * grid layout with pulse animations.
 */
export function DashboardSkeleton() {
  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="px-4 pt-4 pb-2 md:px-6 md:pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-36 rounded" />
            <Skeleton className="h-4 w-64 rounded" />
          </div>
          <Skeleton className="h-8 w-36 rounded-xl hidden sm:block" />
        </div>
      </div>

      {/* KPI grid skeleton */}
      <div className="px-4 pt-2 pb-6 md:px-6">
        <SkeletonKpiGrid />
      </div>

      {/* Product viewer skeleton */}
      <div className="px-4 md:px-6 pb-6">
        <div
          className={cn(
            "rounded-2xl overflow-hidden min-h-[360px]",
            "bg-white/60 dark:bg-zinc-900/50",
            "ring-1 ring-zinc-200/30 dark:ring-zinc-800/30",
            "backdrop-blur-xl shadow-sm"
          )}
        >
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
            <div className="flex gap-2">
              <Skeleton className="h-7 w-28 rounded-lg" />
              <Skeleton className="h-7 w-32 rounded-lg" />
              <Skeleton className="h-7 w-26 rounded-lg" />
            </div>
            <Skeleton className="h-5 w-32 rounded-full" />
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[280px]">
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-4 w-40 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Bento grid skeleton */}
      <div className="px-4 md:px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Revenue chart */}
          <div className="col-span-1 md:col-span-2 rounded-2xl p-5 bg-white/60 dark:bg-zinc-900/50 ring-1 ring-zinc-200/30 dark:ring-zinc-800/30">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-28 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            </div>
            <SkeletonTimelineBars />
          </div>

          {/* Traffic sources */}
          <div className="col-span-1 rounded-2xl p-5 bg-white/60 dark:bg-zinc-900/50 ring-1 ring-zinc-200/30 dark:ring-zinc-800/30">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-24 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-3 w-12 rounded" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Devices */}
          <div className="col-span-1 rounded-2xl p-5 bg-white/60 dark:bg-zinc-900/50 ring-1 ring-zinc-200/30 dark:ring-zinc-800/30">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-16 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-3 w-8 rounded" />
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent orders */}
          <div className="col-span-1 md:col-span-3 row-span-2 rounded-2xl p-5 bg-white/60 dark:bg-zinc-900/50 ring-1 ring-zinc-200/30 dark:ring-zinc-800/30">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-24 rounded" />
                <Skeleton className="h-3 w-32 rounded" />
              </div>
            </div>
            <div className="space-y-0 -mx-5">
              {/* Table header */}
              <div className="flex gap-4 px-5 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-3 w-28 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-3 w-14 rounded" />
              </div>
              {/* Table rows */}
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex gap-4 px-5 py-3 border-b border-zinc-100/50 dark:border-zinc-800/50">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-5 w-18 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Satisfaction */}
          <div className="col-span-1 rounded-2xl p-5 bg-white/60 dark:bg-zinc-900/50 ring-1 ring-zinc-200/30 dark:ring-zinc-800/30">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-20 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
          </div>

          {/* Alerts */}
          <div className="col-span-1 rounded-2xl p-5 bg-white/60 dark:bg-zinc-900/50 ring-1 ring-zinc-200/30 dark:ring-zinc-800/30">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-16 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Skeleton className="h-2 w-2 rounded-full shrink-0 mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-3 w-24 rounded" />
                      <Skeleton className="h-2.5 w-28 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="col-span-1 md:col-span-2 rounded-2xl p-5 bg-white/60 dark:bg-zinc-900/50 ring-1 ring-zinc-200/30 dark:ring-zinc-800/30">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-20 rounded" />
                <Skeleton className="h-3 w-28 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg p-3 text-center bg-zinc-50/60 dark:bg-zinc-800/30">
                  <div className="space-y-1.5 flex flex-col items-center">
                    <Skeleton className="h-6 w-16 rounded" />
                    <Skeleton className="h-2.5 w-14 rounded" />
                    <Skeleton className="h-4 w-12 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
