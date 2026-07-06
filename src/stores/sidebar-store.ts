"use client";

import { create } from "zustand";

interface SidebarState {
  /** Whether the sidebar is collapsed (icon-only mode) */
  collapsed: boolean;
  /** Whether the mobile sidebar drawer is open */
  mobileOpen: boolean;
  /** Toggle the desktop collapsed state */
  toggleCollapsed: () => void;
  /** Set collapsed state explicitly */
  setCollapsed: (collapsed: boolean) => void;
  /** Open/close the mobile drawer */
  setMobileOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: false,
  mobileOpen: false,
  toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
  setCollapsed: (collapsed) => set({ collapsed }),
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
}));
