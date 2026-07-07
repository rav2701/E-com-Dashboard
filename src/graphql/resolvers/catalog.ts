import type { GraphQLContext } from "../context";

// ───────────────────────────────────────────────────────────────
//  Types
// ───────────────────────────────────────────────────────────────

interface ProductCatalogItem {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  stockLevel: number;
  ratingAvg: number | null;
  reviewCount: number;
  imageUrl: string | null;
  status: string;
  createdAt: string;
}

interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

// ───────────────────────────────────────────────────────────────
//  getAllProducts
// ───────────────────────────────────────────────────────────────

/**
 * Fetches all active products with their primary image URL
 * (extracted from the images JSONB array) and joined category name.
 * Products are ordered by creation date (newest first).
 */
export async function getAllProducts(
  _parent: unknown,
  _args: unknown,
  ctx: GraphQLContext
): Promise<ProductCatalogItem[]> {
  type Row = {
    id: string;
    sku: string;
    name: string;
    category_name: string | null;
    base_price: string;
    compare_at_price: string | null;
    stock_level: string;
    rating_avg: string | null;
    review_count: string;
    image_url: string | null;
    status: string;
    created_at: string;
  };

  const rows = await ctx.db.$queryRawUnsafe<Row[]>(
    `SELECT
      p.id::TEXT,
      p.sku,
      p.name,
      pc.name                                            AS category_name,
      p.base_price::TEXT                                 AS base_price,
      p.compare_at_price::TEXT                           AS compare_at_price,
      p.stock_level::TEXT                                AS stock_level,
      p.rating_avg::TEXT                                 AS rating_avg,
      p.review_count::TEXT                               AS review_count,
      p.status,
      TO_CHAR(p.created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')  AS created_at,
      CASE
        WHEN p.images IS NOT NULL AND jsonb_typeof(p.images) = 'array' AND jsonb_array_length(p.images) > 0
        THEN p.images->0->>'url'
        ELSE NULL
      END                                                AS image_url
    FROM "products" p
    LEFT JOIN "product_categories" pc ON pc.id = p.category_id
    WHERE p.status = 'ACTIVE'
    ORDER BY p.created_at DESC
    `
  );

  return rows.map((row) => ({
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category_name,
    basePrice: parseFloat(row.base_price),
    compareAtPrice: row.compare_at_price ? parseFloat(row.compare_at_price) : null,
    stockLevel: parseInt(row.stock_level, 10),
    ratingAvg: row.rating_avg ? parseFloat(row.rating_avg) : null,
    reviewCount: parseInt(row.review_count, 10),
    imageUrl: row.image_url,
    status: row.status,
    createdAt: row.created_at,
  }));
}

// ───────────────────────────────────────────────────────────────
//  getAllCategories
// ───────────────────────────────────────────────────────────────

/**
 * Fetches all categories with a count of active products in each.
 * Only returns categories that have at least one active product.
 */
export async function getAllCategories(
  _parent: unknown,
  _args: unknown,
  ctx: GraphQLContext
): Promise<CategoryInfo[]> {
  type Row = {
    id: string;
    name: string;
    slug: string;
    product_count: string;
  };

  const rows = await ctx.db.$queryRawUnsafe<Row[]>(
    `SELECT
      pc.id::TEXT,
      pc.name,
      pc.slug,
      COUNT(p.id)::TEXT AS product_count
    FROM "product_categories" pc
    LEFT JOIN "products" p ON p.category_id = pc.id AND p.status = 'ACTIVE'
    GROUP BY pc.id, pc.name, pc.slug
    HAVING COUNT(p.id) > 0
    ORDER BY pc.sort_order ASC, pc.name ASC
    `
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    productCount: parseInt(row.product_count, 10),
  }));
}
