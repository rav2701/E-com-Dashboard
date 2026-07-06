"use client";

import { cn } from "@/lib/utils";
import { BentoGrid } from "@/components/ui/bento-grid";
import { BentoCard } from "@/components/ui/bento-card";
import {
  ShoppingCart,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  Download,
} from "lucide-react";

const mockOrders = [
  { id: "#ORD-4821", customer: "Alice Chen", product: "Wireless Headphones", amount: "$129.99", status: "Shipped", date: "2026-07-04" },
  { id: "#ORD-4820", customer: "Marcus Johnson", product: "Smart Watch Pro", amount: "$349.00", status: "Processing", date: "2026-07-04" },
  { id: "#ORD-4819", customer: "Sofia Rodriguez", product: "Laptop Stand", amount: "$79.99", status: "Delivered", date: "2026-07-03" },
  { id: "#ORD-4818", customer: "James Wilson", product: "Mechanical Keyboard", amount: "$189.95", status: "Shipped", date: "2026-07-03" },
  { id: "#ORD-4817", customer: "Emily Davis", product: "USB-C Hub 7-in-1", amount: "$45.99", status: "Cancelled", date: "2026-07-02" },
  { id: "#ORD-4816", customer: "David Kim", product: "4K Monitor 27\"", amount: "$599.00", status: "Processing", date: "2026-07-02" },
  { id: "#ORD-4815", customer: "Lisa Chen", product: "Bluetooth Speaker", amount: "$89.99", status: "Delivered", date: "2026-07-01" },
  { id: "#ORD-4814", customer: "Tom Brown", product: "Webcam HD Pro", amount: "$159.99", status: "Shipped", date: "2026-07-01" },
];

const statusColors: Record<string, string> = {
  Shipped: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  Processing: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  Delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
};

export default function OrdersPage() {
  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-4 pb-6 md:px-6 md:pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Orders
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Manage and track all customer orders
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-xs text-zinc-500 shadow-sm ring-1 ring-zinc-200/50 dark:bg-zinc-900/70 dark:ring-zinc-800/50">
            <Clock className="h-3.5 w-3.5" />
            <span>{mockOrders.length} orders this week</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-2 rounded-xl bg-white/70 dark:bg-zinc-900/70 px-3 py-2 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 flex-1 max-w-xs">
            <Search className="h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search orders..."
              className="bg-transparent border-none outline-none text-xs text-zinc-600 dark:text-zinc-400 w-full placeholder:text-zinc-400"
            />
          </div>
          <button className="flex items-center gap-1.5 rounded-xl bg-white/70 dark:bg-zinc-900/70 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </button>
          <button className="flex items-center gap-1.5 rounded-xl bg-white/70 dark:bg-zinc-900/70 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <ArrowUpDown className="h-3.5 w-3.5" />
            Sort
          </button>
          <button className="flex items-center gap-1.5 rounded-xl bg-white/70 dark:bg-zinc-900/70 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>

        {/* Orders table */}
        <div className="rounded-2xl bg-white/70 dark:bg-zinc-900/70 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 backdrop-blur-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="pb-3 px-5 pt-4 font-semibold text-zinc-400 dark:text-zinc-500">Order</th>
                <th className="pb-3 px-3 pt-4 font-semibold text-zinc-400 dark:text-zinc-500">Customer</th>
                <th className="pb-3 px-3 pt-4 font-semibold text-zinc-400 dark:text-zinc-500">Product</th>
                <th className="pb-3 px-3 pt-4 font-semibold text-zinc-400 dark:text-zinc-500">Amount</th>
                <th className="pb-3 px-3 pt-4 font-semibold text-zinc-400 dark:text-zinc-500">Date</th>
                <th className="pb-3 px-3 pt-4 font-semibold text-zinc-400 dark:text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-zinc-100/50 transition-colors hover:bg-zinc-50/50 dark:border-zinc-800/50 dark:hover:bg-zinc-800/30 cursor-pointer"
                >
                  <td className="py-3 px-5 font-medium text-zinc-800 dark:text-zinc-200">{order.id}</td>
                  <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400">{order.customer}</td>
                  <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400">{order.product}</td>
                  <td className="py-3 px-3 font-medium text-zinc-800 dark:text-zinc-200">{order.amount}</td>
                  <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400">{order.date}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[order.status]}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
