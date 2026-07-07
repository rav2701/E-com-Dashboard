"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { graphql } from "@/lib/graphql";
import {
  Shield,
  Users,
  Activity,
  Settings,
  Database,
  Loader2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

// ───────────────────────────────────────────────────────────────
//  GraphQL query
// ───────────────────────────────────────────────────────────────

const ME_QUERY = `
  query Me {
    me {
      id
      email
      firstName
      lastName
      role
      avatarUrl
    }
  }
`;

// ───────────────────────────────────────────────────────────────
//  Page
// ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("ecomdash_token");
    if (!token) {
      router.push("/login");
      return;
    }

    graphql<{ me: { id: string; email: string; firstName: string; lastName: string; role: string; avatarUrl: string | null } }>(ME_QUERY)
      .then((res) => {
        const userData = res.data.me;
        if (!userData || userData.role !== "ADMIN") {
          setAuthorized(false);
          setLoading(false);
          return;
        }
        setUser(userData);
        setAuthorized(true);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("ecomdash_token");
        router.push("/login");
      });
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 ring-1 ring-red-200/50 dark:bg-red-950/30 dark:ring-red-800/30">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Access Denied
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            You do not have administrator privileges. Please log in with an admin account.
          </p>
          <button
            onClick={() => router.push("/login")}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all",
              "bg-gradient-to-r from-indigo-600 to-purple-600 text-white",
              "hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-indigo-500/25"
            )}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Admin Panel
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Welcome back, {user?.firstName} — you have full system access
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-amber-50/80 px-3 py-1.5 ring-1 ring-amber-200/50 dark:bg-amber-950/30 dark:ring-amber-800/30">
          <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
            Admin
          </span>
        </div>
      </div>

      {/* Back to Dashboard */}
      <button
        onClick={() => router.push("/")}
        className={cn(
          "group inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
          "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
          "dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
        )}
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Dashboard
      </button>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminCard
          icon={Users}
          label="User Management"
          description="Manage registered users and their roles"
          href="/admin/users"
          color="indigo"
        />
        <AdminCard
          icon={Activity}
          label="System Health"
          description="Monitor application performance and errors"
          href="/admin/system"
          color="emerald"
        />
        <AdminCard
          icon={Database}
          label="Database"
          description="View database stats and run maintenance"
          href="/admin/database"
          color="violet"
        />
        <AdminCard
          icon={Settings}
          label="Configuration"
          description="Manage app-wide settings and preferences"
          href="/admin/settings"
          color="amber"
        />
      </div>

      {/* Quick Info */}
      <div className="rounded-2xl bg-white/70 p-6 shadow-sm ring-1 ring-zinc-200/50 backdrop-blur-xl dark:bg-zinc-900/70 dark:ring-zinc-800/50">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Admin Account
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-xl bg-zinc-50/80 px-4 py-2.5 dark:bg-zinc-800/50">
            <span className="text-zinc-500 dark:text-zinc-400">Email</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-zinc-50/80 px-4 py-2.5 dark:bg-zinc-800/50">
            <span className="text-zinc-500 dark:text-zinc-400">Name</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {user?.firstName} {user?.lastName}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-zinc-50/80 px-4 py-2.5 dark:bg-zinc-800/50">
            <span className="text-zinc-500 dark:text-zinc-400">Role</span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
              <Shield className="h-3 w-3" />
              ADMIN
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
//  AdminCard Component
// ───────────────────────────────────────────────────────────────

function AdminCard({
  icon: Icon,
  label,
  description,
  href,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  href: string;
  color: "indigo" | "emerald" | "violet" | "amber";
}) {
  const router = useRouter();

  const colorStyles = {
    indigo: "from-indigo-500 to-indigo-600 shadow-indigo-500/25 hover:shadow-indigo-500/40",
    emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/25 hover:shadow-emerald-500/40",
    violet: "from-violet-500 to-violet-600 shadow-violet-500/25 hover:shadow-violet-500/40",
    amber: "from-amber-500 to-amber-600 shadow-amber-500/25 hover:shadow-amber-500/40",
  };

  return (
    <button
      onClick={() => router.push(href)}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-white/70 p-5 text-left shadow-sm ring-1 ring-zinc-200/50 backdrop-blur-xl transition-all duration-200 hover:shadow-lg dark:bg-zinc-900/70 dark:ring-zinc-800/50",
        "hover:-translate-y-0.5"
      )}
    >
      <div className={cn(
        "mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-all duration-200 group-hover:shadow-lg",
        colorStyles[color]
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {label}
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
    </button>
  );
}
