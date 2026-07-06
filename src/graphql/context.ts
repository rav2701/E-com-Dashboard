import { db } from "@/lib/db";
import {
  createProductLoader,
  createOrderLoader,
  createCategoryLoader,
} from "./loaders";
import { verifyToken } from "./resolvers/auth";

export interface GraphQLContext {
  db: typeof db;
  loaders: {
    product: ReturnType<typeof createProductLoader>;
    order: ReturnType<typeof createOrderLoader>;
    category: ReturnType<typeof createCategoryLoader>;
  };
  /** The authenticated user's ID, if a valid JWT was provided. */
  userId?: string;
}

export function createContext(): GraphQLContext {
  // The context factory receives the server context from yoga.
  // We access the request via the params passed to the hook.
  // For now, we return the base context — the userId is injected
  // by the GraphQL Yoga server via the server context param.
  return {
    db,
    loaders: {
      product: createProductLoader(),
      order: createOrderLoader(),
      category: createCategoryLoader(),
    },
  };
}

/**
 * Build the GraphQL context with optional authentication.
 * This version receives the initial params from the yoga server
 * and can extract the JWT from the request headers.
 */
export async function buildContext(
  initialContext: ReturnType<typeof createContext>,
  request: Request
): Promise<GraphQLContext> {
  const ctx: GraphQLContext = {
    ...initialContext,
    loaders: {
      product: createProductLoader(),
      order: createOrderLoader(),
      category: createCategoryLoader(),
    },
  };

  // Extract JWT from Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const payload = verifyToken(token);
      ctx.userId = payload.userId;
    } catch {
      // Invalid token — proceed without authentication
    }
  }

  return ctx;
}
