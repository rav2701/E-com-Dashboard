"use client";

/**
 * @file Vertical bar chart showing product count by category.
 * Used by the Monthly Sales Summary report — top 12 categories.
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
import type { CategoryMetric } from "@/hooks/use-report-data";

interface Props {
  /** Category distribution data (name + product count + optional fill color). */
  data: CategoryMetric[];
}

/**
 * Vertical bar chart showing how many products exist in each category.
 * Displays up to 12 categories with category-colored bars.
 */
export function SalesSummaryChart({ data }: Props) {
  const top = data.slice(0, 12);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={top} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
          <XAxis
            dataKey="name"
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
            label={{
              value: "Products",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 10, fill: "#a1a1aa" },
            }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #e4e4e7",
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            formatter={(_value: unknown, _name: unknown, props: unknown) => {
              const p = (props as { payload: CategoryMetric }).payload;
              return [`${p.value} products`, "Count"];
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {top.map((entry, i) => (
              <Cell key={i} fill={entry.fill ?? "#6366f1"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-[10px] text-zinc-400 dark:text-zinc-500 text-center">
        Product count by category &mdash; {data.reduce((s, d) => s + d.value, 0)} total products
      </p>
    </div>
  );
}
