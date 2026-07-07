"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import gsap from "gsap";
import { ShoppingBag } from "lucide-react";

export function CartTrigger() {
  const { items, openCart } = useCartStore();
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const prevCount = useRef(totalItems);

  // ── Bounce animation when count changes ──────────────
  useEffect(() => {
    if (totalItems > prevCount.current) {
      if (badgeRef.current) {
        gsap.fromTo(
          badgeRef.current,
          { scale: 1.5 },
          { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" }
        );
      }
      prevCount.current = totalItems;
    }
    prevCount.current = totalItems;
  }, [totalItems]);

  return (
    <button
      onClick={openCart}
      className={cn(
        "fixed bottom-6 right-6 z-30",
        "flex h-14 w-14 items-center justify-center rounded-full",
        "bg-gradient-to-br from-indigo-500 to-purple-600",
        "text-white shadow-lg",
        "hover:shadow-xl hover:scale-105",
        "active:scale-95",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2",
        "dark:focus:ring-offset-zinc-900"
      )}
      aria-label={`Shopping cart with ${totalItems} items`}
    >
      <ShoppingBag className="h-6 w-6" />

      {totalItems > 0 && (
        <span
          ref={badgeRef}
          className={cn(
            "absolute -top-1 -right-1",
            "flex h-5 min-w-[20px] items-center justify-center rounded-full",
            "bg-rose-500 text-white text-[10px] font-bold",
            "shadow-md px-1",

          )}
        >
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </button>
  );
}
