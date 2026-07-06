"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { graphql } from "@/lib/graphql";

// ───────────────────────────────────────────────────────────────
//  Types
// ───────────────────────────────────────────────────────────────

export type ViewId = "overview" | "returns" | "distribution";

export interface DashboardKPI {
  grossVolume: number;
  totalOrders: number;
  fulfillmentRate: number;
  conversionRate: number;
  averageOrderValue: number;
  activeUsers: number;
  revenueBreakdown: {
    subtotal: number;
    shipping: number;
    taxes: number;
    discounts: number;
    netRevenue: number;
  };
}

export interface TimelineBucket {
  date: string;
  revenue: number;
  ordersCount: number;
  itemsSold: number;
  averageOrderValue: number;
}

export interface ProductRanking {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  basePrice: number;
  stockLevel: number;
  totalRevenue: number;
  unitsSold: number;
  orderCount: number;
  ratingAvg: number | null;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  product: string;
  amount: number;
  status: string;
  date: string;
}

export interface TrafficSource {
  source: string;
  percentage: number;
  visits: string;
}

export interface DeviceBreakdown {
  type: string;
  percentage: number;
}

export interface Alert {
  level: string;
  title: string;
  description: string;
}

export interface DashboardData {
  kpis: DashboardKPI;
  timeline: TimelineBucket[];
  topProducts: ProductRanking[];
  recentOrders: RecentOrder[];
  trafficSources: TrafficSource[];
  deviceBreakdown: DeviceBreakdown[];
  alerts: Alert[];
}

type LoadingState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loading"; data: DashboardData }
  | { status: "settled"; data: DashboardData }
  | { status: "error"; error: Error };

// ───────────────────────────────────────────────────────────────
//  GraphQL Query Strings
// ───────────────────────────────────────────────────────────────

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

const TOP_PRODUCTS_QUERY = `
  query GetTopProducts($input: TopProductsInput!) {
    getTopProducts(input: $input) {
      id
      sku
      name
      category
      basePrice
      stockLevel
      totalRevenue
      unitsSold
      orderCount
      ratingAvg
    }
  }
`;

const RECENT_ORDERS_QUERY = `
  query GetRecentOrders($limit: Int) {
    getRecentOrders(limit: $limit) {
      id
      orderNumber
      customer
      customerEmail
      product
      amount
      status
      date
    }
  }
`;

const TRAFFIC_SOURCES_QUERY = `
  query GetTrafficSources {
    getTrafficSources {
      source
      percentage
      visits
    }
  }
`;

const DEVICE_BREAKDOWN_QUERY = `
  query GetDeviceBreakdown {
    getDeviceBreakdown {
      type
      percentage
    }
  }
`;

const ALERTS_QUERY = `
  query GetAlerts {
    getAlerts {
      level
      title
      description
    }
  }
`;

// ───────────────────────────────────────────────────────────────
//  Hook
// ───────────────────────────────────────────────────────────────

interface UseDashboardOptions {
  timelineInterval?: "DAY" | "WEEK" | "MONTH";
  timelineFrom?: string;
  timelineTo?: string;
  productLimit?: number;
  productSortBy?: "REVENUE" | "UNITS_SOLD" | "RATING";
  recentOrdersLimit?: number;
}

/**
 * Fetches all 7 dashboard GraphQL queries in parallel and
 * returns a loading-state machine.
 *
 * - `status === "loading"`  → show skeleton placeholders
 * - `status === "settled"`  → render live data
 * - `status === "error"`    → show an error state with retry
 *
 * Stale-while-revalidate: previously settled data is preserved
 * when the refetch triggers, so the UI never flashes back to
 * a blank loading state.
 */
export function useDashboardData(options: UseDashboardOptions = {}) {
  const [state, setState] = useState<LoadingState>({ status: "loading" });
  const settledRef = useRef<DashboardData | null>(null);

  const fetchData = useCallback(async () => {
    setState((prev) =>
      prev.status === "settled"
        ? { status: "loading", data: prev.data }
        : { status: "loading" }
    );

    try {
      const [
        kpiRes,
        timelineRes,
        productsRes,
        ordersRes,
        trafficRes,
        deviceRes,
        alertsRes,
      ] = await Promise.all([
        graphql<{ getDashboardKPIs: DashboardKPI }>(KPI_QUERY),
        graphql<{ getSalesTimeline: TimelineBucket[] }>(TIMELINE_QUERY, {
          input: {
            interval: options.timelineInterval ?? "MONTH",
            from: options.timelineFrom ?? null,
            to: options.timelineTo ?? null,
          },
        }),
        graphql<{ getTopProducts: ProductRanking[] }>(TOP_PRODUCTS_QUERY, {
          input: {
            limit: options.productLimit ?? 10,
            sortBy: options.productSortBy ?? "REVENUE",
          },
        }),
        graphql<{ getRecentOrders: RecentOrder[] }>(RECENT_ORDERS_QUERY, {
          limit: options.recentOrdersLimit ?? 6,
        }),
        graphql<{ getTrafficSources: TrafficSource[] }>(TRAFFIC_SOURCES_QUERY),
        graphql<{ getDeviceBreakdown: DeviceBreakdown[] }>(DEVICE_BREAKDOWN_QUERY),
        graphql<{ getAlerts: Alert[] }>(ALERTS_QUERY),
      ]);

      const data: DashboardData = {
        kpis: kpiRes.data.getDashboardKPIs,
        timeline: timelineRes.data.getSalesTimeline,
        topProducts: productsRes.data.getTopProducts,
        recentOrders: ordersRes.data.getRecentOrders,
        trafficSources: trafficRes.data.getTrafficSources,
        deviceBreakdown: deviceRes.data.getDeviceBreakdown,
        alerts: alertsRes.data.getAlerts,
      };

      settledRef.current = data;
      setState({ status: "settled", data });
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to fetch dashboard data");
      setState({ status: "error", error });
    }
  }, [
    options.timelineInterval,
    options.timelineFrom,
    options.timelineTo,
    options.productLimit,
    options.productSortBy,
    options.recentOrdersLimit,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    previousData: settledRef.current,
    refetch: fetchData,
  };
}
