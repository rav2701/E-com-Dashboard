"use client";

/**
 * @file Grouped bar chart comparing estimated original revenue vs.
 * discounted pricing per category. Used by the P&L Statement report.
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { PnLMetric } from "@/hooks/use-report-data";

interface Props {
  /** Estimated revenue, discounted revenue, and savings per category. */
  data: PnLMetric[];
}

/**
 * Grouped bar chart showing estimated original price (blue) vs.
 * current discounted price (green) for the top 10 categories.
 */
export function PnLChart({ data }: Props) {
  const top = data.slice(0, 10);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={top} margin={{ top: 8, right: 8, left: 0, bottom: 8 }} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
          <XAxis
            dataKey="category"
            tick={{ fontSize: 10, className: "fill-zinc-500 dark:fill-zinc-400" }}
            axisLine={false}
            tickLine={false}
            angle={-25}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 11, className: "fill-zinc-500 dark:fill-zinc-400" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #e4e4e7",
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            formatter={(v: unknown) => [`$${Number(v).toFixed(2)}`, undefined]}
            labelFormatter={(label: unknown) => String(label)}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
            formatter={(v: string) =>
              v === "revenue" ? "Est. Revenue" : v === "discounted" ? "Discounted" : ""
            }
          />
          <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Bar dataKey="discounted" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-[10px] text-zinc-400 dark:text-zinc-500 text-center">
        Blue: estimated original price &mdash; Green: current discounted price
      </p>
    </div>
  );
}
