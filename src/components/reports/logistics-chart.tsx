"use client";

/**
 * @file Horizontal bar chart showing total product count per category
 * (stock density). Used by the Shipping & Logistics report.
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { StockMetric } from "@/hooks/use-report-data";

interface Props {
  /** Stock status counts per category (total = inStock + lowStock + outOfStock). */
  data: StockMetric[];
}

/**
 * Horizontal bar chart sorted by total product count (descending).
 * Top 3 categories are green, next 4 are amber, rest are indigo.
 * Shows up to 12 categories.
 */
export function LogisticsChart({ data }: Props) {
  // Calculate total stock per category and sort by stock density
  const stockDensity = data
    .map((d) => ({
      category: d.category,
      totalStock: d.inStock + d.lowStock + d.outOfStock,
      inStock: d.inStock,
    }))
    .sort((a, b) => b.totalStock - a.totalStock)
    .slice(0, 12);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={stockDensity} margin={{ top: 8, right: 8, left: 0, bottom: 8 }} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
          <XAxis
            type="number"
            tick={{ fontSize: 11, className: "fill-zinc-500 dark:fill-zinc-400" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fontSize: 9, className: "fill-zinc-500 dark:fill-zinc-400" }}
            axisLine={false}
            tickLine={false}
            width={90}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #e4e4e7",
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            formatter={(_value: unknown, _name: unknown, props: unknown) => {
              const p = (props as { payload: { category: string; totalStock: number; inStock: number } }).payload;
              return [`${p.totalStock} products (${p.inStock} in stock)`, p.category];
            }}
          />
          <Bar dataKey="totalStock" radius={[0, 6, 6, 0]} maxBarSize={20}>
            {stockDensity.map((_, i) => (
              <Cell key={i} fill={i < 3 ? "#22c55e" : i < 7 ? "#f59e0b" : "#6366f1"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-[10px] text-zinc-400 dark:text-zinc-500 text-center">
        Product availability density by category &mdash; higher = more products
      </p>
    </div>
  );
}
