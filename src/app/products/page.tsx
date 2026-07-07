"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { LightboxProduct } from "@/components/products/product-lightbox";
import { ProductLightbox } from "@/components/products/product-lightbox";
import { useCartStore } from "@/stores/cart-store";
import { useFakeStoreProducts, type FakeStoreCard } from "@/hooks/use-fakestore-products";
import {
  Search,
  Filter,
  Star,
  ShoppingCart,
  Eye,
  Heart,
  ChevronDown,
  SlidersHorizontal,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

// ───────────────────────────────────────────────────────────────
//  ProductCard type (extends LightboxProduct with extra fields)
// ───────────────────────────────────────────────────────────────

interface ProductCard extends LightboxProduct {
  description: string;
  category: string;
  id: string;
}

// ───────────────────────────────────────────────────────────────
//  StarRating Component
// ───────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }, (_, i) => {
          if (i < fullStars) {
            return <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />;
          }
          if (i === fullStars && hasHalf) {
            return (
              <span key={i} className="relative">
                <Star className="h-3 w-3 text-zinc-300 dark:text-zinc-600" />
                <span className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                </span>
              </span>
            );
          }
          return <Star key={i} className="h-3 w-3 text-zinc-300 dark:text-zinc-600" />;
        })}
      </div>
      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 ml-0.5">
        ({rating.toFixed(1)})
      </span>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
//  Page Component
// ───────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const store = useFakeStoreProducts();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"name" | "price-low" | "price-high" | "rating">("name");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // ── Map to ProductCard ──────────────────────────────────────
  const allProducts: ProductCard[] = useMemo(() => {
    return store.products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: p.price,
      stock: p.stock,
      rating: p.rating,
      category: p.category,
      imageUrl: p.imageUrl,
      description: p.description,
    }));
  }, [store.products]);

  // ── All unique categories ───────────────────────────────────
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const p of allProducts) {
      cats.add(p.category);
    }
    return ["All", ...Array.from(cats).sort()];
  }, [allProducts]);

  // ── Filtered + sorted products ──────────────────────────────
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    switch (sortBy) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price-low":
        result.sort(
          (a, b) =>
            parseFloat(a.price.replace("$", "")) -
            parseFloat(b.price.replace("$", ""))
        );
        break;
      case "price-high":
        result.sort(
          (a, b) =>
            parseFloat(b.price.replace("$", "")) -
            parseFloat(a.price.replace("$", ""))
        );
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [allProducts, searchQuery, selectedCategory, sortBy]);

  // ── Handlers ────────────────────────────────────────────────
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const toggleWishlist = (e: React.MouseEvent, sku: string) => {
    e.stopPropagation();
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(sku)) next.delete(sku);
      else next.add(sku);
      return next;
    });
  };

  const { addItem: addToCart } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent, product: ProductCard) => {
    e.stopPropagation();
    const price = parseFloat(product.price.replace("$", ""));
    addToCart({
      sku: product.sku,
      name: product.name,
      price,
      priceLabel: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
    });
  };

  const sortOptions = [
    { value: "name" as const, label: "Name A-Z" },
    { value: "price-low" as const, label: "Price: Low to High" },
    { value: "price-high" as const, label: "Price: High to Low" },
    { value: "rating" as const, label: "Highest Rated" },
  ];

  const sortLabel = sortOptions.find((o) => o.value === sortBy)?.label ?? "Sort by";

  // ── Loading State ───────────────────────────────────────────
  if (store.status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
          <Loader2 className="h-7 w-7 text-indigo-500 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Loading products...
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
          Fetching from FakeStore API
        </p>
      </div>
    );
  }

  // ── Error State ─────────────────────────────────────────────
  if (store.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30 mb-4">
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Failed to load products
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
          {store.error?.message}
        </p>
        <button
          onClick={() => store.refetch()}
          className="mt-4 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="animate-fade-in">
        <div className="px-4 pt-4 pb-6 md:px-6 md:pt-6">
          {/* ── Header ────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Products
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Browse {allProducts.length} products from the FakeStore API
              </p>
            </div>
          </div>

          {/* ── Toolbar ───────────────────────────────────── */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <div className="flex items-center gap-2 rounded-xl bg-white/70 dark:bg-zinc-900/70 px-3 py-2 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 flex-1 max-w-xs">
              <Search className="h-4 w-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="bg-transparent border-none outline-none text-xs text-zinc-600 dark:text-zinc-400 w-full placeholder:text-zinc-400"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                className="flex items-center gap-1.5 rounded-xl bg-white/70 dark:bg-zinc-900/70 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Filter className="h-3.5 w-3.5" />
                {selectedCategory === "All" ? "Category" : selectedCategory}
                <ChevronDown className="h-3 w-3" />
              </button>
              {showCategoryDropdown && (
                <div className="absolute top-full right-0 mt-1 z-20 w-48 rounded-xl bg-white dark:bg-zinc-900 shadow-lg ring-1 ring-zinc-200/60 dark:ring-zinc-700/60 overflow-hidden">
                  {allCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowCategoryDropdown(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs transition-colors",
                        cat === selectedCategory
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      )}
                    >
                      {cat === "All" ? "All Categories" : cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                onBlur={() => setTimeout(() => setShowSortDropdown(false), 200)}
                className="flex items-center gap-1.5 rounded-xl bg-white/70 dark:bg-zinc-900/70 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {sortBy === "name" ? "Sort by" : sortLabel}
                <ChevronDown className="h-3 w-3" />
              </button>
              {showSortDropdown && (
                <div className="absolute top-full right-0 mt-1 z-20 w-44 rounded-xl bg-white dark:bg-zinc-900 shadow-lg ring-1 ring-zinc-200/60 dark:ring-zinc-700/60 overflow-hidden">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortBy(opt.value);
                        setShowSortDropdown(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs transition-colors",
                        sortBy === opt.value
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Product Grid ──────────────────────────────── */}
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
                <Search className="h-7 w-7 text-zinc-400" />
              </div>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                No products found
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                Try adjusting your search or filter
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-4 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => {
                const realIndex = allProducts.findIndex((p) => p.sku === product.sku);
                return (
                  <div
                    key={product.sku}
                    onClick={() => openLightbox(realIndex >= 0 ? realIndex : index)}
                    className={cn(
                      "group relative flex flex-col",
                      "rounded-xl overflow-hidden",
                      "bg-white dark:bg-zinc-900",
                      "shadow-sm hover:shadow-lg",
                      "ring-1 ring-zinc-200/60 dark:ring-zinc-800/60",
                      "transition-all duration-300 ease-out",
                      "cursor-pointer",
                      "hover:-translate-y-0.5"
                    )}
                  >
                    {/* ── Image ─────────────────────────────── */}
                    <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className={cn(
                          "h-full w-full object-contain p-4",
                          "transition-all duration-500 ease-out",
                          "group-hover:scale-105"
                        )}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {product.stock <= 50 && product.stock > 0 && (
                        <span className="absolute top-3 right-3 z-10 rounded-md bg-amber-500/90 px-2 py-1 text-[9px] font-semibold text-white shadow-sm backdrop-blur-sm">
                          Only {product.stock} left
                        </span>
                      )}

                      {product.stock === 0 && (
                        <span className="absolute top-3 right-3 z-10 rounded-md bg-red-500/90 px-2 py-1 text-[9px] font-semibold text-white shadow-sm backdrop-blur-sm">
                          Out of Stock
                        </span>
                      )}

                      <button
                        onClick={(e) => toggleWishlist(e, product.sku)}
                        className={cn(
                          "absolute top-3 left-3 z-10",
                          "flex h-8 w-8 items-center justify-center rounded-full",
                          "bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm shadow-sm",
                          "opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110",
                          product.stock > 0 ? "flex" : "hidden"
                        )}
                        aria-label="Add to wishlist"
                      >
                        <Heart
                          className={cn(
                            "h-4 w-4 transition-colors duration-200",
                            wishlist.has(product.sku)
                              ? "fill-rose-500 text-rose-500"
                              : "text-zinc-600 dark:text-zinc-300"
                          )}
                        />
                      </button>

                      <div
                        className={cn(
                          "absolute bottom-0 left-0 right-0 z-10",
                          "flex items-center justify-center gap-2 p-3",
                          "translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
                        )}
                      >
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5",
                            "bg-white/95 dark:bg-zinc-800/95 text-xs font-semibold text-zinc-800 dark:text-zinc-200",
                            "shadow-lg backdrop-blur-sm hover:bg-white dark:hover:bg-zinc-700",
                            "transition-all duration-200 hover:scale-[1.02] active:scale-95"
                          )}
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Add to Cart
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openLightbox(realIndex >= 0 ? realIndex : index);
                          }}
                          className={cn(
                            "flex items-center justify-center rounded-lg px-3 py-2.5",
                            "bg-white/95 dark:bg-zinc-800/95 text-xs font-medium text-zinc-600 dark:text-zinc-400",
                            "shadow-lg backdrop-blur-sm hover:bg-white dark:hover:bg-zinc-700",
                            "hover:text-zinc-800 dark:hover:text-zinc-200",
                            "transition-all duration-200 hover:scale-[1.02] active:scale-95"
                          )}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* ── Info ───────────────────────────────── */}
                    <div className="flex flex-col gap-1.5 p-4">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        {product.category}
                      </span>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                      </h3>
                      <StarRating rating={product.rating} />
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                          {product.price}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className={cn(
                          "mt-2 sm:hidden flex items-center justify-center gap-1.5 rounded-lg py-2.5 w-full",
                          "bg-indigo-600 text-white text-xs font-semibold",
                          "hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-200"
                        )}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <ProductLightbox
          products={allProducts}
          initialIndex={lightboxIndex}
          onClose={closeLightbox}
        />
      )}
    </>
  );
}
