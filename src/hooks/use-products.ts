"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { graphql } from "@/lib/graphql";

// ───────────────────────────────────────────────────────────────
//  Types
// ───────────────────────────────────────────────────────────────

export interface ProductCatalogItem {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  stockLevel: number;
  ratingAvg: number | null;
  reviewCount: number;
  imageUrl: string | null;
  status: string;
  createdAt: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export interface ProductCatalogData {
  products: ProductCatalogItem[];
  categories: CategoryInfo[];
}

type LoadingState =
  | { status: "loading" }
  | { status: "settled"; data: ProductCatalogData }
  | { status: "error"; error: Error };

// ───────────────────────────────────────────────────────────────
//  GraphQL Queries
// ───────────────────────────────────────────────────────────────

const ALL_PRODUCTS_QUERY = `
  query GetAllProducts {
    getAllProducts {
      id
      sku
      name
      category
      basePrice
      compareAtPrice
      stockLevel
      ratingAvg
      reviewCount
      imageUrl
      status
      createdAt
    }
  }
`;

const ALL_CATEGORIES_QUERY = `
  query GetAllCategories {
    getAllCategories {
      id
      name
      slug
      productCount
    }
  }
`;

// ───────────────────────────────────────────────────────────────
//  Hook
// ───────────────────────────────────────────────────────────────

export function useProductsCatalog() {
  const [state, setState] = useState<LoadingState>({ status: "loading" });

  const fetchData = useCallback(async () => {
    setState({ status: "loading" });

    try {
      const [productsRes, categoriesRes] = await Promise.all([
        graphql<{ getAllProducts: ProductCatalogItem[] }>(ALL_PRODUCTS_QUERY),
        graphql<{ getAllCategories: CategoryInfo[] }>(ALL_CATEGORIES_QUERY),
      ]);

      const data: ProductCatalogData = {
        products: productsRes.data.getAllProducts,
        categories: categoriesRes.data.getAllCategories,
      };

      setState({ status: "settled", data });
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to fetch product catalog");
      setState({ status: "error", error });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
}
