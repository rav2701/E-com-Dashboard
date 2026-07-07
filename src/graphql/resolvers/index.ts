import { getDashboardKPIs } from "./dashboard";
import { getSalesTimeline } from "./timeline";
import { getTopProducts } from "./products";
import {
  getRecentOrders,
  getTrafficSources,
  getDeviceBreakdown,
  getAlerts,
  getCategoryPerformance,
} from "./sections";
import { register, login, forgotPassword, me } from "./auth";
import type { GraphQLContext } from "../context";

export const resolvers = {
  Query: {
    getDashboardKPIs,
    getSalesTimeline,
    getTopProducts,
    getRecentOrders,
    getTrafficSources,
    getDeviceBreakdown,
    getAlerts,
    getCategoryPerformance,
    me,
  },

  Mutation: {
    register,
    login,
    forgotPassword,
  },

  // ── Type-level resolvers ─────────────────────────────────
  // These demonstrate the DataLoader pattern for N+1 mitigation.
  // When a client queries nested relations (e.g. order.items.product),
  // loaders batch the individual fetches into a single DB query.

  ProductRanking: {
    /**
     * Resolves the category name via DataLoader, batching
     * across all products in the rankings list. Falls back
     * to the joined value from the top-products query when
     * already pre-loaded.
     */
    category: (
      parent: { categoryId?: string | null; categoryName?: string | null },
      _args: unknown,
      ctx: GraphQLContext
    ) => {
      // If already joined in the parent query, return directly — no DB call needed.
      if (parent.categoryName) return parent.categoryName;
      if (!parent.categoryId) return null;

      // Otherwise batch-fetch via DataLoader (N+1 prevention).
      return ctx.loaders.category.load(parent.categoryId).then(
        (cat: { name?: string } | null) => cat?.name ?? null
      );
    },
  },
};
