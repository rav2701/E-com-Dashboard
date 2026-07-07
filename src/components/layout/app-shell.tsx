"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { MainContent } from "./main-content";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { CartTrigger } from "@/components/cart/cart-trigger";
import { CartDrawer } from "@/components/cart/cart-drawer";

const authRoutes = ["/login", "/register", "/forgot-password"];

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAuth = authRoutes.includes(pathname);

  if (isAuth) {
    return <>{children}</>;
  }

  return (
    <LenisProvider>
      <Sidebar />
      <MainContent>{children}</MainContent>
      <CartTrigger />
      <CartDrawer />
    </LenisProvider>
  );
}
