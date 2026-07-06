"use client";

import { cn } from "@/lib/utils";
import { LogOut, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LogoutPage() {
  return (
    <div className="animate-fade-in flex items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-sm w-full">
        <div className="rounded-2xl bg-white/70 dark:bg-zinc-900/70 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 backdrop-blur-xl shadow-sm p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30 mx-auto mb-5 ring-1 ring-red-200/30 dark:ring-red-800/30">
            <LogOut className="h-7 w-7 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Sign Out
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            Are you sure you want to sign out of your account? You will need to sign in again to access the dashboard.
          </p>
          <div className="flex flex-col gap-3">
            <button
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium",
                "bg-red-600 text-white hover:bg-red-700",
                "transition-colors duration-200"
              )}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
            <Link
              href="/"
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium",
                "text-zinc-600 hover:text-zinc-900 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100",
                "transition-colors duration-200"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
