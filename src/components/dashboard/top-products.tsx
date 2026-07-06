"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Star, DollarSign, Package } from "lucide-react";
import type { ProductRanking } from "@/hooks/use-dashboard";
import gsap from "gsap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

// ───────────────────────────────────────────────────────────────
//  Colours for the ranked bars
// ───────────────────────────────────────────────────────────────

const barColors = [
  "#6366f1", // indigo
  "#818cf8", // indigo-400
  "#a5b4fc", // indigo-300
  "#6d28d9", // violet-700
  "#8b5cf6", // violet-500
  "#a78bfa", // violet-400
  "#0d9488", // teal-600
  "#14b8a6", // teal-500
  "#2dd4bf", // teal-400
  "#5eead4", // teal-300
];

// ───────────────────────────────────────────────────────────────
//  Custom Tooltip – inline types (payload/label come from context)
// ───────────────────────────────────────────────────────────────

interface TooltipPayloadEntry {
  dataKey?: string;
  value?: number;
  payload?: Record<string, unknown>;
}

interface ProductsTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

function ProductsTooltip({ active, payload }: ProductsTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const entry = payload[0]?.payload as ProductRanking | undefined;
  if (!entry) return null;

  return (
    <div className="rounded-xl bg-white/90 px-4 py-3 shadow-lg ring-1 ring-zinc-200/50 backdrop-blur-xl dark:bg-zinc-900/90 dark:ring-zinc-700/50">
      <p className="mb-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
        {entry.name}
      </p>
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />
          <span className="text-zinc-500 dark:text-zinc-400">Revenue</span>
          <span className="ml-auto font-semibold text-zinc-900 dark:text-zinc-100">
            ${entry.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 0 })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Package className="h-3 w-3 text-zinc-400" />
          <span className="text-zinc-500 dark:text-zinc-400">Units Sold</span>
          <span className="ml-auto font-semibold text-zinc-900 dark:text-zinc-100">
            {entry.unitsSold.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-3 w-3 text-zinc-400" />
          <span className="text-zinc-500 dark:text-zinc-400">Price</span>
          <span className="ml-auto font-semibold text-zinc-900 dark:text-zinc-100">
            ${entry.basePrice.toFixed(2)}
          </span>
        </div>
        {entry.ratingAvg != null && (
          <div className="flex items-center gap-2">
            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
            <span className="text-zinc-500 dark:text-zinc-400">Rating</span>
            <span className="ml-auto font-semibold text-zinc-900 dark:text-zinc-100">
              {entry.ratingAvg.toFixed(1)}
            </span>
          </div>
        )}
        {entry.stockLevel != null && (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                entry.stockLevel > 50
                  ? "bg-emerald-500"
                  : entry.stockLevel > 20
                    ? "bg-amber-500"
                    : "bg-red-500"
              )}
            />
            <span className="text-zinc-500 dark:text-zinc-400">Stock</span>
            <span className="ml-auto font-semibold text-zinc-900 dark:text-zinc-100">
              {entry.stockLevel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
//  Custom Y-axis tick (product name + rank badge + category)
// ───────────────────────────────────────────────────────────────

interface ProductsTickProps {
  x: number | string;
  y: number | string;
  payload: { value: string; index: number };
  data: ProductRanking[];
}

function ProductsTick({ x, y, payload, data }: ProductsTickProps) {
  const product = data[payload.index];
  if (!product) return null;

  const rank = payload.index + 1;
  const isTop3 = rank <= 3;

  return (
    <g transform={`translate(${x},${y})`}>
      {/* Rank badge */}
      <rect
        x={-28}
        y={-10}
        width={18}
        height={18}
        rx={4}
        fill={isTop3 ? "#6366f1" : "currentColor"}
        className={cn(
          !isTop3 && "fill-zinc-200 dark:fill-zinc-700"
        )}
      />
      <text
        x={-19}
        y={4}
        textAnchor="middle"
        className="text-[10px] font-bold"
        fill={isTop3 ? "#fff" : "currentColor"}
        style={{ fill: isTop3 ? "#fff" : undefined }}
      >
        {rank}
      </text>

      {/* Product name */}
      <text
        x={-4}
        y={4}
        className="text-[11px] font-medium fill-zinc-700 dark:fill-zinc-300"
        dominantBaseline="middle"
      >
        {product.name.length > 22
          ? product.name.slice(0, 20) + "…"
          : product.name}
      </text>        {/* Category label */}
        {product.category && (
          <text
            x={-4}
            y={14}
            className="text-[8px] fill-zinc-400 dark:fill-zinc-500"
            dominantBaseline="middle"
          >
            {product.category}
          </text>
        )}
    </g>
  );
}

// ───────────────────────────────────────────────────────────────
//  Product Revenue Bar Chart
// ───────────────────────────────────────────────────────────────

interface HorizontalBarChartProps {
  data: ProductRanking[];
}

function HorizontalBarChart({ data }: HorizontalBarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  // Find the max revenue for scaling
  const maxRevenue = Math.max(...data.map((p) => p.totalRevenue), 1);

  // ── GSAP entrance animation ─────────────────────────────
  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    const ctx = gsap.context(() => {
      // Animate bars: grow from left (scaleX 0 → 1)
      const bars = chartRef.current?.querySelectorAll<HTMLElement>(
        ".recharts-bar-rectangle rect"
      );
      if (bars && bars.length) {
        gsap.from(bars, {
          scaleX: 0,
          transformOrigin: "0 50%",
          duration: 0.7,
          stagger: 0.04,
          ease: "power3.out",
        });
      }

      // Animate Y-axis labels: fade up from left
      const ticks = chartRef.current?.querySelectorAll<HTMLElement>(
        ".recharts-yAxis .recharts-text"
      );
      if (ticks && ticks.length) {
        gsap.from(ticks, {
          opacity: 0,
          x: -12,
          duration: 0.4,
          stagger: 0.04,
          delay: 0.15,
          ease: "power2.out",
        });
      }

      // Animate revenue labels: fade in
      const labels = chartRef.current?.querySelectorAll<HTMLElement>(
        ".recharts-label text"
      );
      if (labels && labels.length) {
        gsap.from(labels, {
          opacity: 0,
          x: 6,
          duration: 0.35,
          stagger: 0.04,
          delay: 0.3,
          ease: "power2.out",
        });
      }

      // Rank badges: subtle scale from 0
      const badges = chartRef.current?.querySelectorAll<HTMLElement>(
        ".recharts-yAxis rect"
      );
      if (badges && badges.length) {
        gsap.from(badges, {
          scale: 0,
          duration: 0.3,
          stagger: 0.04,
          delay: 0.2,
          ease: "back.out(2)",
        });
      }
    }, chartRef);

    return () => ctx.revert();
  }, [data]);

  return (
    <div ref={chartRef} className="flex-1 min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 60, bottom: 0, left: 120 }}
          barCategoryGap={6}
        >
          <defs>
            <linearGradient id="productBarGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.85} />
              <stop offset="100%" stopColor="#818cf8" stopOpacity={0.6} />
            </linearGradient>
          </defs>

          <XAxis
            type="number"
            hide
            domain={[0, maxRevenue * 1.15]}
          />

          <YAxis
            type="category"
            dataKey="name"
            tick={(props) => (
              <ProductsTick {...props} data={data} />
            )}
            tickLine={false}
            axisLine={false}
            width={120}
          />

          <Tooltip
            content={<ProductsTooltip />}
            cursor={{
              fill: "currentColor",
              className: "fill-zinc-200/30 dark:fill-zinc-700/20",
            }}
          />

          <Bar
            isAnimationActive={false}
            dataKey="totalRevenue"
            radius={[0, 4, 4, 0]}
            maxBarSize={20}
            className="cursor-pointer"
          >
            <LabelList
              dataKey="totalRevenue"
              position="right"
              formatter={(value: unknown) => {
                const num = Number(value ?? 0);
                return `$${num >= 1_000_000 ? (num / 1_000_000).toFixed(1) + "M" : num >= 1_000 ? (num / 1_000).toFixed(0) + "k" : num.toLocaleString()}`;
              }}
              className="fill-zinc-500 text-[10px] font-medium dark:fill-zinc-400"
            />
            {data.map((entry: ProductRanking, index: number) => (
              <Cell
                key={entry.id}
                fill={barColors[index % barColors.length]}
                className="transition-opacity hover:opacity-80"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
//  Top Products Card
// ───────────────────────────────────────────────────────────────

interface TopProductsProps {
  data: ProductRanking[];
  className?: string;
}

export function TopProducts({ data, className }: TopProductsProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-full",
          "text-xs text-zinc-400 dark:text-zinc-500",
          className
        )}
      >
        No product data available
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <HorizontalBarChart data={data} />
    </div>
  );
}
