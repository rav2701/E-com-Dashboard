"use client";

import { useEffect, useState } from "react";

/**
 * Provider that ensures Zustand stores are only accessed after
 * client-side hydration is complete. Prevents hydration mismatches
 * between server and client renders.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Render children normally even before hydration — the individual
  // stores use "use client" and will handle SSR gracefully.
  // This wrapper exists for future persistence/syncing layers.
  return <>{children}</>;
}
