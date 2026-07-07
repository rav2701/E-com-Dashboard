"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  DollarSign,
  Package,
} from "lucide-react";

// ───────────────────────────────────────────────────────────────
//  Types
// ───────────────────────────────────────────────────────────────

export interface LightboxProduct {
  name: string;
  sku: string;
  price: string;
  stock: number;
  rating: number;
  imageUrl: string;
}

interface ProductLightboxProps {
  products: LightboxProduct[];
  initialIndex: number;
  onClose: () => void;
}

// ───────────────────────────────────────────────────────────────
//  ProductLightbox Component
// ───────────────────────────────────────────────────────────────

export function ProductLightbox({
  products,
  initialIndex,
  onClose,
}: ProductLightboxProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(initialIndex);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const isAnimating = useRef(false);

  const product = products[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < products.length - 1;

  // ── GSAP Entrance Animation ────────────────────────────
  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    );

    tl.fromTo(
      panelRef.current,
      { scale: 0.92, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
      "-=0.15"
    );

    return () => {
      tl.kill();
    };
  }, []);

  // ── Slide Transition ───────────────────────────────────
  const slideTo = useCallback(
    (index: number) => {
      if (isAnimating.current) return;
      if (index < 0 || index >= products.length) return;
      isAnimating.current = true;
      currentIndexRef.current = index;

      const direction = index > currentIndex ? 1 : -1;

      // Exit current image
      gsap.to(imageRef.current, {
        x: -direction * 60,
        opacity: 0,
        scale: 0.96,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          setCurrentIndex(index);

          // Wait for React to render the new image, then animate in
          requestAnimationFrame(() => {
            gsap.set(imageRef.current, {
              x: direction * 60,
              opacity: 0,
              scale: 0.96,
            });
            gsap.to(imageRef.current, {
              x: 0,
              opacity: 1,
              scale: 1,
              duration: 0.35,
              ease: "power3.out",
              onComplete: () => {
                isAnimating.current = false;
              },
            });
          });
        },
      });

      // Animate details
      gsap.to(detailsRef.current, {
        opacity: 0,
        y: 12,
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(detailsRef.current, { opacity: 0, y: 12 });
          gsap.to(detailsRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: "power3.out",
            delay: 0.05,
          });
        },
      });
    },
    [currentIndex, products.length]
  );

  const goNext = useCallback(() => {
    if (hasNext) slideTo(currentIndex + 1);
  }, [hasNext, currentIndex, slideTo]);

  const goPrev = useCallback(() => {
    if (hasPrev) slideTo(currentIndex - 1);
  }, [hasPrev, currentIndex, slideTo]);

  // ── Keyboard Navigation ────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          e.preventDefault();
          goPrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          goNext();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scrolling while lightbox is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, goNext, goPrev]);

  // ── Click outside to close ─────────────────────────────
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-black/60 backdrop-blur-lg"
      )}
    >
      {/* ── Main Panel ──────────────────────────────────── */}
      <div
        ref={panelRef}
        className={cn(
          "relative flex flex-col md:flex-row",
          "w-[95vw] max-w-4xl max-h-[90vh]",
          "rounded-2xl overflow-hidden",
          "bg-white dark:bg-zinc-900",
          "shadow-2xl ring-1 ring-white/10"
        )}
      >
        {/* ── Close Button ──────────────────────────────── */}
        <button
          onClick={onClose}
          className={cn(
            "absolute top-3 right-3 z-20",
            "flex h-8 w-8 items-center justify-center rounded-full",
            "bg-white/80 dark:bg-zinc-800/80",
            "text-zinc-600 dark:text-zinc-300",
            "hover:bg-white dark:hover:bg-zinc-700",
            "transition-all duration-200",
            "shadow-md backdrop-blur-sm"
          )}
          aria-label="Close lightbox"
        >
          <X className="h-4 w-4" />
        </button>

        {/* ── Image Section ─────────────────────────────── */}
        <div className="relative flex-1 min-h-[40vh] md:min-h-[60vh] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <div
            ref={imageRef}
            className="w-full h-full flex items-center justify-center p-4"
          >
            <img
              key={product.imageUrl}
              src={product.imageUrl}
              alt={product.name}
              className={cn(
                "max-w-full max-h-[55vh] md:max-h-[70vh]",
                "rounded-xl object-contain",
                "shadow-lg"
              )}
              draggable={false}
            />
          </div>

          {/* ── Navigation Arrows (on image) ────────────── */}
          {hasPrev && (
            <button
              onClick={goPrev}
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 z-10",
                "flex h-10 w-10 items-center justify-center rounded-full",
                "bg-white/80 dark:bg-zinc-800/80",
                "text-zinc-700 dark:text-zinc-300",
                "hover:bg-white dark:hover:bg-zinc-700",
                "transition-all duration-200",
                "shadow-lg backdrop-blur-sm",
                "hover:scale-110 active:scale-95"
              )}
              aria-label="Previous product"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {hasNext && (
            <button
              onClick={goNext}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 z-10",
                "flex h-10 w-10 items-center justify-center rounded-full",
                "bg-white/80 dark:bg-zinc-800/80",
                "text-zinc-700 dark:text-zinc-300",
                "hover:bg-white dark:hover:bg-zinc-700",
                "transition-all duration-200",
                "shadow-lg backdrop-blur-sm",
                "hover:scale-110"
              )}
              aria-label="Next product"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {/* ── Position indicator dots ─────────────────── */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => slideTo(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === currentIndex
                    ? "w-6 bg-white shadow-md"
                    : "w-1.5 bg-white/50 hover:bg-white/80"
                )}
                aria-label={`Go to product ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ── Details Section ───────────────────────────── */}
        <div
          ref={detailsRef}
          className={cn(
            "w-full md:w-80 shrink-0 p-6",
            "flex flex-col justify-between",
            "bg-zinc-50/80 dark:bg-zinc-800/80",
            "border-t md:border-t-0 md:border-l border-zinc-200/60 dark:border-zinc-700/50"
          )}
        >
          <div className="space-y-5">
            {/* Product header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                <Package className="h-3 w-3" />
                <span>{product.sku}</span>
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                {product.name}
              </h2>
            </div>

            {/* Price & rating */}
            <div className="flex items-center justify-between py-3 border-y border-zinc-200/60 dark:border-zinc-700/50">
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {product.price}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {product.rating}
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  / 5.0
                </span>
              </div>
            </div>

            {/* Stock info */}
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Stock Status
              </p>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    product.stock > 100
                      ? "bg-emerald-500"
                      : product.stock > 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                  )}
                />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {product.stock} units available
                </span>
              </div>
              {/* Mini stock bar */}
              <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    product.stock > 100
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                      : product.stock > 50
                        ? "bg-gradient-to-r from-amber-500 to-amber-400"
                        : "bg-gradient-to-r from-red-500 to-red-400"
                  )}
                  style={{
                    width: `${Math.min((product.stock / 700) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Footer with counter */}
          <div className="mt-6 pt-4 border-t border-zinc-200/60 dark:border-zinc-700/50">
            <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
              <span>
                {currentIndex + 1} of {products.length}
              </span>
              <span className="text-[10px]">
                Use ← → to navigate
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
