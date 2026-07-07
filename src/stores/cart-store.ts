/**
 * @file Global shopping cart state managed by Zustand.
 * Tracks cart items, quantities, and the drawer open/close state.
 * Persisted only in memory (not localStorage).
 */

"use client";

import { create } from "zustand";

// ───────────────────────────────────────────────────────────────
//  Types
// ───────────────────────────────────────────────────────────────

/** A single item in the shopping cart. */
export interface CartItem {
  sku: string;
  name: string;
  price: number;       // numeric value for calculations
  priceLabel: string;  // formatted display string
  imageUrl: string;
  quantity: number;
  category: string;
}

/** Full cart state shape and action signatures. */
export interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

// ───────────────────────────────────────────────────────────────
//  Store
// ───────────────────────────────────────────────────────────────

/**
 * Zustand store for cart state.
 *
 * - `addItem` increments quantity if the item already exists, otherwise adds it
 *   with quantity 1.  Also auto-opens the cart drawer.
 * - `updateQuantity` removes the item if the new quantity is <= 0.
 * - `clearCart` empties all items (does not close the drawer).
 */
export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (item) => {
    set((state) => {
      const existing = state.items.find((i) => i.sku === item.sku);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.sku === item.sku
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
          isOpen: true,
        };
      }
      return {
        items: [...state.items, { ...item, quantity: 1 }],
        isOpen: true,
      };
    });
  },

  removeItem: (sku) => {
    set((state) => ({
      items: state.items.filter((i) => i.sku !== sku),
    }));
  },

  updateQuantity: (sku, quantity) => {
    if (quantity <= 0) {
      get().removeItem(sku);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.sku === sku ? { ...i, quantity } : i
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
}));
