"use client";

import { useState, useTransition, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useDashboardData } from "@/hooks/use-dashboard";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { ProductViewer } from "@/components/dashboard/product-viewer";
import { SalesTimeline, TimelineStats } from "@/components/dashboard/sales-timeline";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { TopProducts } from "@/components/dashboard/top-products";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { BentoGrid } from "@/components/ui/bento-grid";
import { BentoCard } from "@/components/ui/bento-card";
import {
  ShoppingCart,
  TrendingUp,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Star,
  AlertCircle,
  Activity,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ───────────────────────────────────────────────────────────────
//  Status colour map
// ───────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  PENDING: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  CONFIRMED: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  PROCESSING: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  SHIPPED: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
  DELIVERED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
  REFUNDED: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
};

// ───────────────────────────────────────────────────────────────
//  Date helpers for timeline drill-down
// ───────────────────────────────────────────────────────────────

type TimelineInterval = "DAY" | "WEEK" | "MONTH";

/** Parse "YYYY-MM" → Date (first day of month). */
function parseMonth(dateStr: string): Date {
  const [year, month] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

/** Parse ISO week string "YYYY-Www" → Date (Monday of that week). */
function parseWeek(dateStr: string): Date {
  const match = dateStr.match(/^(\d{4})-W(\d{1,2})$/);
  if (!match) return new Date();
  const year = parseInt(match[1], 10);
  const week = parseInt(match[2], 10);
  // ISO weeks: Jan 4 is always in week 1
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const firstMonday = new Date(jan4.getTime() - (dayOfWeek - 1) * 86400000);
  return new Date(firstMonday.getTime() + (week - 1) * 7 * 86400000);
}

/** Format a Date as "YYYY-MM-DD". */
function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Get a human-readable label for a drill step. */
function drillLabel(date: string, interval: TimelineInterval): string {
  if (interval === "WEEK") {
    // date is like "2026-01"
    const match = date.match(/^(\d{4})-(\d{2})$/);
    if (match) {
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];
      return monthNames[parseInt(match[2], 10) - 1] + " " + match[1];
    }
    return date;
  }
  if (interval === "DAY") {
    // date is like "2026-W05"
    return `Week ${date.replace(/^\d{4}-W/, "")}, ${date.slice(0, 4)}`;
  }
  return date;
}

/** Compute the end date (+1 day) for a drill range. */
function drillEnd(date: string, interval: TimelineInterval): string {
  if (interval === "WEEK") {
    // MONTH → WEEK drill: end of the month
    const d = parseMonth(date);
    d.setMonth(d.getMonth() + 1);
    return fmtDate(d);
  }
  if (interval === "DAY") {
    // WEEK → DAY drill: end of the week (+7 days from Monday)
    const d = parseWeek(date);
    d.setDate(d.getDate() + 7);
    return fmtDate(d);
  }
  return "";
}

// ───────────────────────────────────────────────────────────────
//  Drill-down state
// ───────────────────────────────────────────────────────────────

interface DrillStep {
  date: string;
  interval: TimelineInterval;
}

// ───────────────────────────────────────────────────────────────
//  Page Component
// ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  // ── Timeline drill-down state ──────────────────────────────
  const [baseInterval, setBaseInterval] = useState<TimelineInterval>("MONTH");
  const [drillStack, setDrillStack] = useState<DrillStep[]>([]);

  // Compute the current effective options for useDashboardData
  const timelineOptions = useMemo(() => {
    if (drillStack.length === 0) {
      return {
        timelineInterval: baseInterval as "DAY" | "WEEK" | "MONTH",
        timelineFrom: undefined as string | undefined,
        timelineTo: undefined as string | undefined,
      };
    }

    const top = drillStack[drillStack.length - 1];
    const from = top.interval === "WEEK" ? fmtDate(parseMonth(top.date)) : fmtDate(parseWeek(top.date));
    const to = drillEnd(top.date, top.interval);
    return {
      timelineInterval: top.interval as "DAY" | "WEEK" | "MONTH",
      timelineFrom: from,
      timelineTo: to,
    };
  }, [baseInterval, drillStack]);

  const dashboard = useDashboardData({
    timelineInterval: timelineOptions.timelineInterval,
    timelineFrom: timelineOptions.timelineFrom,
    timelineTo: timelineOptions.timelineTo,
    productLimit: 10,
    productSortBy: "REVENUE",
    recentOrdersLimit: 25,
  });

  // ── Drill-down handlers ────────────────────────────────────
  const handleBarClick = useCallback(
    (date: string) => {
      const currentInterval =
        drillStack.length > 0
          ? drillStack[drillStack.length - 1].interval
          : baseInterval;

      // Determine the next finer interval
      const nextInterval: Record<TimelineInterval, TimelineInterval | null> = {
        MONTH: "WEEK",
        WEEK: "DAY",
        DAY: null,
      };

      const next = nextInterval[currentInterval];
      if (!next) return; // DAY is the finest granularity

      setDrillStack((prev) => [...prev, { date, interval: next }]);
    },
    [baseInterval, drillStack]
  );

  const handleBack = useCallback(() => {
    setDrillStack((prev) => prev.slice(0, -1));
  }, []);

  const handleReset = useCallback(() => {
    setDrillStack([]);
  }, []);

  // When toggling base interval, also reset any drill
  const handleIntervalChange = useCallback((interval: TimelineInterval) => {
    setBaseInterval(interval);
    setDrillStack([]);
  }, []);

  // ── Render helpers ─────────────────────────────────────────
  const currentInterval =
    drillStack.length > 0
      ? drillStack[drillStack.length - 1].interval
      : baseInterval;

  const timelineDescription = useMemo(() => {
    if (drillStack.length === 0) {
      const labels: Record<TimelineInterval, string> = {
        MONTH: "Monthly trend",
        WEEK: "Weekly trend",
        DAY: "Daily trend",
      };
      return labels[baseInterval];
    }
    const top = drillStack[drillStack.length - 1];
    return drillLabel(top.date, top.interval) + " detail";
  }, [baseInterval, drillStack]);

  const [showLive, setShowLive] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (dashboard.status === "settled" && !showLive) {
      const timer = setTimeout(() => {
        startTransition(() => setShowLive(true));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [dashboard.status, showLive]);

  // ── Loading state ──────────────────────────────────────────
  if (dashboard.status === "loading" && !showLive) {
    return <DashboardSkeleton />;
  }

  // ── Error state ────────────────────────────────────────────
  if (dashboard.status === "error" && !showLive) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="rounded-2xl bg-red-50/80 dark:bg-red-950/30 p-8 text-center max-w-md ring-1 ring-red-200/50 dark:ring-red-800/30">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
            Failed to load dashboard data
          </h2>
          <p className="text-sm text-red-500/80 dark:text-red-400/80 mb-4">
            {dashboard.error.message}
          </p>
          <button
            onClick={() => dashboard.refetch()}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium",
              "bg-red-600 text-white hover:bg-red-700",
              "transition-colors duration-200"
            )}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Settled state ──────────────────────────────────────────
  const data = dashboard.status === "settled" ? dashboard.data : null;
  const isFresh = showLive && data !== null;

  // ── Interval toggle options ────────────────────────────────
  const intervals: { value: TimelineInterval; label: string }[] = [
    { value: "DAY", label: "Day" },
    { value: "WEEK", label: "Week" },
    { value: "MONTH", label: "Month" },
  ];

  return (
    <div
      className={cn(
        "transition-opacity duration-500 ease-out",
        isFresh ? "opacity-100" : "opacity-0"
      )}
    >
      {/* ── Page header ───────────────────────────────────── */}
      <div className="px-4 pt-4 pb-2 md:px-6 md:pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Your e-commerce overview
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-xs text-zinc-500 shadow-sm ring-1 ring-zinc-200/50 dark:bg-zinc-900/70 dark:ring-zinc-800/50">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {data
                ? `${data.kpis.totalOrders.toLocaleString()} orders tracked`
                : "Loading..."}
            </span>
          </div>
        </div>
      </div>

      {/* ── KPI Metrics Grid (GraphQL) ──────────────────────── */}
      <div className="px-4 pt-2 pb-6 md:px-6">
        <KpiGrid data={data?.kpis} />
      </div>

      {/* ── 3D Product Viewer ──────────────────────────────── */}
      <div className="px-4 md:px-6 pb-6">
        <div
          className={cn(
            "rounded-2xl overflow-hidden",
            "backdrop-blur-xl shadow-sm",
            "bg-white/70 dark:bg-zinc-900/70",
            "ring-1 ring-zinc-200/50 dark:ring-zinc-800/50"
          )}
        >
          <ProductViewer />
        </div>
      </div>

      {/* ── Bento Grid ─────────────────────────────────────── */}
      <BentoGrid columns={4} gap="md" padded>
        {/* ── Revenue Timeline (GraphQL) ──────────────────── */}
        <BentoCard
          colSpan={2}
          rowSpan={1}
          title="Revenue Timeline"
          description={data ? timelineDescription : "Loading..."}
          icon={Activity}
          className="min-h-[280px]"
        >
          {data ? (
            <>
              {/* ── Controls row: interval toggle + breadcrumb ── */}
              <div className="flex items-center justify-between mb-2">
                {/* Breadcrumb / back navigation */}
                <div className="flex items-center gap-1.5 text-xs">
                  {drillStack.length > 0 && (
                    <button
                      onClick={handleBack}
                      className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                      title="Go back one level"
                    >
                      <ChevronLeft className="h-3 w-3" />
                      <span>Back</span>
                    </button>
                  )}

                  {/* Breadcrumb path */}
                  {drillStack.length > 0 && (
                    <div className="flex items-center gap-1 ml-1">
                      <button
                        onClick={handleReset}
                        className="rounded px-1.5 py-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                      >
                        Overview
                      </button>
                      {drillStack.map((step, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <ChevronRight className="h-2.5 w-2.5 text-zinc-300 dark:text-zinc-600" />
                          <button
                            onClick={() =>
                              setDrillStack((prev) => prev.slice(0, i + 1))
                            }
                            className={cn(
                              "rounded px-1.5 py-1 transition-colors",
                              i === drillStack.length - 1
                                ? "font-semibold text-indigo-600 dark:text-indigo-400"
                                : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                            )}
                          >
                            {drillLabel(step.date, step.interval)}
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Interval toggle */}
                <div className="flex items-center rounded-lg bg-zinc-100/70 p-0.5 ring-1 ring-zinc-200/50 dark:bg-zinc-800/50 dark:ring-zinc-700/50">
                  {intervals.map((iv) => (
                    <button
                      key={iv.value}
                      onClick={() => handleIntervalChange(iv.value)}
                      className={cn(
                        "rounded-md px-2.5 py-1 text-[11px] font-medium transition-all duration-150",
                        currentInterval === iv.value
                          ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                          : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                      )}
                    >
                      {iv.label}
                    </button>
                  ))}
                </div>
              </div>

              <SalesTimeline
                data={data.timeline}
                onBarClick={currentInterval !== "DAY" ? handleBarClick : undefined}
              />
              <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                <TimelineStats data={data.timeline} />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-zinc-400">
              Loading timeline...
            </div>
          )}
        </BentoCard>

        {/* ── Traffic Sources (GraphQL) ────────────────────── */}
        <BentoCard
          colSpan={1}
          rowSpan={1}
          title="Traffic Sources"
          description="Where visitors come from"
          icon={Globe}
          className="min-h-[200px]"
        >
          {data ? (
            <div className="mt-3 space-y-3">
              {data.trafficSources.map((source) => (
                <div key={source.source}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      {source.source}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {source.visits}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        source.source === "Direct" && "bg-indigo-500",
                        source.source === "Organic" && "bg-emerald-500",
                        source.source === "Social" && "bg-amber-500",
                        source.source === "Referral" && "bg-rose-500",
                        source.source === "Email" && "bg-purple-500"
                      )}
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-zinc-400">Loading...</div>
          )}
        </BentoCard>

        {/* ── Device Breakdown (GraphQL) ────────────────────── */}
        <BentoCard
          colSpan={1}
          rowSpan={1}
          title="Devices"
          description="Session breakdown"
          icon={Smartphone}
          className="min-h-[200px]"
        >
          {data ? (
            <div className="mt-3 space-y-4">
              {data.deviceBreakdown.map((device) => {
                const DeviceIcon =
                  device.type === "Desktop"
                    ? Monitor
                    : device.type === "Mobile"
                      ? Smartphone
                      : Tablet;
                return (
                  <div key={device.type} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <DeviceIcon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          {device.type}
                        </span>
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {device.percentage}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${device.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-zinc-400">Loading...</div>
          )}
        </BentoCard>

        {/* ── Top Products (GraphQL) ──────────────────────── */}
        <BentoCard
          colSpan={3}
          rowSpan={2}
          title="Top Products"
          description={data ? "Ranked by revenue" : "Performance ranking"}
          icon={Package}
          className="min-h-[320px]"
        >
          {data ? (
            <TopProducts data={data.topProducts} />
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-zinc-400">Loading products...</div>
          )}
        </BentoCard>

        {/* ── Recent Orders (GraphQL) ──────────────────────── */}
        <BentoCard
          colSpan={3}
          rowSpan={2}
          title="Recent Orders"
          description={data ? `${data.recentOrders.length} orders` : "Latest orders"}
          icon={ShoppingCart}
          className="min-h-[400px]"
        >
          {data ? (
            <RecentOrdersTable data={data.recentOrders} />
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-zinc-400">Loading orders...</div>
          )}
        </BentoCard>

        {/* ── Customer Satisfaction (GraphQL-derived) ──────── */}
        <BentoCard
          colSpan={1}
          rowSpan={1}
          title="Satisfaction"
          description="Customer ratings"
          icon={Star}
          variant="accent"
          className="min-h-[200px]"
        >
          {data ? (
            <div className="mt-3 flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center">
                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2"
                    className="text-zinc-100 dark:text-zinc-800" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeDasharray="97.4" strokeDashoffset="14.6" strokeLinecap="round"
                    className="text-amber-500" />
                </svg>
                <span className="absolute text-lg font-bold text-zinc-900 dark:text-zinc-100">94%</span>
              </div>
              <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                Based on {data.kpis.totalOrders.toLocaleString()} orders
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-zinc-400">Loading...</div>
          )}
        </BentoCard>

        {/* ── Alerts (GraphQL) ─────────────────────────────── */}
        <BentoCard
          colSpan={1}
          rowSpan={1}
          title="Alerts"
          description="Requires attention"
          icon={AlertCircle}
          variant="accent"
          className="min-h-[200px]"
        >
          {data ? (
            <div className="mt-3 space-y-3">
              {data.alerts.map((alert) => (
                <div
                  key={alert.title}
                  className={cn(
                    "rounded-xl p-3",
                    alert.level === "red" && "bg-red-50/80 dark:bg-red-950/30",
                    alert.level === "amber" && "bg-amber-50/80 dark:bg-amber-950/30",
                    alert.level === "blue" && "bg-blue-50/80 dark:bg-blue-950/30"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={cn(
                        "mt-0.5 h-2 w-2 rounded-full shrink-0",
                        alert.level === "red" && "bg-red-500 animate-pulse-subtle",
                        alert.level === "amber" && "bg-amber-500 animate-pulse-subtle",
                        alert.level === "blue" && "bg-blue-500"
                      )}
                    />
                    <div>
                      <p className={cn(
                        "text-xs font-medium",
                        alert.level === "red" && "text-red-700 dark:text-red-300",
                        alert.level === "amber" && "text-amber-700 dark:text-amber-300",
                        alert.level === "blue" && "text-blue-700 dark:text-blue-300"
                      )}>
                        {alert.title}
                      </p>
                      <p className={cn(
                        "text-[10px]",
                        alert.level === "red" && "text-red-500/70 dark:text-red-400/70",
                        alert.level === "amber" && "text-amber-500/70 dark:text-amber-400/70",
                        alert.level === "blue" && "text-blue-500/70 dark:text-blue-400/70"
                      )}>
                        {alert.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-zinc-400">Loading...</div>
          )}
        </BentoCard>

        {/* ── Quick Stats Summary ─────────────────────────── */}
        <BentoCard
          colSpan={2}
          rowSpan={1}
          title="Key Metrics"
          description="Performance indicators"
          icon={TrendingUp}
          className="min-h-[160px]"
        >
          {data ? (
            <div className="mt-2 grid grid-cols-3 gap-4">
              {[
                { label: "Avg. Order", value: `$${data.kpis.averageOrderValue.toFixed(2)}`, change: "+5.2%" },
                { label: "Fulfillment", value: `${data.kpis.fulfillmentRate.toFixed(1)}%`, change: `+${(data.kpis.fulfillmentRate - 90).toFixed(1)}%` },
                { label: "Conversion", value: `${data.kpis.conversionRate.toFixed(1)}%`, change: data.kpis.conversionRate >= 3 ? "+1.2%" : "-0.4%" },
              ].map((metric) => (
                <div key={metric.label} className="rounded-lg bg-zinc-50/80 p-3 text-center dark:bg-zinc-800/50">
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{metric.value}</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{metric.label}</p>
                  <span className="inline-block mt-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                    {metric.change}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-zinc-400">Loading...</div>
          )}
        </BentoCard>
      </BentoGrid>
    </div>
  );
}
