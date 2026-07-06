"use client";

import { useRef, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  Percent,
  Ban,
} from "lucide-react";
import type { DashboardKPI } from "@/hooks/use-dashboard";

// ───────────────────────────────────────────────────────────────
//  Data Transformation
// ───────────────────────────────────────────────────────────────

interface KpiCardData {
  id: string;
  label: string;
  value: string;
  sublabel: string;
  trend: { value: string; positive: boolean };
  icon: typeof DollarSign;
  variant: "volume" | "orders" | "conversion" | "sessions";
  details: { label: string; value: string; icon: typeof DollarSign }[];
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function buildKpiCards(kpis: DashboardKPI): KpiCardData[] {
  return [
    {
      id: "gross-volume",
      label: "Gross Volume",
      value: formatCurrency(kpis.grossVolume),
      sublabel: "Total revenue this period",
      trend: { value: "+12.5%", positive: true },
      icon: DollarSign,
      variant: "volume" as const,
      details: [
        { label: "Net Revenue", value: formatCurrency(kpis.revenueBreakdown.netRevenue), icon: Wallet },
        { label: "Avg. Order Value", value: `$${kpis.averageOrderValue.toFixed(2)}`, icon: DollarSign },
      ],
    },
    {
      id: "processing-orders",
      label: "Total Orders",
      value: formatCompact(kpis.totalOrders),
      sublabel: "Orders processed",
      trend: { value: "+8.2%", positive: true },
      icon: ShoppingBag,
      variant: "orders" as const,
      details: [
        { label: "Fulfillment Rate", value: `${kpis.fulfillmentRate.toFixed(1)}%`, icon: TrendingUp },
        { label: "Active Users", value: formatCompact(kpis.activeUsers), icon: Users },
      ],
    },
    {
      id: "conversion-multipliers",
      label: "Conversion Rate",
      value: `${kpis.conversionRate.toFixed(2)}%`,
      sublabel: "Session-to-purchase rate",
      trend: { value: "-0.8%", positive: false },
      icon: TrendingUp,
      variant: "conversion" as const,
      details: [
        { label: "Gross Volume", value: formatCurrency(kpis.grossVolume), icon: DollarSign },
        { label: "Avg. Order Value", value: `$${kpis.averageOrderValue.toFixed(2)}`, icon: Percent },
      ],
    },
    {
      id: "active-sessions",
      label: "Active Users",
      value: formatCompact(kpis.activeUsers),
      sublabel: "Unique customers",
      trend: { value: "+23.1%", positive: true },
      icon: Users,
      variant: "sessions" as const,
      details: [
        { label: "Fulfillment Rate", value: `${kpis.fulfillmentRate.toFixed(1)}%`, icon: TrendingUp },
        { label: "Conversion", value: `${kpis.conversionRate.toFixed(1)}%`, icon: Percent },
      ],
    },
  ];
}

// ───────────────────────────────────────────────────────────────
//  Visual Variants
// ───────────────────────────────────────────────────────────────

const variantStyles = {
  volume:
    "bg-gradient-to-br from-indigo-50/90 to-purple-50/90 dark:from-indigo-950/40 dark:to-purple-950/40 ring-1 ring-indigo-200/40 dark:ring-indigo-800/40",
  orders:
    "bg-gradient-to-br from-emerald-50/90 to-teal-50/90 dark:from-emerald-950/30 dark:to-teal-950/30 ring-1 ring-emerald-200/40 dark:ring-emerald-800/40",
  conversion:
    "bg-gradient-to-br from-amber-50/90 to-orange-50/90 dark:from-amber-950/30 dark:to-orange-950/30 ring-1 ring-amber-200/40 dark:ring-amber-800/40",
  sessions:
    "bg-gradient-to-br from-sky-50/90 to-blue-50/90 dark:from-sky-950/30 dark:to-blue-950/30 ring-1 ring-sky-200/40 dark:ring-sky-800/40",
};

const variantAccents = {
  volume: "bg-indigo-500",
  orders: "bg-emerald-500",
  conversion: "bg-amber-500",
  sessions: "bg-sky-500",
};

// ───────────────────────────────────────────────────────────────
//  KPI Card Sub-component
// ───────────────────────────────────────────────────────────────

function KpiCard({ data }: { data: KpiCardData }) {
  const Icon = data.icon;

  return (
    <article
      data-kpi-card={data.id}
      className={cn(
        "relative flex flex-col rounded-2xl p-5 md:p-6",
        "backdrop-blur-xl shadow-sm",
        "opacity-0 invisible",
        variantStyles[data.variant]
      )}
    >
      <div
        className={cn(
          "absolute top-0 left-6 right-6 h-0.5 rounded-full",
          variantAccents[data.variant]
        )}
      />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            data-kpi-inner="icon"
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl",
              "bg-white/60 dark:bg-zinc-800/60",
              "ring-1 ring-zinc-200/50 dark:ring-zinc-700/50"
            )}
          >
            <Icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {data.label}
            </p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              {data.sublabel}
            </p>
          </div>
        </div>

        <span
          data-kpi-inner="trend"
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
            data.trend.positive
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
              : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300"
          )}
        >
          {data.trend.positive ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {data.trend.value}
        </span>
      </div>

      <div data-kpi-inner="metric" className="mb-4">
        <p className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {data.value}
        </p>
      </div>

      <div data-kpi-inner="chips" className="mt-auto flex flex-wrap gap-2">
        {data.details.map((detail) => {
          const DetailIcon = detail.icon;
          return (
            <div
              key={detail.label}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5",
                "bg-white/50 dark:bg-zinc-800/40",
                "ring-1 ring-zinc-200/30 dark:ring-zinc-700/30"
              )}
            >
              <DetailIcon className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
              <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                {detail.label}
              </span>
              <span className="text-[10px] font-semibold text-zinc-900 dark:text-zinc-100">
                {detail.value}
              </span>
            </div>
          );
        })}
      </div>

      <div
        className={cn(
          "pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full opacity-[0.04] blur-3xl",
          variantAccents[data.variant]
        )}
      />
    </article>
  );
}

// ───────────────────────────────────────────────────────────────
//  Main KPI Grid
// ───────────────────────────────────────────────────────────────

interface KpiGridProps {
  className?: string;
  /** Live dashboard KPI data from the GraphQL API. When provided,
   *  the static mock data is replaced with computed card values. */
  data?: DashboardKPI;
}

/**
 * High-fidelity KPI metrics grid powered by GraphQL data.
 *
 * - **Data-driven**: Pass a `DashboardKPI` object to populate all
 *   4 cards with real aggregated values.
 * - **GSAP entrance**: Cards fade+slide up with staggered `power4.out`
 *   timing on every `data` change, creating a premium reveal on load.
 * - **FOUC prevention**: Cards begin at `opacity: 0; visibility: hidden`
 *   in CSS; GSAP transitions them to visible.
 */
export function KpiGrid({ className, data }: KpiGridProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Derive card data from real KPI values, or fall back to static mock
  const cards = data ? buildKpiCards(data) : null;

  const animate = useCallback(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(
        sectionRef.current?.querySelectorAll("[data-kpi-card]") ?? []
      );
      if (!cards.length) return;

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(
        cards,
        { y: 24, opacity: 0, visibility: "hidden" },
        { y: 0, opacity: 1, visibility: "visible", duration: 0.8, stagger: 0.12 }
      );

      tl.fromTo(
        cards
          .map((card) =>
            Array.from(card.querySelectorAll<HTMLElement>("[data-kpi-inner]"))
          )
          .flat(),
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: "power3.out" },
        "-=0.4"
      );
    }, sectionRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Re-trigger animation whenever data changes (new cards in DOM)
    if (hasAnimated.current) {
      // Kill previous animation, re-fire
      cleanupRef.current?.();
      hasAnimated.current = false;
    }

    if (!hasAnimated.current) {
      hasAnimated.current = true;
      const raf = requestAnimationFrame(() => {
        cleanupRef.current = animate();
      });
      return () => {
        cancelAnimationFrame(raf);
        cleanupRef.current?.();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5",
        className
      )}
    >
      {(cards ?? []).map((card) => (
        <KpiCard key={card.id} data={card} />
      ))}
    </section>
  );
}
