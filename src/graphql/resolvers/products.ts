import type { GraphQLContext } from "../context";

interface TopProductsInput {
  limit?: number;
  sortBy?: "REVENUE" | "UNITS_SOLD" | "RATING";
}

interface ProductRankingResult {
  id: string;
  sku: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  basePrice: number;
  stockLevel: number;
  totalRevenue: number;
  unitsSold: number;
  orderCount: number;
  ratingAvg: number | null;
}

// Safe lookup map for ORDER BY clauses — never interpolate raw user input.
const ORDER_BY_CLAUSES: Record<string, string> = {
  REVENUE: "ORDER BY total_revenue DESC",
  UNITS_SOLD: "ORDER BY units_sold DESC",
  RATING: "ORDER BY p.rating_avg DESC NULLS LAST",
};

/**
 * Returns top-performing products ranked by revenue, units sold,
 * or average rating. Uses a single aggregated query that joins
 * order_items with products.
 *
 * The ORDER BY and LIMIT are pushed down to PostgreSQL, so only
 * the top N rows are materialized. The composite index on
 * (product_id, placed_at) accelerates the join for time-filtered
 * variants if needed in the future.
 */
export async function getTopProducts(
  _parent: unknown,
  args: { input: TopProductsInput },
  ctx: GraphQLContext
): Promise<ProductRankingResult[]> {
  const limit = Math.min(args.input.limit ?? 10, 100);
  const sortBy = args.input.sortBy ?? "REVENUE";
  const orderClause = ORDER_BY_CLAUSES[sortBy] ?? ORDER_BY_CLAUSES.REVENUE;

  type ProductRow = {
    id: string;
    sku: string;
    name: string;
    category_id: string | null;
    category_name: string | null;
    base_price: string;
    stock_level: string;
    total_revenue: string;
    units_sold: string;
    order_count: string;
    rating_avg: string | null;
  };

  const rows = await ctx.db.$queryRawUnsafe<ProductRow[]>(
    `
    SELECT
      p.id,
      p.sku,
      p.name,
      pc.name                                                       AS category_name,
      p.base_price::TEXT                                            AS base_price,
      p.stock_level::TEXT                                           AS stock_level,
      COALESCE(SUM(oi.total), 0)::TEXT                              AS total_revenue,
      COALESCE(SUM(oi.quantity), 0)::TEXT                           AS units_sold,
      COUNT(DISTINCT oi.order_id)::TEXT                             AS order_count,
      p.rating_avg::TEXT                                            AS rating_avg
    FROM "products" p
    LEFT JOIN "order_items" oi          ON oi.product_id = p.id
    LEFT JOIN "product_categories" pc   ON pc.id = p.category_id
    WHERE p.status = 'ACTIVE'
    GROUP BY p.id, p.sku, p.name, pc.name,
             p.base_price, p.stock_level, p.rating_avg
    ${orderClause}
    LIMIT $1
    `,
    limit
  );

  return rows.map((row) => ({
    id: row.id,
    sku: row.sku,
    name: row.name,
    categoryId: null,
    categoryName: row.category_name,
    basePrice: parseFloat(row.base_price),
    stockLevel: parseInt(row.stock_level, 10),
    totalRevenue: parseFloat(row.total_revenue),
    unitsSold: parseInt(row.units_sold, 10),
    orderCount: parseInt(row.order_count, 10),
    ratingAvg: row.rating_avg ? parseFloat(row.rating_avg) : null,
  }));
}
