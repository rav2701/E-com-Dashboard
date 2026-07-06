"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import type { TimelineBucket } from "@/hooks/use-dashboard";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ───────────────────────────────────────────────────────────────
//  Types for the custom tooltip content
// ───────────────────────────────────────────────────────────────

interface TooltipPayloadEntry {
  dataKey?: string;
  value?: number;
  payload?: Record<string, unknown>;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

// ───────────────────────────────────────────────────────────────
//  Custom Tooltip
// ───────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  // The first entry's payload has the full timeline bucket data
  const raw = payload[0]?.payload as TimelineBucket | undefined;

  const revenuePayload = payload.find((p) => p.dataKey === "revenue");
  const ordersPayload = payload.find((p) => p.dataKey === "ordersCount");

  const itemsSold = raw?.itemsSold;
  const avgOrderValue = raw?.averageOrderValue;

  return (
    <div className="rounded-xl bg-white/90 px-4 py-3 shadow-lg ring-1 ring-zinc-200/50 backdrop-blur-xl dark:bg-zinc-900/90 dark:ring-zinc-700/50">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {label}
      </p>
      <div className="space-y-1.5">
        {revenuePayload && (
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />
            <span className="text-zinc-500 dark:text-zinc-400">Revenue</span>
            <span className="ml-auto font-semibold text-zinc-900 dark:text-zinc-100">
              ${Number(revenuePayload.value ?? 0).toLocaleString("en-US", { minimumFractionDigits: 0 })}
            </span>
          </div>
        )}
        {ordersPayload && (
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-zinc-500 dark:text-zinc-400">Orders</span>
            <span className="ml-auto font-semibold text-zinc-900 dark:text-zinc-100">
              {Number(ordersPayload.value ?? 0).toLocaleString()}
            </span>
          </div>
        )}
        {itemsSold != null && (
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
            <span className="text-zinc-500 dark:text-zinc-400">Items Sold</span>
            <span className="ml-auto font-semibold text-zinc-900 dark:text-zinc-100">
              {itemsSold.toLocaleString()}
            </span>
          </div>
        )}
        {avgOrderValue != null && (
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-sm bg-violet-400" />
            <span className="text-zinc-500 dark:text-zinc-400">Avg. Order</span>
            <span className="ml-auto font-semibold text-zinc-900 dark:text-zinc-100">
              ${avgOrderValue.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
//  Custom Legend
// ───────────────────────────────────────────────────────────────

interface LegendPayloadEntry {
  value: string;
  color: string;
  dataKey?: string;
}

function ChartLegend({ payload }: { payload?: LegendPayloadEntry[] }) {
  if (!payload) return null;
  return (
    <div className="flex items-center justify-center gap-4 pt-1">
      {payload.map((entry) => (
        <div key={entry.dataKey ?? entry.value} className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-block h-2 w-2 rounded-[2px]",
              entry.dataKey === "ordersCount" && "rounded-full"
            )}
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
//  Sales Timeline Card
// ───────────────────────────────────────────────────────────────

interface SalesTimelineProps {
  data: TimelineBucket[];
  className?: string;
  /**
   * Callback fired when a bar is clicked.
   * Receives the date string of the clicked bucket so the parent
   * can drill into a smaller interval (e.g. MONTH → WEEK).
   */
  onBarClick?: (date: string) => void;
}

/**
 * Renders the sales timeline as a Recharts ComposedChart with:
 * - Bar chart for revenue (indigo gradient, left Y-axis)
 * - Line chart for order count (emerald, right Y-axis)
 * - Custom tooltip showing all metrics per bucket
 * - Responsive layout with dual Y-axes
 * - Click handler on bars for drill-down navigation
 */
export function SalesTimeline({ data, className, onBarClick }: SalesTimelineProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center text-xs text-zinc-400 dark:text-zinc-500">
        No timeline data available
      </div>
    );
  }

  // Determine if we should show date labels at all
  const showXLabels = data.length >= 3;

  const handleBarClick = onBarClick
    ? (entry: unknown) => {
        const d = entry as TimelineBucket;
        onBarClick(d.date);
      }
    : undefined;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Chart area */}
      <div className="flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 6, right: 4, bottom: 2, left: -14 }}
          >
            <defs>
              <linearGradient id="revenueBarFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.45} />
              </linearGradient>
              <linearGradient id="revenueBarHover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.7} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-zinc-200/60 dark:stroke-zinc-700/30"
            />

            <XAxis
              dataKey="date"
              hide={!showXLabels}
              tick={{ fontSize: 9, fill: "currentColor" }}
              className="fill-zinc-400 dark:fill-zinc-500"
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={40}
            />

            {/* Left Y-axis — Revenue */}
            <YAxis
              yAxisId="revenue"
              orientation="left"
              tick={{ fontSize: 9, fill: "currentColor" }}
              className="fill-zinc-400 dark:fill-zinc-500"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) =>
                value >= 1_000_000
                  ? `$${(value / 1_000_000).toFixed(1)}M`
                  : value >= 1_000
                    ? `$${(value / 1_000).toFixed(0)}k`
                    : `$${value}`
              }
              width={36}
            />

            {/* Right Y-axis — Orders Count */}
            <YAxis
              yAxisId="orders"
              orientation="right"
              tick={{ fontSize: 9, fill: "currentColor" }}
              className="fill-zinc-400 dark:fill-zinc-500"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => `${value}`}
              width={24}
            />

            <Tooltip
              content={<ChartTooltip />}
              cursor={{
                className: "fill-zinc-200/30 dark:fill-zinc-700/20",
              }}
            />

            <Legend content={<ChartLegend />} />

            <Bar
              yAxisId="revenue"
              dataKey="revenue"
              fill="url(#revenueBarFill)"
              radius={[3, 3, 0, 0]}
              maxBarSize={36}
              name="Revenue"
              className={cn("cursor-pointer", !!onBarClick && "active:opacity-80")}
              activeBar={{
                fill: "url(#revenueBarHover)",
              }}
              {...(handleBarClick ? { onClick: handleBarClick } : {})}
            />

            <Line
              yAxisId="orders"
              type="monotone"
              dataKey="ordersCount"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 4,
                fill: "#10b981",
                stroke: "#fff",
                strokeWidth: 2,
              }}
              name="Orders"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
//  Mini stat footer row
// ───────────────────────────────────────────────────────────────

interface TimelineStatsProps {
  data: TimelineBucket[];
}

export function TimelineStats({ data }: TimelineStatsProps) {
  const { totalRevenue, avgOrderValue } = useMemo(() => {
    if (!data || data.length === 0) return { totalRevenue: 0, avgOrderValue: 0 };
    const total = data.reduce((s, b) => s + b.revenue, 0);
    const totalOrders = data.reduce((s, b) => s + b.ordersCount, 0);
    return {
      totalRevenue: total,
      avgOrderValue: totalOrders > 0 ? total / totalOrders : 0,
    };
  }, [data]);

  return (
    <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
      <div className="flex items-center gap-1.5">
        <TrendingUp className="h-3 w-3 text-indigo-500" />
        <span>
          Total{" "}
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </span>
      </div>
      <span className="text-zinc-300 dark:text-zinc-600">·</span>
      <span>
        Avg{" "}
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
          ${avgOrderValue.toFixed(2)}
        </span>
        /order
      </span>
    </div>
  );
}
