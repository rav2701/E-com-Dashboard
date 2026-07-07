"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import gsap from "gsap";
import {
  X,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  CreditCard,
  Package,
} from "lucide-react";

// ───────────────────────────────────────────────────────────────
//  CartDrawer Component
// ───────────────────────────────────────────────────────────────

export function CartDrawer() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCartStore();

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  // ── GSAP Entrance / Exit ──────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      if (tlRef.current) {
        tlRef.current.reverse();
      }
      return;
    }

    tlRef.current?.kill();
    const tl = gsap.timeline();

    tl.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: "power2.out" }
    );

    tl.fromTo(
      drawerRef.current,
      { x: "100%" },
      { x: "0%", duration: 0.35, ease: "power3.out" },
      "-=0.15"
    );

    if (drawerRef.current) {
      const items = drawerRef.current.querySelectorAll("[data-animate]");
      if (items.length > 0) {
        tl.fromTo(
          items,
          { x: 24, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.25, stagger: 0.04, ease: "power2.out" },
          "-=0.15"
        );
      }
    }

    tlRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [isOpen]);

  // ── Keyboard ───────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) closeCart();
      }}
      className="fixed inset-0 z-50"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "absolute top-0 right-0 h-full w-full max-w-md",
          "bg-white dark:bg-zinc-900",
          "shadow-2xl flex flex-col"
        )}
      >
        {/* ── Header ──────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200/60 dark:border-zinc-700/50">
          <div className="flex items-center gap-3" data-animate>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Shopping Cart
              </h2>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            data-animate
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Items ────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 custom-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
                <ShoppingCart className="h-7 w-7 text-zinc-400" />
              </div>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Your cart is empty
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                Add some products to get started
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.sku}
                data-animate
                className={cn(
                  "group relative flex gap-3 p-3 rounded-xl",
                  "bg-zinc-50/80 dark:bg-zinc-800/50",
                  "ring-1 ring-zinc-200/40 dark:ring-zinc-700/40",
                  "transition-all duration-200"
                )}
              >
                {/* Image */}
                <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-1">
                      {item.name}
                    </p>
                    <button
                      onClick={() => removeItem(item.sku)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-zinc-400 hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {item.category}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 rounded-lg bg-white dark:bg-zinc-700 ring-1 ring-zinc-200/60 dark:ring-zinc-600/60">
                      <button
                        onClick={() =>
                          updateQuantity(item.sku, item.quantity - 1)
                        }
                        className="flex h-7 w-7 items-center justify-center text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="min-w-[20px] text-center text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.sku, item.quantity + 1)
                        }
                        className="flex h-7 w-7 items-center justify-center text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Footer ────────────────────────────────────── */}
        {items.length > 0 && (
          <div className="border-t border-zinc-200/60 dark:border-zinc-700/50 px-5 py-4 space-y-3">
            {/* Subtotals */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span>Subtotal</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span>Shipping</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {shipping === 0 ? (
                    <span className="text-emerald-500 font-semibold">FREE</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              {subtotal < 100 && (
                <p className="text-[9px] text-amber-500 flex items-center gap-1">
                  <Package className="h-2.5 w-2.5" />
                  Add ${(100 - subtotal).toFixed(2)} more for free shipping
                </p>
              )}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-700/50">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Total
              </span>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                ${total.toFixed(2)}
              </span>
            </div>

            {/* Checkout button */}
            <button
              onClick={() => {
                console.log("Checkout:", { items, subtotal, shipping, total });
                alert(
                  `Checkout submitted!\n\nItems: ${totalItems}\nTotal: $${total.toFixed(2)}`
                );
              }}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-xl",
                "bg-indigo-600 text-white text-sm font-semibold",
                "hover:bg-indigo-700 active:bg-indigo-800",
                "transition-colors duration-200 shadow-sm"
              )}
            >
              <CreditCard className="h-4 w-4" />
              Checkout &mdash; ${total.toFixed(2)}
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Clear cart */}
            <button
              onClick={clearCart}
              className="w-full text-center text-[10px] text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
