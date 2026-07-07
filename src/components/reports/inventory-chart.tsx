"use client";

/**
 * @file Stacked bar chart showing in-stock / low-stock / out-of-stock
 * counts per category. Used by the Inventory Status Report.
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
import type { StockMetric } from "@/hooks/use-report-data";

interface Props {
  /** Stock status counts (inStock, lowStock, outOfStock) per category. */
  data: StockMetric[];
}

/**
 * Stacked bar chart (green / amber / red) showing stock health
 * across the top 12 categories.
 */
export function InventoryChart({ data }: Props) {
  const top = data.slice(0, 12);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={top} margin={{ top: 8, right: 8, left: 0, bottom: 8 }} barGap={0}>
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
          />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #e4e4e7",
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
            formatter={(v: string) =>
              v === "inStock" ? "In Stock" : v === "lowStock" ? "Low Stock" : "Out of Stock"
            }
          />
          <Bar dataKey="inStock" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
          <Bar dataKey="lowStock" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
          <Bar dataKey="outOfStock" stackId="a" fill="#ef4444" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-[10px] text-zinc-400 dark:text-zinc-500 text-center">
        Stock availability by category &mdash; green: in stock, amber: low stock, red: out of stock
      </p>
    </div>
  );
}
