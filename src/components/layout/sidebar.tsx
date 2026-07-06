"use client";

import { useSidebarStore } from "@/stores/sidebar-store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
  BarChart3,
  Bell,
  LogOut,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";

const navigationItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Products", href: "/products", icon: Package },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Reports", href: "/reports", icon: TrendingUp },
  { label: "AI Chat", href: "/chat", icon: Sparkles },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

const bottomItems = [
  { label: "Sign Out", href: "/logout", icon: LogOut },
];

export function Sidebar() {
  const { collapsed, mobileOpen, toggleCollapsed, setMobileOpen } =
    useSidebarStore();
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait until after client-side hydration to render theme-dependent UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  // Close mobile drawer on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setMobileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen, setMobileOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const sidebarWidth = collapsed ? "w-[72px]" : "w-64";
  const transitionClass = "transition-all duration-300 ease-in-out";

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Mobile hamburger */}
      <button
        type="button"
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-lg backdrop-blur-md ring-1 ring-zinc-200 lg:hidden dark:bg-zinc-900/80 dark:ring-zinc-800"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
        {mobileOpen ? (
          <X className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
        ) : (
          <Menu className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        data-lenis-prevent
        className={cn(
          "fixed top-0 left-0 z-40 flex h-full flex-col",
          "bg-white/80 backdrop-blur-xl border-r border-zinc-200/60",
          "dark:bg-zinc-950/80 dark:border-zinc-800/60",
          transitionClass,
          sidebarWidth,
          // Mobile: overlay drawer
          "lg:translate-x-0",
          mobileOpen
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo area */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-zinc-200/60 dark:border-zinc-800/60",
            collapsed ? "justify-center px-0" : "justify-between px-5"
          )}
        >
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <span className="text-xs font-bold text-white">ED</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  EcomDash
                </span>
                <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                  Enterprise
                </span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <span className="text-xs font-bold text-white">ED</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      collapsed && "justify-center px-0",
                      isActive
                        ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200/50 dark:from-indigo-950/50 dark:to-purple-950/50 dark:text-indigo-300 dark:ring-indigo-800/50"
                        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300"
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {!collapsed && isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-zinc-200/60 p-2 dark:border-zinc-800/60">
          <ul className="space-y-1">
            {/* Theme toggle — only rendered after hydration to avoid SSR mismatch */}
            <li>
              <button
                onClick={() =>
                  setTheme(
                    resolvedTheme === "dark" ? "light" : "dark"
                  )
                }
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  collapsed && "justify-center px-0",
                  "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
                )}
                title={mounted ? `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode` : undefined}
              >
                {mounted && resolvedTheme === "dark" ? (
                  <Sun className="h-5 w-5 shrink-0 text-amber-500 transition-colors group-hover:text-amber-600" />
                ) : (
                  <Moon className="h-5 w-5 shrink-0 text-indigo-500 transition-colors group-hover:text-indigo-600" />
                )}
                {!collapsed && (
                  <span className="truncate">
                    {mounted && resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
                  </span>
                )}
              </button>
            </li>
            {bottomItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      collapsed && "justify-center px-0",
                      "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0 text-zinc-400 group-hover:text-red-500 dark:text-zinc-500 dark:group-hover:text-red-400" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          type="button"
          onClick={toggleCollapsed}
          className={cn(
            "hidden lg:flex absolute -right-3 top-20 h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-400 shadow-sm transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </aside>
    </>
  );
}
