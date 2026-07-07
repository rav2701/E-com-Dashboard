"use client";

/**
 * @file Area chart showing average rating trends across categories
 * (sorted ascending). Used by the Tax Summary Report.
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { RatingMetric } from "@/hooks/use-report-data";

interface Props {
  /** Average rating and product count per category. */
  data: RatingMetric[];
}

/**
 * Area chart with a purple gradient fill. Categories are sorted by
 * average rating ascending so the trend line rises left to right.
 * Displays up to 12 categories.
 */
export function TaxChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => a.avgRating - b.avgRating);
  const top = sorted.slice(0, 12);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={top} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="taxGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            domain={[0, 5]}
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
            formatter={(_value: unknown, _name: unknown, props: unknown) => {
              const p = (props as { payload: RatingMetric }).payload;
              return [`${p.avgRating} ⭐ (${p.productCount} products)`, "Avg Rating"];
            }}
          />
          <Area
            type="monotone"
            dataKey="avgRating"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#taxGradient)"
            dot={{ r: 3, fill: "#8b5cf6" }}
            activeDot={{ r: 5, fill: "#8b5cf6" }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="mt-2 text-[10px] text-zinc-400 dark:text-zinc-500 text-center">
        Average rating trend across categories (sorted ascending)
      </p>
    </div>
  );
}
