"use client";

import { useState, useEffect, useCallback } from "react";
import { graphql } from "@/lib/graphql";
import type {
  TimelineBucket,
  DashboardKPI,
} from "./use-dashboard";

// ───────────────────────────────────────────────────────────────
//  Types
// ───────────────────────────────────────────────────────────────

export type TimelineInterval = "DAY" | "WEEK" | "MONTH";

export interface CategoryPerformanceItem {
  name: string;
  revenue: number;
  unitsSold: number;
  orderCount: number;
  percentage: number;
}

export interface AnalyticsState {
  loading: boolean;
  error: string | null;
  timeline: TimelineBucket[];
  kpis: DashboardKPI | null;
  categoryPerformance: CategoryPerformanceItem[];
}

// ───────────────────────────────────────────────────────────────
//  GraphQL Queries
// ───────────────────────────────────────────────────────────────

const TIMELINE_QUERY = `
  query GetSalesTimeline($input: SalesTimelineInput!) {
    getSalesTimeline(input: $input) {
      date
      revenue
      ordersCount
      itemsSold
      averageOrderValue
    }
  }
`;

const KPI_QUERY = `
  query GetDashboardKPIs {
    getDashboardKPIs {
      grossVolume
      totalOrders
      fulfillmentRate
      conversionRate
      averageOrderValue
      activeUsers
      revenueBreakdown {
        subtotal
        shipping
        taxes
        discounts
        netRevenue
      }
    }
  }
`;

const CATEGORY_PERFORMANCE_QUERY = `
  query GetCategoryPerformance {
    getCategoryPerformance {
      name
      revenue
      unitsSold
      orderCount
      percentage
    }
  }
`;

// ───────────────────────────────────────────────────────────────
//  Hook
// ───────────────────────────────────────────────────────────────

interface UseAnalyticsOptions {
  interval?: TimelineInterval;
  from?: string;
  to?: string;
}

/**
 * Fetches timeline, KPI, and category performance data for the analytics page.
 */
export function useAnalyticsData(options: UseAnalyticsOptions = {}) {
  const [state, setState] = useState<AnalyticsState>({
    loading: true,
    error: null,
    timeline: [],
    kpis: null,
    categoryPerformance: [],
  });

  const { interval = "MONTH", from, to } = options;

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [timelineRes, kpiRes, categoryRes] = await Promise.all([
        graphql<{ getSalesTimeline: TimelineBucket[] }>(TIMELINE_QUERY, {
          input: {
            interval,
            from: from ?? null,
            to: to ?? null,
          },
        }),
        graphql<{ getDashboardKPIs: DashboardKPI }>(KPI_QUERY),
        graphql<{ getCategoryPerformance: CategoryPerformanceItem[] }>(
          CATEGORY_PERFORMANCE_QUERY
        ),
      ]);

      setState({
        loading: false,
        error: null,
        timeline: timelineRes.data.getSalesTimeline,
        kpis: kpiRes.data.getDashboardKPIs,
        categoryPerformance: categoryRes.data.getCategoryPerformance,
      });
    } catch (err) {
      setState({
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch analytics data",
        timeline: [],
        kpis: null,
        categoryPerformance: [],
      });
    }
  }, [interval, from, to]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}
