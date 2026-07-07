import { graphql } from "graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs } from "@/graphql/schema";
import { resolvers } from "@/graphql/resolvers";
import {
  createContext,
  buildContext,
  type GraphQLContext,
} from "@/graphql/context";

export const runtime = "nodejs";

// ── Build schema once ─────────────────────────────────────────

let _schema: ReturnType<typeof makeExecutableSchema> | null = null;
let _schemaError: string | null = null;

function getSchema() {
  if (_schemaError) throw new Error(_schemaError);
  if (_schema) return _schema;
  try {
    _schema = makeExecutableSchema({ typeDefs, resolvers });
    return _schema;
  } catch (err) {
    _schemaError = err instanceof Error ? err.message : String(err);
    throw new Error(_schemaError);
  }
}

// ── Parse GraphQL body ────────────────────────────────────────

async function parseBody(request: Request): Promise<{ query: string; variables?: Record<string, unknown> }> {
  const text = await request.text();
  if (!text) {
    throw new Error("Request body is empty. Send a POST request with a JSON body containing 'query'.");
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON body");
  }
}

// ── Handle request ────────────────────────────────────────────

async function handleRequest(request: Request): Promise<Response> {
  try {
    const schema = getSchema();
    const baseCtx = createContext();
    const ctx = await buildContext(baseCtx, request);
    const { query, variables } = await parseBody(request);

    const result = await graphql({
      schema,
      source: query,
      variableValues: variables,
      contextValue: ctx,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      }
    );
  }
}

// ── Next.js App Router handlers ───────────────────────────────

export async function GET() {
  return new Response(
    JSON.stringify({ error: "Use POST to send GraphQL queries" }),
    {
      status: 405,
      headers: { "content-type": "application/json", allow: "POST" },
    }
  );
}

export async function POST(request: Request) {
  return handleRequest(request);
}
