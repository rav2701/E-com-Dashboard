import DataLoader from "dataloader";
import { db } from "@/lib/db";
import type {
  Product,
  Order,
  ProductCategory,
} from "@/generated/prisma/client";

/**
 * Batches product fetches by ID to prevent N+1 when resolving
 * order items → product details across multiple orders.
 */
export function createProductLoader() {
  return new DataLoader<string, Product | null>(async (ids) => {
    const products = await db.product.findMany({
      where: { id: { in: [...ids] } },
    });
    const map = new Map(products.map((p) => [p.id, p]));
    return ids.map((id) => map.get(id) ?? null);
  });
}

/**
 * Batches order fetches by ID.
 */
export function createOrderLoader() {
  return new DataLoader<string, Order | null>(async (ids) => {
    const orders = await db.order.findMany({
      where: { id: { in: [...ids] } },
    });
    const map = new Map(orders.map((o) => [o.id, o]));
    return ids.map((id) => map.get(id) ?? null);
  });
}

/**
 * Batches category fetches by ID. Used by the ProductRanking
 * type resolver to resolve category names without N+1.
 */
export function createCategoryLoader() {
  return new DataLoader<string, ProductCategory | null>(async (ids) => {
    const categories = await db.productCategory.findMany({
      where: { id: { in: [...ids] } },
    });
    const map = new Map(categories.map((c) => [c.id, c]));
    return ids.map((id) => map.get(id) ?? null);
  });
}
