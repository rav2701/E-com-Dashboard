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

// Build executable schema from SDL + resolvers
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Store the base context factory result to avoid re-initializing loaders
const baseCtx = createContext();

// Yoga server instance (created once and reused across invocations)
const yoga = createYoga({
  schema,
  context: async ({ request }: { request: Request }): Promise<GraphQLContext> => {
    return buildContext(baseCtx, request);
  },
  graphqlEndpoint: "/api/graphql",
  cors: { origin: "*", credentials: true },
  graphiql: process.env.NODE_ENV === "development",
});

// ── Next.js App Router handlers ───────────────────────────────

export async function GET(request: Request) {
  try {
    return await yoga.fetch(request);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export async function POST(request: Request) {
  try {
    return await yoga.fetch(request);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
