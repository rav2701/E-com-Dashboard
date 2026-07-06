import { streamText, tool, toUIMessageStream, createUIMessageStreamResponse } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

// ───────────────────────────────────────────────────────────────
//  Mock upstream product data
// ───────────────────────────────────────────────────────────────

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  basePrice: number;
  stockLevel: number;
  totalRevenue: number;
  unitsSold: number;
  ratingAvg: number | null;
  trend: "up" | "down" | "stable";
}

interface ProductShowcaseResult {
  query: string;
  total: number;
  products: ProductItem[];
  summary: {
    totalRevenue: number;
    avgPrice: number;
    totalUnits: number;
  };
}

const ALL_PRODUCTS: ProductItem[] = [
  {
    id: "1",
    name: "Noise-Cancelling Headphones Pro",
    sku: "MID-0001",
    category: "Electronics",
    basePrice: 249.99,
    stockLevel: 42,
    totalRevenue: 24580.0,
    unitsSold: 98,
    ratingAvg: 4.7,
    trend: "up",
  },
  {
    id: "2",
    name: "Mechanical Keyboard RGB",
    sku: "MID-0003",
    category: "Accessories",
    basePrice: 159.99,
    stockLevel: 28,
    totalRevenue: 18790.0,
    unitsSold: 117,
    ratingAvg: 4.5,
    trend: "up",
  },
  {
    id: "3",
    name: "Smart Watch Pro Max",
    sku: "MID-0002",
    category: "Wearables",
    basePrice: 399.99,
    stockLevel: 15,
    totalRevenue: 35990.0,
    unitsSold: 90,
    ratingAvg: 4.8,
    trend: "up",
  },
  {
    id: "4",
    name: "Wireless Charging Station",
    sku: "MID-0004",
    category: "Accessories",
    basePrice: 79.99,
    stockLevel: 65,
    totalRevenue: 9590.0,
    unitsSold: 120,
    ratingAvg: 4.2,
    trend: "stable",
  },
  {
    id: "5",
    name: "Studio Reference Headphones",
    sku: "PRM-0001",
    category: "Electronics",
    basePrice: 499.99,
    stockLevel: 8,
    totalRevenue: 12499.0,
    unitsSold: 25,
    ratingAvg: 4.9,
    trend: "up",
  },
  {
    id: "6",
    name: "Basic Wireless Earbuds",
    sku: "BGT-0001",
    category: "Electronics",
    basePrice: 29.99,
    stockLevel: 120,
    totalRevenue: 5990.0,
    unitsSold: 200,
    ratingAvg: 3.8,
    trend: "down",
  },
  {
    id: "7",
    name: "Leather Crossbody Bag",
    sku: "MID-0007",
    category: "Fashion",
    basePrice: 129.99,
    stockLevel: 22,
    totalRevenue: 8450.0,
    unitsSold: 65,
    ratingAvg: 4.4,
    trend: "stable",
  },
  {
    id: "8",
    name: "Premium Camping Tent",
    sku: "PRM-0013",
    category: "Outdoors",
    basePrice: 899.99,
    stockLevel: 5,
    totalRevenue: 7199.0,
    unitsSold: 8,
    ratingAvg: 4.6,
    trend: "stable",
  },
];

async function simulateProductFetch(
  query: string,
  filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  }
): Promise<ProductShowcaseResult> {
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

  let filtered = [...ALL_PRODUCTS];

  if (filters?.category) {
    const cat = filters.category.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.category.toLowerCase().includes(cat) ||
        p.name.toLowerCase().includes(cat)
    );
  }
  if (filters?.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.basePrice >= filters.minPrice!);
  }
  if (filters?.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.basePrice <= filters.maxPrice!);
  }
  if (query && query !== "all" && query !== "products") {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }

  switch (filters?.sortBy) {
    case "price_asc":
      filtered.sort((a, b) => a.basePrice - b.basePrice);
      break;
    case "price_desc":
      filtered.sort((a, b) => b.basePrice - a.basePrice);
      break;
    case "rating":
      filtered.sort((a, b) => (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0));
      break;
    case "popularity":
      filtered.sort((a, b) => b.unitsSold - a.unitsSold);
      break;
    default:
      filtered.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  const summary = {
    totalRevenue: filtered.reduce((s, p) => s + p.totalRevenue, 0),
    avgPrice:
      filtered.length > 0
        ? filtered.reduce((s, p) => s + p.basePrice, 0) / filtered.length
        : 0,
    totalUnits: filtered.reduce((s, p) => s + p.unitsSold, 0),
  };

  return {
    query: query || "all products",
    total: filtered.length,
    products: filtered.slice(0, 6),
    summary,
  };
}

// ───────────────────────────────────────────────────────────────
//  Fallback SSE stream generator (offline / mock mode)
// ───────────────────────────────────────────────────────────────

async function generateFallbackResponse(
  messages: { role: string; content: string }[]
): Promise<Response> {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const rawQuery = lastUserMsg?.content ?? "";

  const result = await simulateProductFetch(rawQuery);

  const toolCallId = "offline-tool-1";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 1. Offline-mode signal — client shows a visual badge
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "offline-mode" })}\n\n`
          )
        );

        // Brief pause before skeleton appears
        await new Promise((r) => setTimeout(r, 200));

        // 2. Tool input start — triggers ProductShowcaseSkeleton
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "tool-input-start",
              toolCallId,
              toolName: "fetchProductShowcase",
            })}\n\n`
          )
        );

        await new Promise((r) => setTimeout(r, 600));

        // 3. Tool output — triggers ProductShowcase with real data
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "tool-output-available",
              toolCallId,
              output: result,
            })}\n\n`
          )
        );

        controller.close();
      } catch {
        try {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                errorText: "Failed to generate offline response.",
              })}\n\n`
            )
          );
        } catch {
          // ignore double-close
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// ───────────────────────────────────────────────────────────────
//  Route Handler
// ───────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const { messages } = await req.json();

  // ── Key not configured → immediate offline fallback ─────────
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.warn("GOOGLE_GENERATIVE_AI_API_KEY missing — returning offline mock data");
    return generateFallbackResponse(messages);
  }

  // ── Try the Google Gemini-powered stream ────────────────────
  // Note: streamText is lazy — the actual API call happens when the
  // client reads the response body. Runtime errors (quota, network)
  // surface as SSE error events handled by toUIMessageStream's onError.
  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages,
    tools: {
      fetchProductShowcase: tool({
        description: `Search and showcase products from the inventory catalog. Use this when users ask about inventory items, product pricing, category comparisons, or any product-related queries.`,
        inputSchema: z.object({
          query: z
            .string()
            .describe(
              "The user's search query \u2014 extract key product terms or use 'all' for a broad overview"
            ),
          category: z
            .string()
            .optional()
            .describe(
              "Category filter: Electronics, Accessories, Wearables, Fashion, Outdoors"
            ),
          minPrice: z.number().optional().describe("Minimum price filter"),
          maxPrice: z.number().optional().describe("Maximum price filter"),
          sortBy: z
            .enum(["revenue", "price_asc", "price_desc", "rating", "popularity"])
            .optional()
            .describe("Sort order for results"),
        }),
        execute: async (input) => {
          return simulateProductFetch(input.query || "all", {
            category: input.category,
            minPrice: input.minPrice,
            maxPrice: input.maxPrice,
            sortBy: input.sortBy,
          });
        },
      }),
    },
  });

  const uiMsgStream = toUIMessageStream({
    stream: result.stream,
    originalMessages: messages,
    onError: (error) => {
      console.error("Chat stream error:", error);
      const msg = String(error);
      if (
        msg.includes("quota") ||
        msg.includes("billing") ||
        msg.includes("429") ||
        msg.includes("RATE_LIMIT")
      ) {
        return "The AI service is currently rate-limited. This usually resolves within a minute — please try again.";
      }
      if (msg.includes("API_KEY_INVALID") || msg.includes("API key not valid")) {
        return "Your Google AI API key is invalid. Please check your GOOGLE_GENERATIVE_AI_API_KEY in the .env file.";
      }
      return "An error occurred while processing your request. Please check the server logs for details.";
    },
  });

  return createUIMessageStreamResponse({ stream: uiMsgStream });
}
