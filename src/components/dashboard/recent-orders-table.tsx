"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { RecentOrder } from "@/hooks/use-dashboard";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Search,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// ───────────────────────────────────────────────────────────────
//  Status colour map
// ───────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  PENDING: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  CONFIRMED: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  PROCESSING: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  SHIPPED: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
  DELIVERED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
  REFUNDED: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
};

// ───────────────────────────────────────────────────────────────
//  Column helper
// ───────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<RecentOrder>();

// ───────────────────────────────────────────────────────────────
//  Table Component
// ───────────────────────────────────────────────────────────────

interface RecentOrdersTableProps {
  data: RecentOrder[];
}

export function RecentOrdersTable({ data }: RecentOrdersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // ── Column definitions ────────────────────────────────────
  const columns = useMemo(
    () => [
      columnHelper.accessor("orderNumber", {
        header: "Order",
        cell: (info) => (
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("customer", {
        header: "Customer",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div>
              <span className="text-zinc-800 dark:text-zinc-200">
                {info.getValue()}
              </span>
              <span className="block text-[9px] text-zinc-400 dark:text-zinc-500">
                {row.customerEmail}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("product", {
        header: "Product",
        cell: (info) => (
          <span className="text-zinc-600 dark:text-zinc-400">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("amount", {
        header: "Amount",
        cell: (info) => (
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            ${info.getValue().toFixed(2)}
          </span>
        ),
        sortingFn: "basic",
      }),
      columnHelper.accessor("date", {
        header: "Date",
        cell: (info) => (
          <span className="text-zinc-500 dark:text-zinc-400">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          return (
            <span
              className={cn(
                "inline-block rounded-full px-2 py-0.5 text-[10px] font-medium",
                statusColors[status] ??
                  "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              )}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </span>
          );
        },
        filterFn: "equalsString",
      }),
    ],
    []
  );

  // ── Table instance ────────────────────────────────────────
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  });

  // ── Empty state ───────────────────────────────────────────
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-zinc-400 dark:text-zinc-500">
        No orders data available
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Search bar ───────────────────────────────────── */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
        <input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search orders..."
          className={cn(
            "w-full rounded-lg border border-zinc-200 bg-white/80 py-2 pl-9 pr-3 text-xs",
            "placeholder:text-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
            "dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-indigo-500"
          )}
        />
      </div>

      {/* ── Scrollable table area ─────────────────────────── */}
      <div className="flex-1 -mx-5 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-zinc-100 dark:border-zinc-800"
              >
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "pb-2 px-3 first:pl-5 last:pr-5",
                        "font-semibold text-zinc-400 dark:text-zinc-500",
                        canSort &&
                          "cursor-pointer select-none hover:text-zinc-600 dark:hover:text-zinc-300"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {canSort && (
                          <span className="inline-flex">
                            {sortDir === "asc" ? (
                              <ArrowUp className="h-3 w-3 text-indigo-500" />
                            ) : sortDir === "desc" ? (
                              <ArrowDown className="h-3 w-3 text-indigo-500" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 text-zinc-300 dark:text-zinc-600" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-zinc-100/50 transition-colors",
                  "hover:bg-zinc-50/50 dark:border-zinc-800/50 dark:hover:bg-zinc-800/30"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="py-3 px-3 first:pl-5 last:pr-5"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ────────────────────────────────────── */}
      <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800/60">
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
          {table.getFilteredRowModel().rows.length} of {data.length} orders
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600",
              "dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            title="First page"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600",
              "dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            title="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1 px-2">
            {(() => {
              const total = table.getPageCount();
              const current = table.getState().pagination.pageIndex;
              if (total <= 7) {
                // Show all pages when 7 or fewer
                return Array.from({ length: total }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => table.setPageIndex(i)}
                    className={cn(
                      "min-w-[24px] rounded-md px-1.5 py-1 text-[11px] font-medium transition-colors",
                      i === current
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    )}
                  >
                    {i + 1}
                  </button>
                ));
              }
              // More than 7 pages: show windowed view
              const pages: (number | "ellipsis")[] = [0];
              const start = Math.max(1, current - 1);
              const end = Math.min(total - 2, current + 1);
              if (start > 1) pages.push("ellipsis");
              for (let i = start; i <= end; i++) pages.push(i);
              if (end < total - 2) pages.push("ellipsis");
              pages.push(total - 1);
              return pages.map((item, idx) =>
                item === "ellipsis" ? (
                  <span
                    key={`e${idx}`}
                    className="px-1 text-[11px] text-zinc-300 dark:text-zinc-600"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => table.setPageIndex(item)}
                    className={cn(
                      "min-w-[24px] rounded-md px-1.5 py-1 text-[11px] font-medium transition-colors",
                      item === current
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    )}
                  >
                    {item + 1}
                  </button>
                )
              );
            })()}
          </div>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600",
              "dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            title="Next page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600",
              "dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            title="Last page"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
