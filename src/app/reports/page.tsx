"use client";

import { cn } from "@/lib/utils";
import { BentoGrid } from "@/components/ui/bento-grid";
import { BentoCard } from "@/components/ui/bento-card";
import {
  TrendingUp,
  Clock,
  FileText,
  Download,
  BarChart3,
  PieChart,
  Table2,
} from "lucide-react";

const reports = [
  {
    title: "Monthly Sales Summary",
    description: "Comprehensive overview of all sales activities, revenue, and order metrics for the selected month.",
    icon: BarChart3,
    date: "Generated Jul 5, 2026",
    color: "from-indigo-500 to-purple-600",
  },
  {
    title: "Inventory Status Report",
    description: "Current stock levels, low-stock alerts, and inventory turnover rates across all product categories.",
    icon: Table2,
    date: "Generated Jul 4, 2026",
    color: "from-emerald-500 to-teal-600",
  },
  {
    title: "Customer Analytics",
    description: "Customer acquisition costs, lifetime value analysis, segment performance, and retention rates.",
    icon: PieChart,
    date: "Generated Jul 3, 2026",
    color: "from-amber-500 to-orange-600",
  },
  {
    title: "P&L Statement",
    description: "Profit and loss breakdown including revenue, COGS, shipping costs, taxes, and net profit margins.",
    icon: FileText,
    date: "Generated Jul 2, 2026",
    color: "from-sky-500 to-blue-600",
  },
  {
    title: "Tax Summary Report",
    description: "Collected taxes by jurisdiction, filing-ready summaries, and historical tax liability comparisons.",
    icon: FileText,
    date: "Generated Jul 1, 2026",
    color: "from-rose-500 to-pink-600",
  },
  {
    title: "Shipping & Logistics",
    description: "Carrier performance, delivery times, shipping costs by region, and fulfillment efficiency metrics.",
    icon: TrendingUp,
    date: "Generated Jun 30, 2026",
    color: "from-violet-500 to-purple-600",
  },
];

export default function ReportsPage() {
  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-4 pb-6 md:px-6 md:pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Reports
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Generate and download business intelligence reports
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-xs text-zinc-500 shadow-sm ring-1 ring-zinc-200/50 dark:bg-zinc-900/70 dark:ring-zinc-800/50">
            <Clock className="h-3.5 w-3.5" />
            <span>6 reports available</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.title}
                className={cn(
                  "rounded-2xl p-5",
                  "bg-white/70 dark:bg-zinc-900/70",
                  "ring-1 ring-zinc-200/50 dark:ring-zinc-800/50",
                  "backdrop-blur-xl shadow-sm",
                  "hover:shadow-md transition-all duration-300",
                  "group"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl",
                    "bg-gradient-to-br ring-1 ring-white/20",
                    report.color,
                  )}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700">
                    <Download className="h-3 w-3" />
                    PDF
                  </button>
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{report.title}</h3>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3">{report.description}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">
                  <Clock className="h-3 w-3" />
                  {report.date}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
