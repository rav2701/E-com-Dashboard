"use client";

/**
 * @file Dual-chart analytics view: a donut pie chart for category
 * distribution and a horizontal bar chart for top-rated categories.
 * Used by the Customer Analytics report.
 */

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { CategoryMetric, RatingMetric } from "@/hooks/use-report-data";

interface Props {
  /** Product counts per category (for the donut chart). */
  distribution: CategoryMetric[];
  /** Average ratings per category (for the bar chart). */
  ratings: RatingMetric[];
}

/**
 * Shows an 8-slice donut of category distribution on the left and a
 * 10-row horizontal bar chart of top-rated categories on the right.
 */
export function AnalyticsChart({ distribution, ratings }: Props) {
  const topCategories = distribution.slice(0, 8);
  const topRatings = ratings.slice(0, 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Donut — Category Distribution */}
      <div>
        <h4 className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-2 text-center">
          Category Distribution
        </h4>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={topCategories}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={56}
              outerRadius={90}
              paddingAngle={2}
            >
              {topCategories.map((entry, i) => (
                <Cell key={i} fill={entry.fill ?? "#6366f1"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #e4e4e7",
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              formatter={(_value: unknown, _name: unknown, props: unknown) => {
                const p = (props as { payload: CategoryMetric }).payload;
                return [`${p.value} products`, p.name];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
          {topCategories.map((c) => (
            <span key={c.name} className="flex items-center gap-1 text-[9px] text-zinc-500">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: c.fill }}
              />
              {c.name}
            </span>
          ))}
        </div>
      </div>

      {/* Bar — Top Rated Categories */}
      <div>
        <h4 className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-2 text-center">
          Top Rated Categories
        </h4>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={topRatings} margin={{ top: 4, right: 4, left: 0, bottom: 4 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
            <XAxis
              type="number"
              domain={[0, 5]}
              tick={{ fontSize: 10, className: "fill-zinc-500 dark:fill-zinc-400" }}
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
                const p = (props as { payload: RatingMetric }).payload;
                return [`${p.avgRating} ⭐ (${p.productCount} products)`, "Rating"];
              }}
            />
            <Bar dataKey="avgRating" radius={[0, 6, 6, 0]} maxBarSize={20}>
              {topRatings.map((_, i) => (
                <Cell key={i} fill={i < 3 ? "#22c55e" : i < 6 ? "#f59e0b" : "#6366f1"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
