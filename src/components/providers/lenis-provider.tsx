"use client";

import Lenis from "lenis";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

interface LenisContextValue {
  lenis: Lenis | null;
  scrollTo: (target: Parameters<Lenis["scrollTo"]>[0], options?: Parameters<Lenis["scrollTo"]>[1]) => void;
  stop: () => void;
  start: () => void;
}

interface LenisUserOptions {
  duration?: number;
  easing?: (t: number) => number;
  orientation?: "vertical" | "horizontal";
  gestureOrientation?: "vertical" | "horizontal";
  smoothWheel?: boolean;
  wheelMultiplier?: number;
  touchMultiplier?: number;
  infinite?: boolean;
  prevent?: (node: Element) => boolean;
}

const LenisContext = createContext<LenisContextValue | null>(null);

interface LenisProviderProps {
  children: React.ReactNode;
  /** Lenis configuration options (autoRaf is forced to true) */
  options?: Omit<Partial<LenisUserOptions>, "autoRaf">;
}

export function LenisProvider({
  children,
  options = {},
}: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();

  // Initialize Lenis once
  useEffect(() => {
    const lenis = new Lenis({
      ...options,
      autoRaf: true,
      // Prevent Lenis from capturing wheel events on elements with data-lenis-prevent
      prevent: (node: Element) => {
        return node.closest("[data-lenis-prevent]") !== null;
      },
    });

    lenisRef.current = lenis;
    setReady(true);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset scroll position on route change (App Router navigation)
  useEffect(() => {
    if (!lenisRef.current || !ready) return;

    // Stop any ongoing inertia from previous page
    lenisRef.current.stop();

    // Immediately scroll to top with no animation
    lenisRef.current.scrollTo(0, { immediate: true });

    // Resume after a microtask to ensure the DOM has updated
    const rafId = requestAnimationFrame(() => {
      lenisRef.current?.start();
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [pathname, ready]);

  const scrollTo = useCallback<
    LenisContextValue["scrollTo"]
  >((target, opts) => {
    lenisRef.current?.scrollTo(target, opts);
  }, []);

  const stop = useCallback(() => {
    lenisRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    lenisRef.current?.start();
  }, []);

  return (
    <LenisContext.Provider value={{ lenis: lenisRef.current, scrollTo, stop, start }}>
      {children}
    </LenisContext.Provider>
  );
}

/**
 * Hook to access the Lenis instance and control methods.
 * Returns `null` if used outside of LenisProvider.
 */
export function useLenis(): LenisContextValue | null {
  return useContext(LenisContext);
}
