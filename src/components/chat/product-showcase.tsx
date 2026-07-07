"use client";

import { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import {
  Package,
  DollarSign,
  ShoppingCart,
  Zap,
  TrendingUp,
  ChevronRight,
  Star,
  Sparkles,
  BarChart3,
} from "lucide-react";

// ───────────────────────────────────────────────────────────────
//  Types
// ───────────────────────────────────────────────────────────────

export interface ProductItem {
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
  /** New visual fields for bento-card display */
  imageUrl?: string;
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
  conversionPercentage?: number;
}

export interface ProductShowcaseData {
  query: string;
  total: number;
  products: ProductItem[];
  summary: {
    totalRevenue: number;
    avgPrice: number;
    totalUnits: number;
  };
}

// ───────────────────────────────────────────────────────────────
//  Helpers
// ───────────────────────────────────────────────────────────────

const stockStatusConfig = {
  in_stock: {
    label: "In Stock",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/20",
  },
  low_stock: {
    label: "Low Stock",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    dot: "bg-amber-500",
    ring: "ring-amber-500/20",
  },
  out_of_stock: {
    label: "Out of Stock",
    color: "text-red-500",
    bg: "bg-red-500/10",
    dot: "bg-red-500",
    ring: "ring-red-500/20",
  },
} as const;

const categoryGradients: Record<string, string> = {
  Electronics: "from-violet-500/20 to-fuchsia-500/10",
  Accessories: "from-sky-500/20 to-cyan-500/10",
  Wearables: "from-rose-500/20 to-pink-500/10",
  Fashion: "from-amber-500/20 to-orange-500/10",
  Outdoors: "from-emerald-500/20 to-teal-500/10",
};

const categoryIcons: Record<string, string> = {
  Electronics: "🔌",
  Accessories: "🎧",
  Wearables: "⌚",
  Fashion: "👝",
  Outdoors: "⛺",
};

/**
 * Curated mapping of product keywords to specific Unsplash photo URLs.
 * Each URL is a real product photo that visually matches the product type.
 */
const PRODUCT_IMAGE_MAP: Record<string, string> = {
  // Audio
  headphones: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
  earbuds: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
  speaker: "https://images.unsplash.com/photo-1608248543803-ba4f8c70a0b7?w=400&h=400&fit=crop",

  // Wearables
  watch: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop",
  smartwatch: "https://images.unsplash.com/photo-1546868871-af0de0ae72c9?w=400&h=400&fit=crop",
  wearable: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop",
  fitness: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
  tracker: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",

  // Computer / Tech
  keyboard: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&h=400&fit=crop",
  monitor: "https://images.unsplash.com/photo-1527443154391-507e9b6c0032?w=400&h=400&fit=crop",
  mouse: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&h=400&fit=crop",
  "usb-c": "https://images.unsplash.com/photo-1591522810844-48695034177b?w=400&h=400&fit=crop",
  "usb hub": "https://images.unsplash.com/photo-1591522810844-48695034177b?w=400&h=400&fit=crop",
  charger: "https://images.unsplash.com/photo-1616036740257-9429b6344515?w=400&h=400&fit=crop",
  "laptop stand": "https://images.unsplash.com/photo-1527814050087-3793f7574b66?w=400&h=400&fit=crop",
  "standing desk": "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400&h=400&fit=crop",
  "smart plug": "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400&h=400&fit=crop",
  desk: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400&h=400&fit=crop",
  "laptop": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",

  // Bags & Accessories
  bag: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=400&h=400&fit=crop",
  backpack: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
  wallet: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop",
  sunglasses: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
  scarf: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=400&fit=crop",
  "crossbody": "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=400&h=400&fit=crop",

  // Home & Kitchen
  coffee: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
  "french press": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
  espresso: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
  kitchen: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
  "cutting board": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
  "dutch oven": "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=400&h=400&fit=crop",
  "wine opener": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=400&fit=crop",
  candle: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&h=400&fit=crop",
  "throw blanket": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
  blanket: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
  pillowcase: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
  "fire pit": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop",
  decor: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",

  // Outdoors & Sports
  tent: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=400&fit=crop",
  camping: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=400&fit=crop",
  "water bottle": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
  "beach towel": "https://images.unsplash.com/photo-1564419320411-3b26c75ad8a8?w=400&h=400&fit=crop",
  towel: "https://images.unsplash.com/photo-1564419320411-3b26c75ad8a8?w=400&h=400&fit=crop",
  "yoga mat": "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=400&fit=crop",
  yoga: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=400&fit=crop",
  dumbbell: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe58?w=400&h=400&fit=crop",
  "resistance band": "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=400&fit=crop",
  "rowing machine": "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&h=400&fit=crop",
  "bike mount": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=400&fit=crop",

  // Fashion
  "leather": "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=400&h=400&fit=crop",
  briefcase: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=400&h=400&fit=crop",
  "tote bag": "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=400&h=400&fit=crop",
  tote: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=400&h=400&fit=crop",

  // Defaults by category
  electronics: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
  accessories: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
  fashion: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=400&h=400&fit=crop",
  outdoors: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=400&fit=crop",
};

/**
 * Matches a product name against the keyword map to find a relevant
 * Unsplash product photo. Falls back to a generic electronics image.
 */
function getProductImageUrl(product: ProductItem): string {
  const name = product.name.toLowerCase();
  const category = (product.category || "").toLowerCase();

  // Try exact keyword matches from the name
  for (const [keyword, url] of Object.entries(PRODUCT_IMAGE_MAP)) {
    if (name.includes(keyword) || category.includes(keyword)) {
      return url;
    }
  }

  // Fallback by category
  if (PRODUCT_IMAGE_MAP[category]) {
    return PRODUCT_IMAGE_MAP[category];
  }

  // Ultimate fallback
  return PRODUCT_IMAGE_MAP.electronics;
}

function enrichProduct(p: ProductItem): ProductItem {
  return {
    ...p,
    imageUrl: p.imageUrl || getProductImageUrl(p),
    stockStatus: p.stockStatus ?? (p.stockLevel > 20 ? "in_stock" : p.stockLevel > 5 ? "low_stock" : "out_of_stock"),
    conversionPercentage: p.conversionPercentage ?? Math.round((p.unitsSold / Math.max(p.unitsSold + p.stockLevel, 1)) * 50 + 12 + Math.random() * 20),
  };
}

// ───────────────────────────────────────────────────────────────
//  Loading Skeleton
// ───────────────────────────────────────────────────────────────

export function ProductShowcaseSkeleton() {
  return (
    <div className="my-4 overflow-hidden rounded-3xl border border-zinc-200/60 bg-white/50 backdrop-blur-xl dark:border-zinc-700/50 dark:bg-zinc-900/50">
      {/* Top pulse bar */}
      <div className="h-2 w-full animate-pulse bg-gradient-to-r from-indigo-200/50 via-purple-200/50 to-indigo-200/50 dark:from-indigo-800/30 dark:via-purple-800/30 dark:to-indigo-800/30" />

      <div className="p-5">
        {/* Header skeleton */}
        <div className="mb-5 flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-700" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-2.5 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>

        {/* Bento grid skeleton */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Hero skeleton (spans 2 cols on md+) */}
          <div className="md:col-span-2">
            <div className="h-52 animate-pulse rounded-2xl bg-zinc-100/80 p-5 dark:bg-zinc-800/50">
              <div className="flex gap-4">
                <div className="h-28 w-28 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-700" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                  <div className="h-2.5 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                </div>
              </div>
            </div>
          </div>
          {/* Side skeletons */}
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-zinc-100/80 p-4 dark:bg-zinc-800/50">
                <div className="flex gap-3">
                  <div className="h-16 w-16 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                    <div className="h-2.5 w-2/3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
//  Sub-components
// ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ProductItem["stockStatus"] }) {
  const cfg = stockStatusConfig[status ?? "in_stock"];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
        "ring-1 backdrop-blur-sm transition-all duration-300",
        cfg.bg,
        cfg.color,
        cfg.ring
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function ConversionBar({ pct }: { pct: number }) {
  const clamped = Math.min(Math.max(pct, 0), 100);
  const color =
    clamped >= 60
      ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
      : clamped >= 35
        ? "bg-gradient-to-r from-amber-500 to-amber-400"
        : "bg-gradient-to-r from-rose-500 to-rose-400";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-medium text-zinc-500 dark:text-zinc-400">Conversion</span>
        <span className="font-bold text-zinc-700 dark:text-zinc-300">{clamped}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/60 dark:bg-zinc-700/50">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", color)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl px-3 py-2",
        "bg-white/60 backdrop-blur-sm ring-1 ring-zinc-200/40",
        "dark:bg-zinc-800/40 dark:ring-zinc-700/40"
      )}
    >
      <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", accent)}>
        <Icon className="h-3.5 w-3.5 text-white" />
      </div>
      <div>
        <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
      </div>
    </div>
  );
}

function MiniProductCard({
  product,
  cardRef,
}: {
  product: ProductItem;
  cardRef: (el: HTMLDivElement | null) => void;
}) {
  const enriched = product; // already enriched by parent
  const gradient = categoryGradients[enriched.category] ?? "from-zinc-500/20 to-zinc-400/10";

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-4",
        "bg-white/70 backdrop-blur-xl ring-1 ring-zinc-200/50",
        "dark:bg-zinc-900/70 dark:ring-zinc-800/50",
        "transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
        "cursor-default"
      )}
    >
      {/* Gradient overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-40 transition-opacity duration-500 group-hover:opacity-60",
          gradient
        )}
      />

      {/* Content (relative to sit above gradient) */}
      <div className="relative z-10 flex items-start gap-3">
        {/* Thumbnail */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-zinc-200/50 dark:ring-zinc-700/50">
          <img
            src={enriched.imageUrl!}
            alt={enriched.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {/* Category emoji badge */}
          <div className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-tl-lg bg-white/80 text-[10px] backdrop-blur-sm dark:bg-zinc-900/80">
            {categoryIcons[enriched.category] ?? "📦"}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-2">
              {enriched.name}
            </p>
            <StatusBadge status={enriched.stockStatus} />
          </div>

          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              ${enriched.basePrice.toFixed(0)}
            </span>
            {enriched.ratingAvg && (
              <span className="flex items-center gap-0.5 text-[10px] text-amber-500">
                <Star className="h-2.5 w-2.5 fill-current" />
                {enriched.ratingAvg.toFixed(1)}
              </span>
            )}
          </div>

          <div className="mt-2">
            <ConversionBar pct={enriched.conversionPercentage!} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
//  Product Showcase Component
// ───────────────────────────────────────────────────────────────

interface ProductShowcaseProps {
  data: ProductShowcaseData;
}

export function ProductShowcase({ data }: ProductShowcaseProps) {
  const { query, total, products, summary } = data;
  const top3 = products.slice(0, 3).map((p) => enrichProduct(p));
  const hero = top3[0];
  const sideProducts = top3.slice(1);

  // GSAP refs
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const sideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const statRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const hasAnimated = useRef(false);

  const setSideRef = useCallback((el: HTMLDivElement | null, idx: number) => {
    sideRefs.current[idx] = el;
  }, []);

  const setStatRef = useCallback((el: HTMLDivElement | null, idx: number) => {
    statRefs.current[idx] = el;
  }, []);

  // ─── GSAP Entrance Animation ───
  useEffect(() => {
    if (!containerRef.current || hasAnimated.current) return;
    hasAnimated.current = true;

    timelineRef.current?.kill();

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
    });

    // Staggered entrance (transform only — content is always visible)
    tl.fromTo(
      headerRef.current,
      { y: -12 },
      { y: 0, duration: 0.45 }
    );

    if (heroRef.current) {
      tl.fromTo(
        heroRef.current,
        { y: 24, scale: 0.97 },
        { y: 0, scale: 1, duration: 0.55 },
        "-=0.15"
      );
    }

    sideRefs.current.forEach((ref) => {
      if (ref) {
        tl.fromTo(
          ref,
          { x: 16 },
          { x: 0, duration: 0.45 },
          "-=0.25"
        );
      }
    });

    tl.fromTo(
      statRefs.current.filter(Boolean),
      { y: 12 },
      { y: 0, duration: 0.35, stagger: 0.06 },
      "-=0.15"
    );

    timelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, []);

  if (!hero) {
    return (
      <div className="my-3 rounded-2xl border border-zinc-200/60 bg-white/50 p-5 text-center text-sm text-zinc-500 backdrop-blur-xl dark:border-zinc-700/50 dark:bg-zinc-900/50 dark:text-zinc-400">
        No products found for &ldquo;{query}&rdquo;
      </div>
    );
  }

  const statItems = [
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: `$${summary.totalRevenue.toLocaleString()}`,
      accent: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    },
    {
      icon: TrendingUp,
      label: "Avg. Price",
      value: `$${summary.avgPrice.toFixed(0)}`,
      accent: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    },
    {
      icon: ShoppingCart,
      label: "Units Sold",
      value: summary.totalUnits.toLocaleString(),
      accent: "bg-gradient-to-br from-amber-500 to-amber-600",
    },
  ];

  return (
    <div
      ref={containerRef}
      className="my-4 overflow-hidden rounded-3xl border border-zinc-200/60 bg-white/50 shadow-sm backdrop-blur-xl dark:border-zinc-700/50 dark:bg-zinc-900/50"
    >
      {/* Decorative top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="p-4 md:p-5">
        {/* ─── Header ─── */}
        <div ref={headerRef} className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Product Showcase
              </h3>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                Top {Math.min(total, 3)}
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
              {total} result{total !== 1 ? "s" : ""} for &ldquo;{query}&rdquo; &middot; AI-curated
            </p>
          </div>
          {/* Small decorative sparkle */}
          <div className="hidden sm:flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <BarChart3 className="h-3 w-3 text-zinc-400" />
          </div>
        </div>

        {/* ─── Bento Grid ─── */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* ── Hero Card (spans 2 cols) ── */}
          <div
            ref={heroRef}
            className={cn(
              "relative overflow-hidden rounded-2xl md:col-span-2",
              "bg-gradient-to-br from-zinc-50/90 to-white/90",
              "dark:from-zinc-900/90 dark:to-zinc-800/90",
              "ring-1 ring-zinc-200/50 dark:ring-zinc-700/50",
              "shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.005]"
            )}
          >
            {/* Decorative gradient blob */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-400/10 to-purple-400/10 blur-3xl dark:from-indigo-500/10 dark:to-purple-500/10" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-gradient-to-br from-amber-400/10 to-rose-400/10 blur-2xl dark:from-amber-500/10 dark:to-rose-500/10" />

            <div className="relative z-10 p-4 md:p-5">
              {/* Hero top row: image + info */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {/* Product image */}
                <div className="relative mx-auto w-28 shrink-0 sm:mx-0">
                  <div className="relative overflow-hidden rounded-2xl ring-1 ring-zinc-200/60 dark:ring-zinc-700/60">
                    <img
                      src={hero.imageUrl!}
                      alt={hero.name}
                      className="h-28 w-28 object-cover transition-transform duration-700 hover:scale-110"
                      loading="lazy"
                    />
                    {/* Category overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-2 pt-6">
                      <span className="text-[9px] font-medium text-white/90">
                        {hero.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hero info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                        {hero.name}
                      </h4>
                      <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                        SKU: {hero.sku}
                      </p>
                    </div>
                    <StatusBadge status={hero.stockStatus} />
                  </div>

                  {/* Price + rating row */}
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        ${hero.basePrice.toFixed(0)}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">USD</span>
                    </div>
                    {hero.ratingAvg && (
                      <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 dark:bg-amber-950/30">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                          {hero.ratingAvg.toFixed(1)}
                        </span>
                        <span className="text-[9px] text-amber-500/70 dark:text-amber-400/70">
                          /5.0
                        </span>
                      </div>
                    )}
                    {hero.trend && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-semibold",
                          hero.trend === "up" &&
                            "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
                          hero.trend === "down" &&
                            "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
                          hero.trend === "stable" &&
                            "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        )}
                      >
                        {hero.trend === "up" && <TrendingUp className="h-2.5 w-2.5" />}
                        {hero.trend === "down" && "↓"}
                        {hero.trend === "stable" && "→"}
                        {hero.trend === "up" && " Trending"}
                      </span>
                    )}
                  </div>

                  {/* Conversion bar */}
                  <div className="mt-3">
                    <ConversionBar pct={hero.conversionPercentage!} />
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {statItems.map((stat, i) => (
                  <div key={stat.label} ref={(el) => setStatRef(el, i)}>
                    <StatChip {...stat} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Side products (stacked vertically) ── */}
          <div className="flex flex-col gap-3">
            {sideProducts.length > 0 ? (
              sideProducts.map((product, i) => (
                <MiniProductCard
                  key={product.id}
                  product={product}
                  cardRef={(el) => setSideRef(el, i)}
                />
              ))
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-zinc-200/60 p-6 text-center dark:border-zinc-700/50">
                <div className="space-y-2">
                  <Package className="mx-auto h-6 w-6 text-zinc-300 dark:text-zinc-600" />
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    Only {total} product{total !== 1 ? "s" : ""} matched
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Footer — additional product count ─── */}
        {total > 3 && (
          <div className="mt-3 flex items-center justify-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500">
            <Zap className="h-3 w-3 text-indigo-400" />
            <span>
              {total - 3} more product{total - 3 !== 1 ? "s" : ""} available &mdash; refine your
              query
            </span>
            <ChevronRight className="h-3 w-3 text-indigo-400" />
          </div>
        )}
      </div>
    </div>
  );
}
