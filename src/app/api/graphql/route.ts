import { createYoga } from "graphql-yoga";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs } from "@/graphql/schema";
import { resolvers } from "@/graphql/resolvers";
import {
  createContext,
  buildContext,
  type GraphQLContext,
} from "@/graphql/context";

// Explicitly use Node.js runtime (pg and prisma-adapter-pg require it)
export const runtime = "nodejs";

// ── Lazy initialization with error capture ─────────────────────
// Module-level code that throws (makeExecutableSchema, createYoga)
// would crash the entire module and produce an empty 500.
// Instead, we lazy-init and capture any error for diagnostics.

let _yoga: { fetch(request: Request): Promise<Response> } | null = null;
let _initError: string | null = null;

function getYoga() {
  if (_initError) throw new Error(_initError);
  if (_yoga) return _yoga;

  try {
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const baseCtx = createContext();

    _yoga = createYoga({
      schema,
      context: async ({ request }: { request: Request }): Promise<GraphQLContext> => {
        return buildContext(baseCtx, request);
      },
      graphqlEndpoint: "/api/graphql",
      cors: { origin: "*", credentials: true },
      graphiql: process.env.NODE_ENV === "development",
    });

    return _yoga;
  } catch (err) {
    _initError = err instanceof Error ? err.message : String(err);
    _initError += `\nStack: ${err instanceof Error ? err.stack : "N/A"}`;
    throw new Error(_initError);
  }
}

// ── Helper: handle all requests ────────────────────────────────

async function handleRequest(request: Request): Promise<Response> {
  try {
    const yoga = getYoga();
    return await yoga.fetch(request);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: "GraphQL initialization failed", detail: message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

// ── Next.js App Router handlers ───────────────────────────────

export async function GET(request: Request) {
  return handleRequest(request);
}

export async function POST(request: Request) {
  return handleRequest(request);
}
