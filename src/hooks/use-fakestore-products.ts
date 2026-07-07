"use client";

/**
 * @file Fetches and normalizes product data from the FakeStore and DummyJSON APIs.
 * Combines both sources into a unified {@link FakeStoreCard} format, with automatic
 * fallback to static data when either API is unreachable.
 */

import { useState, useEffect, useCallback } from "react";
import { FAKESTORE_PRODUCTS, type FakeStoreProduct } from "@/lib/fakestore-data";

/** A normalized product card from either the FakeStore or DummyJSON API. */
export interface FakeStoreCard {
  id: string;
  name: string;
  sku: string;
  price: string;
  stock: number;
  rating: number;
  category: string;
  imageUrl: string;
  description: string;
  createdAt: string;
}

type LoadingState =
  | { status: "loading" }
  | { status: "settled"; data: FakeStoreCard[] }
  | { status: "error"; error: Error };

const FAKESTORE_URL = "https://fakestoreapi.com/products";
const DUMMYJSON_URL = "https://dummyjson.com/products?limit=100&select=title,description,category,price,discountPercentage,rating,stock,thumbnail,sku,meta";

// ── Normalize FakeStore product ────────────────────────────────

function randomDate(start: Date, end: Date): string {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString();
}

const FS_DATE_RANGE = { start: new Date("2025-07-01"), end: new Date("2026-07-01") };

function mapFakeStore(p: FakeStoreProduct): FakeStoreCard {
  return {
    id: `fs-${p.id}`,
    name: p.title,
    sku: `FSK-${String(p.id).padStart(4, "0")}`,
    price: `$${p.price.toFixed(2)}`,
    stock: Math.min(p.rating.count, 500),
    rating: p.rating.rate,
    category: p.category,
    imageUrl: p.image,
    description: p.description,
    createdAt: randomDate(FS_DATE_RANGE.start, FS_DATE_RANGE.end),
  };
}

/**
 * Fetch a URL, validate the response shape, and map each item to a {@link FakeStoreCard}.
 * Handles the DummyJSON `{ products: [...] }` wrapper transparently.
 */
async function fetchAndValidate<T>(
  url: string,
  validate: (raw: unknown) => raw is T,
  map: (item: T) => FakeStoreCard
): Promise<FakeStoreCard[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API returned ${res.status}`);

  const data: unknown = await res.json();

  // DummyJSON wraps in { products: [...] }
  const items: unknown = url.includes("dummyjson")
    ? (data as Record<string, unknown>).products
    : data;

  if (!Array.isArray(items) || !items.every(validate)) {
    throw new Error("Invalid response format");
  }

  return items.map(map);
}

function validateFakeStore(raw: unknown): raw is FakeStoreProduct {
  if (!raw || typeof raw !== "object") return false;
  const p = raw as Record<string, unknown>;
  return (
    typeof p.id === "number" &&
    typeof p.title === "string" &&
    typeof p.price === "number" &&
    typeof p.description === "string" &&
    typeof p.image === "string" &&
    typeof p.category === "string" &&
    p.rating !== null &&
    typeof p.rating === "object" &&
    typeof (p.rating as Record<string, unknown>).rate === "number" &&
    typeof (p.rating as Record<string, unknown>).count === "number"
  );
}

// ── Normalize DummyJSON product ────────────────────────────────

interface DummyJSONMeta {
  createdAt: string;
}

interface DummyJSONRaw {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  thumbnail: string;
  sku: string;
  meta: DummyJSONMeta;
}

function mapDummyJSON(p: DummyJSONRaw): FakeStoreCard {
  const discounted = p.price * (1 - p.discountPercentage / 100);

  return {
    id: `dj-${p.id}`,
    name: p.title,
    sku: p.sku || `DJ-${String(p.id).padStart(5, "0")}`,
    price: `$${discounted.toFixed(2)}`,
    stock: p.stock,
    rating: p.rating,
    category: p.category,
    imageUrl: p.thumbnail,
    description: p.description,
    createdAt: p.meta?.createdAt || randomDate(FS_DATE_RANGE.start, FS_DATE_RANGE.end),
  };
}

function validateDummyJSON(raw: unknown): raw is DummyJSONRaw {
  if (!raw || typeof raw !== "object") return false;
  const p = raw as Record<string, unknown>;
  return (
    typeof p.id === "number" &&
    typeof p.title === "string" &&
    typeof p.description === "string" &&
    typeof p.category === "string" &&
    typeof p.price === "number" &&
    typeof p.rating === "number" &&
    typeof p.stock === "number" &&
    typeof p.thumbnail === "string"
  );
}

/**
 * Fetches product catalogs from the FakeStore and DummyJSON APIs in parallel.
 *
 * Uses `Promise.allSettled` so a single API failure doesn't block the other.
 * Falls back to the built-in {@link FAKESTORE_PRODUCTS} static data if both
 * APIs are unreachable.
 *
 * @returns An object with:
 *  - `products` — the array of normalized {@link FakeStoreCard} items
 *  - `status` — `"loading" | "settled" | "error"`
 *  - `error` — the Error object if status is "error"
 *  - `refetch` — a callback to re-run the fetch
 */
export function useFakeStoreProducts() {
  const [state, setState] = useState<LoadingState>({ status: "loading" });

  const fetchProducts = useCallback(async () => {
    setState({ status: "loading" });

    const allCards: FakeStoreCard[] = [];
    let anyFailed = false;

    try {
      // Fetch both APIs in parallel (independent — one failure doesn't kill the other)
      const results = await Promise.allSettled([
        fetchAndValidate(FAKESTORE_URL, validateFakeStore, mapFakeStore),
        fetchAndValidate(DUMMYJSON_URL, validateDummyJSON, mapDummyJSON),
      ]);

      for (const result of results) {
        if (result.status === "fulfilled") {
          allCards.push(...result.value);
        } else {
          anyFailed = true;
          console.warn("API failed:", result.reason);
        }
      }

      if (allCards.length === 0) {
        throw new Error("Both APIs failed to return valid data");
      }

      setState({ status: "settled", data: allCards });
    } catch (err) {
      if (anyFailed && allCards.length > 0) {
        // Some succeeded — show partial results with a warning
        console.warn("Some APIs failed, showing partial results");
        setState({ status: "settled", data: allCards });
      } else {
        // Fall back to static data if everything failed
        console.warn("All APIs failed, using static data:", err);
        try {
          const cards = FAKESTORE_PRODUCTS.map(mapFakeStore);
          setState({ status: "settled", data: cards });
        } catch (fallbackErr) {
          const error =
            fallbackErr instanceof Error
              ? fallbackErr
              : new Error("Failed to load products");
          setState({ status: "error", error });
        }
      }
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products: state.status === "settled" ? state.data : [],
    status: state.status,
    error: state.status === "error" ? state.error : null,
    refetch: fetchProducts,
  };
}
