"use client";

import { cn } from "@/lib/utils";
import {
  Clock,
  Bell,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";

const notifications = [
  {
    icon: ShoppingCart,
    title: "New order received",
    description: "Order #ORD-4832 from Alice Chen — $129.99",
    time: "2 minutes ago",
    type: "success" as const,
    unread: true,
  },
  {
    icon: Package,
    title: "Low stock alert",
    description: "3 products are running low on stock (below threshold)",
    time: "15 minutes ago",
    type: "warning" as const,
    unread: true,
  },
  {
    icon: Users,
    title: "New customer registered",
    description: "Sarah Williams just created an account",
    time: "1 hour ago",
    type: "info" as const,
    unread: true,
  },
  {
    icon: TrendingUp,
    title: "Daily report ready",
    description: "Your sales summary for July 5, 2026 is available",
    time: "2 hours ago",
    type: "info" as const,
    unread: false,
  },
  {
    icon: CheckCircle2,
    title: "Order delivered",
    description: "Order #ORD-4819 has been marked as delivered",
    time: "3 hours ago",
    type: "success" as const,
    unread: false,
  },
  {
    icon: AlertCircle,
    title: "Payment failed",
    description: "Payment for order #ORD-4825 failed — retry initiated",
    time: "5 hours ago",
    type: "warning" as const,
    unread: false,
  },
  {
    icon: Info,
    title: "System update",
    description: "Scheduled maintenance on July 8, 2026 02:00-04:00 UTC",
    time: "1 day ago",
    type: "info" as const,
    unread: false,
  },
  {
    icon: Package,
    title: "Product review pending",
    description: "12 product reviews awaiting moderation",
    time: "2 days ago",
    type: "info" as const,
    unread: false,
  },
];

const typeStyles = {
  success: {
    bg: "bg-emerald-100 dark:bg-emerald-950/50",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    bg: "bg-amber-100 dark:bg-amber-950/50",
    icon: "text-amber-600 dark:text-amber-400",
  },
  info: {
    bg: "bg-blue-100 dark:bg-blue-950/50",
    icon: "text-blue-600 dark:text-blue-400",
  },
};

export default function NotificationsPage() {
  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-4 pb-6 md:px-6 md:pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Stay updated with your store activity
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-xs text-zinc-500 shadow-sm ring-1 ring-zinc-200/50 dark:bg-zinc-900/70 dark:ring-zinc-800/50">
            <Bell className="h-3.5 w-3.5" />
            <span>3 unread</span>
          </div>
        </div>

        {/* Notification feed */}
        <div className="space-y-2">
          {notifications.map((notif, i) => {
            const Icon = notif.icon;
            const style = typeStyles[notif.type];
            return (
              <div
                key={i}
                className={cn(
                  "rounded-2xl p-4",
                  "bg-white/70 dark:bg-zinc-900/70",
                  "ring-1 ring-zinc-200/50 dark:ring-zinc-800/50",
                  "backdrop-blur-xl shadow-sm",
                  "transition-all duration-200 hover:shadow-md",
                  notif.unread && "ring-2 ring-indigo-200 dark:ring-indigo-800"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    style.bg
                  )}>
                    <Icon className={cn("h-4 w-4", style.icon)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          {notif.title}
                          {notif.unread && (
                            <span className="h-2 w-2 rounded-full bg-indigo-500" />
                          )}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {notif.description}
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {notif.time}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
