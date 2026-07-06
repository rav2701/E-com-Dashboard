"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { BentoGrid } from "@/components/ui/bento-grid";
import { BentoCard } from "@/components/ui/bento-card";
import { SalesTimeline, TimelineStats } from "@/components/dashboard/sales-timeline";
import { useAnalyticsData, type TimelineInterval } from "@/hooks/use-analytics";
import {
  TrendingUp,
  Clock,
  Activity,
  PieChart as PieChartIcon,
  LineChart,
  Loader2,
  AlertCircle,
  DollarSign,
  ShoppingCart,
  Globe,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

// ───────────────────────────────────────────────────────────────
//  Interval toggle
// ───────────────────────────────────────────────────────────────

const intervals: { value: TimelineInterval; label: string }[] = [
  { value: "DAY", label: "Day" },
  { value: "WEEK", label: "Week" },
  { value: "MONTH", label: "Month" },
];

// ───────────────────────────────────────────────────────────────
//  Date helpers for timeline drill-down
// ───────────────────────────────────────────────────────────────

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
    return `Week ${date.replace(/^\d{4}-W/, "")}, ${date.slice(0, 4)}`;
  }
  return date;
}

/** Compute the end date (+1 day) for a drill range. */
function drillEnd(date: string, interval: TimelineInterval): string {
  if (interval === "WEEK") {
    const d = parseMonth(date);
    d.setMonth(d.getMonth() + 1);
    return fmtDate(d);
  }
  if (interval === "DAY") {
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
//  Page
// ───────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  // ── Timeline drill-down state ──────────────────────────────
  const [baseInterval, setBaseInterval] = useState<TimelineInterval>("MONTH");
  const [drillStack, setDrillStack] = useState<DrillStep[]>([]);

  // Compute the current effective options for useAnalyticsData
  const timelineOptions = useMemo(() => {
    if (drillStack.length === 0) {
      return {
        interval: baseInterval,
        from: undefined as string | undefined,
        to: undefined as string | undefined,
      };
    }

    const top = drillStack[drillStack.length - 1];
    const from = top.interval === "WEEK" ? fmtDate(parseMonth(top.date)) : fmtDate(parseWeek(top.date));
    const to = drillEnd(top.date, top.interval);
    return {
      interval: top.interval,
      from,
      to,
    };
  }, [baseInterval, drillStack]);

  const { loading, error, timeline, kpis, categoryPerformance, refetch } = useAnalyticsData({
    interval: timelineOptions.interval,
    from: timelineOptions.from,
    to: timelineOptions.to,
  });

  // ── Drill-down handlers ────────────────────────────────────
  const handleBarClick = useCallback(
    (date: string) => {
      const currentInterval =
        drillStack.length > 0
          ? drillStack[drillStack.length - 1].interval
          : baseInterval;

      const nextInterval: Record<TimelineInterval, TimelineInterval | null> = {
        MONTH: "WEEK",
        WEEK: "DAY",
        DAY: null,
      };

      const next = nextInterval[currentInterval];
      if (!next) return;

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

  // Funnel data for the donut chart — computed each render to stay reactive to kpis
  const conversionPct =
    kpis && kpis.conversionRate > 0
      ? Math.round(kpis.conversionRate * 10) / 10
      : 3.2;

  const funnelData = [
    { name: "Visit → Cart", value: 24, color: "#6366f1" },
    { name: "Cart → Checkout", value: 62, color: "#a855f7" },
    { name: "Checkout → Purchase", value: conversionPct, color: "#10b981" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-4 pb-6 md:px-6 md:pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Analytics
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Deep-dive into your e-commerce performance metrics
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-xs text-zinc-500 shadow-sm ring-1 ring-zinc-200/50 dark:bg-zinc-900/70 dark:ring-zinc-800/50">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {kpis
                ? `${kpis.totalOrders.toLocaleString()} orders tracked`
                : "Loading..."
              }
            </span>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50/80 dark:bg-red-950/30 p-4 ring-1 ring-red-200/50 dark:ring-red-800/30">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={refetch}
                className="ml-auto shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <BentoGrid columns={4} gap="md" padded={false}>
          {/* ── Revenue Over Time (live Recharts chart) ─────── */}
          <BentoCard
            colSpan={3}
            rowSpan={2}
            title="Revenue Over Time"
            description={
              loading
                ? "Loading..."
                : timelineDescription
            }
            icon={LineChart}
            className="min-h-[360px]"
          >
            {timeline.length > 0 ? (
              <div className="flex flex-col h-full">
                {/* Controls row: breadcrumb + interval toggle */}
                <div className="flex items-center justify-between mb-3">
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

                    {/* KPI summary (only show when not drilling) */}
                    {drillStack.length === 0 && kpis && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="h-3 w-3 text-indigo-500" />
                          <span>
                            Total{" "}
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                              ${kpis.grossVolume.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                          </span>
                        </div>
                        <span className="text-zinc-300 dark:text-zinc-600">·</span>
                        <div className="flex items-center gap-1.5">
                          <ShoppingCart className="h-3 w-3 text-emerald-500" />
                          <span>
                            {kpis.totalOrders.toLocaleString()} orders
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

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

                {/* Chart */}
                <div className="flex-1 min-h-[200px]">
                  <SalesTimeline
                    data={timeline}
                    onBarClick={currentInterval !== "DAY" ? handleBarClick : undefined}
                  />
                </div>

                {/* Stats footer */}
                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                  <TimelineStats data={timeline} />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-400 dark:text-zinc-500">
                {loading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p className="text-xs">Loading chart data...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <LineChart className="h-12 w-12 text-zinc-300 dark:text-zinc-600" />
                    <p className="text-sm font-medium">No timeline data available</p>
                  </div>
                )}
              </div>
            )}
          </BentoCard>

          {/* ── Conversion Funnel ───────────────────────────── */}
          <BentoCard
            colSpan={1}
            rowSpan={1}
            title="Conversion Funnel"
            description="Session → purchase breakdown"
            icon={TrendingUp}
            className="min-h-[260px]"
          >
            {kpis ? (
              <div className="flex flex-col items-center h-full">
                {/* Donut chart */}
                <div className="flex-1 w-full min-h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={funnelData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={72}
                        paddingAngle={3}
                        dataKey="value"
                        cornerRadius={4}
                      >
                        {funnelData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const entry = payload[0];
                          return (
                            <div className="rounded-xl bg-white/90 px-3 py-2 shadow-lg ring-1 ring-zinc-200/50 backdrop-blur-xl dark:bg-zinc-900/90 dark:ring-zinc-700/50">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                {entry.name}
                              </p>
                              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                                {Number(entry.value).toFixed(1)}%
                              </p>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 mt-1">
                  {[
                    { label: "Visit → Cart", color: "bg-indigo-500" },
                    { label: "Cart → Checkout", color: "bg-purple-500" },
                    {
                      label: "Purchase",
                      color: "bg-emerald-500",
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <span className={cn("inline-block h-2 w-2 rounded-full", item.color)} />
                      <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-400 dark:text-zinc-500">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <p className="text-xs">Loading...</p>
                </div>
              </div>
            )}
          </BentoCard>

          {/* ── Top Metrics (live KPIs) ─────────────────────── */}
          <BentoCard
            colSpan={1}
            rowSpan={1}
            title="Key Metrics"
            description="Performance indicators"
            icon={Activity}
            className="min-h-[180px]"
          >
            {kpis ? (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  { label: "Conversion", value: `${kpis.conversionRate.toFixed(1)}%` },
                  { label: "AOV", value: `$${kpis.averageOrderValue.toFixed(2)}` },
                  { label: "Fulfillment", value: `${kpis.fulfillmentRate.toFixed(1)}%` },
                  { label: "Active Users", value: kpis.activeUsers.toLocaleString() },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg bg-zinc-50/80 p-2.5 text-center dark:bg-zinc-800/50">
                    <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">{m.value}</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{m.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-400 dark:text-zinc-500">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <p className="text-xs">Loading...</p>
                </div>
              </div>
            )}
          </BentoCard>

          {/* ── Category Performance ────────────────────────── */}
          <BentoCard
            colSpan={2}
            rowSpan={1}
            title="Category Performance"
            description="Revenue by product category"
            icon={PieChartIcon}
            className="min-h-[240px]"
          >
            {categoryPerformance.length > 0 ? (
              <div className="flex gap-4 h-full mt-1">
                {/* Radar chart */}
                <div className="w-[130px] shrink-0 h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={categoryPerformance}>
                      <PolarGrid
                        className="stroke-zinc-200/60 dark:stroke-zinc-700/30"
                      />
                      <PolarAngleAxis
                        dataKey="name"
                        tick={{
                          fontSize: 8,
                          fill: "currentColor",
                        }}
                        className="fill-zinc-500 dark:fill-zinc-400"
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={{
                          fontSize: 8,
                          fill: "currentColor",
                        }}
                        className="fill-zinc-400 dark:fill-zinc-500"
                        tickFormatter={(v: number) => `${v}%`}
                      />
                      <Radar
                        name="Revenue"
                        dataKey="percentage"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const entry = payload[0]?.payload;
                          if (!entry) return null;
                          return (
                            <div className="rounded-xl bg-white/90 px-3 py-2 shadow-lg ring-1 ring-zinc-200/50 backdrop-blur-xl dark:bg-zinc-900/90 dark:ring-zinc-700/50">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                {entry.name}
                              </p>
                              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                                ${Math.round(entry.revenue).toLocaleString()}
                              </p>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                {entry.percentage}% of revenue · {entry.unitsSold.toLocaleString()} units
                              </p>
                            </div>
                          );
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Data list */}
                <div className="flex-1 min-w-0 space-y-2">
                  {categoryPerformance.map((cat, idx) => {
                    const dotColors = [
                      "bg-indigo-500", "bg-rose-500", "bg-amber-500", "bg-emerald-500",
                      "bg-purple-500", "bg-cyan-500", "bg-pink-500", "bg-lime-500",
                    ];
                    return (
                      <div key={cat.name} className="flex items-center gap-2">
                        <span className={cn("inline-block h-2 w-2 shrink-0 rounded-full", dotColors[idx % dotColors.length])} />
                        <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 truncate flex-1">
                          {cat.name}
                        </span>
                        <span className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                          ${Math.round(cat.revenue / 1000)}k
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : kpis ? (
              <div className="flex items-center justify-center h-full text-xs text-zinc-400 dark:text-zinc-500">
                No category data available
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-400 dark:text-zinc-500">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <p className="text-xs">Loading...</p>
                </div>
              </div>
            )}
          </BentoCard>

          {/* ── Geographic Distribution ─────────────────────── */}
          <BentoCard
            colSpan={2}
            rowSpan={1}
            title="Geographic Distribution"
            description="Sales by region"
            icon={Globe}
            className="min-h-[200px]"
          >
            {kpis ? (
              <div className="mt-3 space-y-3">
                {[
                  { region: "North America", pct: 40, flag: "🇺🇸" },
                  { region: "Europe", pct: 30, flag: "🇪🇺" },
                  { region: "Asia-Pacific", pct: 15, flag: "🌏" },
                  { region: "Latin America", pct: 10, flag: "🌎" },
                  { region: "Middle East & Africa", pct: 5, flag: "🌍" },
                ].map((region) => (
                  <div key={region.region}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        <span className="mr-1.5">{region.flag}</span>
                        {region.region}
                      </span>
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {region.pct}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                        style={{ width: `${region.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-400 dark:text-zinc-500">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <p className="text-xs">Loading...</p>
                </div>
              </div>
            )}
          </BentoCard>
        </BentoGrid>
      </div>
    </div>
  );
}
