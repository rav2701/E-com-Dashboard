import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { typeDefs } from "@/graphql/schema";
import pkg from "@/../package.json";

export const runtime = "nodejs";

// ── Types ─────────────────────────────────────────────────────

interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: { status: "ok" | "error"; latencyMs: number; message?: string };
    graphql: { status: "ok" | "error"; queryCount: number; message?: string };
    memory: {
      status: "ok" | "warn";
      heapUsedMb: number;
      heapTotalMb: number;
      rssMb: number;
    };
  };
}

// ── Route Handler ─────────────────────────────────────────────

export async function GET() {
  const startedAt = performance.now();
  const result: HealthCheckResult = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: pkg.version,
    checks: {
      database: { status: "ok", latencyMs: 0 },
      graphql: { status: "ok", queryCount: 0 },
      memory: {
        status: "ok",
        heapUsedMb: 0,
        heapTotalMb: 0,
        rssMb: 0,
      },
    },
  };

  // ── 1. Database health check ──────────────────────────────
  try {
    const dbStart = performance.now();
    await db.$queryRawUnsafe<[{ count: number }]>(
      "SELECT COUNT(*)::int AS count FROM orders"
    );
    result.checks.database.latencyMs = Math.round(
      performance.now() - dbStart
    );
    result.checks.database.status = "ok";
  } catch (err) {
    result.checks.database.status = "error";
    result.checks.database.message =
      err instanceof Error ? err.message : "Unknown database error";
    result.status = "degraded";
  }

  // ── 2. GraphQL schema health check ────────────────────────
  try {
    // Count defined queries in the schema SDL
    const queryMatches = typeDefs.match(/type Query\s*\{([^}]+)\}/);
    if (queryMatches) {
      const queryLines = queryMatches[1]
        .split("\n")
        .filter((l) => l.trim() && !l.trim().startsWith('"'));
      result.checks.graphql.queryCount = queryLines.length;
    }
    result.checks.graphql.status = "ok";
  } catch (err) {
    result.checks.graphql.status = "error";
    result.checks.graphql.message =
      err instanceof Error ? err.message : "Schema parse error";
    result.status = "degraded";
  }

  // ── 3. Memory / system info ───────────────────────────────
  const mem = process.memoryUsage();
  result.checks.memory.heapUsedMb = parseFloat(
    (mem.heapUsed / 1024 / 1024).toFixed(1)
  );
  result.checks.memory.heapTotalMb = parseFloat(
    (mem.heapTotal / 1024 / 1024).toFixed(1)
  );
  result.checks.memory.rssMb = parseFloat(
    (mem.rss / 1024 / 1024).toFixed(1)
  );
  result.checks.memory.status =
    result.checks.memory.heapUsedMb > 300 ? "warn" : "ok";

  // ── Response ──────────────────────────────────────────────
  const totalLatency = Math.round(performance.now() - startedAt);
  const httpStatus =
    result.status === "healthy" ? 200 : result.status === "degraded" ? 207 : 503;

  return NextResponse.json(result, {
    status: httpStatus,
    headers: {
      "x-response-time": `${totalLatency}ms`,
      "cache-control": "no-store, max-age=0",
    },
  });
}
