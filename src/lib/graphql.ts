/**
 * Lightweight GraphQL client for the dashboard analytics API.
 *
 * This module provides a single `graphql` export that posts operations
 * to the Next.js App Router endpoint at `/api/graphql`. All response
 * types are inferred via the generic `Data` parameter.
 *
 * @example
 * ```ts
 * const { data } = await graphql<{ getDashboardKPIs: DashboardKPIs }>(`
 *   query { getDashboardKPIs { grossVolume totalOrders } }
 * `);
 * ```
 */

export interface GraphQLResponse<Data> {
  data: Data;
  errors?: Array<{ message: string; locations?: unknown[]; path?: (string | number)[] }>;
}

/**
 * Execute a GraphQL query or mutation against the local API endpoint.
 *
 * Automatically includes `Content-Type: application/json` and the
 * stored JWT token in the Authorization header if present.
 * Throws an error when the HTTP status is not OK or
 * when the GraphQL response contains errors.
 */
export async function graphql<Data>(
  query: string,
  variables?: Record<string, unknown>
): Promise<GraphQLResponse<Data>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  // Attach auth token if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("ecomdash_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch("/api/graphql", {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
  }

  const json: GraphQLResponse<Data> = await response.json();

  if (json.errors && json.errors.length > 0) {
    const messages = json.errors.map((e) => e.message).join("; ");
    throw new Error(`GraphQL errors: ${messages}`);
  }

  return json;
}
