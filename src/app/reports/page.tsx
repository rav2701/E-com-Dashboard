"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useReportData, type DateRange } from "@/hooks/use-report-data";
import { SalesSummaryChart } from "@/components/reports/sales-summary-chart";
import { InventoryChart } from "@/components/reports/inventory-chart";
import { AnalyticsChart } from "@/components/reports/analytics-chart";
import { PnLChart } from "@/components/reports/pnl-chart";
import { TaxChart } from "@/components/reports/tax-chart";
import { LogisticsChart } from "@/components/reports/logistics-chart";
import { ExportButtons } from "@/components/reports/export-buttons";
import { DateRangePicker } from "@/components/reports/date-range-picker";
import {
  TrendingUp,
  Clock,
  FileText,
  BarChart3,
  PieChart,
  Table2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

type ReportId =
  | "sales"
  | "inventory"
  | "analytics"
  | "pnl"
  | "tax"
  | "logistics";

interface ReportConfig {
  id: ReportId;
  title: string;
  description: string;
  icon: typeof BarChart3;
  color: string;
}

const REPORTS: ReportConfig[] = [
  {
    id: "sales",
    title: "Monthly Sales Summary",
    description: "Product distribution across categories — see which categories have the most products and their price ranges.",
    icon: BarChart3,
    color: "from-indigo-500 to-purple-600",
  },
  {
    id: "inventory",
    title: "Inventory Status Report",
    description: "Stock health by category — in-stock, low-stock, and out-of-stock breakdown.",
    icon: Table2,
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "analytics",
    title: "Customer Analytics",
    description: "Category distribution and top-rated categories by average customer rating.",
    icon: PieChart,
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "pnl",
    title: "P&L Statement",
    description: "Estimated revenue vs discounted pricing across categories.",
    icon: FileText,
    color: "from-sky-500 to-blue-600",
  },
  {
    id: "tax",
    title: "Tax Summary Report",
    description: "Average rating trend across categories — identify top and bottom performers.",
    icon: FileText,
    color: "from-rose-500 to-pink-600",
  },
  {
    id: "logistics",
    title: "Shipping & Logistics",
    description: "Product availability density — which categories have the most products in the catalog.",
    icon: TrendingUp,
    color: "from-violet-500 to-purple-600",
  },
];

function DetailView({
  report,
  data,
  dateRange,
  onDateRangeChange,
  onBack,
}: {
  report: ReportConfig;
  data: ReturnType<typeof useReportData>;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onBack: () => void;
}) {
  const Icon = report.icon;

  const exportProps = (() => {
    switch (report.id) {
      case "sales":
        return {
          columns: [
            { header: "Category", key: "category" },
            { header: "Products", key: "products" },
          ],
          data: data.categoryDistribution.map((c) => ({
            category: c.name,
            products: c.value,
          })),
        };
      case "inventory":
      case "logistics":
        return {
          columns: [
            { header: "Category", key: "category" },
            { header: "In Stock", key: "inStock" },
            { header: "Low Stock", key: "lowStock" },
            { header: "Out of Stock", key: "outOfStock" },
            { header: "Total", key: "total" },
          ],
          data: data.stockLevels.map((s) => ({
            category: s.category,
            inStock: s.inStock,
            lowStock: s.lowStock,
            outOfStock: s.outOfStock,
            total: s.inStock + s.lowStock + s.outOfStock,
          })),
        };
      case "analytics":
        return {
          columns: [
            { header: "Category", key: "category" },
            { header: "Avg Rating", key: "avgRating" },
            { header: "Products", key: "productCount" },
          ],
          data: data.ratingMetrics.map((r) => ({
            category: r.category,
            avgRating: r.avgRating,
            productCount: r.productCount,
          })),
        };
      case "pnl":
        return {
          columns: [
            { header: "Category", key: "category" },
            { header: "Est. Revenue", key: "revenue" },
            { header: "Discounted", key: "discounted" },
            { header: "Savings", key: "savings" },
          ],
          data: data.pnlMetrics.map((p) => ({
            category: p.category,
            revenue: `$${p.revenue.toFixed(2)}`,
            discounted: `$${p.discounted.toFixed(2)}`,
            savings: `$${p.savings.toFixed(2)}`,
          })),
        };
      case "tax":
        return {
          columns: [
            { header: "Category", key: "category" },
            { header: "Avg Rating", key: "avgRating" },
            { header: "Products", key: "productCount" },
          ],
          data: data.ratingMetrics.map((r) => ({
            category: r.category,
            avgRating: r.avgRating,
            productCount: r.productCount,
          })),
        };
    }
  })();

  return (
    <div className="animate-fade-in">
      <div className="flex items-start gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 dark:bg-zinc-900/70 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 mt-0.5"
        >
          <ArrowLeft className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                  "bg-gradient-to-br ring-1 ring-white/20",
                  report.color
                )}
              >
                <Icon className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                {report.title}
              </h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <DateRangePicker range={dateRange} onChange={onDateRangeChange} />
              {exportProps && (
                <ExportButtons
                  title={report.title}
                  subtitle={report.description}
                  columns={exportProps.columns}
                  data={exportProps.data as Record<string, unknown>[]}
                />
              )}
            </div>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 ml-10">
            {report.description}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white/70 dark:bg-zinc-900/70 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 backdrop-blur-xl shadow-sm p-5">
        {report.id === "sales" && <SalesSummaryChart data={data.categoryDistribution} />}
        {report.id === "inventory" && <InventoryChart data={data.stockLevels} />}
        {report.id === "analytics" && (
          <AnalyticsChart distribution={data.categoryDistribution} ratings={data.ratingMetrics} />
        )}
        {report.id === "pnl" && <PnLChart data={data.pnlMetrics} />}
        {report.id === "tax" && <TaxChart data={data.ratingMetrics} />}
        {report.id === "logistics" && <LogisticsChart data={data.stockLevels} />}
      </div>

      <p className="mt-4 text-[10px] text-zinc-400 dark:text-zinc-500 text-center">
        Showing {data.filteredCount} of {data.products.length} products
      </p>
    </div>
  );
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportId | null>(null);

  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(new Date().getFullYear() - 1, 0, 1),
    end: new Date(),
  });

  const data = useReportData(dateRange);

  if (data.status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
          <Loader2 className="h-7 w-7 text-indigo-500 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Loading report data...
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
          Fetching product catalog
        </p>
      </div>
    );
  }

  if (data.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30 mb-4">
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Failed to load report data
        </p>
        <button
          onClick={() => data.refetch()}
          className="mt-4 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  // Show detail view for selected report
  if (selectedReport) {
    const report = REPORTS.find((r) => r.id === selectedReport)!;
    return (
      <div className="px-4 pt-4 pb-6 md:px-6 md:pt-6">
        <DetailView
          report={report}
          data={data}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onBack={() => setSelectedReport(null)}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-4 pb-6 md:px-6 md:pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Reports
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Interactive business intelligence
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DateRangePicker range={dateRange} onChange={setDateRange} />
            <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-xs text-zinc-500 shadow-sm ring-1 ring-zinc-200/50 dark:bg-zinc-900/70 dark:ring-zinc-800/50">
              <Clock className="h-3.5 w-3.5" />
              <span>{data.filteredCount} products</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORTS.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={cn(
                  "rounded-2xl p-5 text-left",
                  "bg-white/70 dark:bg-zinc-900/70",
                  "ring-1 ring-zinc-200/50 dark:ring-zinc-800/50",
                  "backdrop-blur-xl shadow-sm",
                  "hover:shadow-md hover:ring-2 hover:ring-indigo-500/30 dark:hover:ring-indigo-400/30",
                  "transition-all duration-300 ease-out",
                  "group cursor-pointer"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl",
                      "bg-gradient-to-br ring-1 ring-white/20",
                      report.color
                    )}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-indigo-500 font-semibold">
                    View &rarr;
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                  {report.title}
                </h3>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3 line-clamp-2">
                  {report.description}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">
                  <Clock className="h-3 w-3" />
                  {data.filteredCount} products in range
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
