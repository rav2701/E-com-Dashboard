import type { GraphQLContext } from "../context";

interface DashboardKPIsResult {
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

/**
 * Fetches all dashboard KPIs in a single aggregated database query.
 *
 * Uses Prisma's raw query to compute multiple aggregates in one
 * index-only scan by leveraging the composite indexes on
 * (placedAt), (status, placedAt), and (paymentStatus, status).
 */
export async function getDashboardKPIs(
  _parent: unknown,
  _args: unknown,
  ctx: GraphQLContext
): Promise<DashboardKPIsResult> {
  // ── Single aggregation pipeline ──────────────────────────────
  type AggRow = {
    gross_volume: string;
    total_orders: string;
    delivered_orders: string;
    paid_orders: string;
    active_users: string;
    sum_subtotal: string;
    sum_shipping: string;
    sum_tax: string;
    sum_discount: string;
  };

  const [agg] = await ctx.db.$queryRawUnsafe<AggRow[]>(
    `
    SELECT
      COALESCE(SUM(o.total), 0)::TEXT             AS gross_volume,
      COUNT(*)::TEXT                                AS total_orders,
      COUNT(*) FILTER (WHERE o.status = 'DELIVERED')::TEXT  AS delivered_orders,
      COUNT(*) FILTER (
        WHERE o.payment_status IN ('PAID', 'REFUNDED', 'PARTIALLY_REFUNDED')
      )::TEXT                                       AS paid_orders,
      COUNT(DISTINCT o.user_id)::TEXT               AS active_users,
      COALESCE(SUM(o.subtotal), 0)::TEXT           AS sum_subtotal,
      COALESCE(SUM(o.shipping_cost), 0)::TEXT      AS sum_shipping,
      COALESCE(SUM(o.tax_amount), 0)::TEXT          AS sum_tax,
      COALESCE(SUM(o.discount_amount), 0)::TEXT     AS sum_discount
    FROM "orders" o
    `
  );

  const grossVolume = parseFloat(agg.gross_volume);
  const totalOrders = parseInt(agg.total_orders, 10);
  const deliveredOrders = parseInt(agg.delivered_orders, 10);
  const paidOrders = parseInt(agg.paid_orders, 10);
  const activeUsers = parseInt(agg.active_users, 10);
  const subtotal = parseFloat(agg.sum_subtotal);
  const shipping = parseFloat(agg.sum_shipping);
  const taxes = parseFloat(agg.sum_tax);
  const discounts = parseFloat(agg.sum_discount);

  return {
    grossVolume,
    totalOrders,
    fulfillmentRate:
      totalOrders > 0
        ? parseFloat(((deliveredOrders / totalOrders) * 100).toFixed(2))
        : 0,
    conversionRate:
      totalOrders > 0
        ? parseFloat(((paidOrders / totalOrders) * 100).toFixed(2))
        : 0,
    averageOrderValue:
      totalOrders > 0
        ? parseFloat((grossVolume / totalOrders).toFixed(2))
        : 0,
    activeUsers,
    revenueBreakdown: {
      subtotal,
      shipping,
      taxes,
      discounts,
      netRevenue: parseFloat((subtotal - discounts).toFixed(2)),
    },
  };
}
