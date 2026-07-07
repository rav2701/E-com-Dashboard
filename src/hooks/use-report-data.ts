"use client";

/**
 * @file Processes the unified product catalog into chart-ready datasets.
 * Computes category distributions, stock levels, rating averages, and
 * estimated P&L figures — all filterable by an optional {@link DateRange}.
 */

import { useMemo } from "react";
import { useFakeStoreProducts, type FakeStoreCard } from "@/hooks/use-fakestore-products";

// ── Chart data types ──────────────────────────────────────────

/** Product count per category, used by the Sales Summary bar chart. */
export interface CategoryMetric {
  name: string;
  value: number;
  fill?: string;
}

/** Stock status counts per category, used by the Inventory stacked bar. */
export interface StockMetric {
  category: string;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

/** Average rating and product count per category, used by Analytics & Tax charts. */
export interface RatingMetric {
  category: string;
  avgRating: number;
  productCount: number;
}

/** Estimated revenue vs discounted pricing per category, used by the P&L chart. */
export interface PnLMetric {
  category: string;
  revenue: number;
  discounted: number;
  savings: number;
}

/** Inclusive date boundary for filtering products by {@link FakeStoreCard.createdAt}. */
export interface DateRange {
  start: Date;
  end: Date;
}

const CATEGORY_COLORS: Record<string, string> = {
  beauty: "#ec4899",
  fragrances: "#a855f7",
  furniture: "#f97316",
  groceries: "#22c55e",
  "home-decoration": "#14b8a6",
  "kitchen-accessories": "#eab308",
  laptops: "#3b82f6",
  "mens-shirts": "#6366f1",
  "mens-shoes": "#8b5cf6",
  "mens-watches": "#0ea5e9",
  "mobile-accessories": "#06b6d4",
  motorcycle: "#d946ef",
  "skin-care": "#f43f5e",
  smartphones: "#2563eb",
  "sports-accessories": "#84cc16",
  sunglasses: "#f59e0b",
  tablets: "#6366f1",
  tops: "#d946ef",
  vehicle: "#78716c",
  "womens-bags": "#a21caf",
  "womens-dresses": "#db2777",
  "womens-jewellery": "#e11d48",
  "womens-shoes": "#f472b6",
  "womens-watches": "#38bdf8",
  electronics: "#06b6d4",
  jewelery: "#f59e0b",
  "men's clothing": "#3b82f6",
  "women's clothing": "#ec4899",
};

function categoryColor(name: string): string {
  return CATEGORY_COLORS[name] ?? "#6b7280";
}

function isInRange(product: FakeStoreCard, range: DateRange): boolean {
  const d = new Date(product.createdAt);
  return d >= range.start && d <= range.end;
}

/**
 * Derives chart-ready datasets from the unified product catalog.
 *
 * @param dateRange - Optional filter; only products whose `createdAt` falls
 *                    within this range are included in the computed metrics.
 * @returns Aggregated metrics for category distribution, stock levels,
 *          rating averages, estimated P&L, plus the raw product list and
 *          loading/error state from the underlying data fetch.
 */
export function useReportData(dateRange?: DateRange) {
  const store = useFakeStoreProducts();
  const products = store.products;

  const filtered = useMemo(() => {
    if (!dateRange) return products;
    return products.filter((p) => isInRange(p, dateRange));
  }, [products, dateRange]);

  const categoryDistribution = useMemo((): CategoryMetric[] => {
    const map = new Map<string, number>();
    for (const p of filtered) {
      map.set(p.category, (map.get(p.category) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value, fill: categoryColor(name) }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const stockLevels = useMemo((): StockMetric[] => {
    const map = new Map<string, { inStock: number; lowStock: number; outOfStock: number }>();
    for (const p of filtered) {
      const entry = map.get(p.category) ?? { inStock: 0, lowStock: 0, outOfStock: 0 };
      if (p.stock <= 0) entry.outOfStock++;
      else if (p.stock < 20) entry.lowStock++;
      else entry.inStock++;
      map.set(p.category, entry);
    }
    return Array.from(map.entries())
      .map(([category, v]) => ({ category, ...v }))
      .sort((a, b) => b.inStock - a.inStock);
  }, [filtered]);

  const ratingMetrics = useMemo((): RatingMetric[] => {
    const map = new Map<string, { total: number; count: number }>();
    for (const p of filtered) {
      const entry = map.get(p.category) ?? { total: 0, count: 0 };
      entry.total += p.rating;
      entry.count++;
      map.set(p.category, entry);
    }
    return Array.from(map.entries())
      .map(([category, v]) => ({
        category,
        avgRating: Math.round((v.total / v.count) * 10) / 10,
        productCount: v.count,
      }))
      .sort((a, b) => b.avgRating - a.avgRating);
  }, [filtered]);

  const pnlMetrics = useMemo((): PnLMetric[] => {
    const map = new Map<string, { revenue: number; discounted: number }>();
    for (const p of filtered) {
      const entry = map.get(p.category) ?? { revenue: 0, discounted: 0 };
      const price = parseFloat(p.price.replace("$", ""));
      const original = Math.round(price * 1.15 * 100) / 100;
      entry.revenue += original;
      entry.discounted += price;
      map.set(p.category, entry);
    }
    return Array.from(map.entries())
      .map(([category, v]) => ({
        category,
        revenue: Math.round(v.revenue * 100) / 100,
        discounted: Math.round(v.discounted * 100) / 100,
        savings: Math.round((v.revenue - v.discounted) * 100) / 100,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filtered]);

  return {
    products,
    filteredCount: filtered.length,
    status: store.status,
    error: store.error,
    refetch: store.refetch,
    categoryDistribution,
    stockLevels,
    ratingMetrics,
    pnlMetrics,
  };
}
