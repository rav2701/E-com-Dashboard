import type { GraphQLContext } from "../context";

interface SalesTimelineInput {
  interval: "DAY" | "WEEK" | "MONTH";
  from?: string | null;
  to?: string | null;
}

interface SalesTimelineBucket {
  date: string;
  revenue: number;
  ordersCount: number;
  itemsSold: number;
  averageOrderValue: number;
}

// Safe lookup maps — never parameterize date_trunc unit or format patterns.
const TRUNC_UNITS: Record<string, string> = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
};

const LABEL_PATTERNS: Record<string, string> = {
  DAY: "YYYY-MM-DD",
  WEEK: 'YYYY-"W"IW',
  MONTH: "YYYY-MM",
};

/**
 * Returns time-bucketed sales records using PostgreSQL's date_trunc.
 *
 * The query uses the BRIN index on `placed_at` for fast range scans
 * and groups by the truncated timestamp. All aggregates (revenue,
 * order count, items sold) are computed server-side in a single pass.
 */
export async function getSalesTimeline(
  _parent: unknown,
  args: { input: SalesTimelineInput },
  ctx: GraphQLContext
): Promise<SalesTimelineBucket[]> {
  const { interval, from, to } = args.input;

  // Default range: last 12 months
  const endDate = to ? new Date(to) : new Date();
  const startDate = from
    ? new Date(from)
    : new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);

  const truncUnit = TRUNC_UNITS[interval] ?? "month";
  const labelPattern = LABEL_PATTERNS[interval] ?? "YYYY-MM";

  type TimelineRow = {
    bucket: string;
    revenue: string;
    orders_count: string;
    items_sold: string;
  };

  // Build the SQL with inline truncation unit (not parameterized) for
  // PostgreSQL compatibility across versions < 14.
  const sql = `
    SELECT
      TO_CHAR(DATE_TRUNC('${truncUnit}', o.placed_at), '${labelPattern}') AS bucket,
      COALESCE(SUM(o.total), 0)::TEXT                 AS revenue,
      COUNT(DISTINCT o.id)::TEXT                      AS orders_count,
      COALESCE(SUM(oi.quantity), 0)::TEXT             AS items_sold
    FROM "orders" o
    JOIN "order_items" oi ON oi.order_id = o.id
    WHERE o.placed_at >= $1
      AND o.placed_at <  $2
      AND o.status NOT IN ('CANCELLED', 'REFUNDED')
    GROUP BY DATE_TRUNC('${truncUnit}', o.placed_at)
    ORDER BY bucket ASC
  `;

  const rows = await ctx.db.$queryRawUnsafe<TimelineRow[]>(
    sql,
    startDate,
    endDate
  );

  return rows.map((row) => {
    const revenue = parseFloat(row.revenue);
    const ordersCount = parseInt(row.orders_count, 10);
    return {
      date: row.bucket,
      revenue,
      ordersCount,
      itemsSold: parseInt(row.items_sold, 10),
      averageOrderValue:
        ordersCount > 0 ? parseFloat((revenue / ordersCount).toFixed(2)) : 0,
    };
  });
}
