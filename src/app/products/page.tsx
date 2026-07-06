"use client";

import { cn } from "@/lib/utils";
import { BentoGrid } from "@/components/ui/bento-grid";
import { BentoCard } from "@/components/ui/bento-card";
import {
  Package,
  Clock,
  Plus,
  Search,
  Filter,
  Star,
  DollarSign,
} from "lucide-react";

const mockProducts = [
  { name: "Wireless Headphones Pro", sku: "WH-PRO-001", price: "$129.99", stock: 245, rating: 4.7 },
  { name: "Smart Watch Series X", sku: "SW-X-042", price: "$349.00", stock: 89, rating: 4.5 },
  { name: "Mechanical Keyboard RGB", sku: "KB-RGB-018", price: "$189.95", stock: 156, rating: 4.8 },
  { name: "4K Monitor 27\" Ultrasharp", sku: "MN-4K-027", price: "$599.00", stock: 34, rating: 4.6 },
  { name: "Bluetooth Speaker Mini", sku: "SP-BT-009", price: "$89.99", stock: 412, rating: 4.3 },
  { name: "USB-C Hub 7-in-1", sku: "USB-HUB-007", price: "$45.99", stock: 678, rating: 4.1 },
];

export default function ProductsPage() {
  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-4 pb-6 md:px-6 md:pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Products
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Manage your product catalog and inventory
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-xs text-zinc-500 shadow-sm ring-1 ring-zinc-200/50 dark:bg-zinc-900/70 dark:ring-zinc-800/50">
              <Clock className="h-3.5 w-3.5" />
              <span>{mockProducts.length} active products</span>
            </div>
            <button className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add Product</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-2 rounded-xl bg-white/70 dark:bg-zinc-900/70 px-3 py-2 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 flex-1 max-w-xs">
            <Search className="h-4 w-4 text-zinc-400" />
            <input type="text" placeholder="Search products..." className="bg-transparent border-none outline-none text-xs text-zinc-600 dark:text-zinc-400 w-full placeholder:text-zinc-400" />
          </div>
          <button className="flex items-center gap-1.5 rounded-xl bg-white/70 dark:bg-zinc-900/70 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <Filter className="h-3.5 w-3.5" />
            Category
          </button>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockProducts.map((product) => (
            <div
              key={product.sku}
              className={cn(
                "rounded-2xl p-5",
                "bg-white/70 dark:bg-zinc-900/70",
                "ring-1 ring-zinc-200/50 dark:ring-zinc-800/50",
                "backdrop-blur-xl shadow-sm",
                "hover:shadow-md transition-shadow duration-300",
                "cursor-pointer"
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 ring-1 ring-indigo-200/30 dark:ring-indigo-800/30">
                  <Package className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{product.name}</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{product.sku}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{product.price}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-400 dark:text-zinc-500">{product.stock} in stock</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="font-medium text-zinc-600 dark:text-zinc-400">{product.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
