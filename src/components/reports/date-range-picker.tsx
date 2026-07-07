/**
 * @file Date range picker with preset shortcuts and a custom date input section.
 * Used by the Reports page to filter chart data by time period.
 */

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Calendar, ChevronDown } from "lucide-react";
import type { DateRange } from "@/hooks/use-report-data";

/** A named preset that produces a dynamic date range relative to "now". */
interface Preset {
  label: string;
  getRange: () => DateRange;
}

const PRESETS: Preset[] = [
  {
    label: "Last 7 days",
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return { start, end };
    },
  },
  {
    label: "Last 30 days",
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return { start, end };
    },
  },
  {
    label: "Last 90 days",
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 90);
      return { start, end };
    },
  },
  {
    label: "Last 6 months",
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 6);
      return { start, end };
    },
  },
  {
    label: "Last 12 months",
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setFullYear(start.getFullYear() - 1);
      return { start, end };
    },
  },
  {
    label: "All time",
    getRange: () => ({
      start: new Date("2025-01-01"),
      end: new Date(),
    }),
  },
];

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface Props {
  range: DateRange;
  onChange: (range: DateRange) => void;
}

/**
 * A dropdown date range filter with 6 preset shortcuts and custom date inputs.
 *
 * @param range   - The currently selected date range (controlled externally).
 * @param onChange - Called whenever the user picks a preset or changes a custom date.
 */
export function DateRangePicker({ range, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activePreset = PRESETS.find((p) => {
    const r = p.getRange();
    return (
      Math.abs(r.start.getTime() - range.start.getTime()) < 1000 &&
      Math.abs(r.end.getTime() - range.end.getTime()) < 1000
    );
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 rounded-xl bg-white/70 dark:bg-zinc-900/70",
          "px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400",
          "ring-1 ring-zinc-200/50 dark:ring-zinc-800/50",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        )}
      >
        <Calendar className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">
          {activePreset
            ? activePreset.label
            : `${formatDate(range.start)} - ${formatDate(range.end)}`}
        </span>
        <span className="sm:hidden text-[10px]">
          {formatDate(range.start)} - {formatDate(range.end)}
        </span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-30 w-56 rounded-xl bg-white dark:bg-zinc-900 shadow-lg ring-1 ring-zinc-200/60 dark:ring-zinc-700/60 overflow-hidden">
          <div className="p-2 space-y-0.5">
            {PRESETS.map((preset) => {
              const r = preset.getRange();
              const isActive =
                Math.abs(r.start.getTime() - range.start.getTime()) < 1000 &&
                Math.abs(r.end.getTime() - range.end.getTime()) < 1000;
              return (
                <button
                  key={preset.label}
                  onClick={() => {
                    onChange(r);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-xs rounded-lg transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 p-3 space-y-2">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Custom range
            </p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={range.start.toISOString().split("T")[0]}
                onChange={(e) => {
                  const d = new Date(e.target.value);
                  if (!isNaN(d.getTime())) onChange({ ...range, start: d });
                }}
                className={cn(
                  "flex-1 rounded-lg border-0 bg-zinc-50 dark:bg-zinc-800",
                  "px-2 py-1.5 text-[10px] text-zinc-700 dark:text-zinc-300",
                  "ring-1 ring-zinc-200/50 dark:ring-zinc-700/50",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                )}
              />
              <span className="text-[10px] text-zinc-400">—</span>
              <input
                type="date"
                value={range.end.toISOString().split("T")[0]}
                onChange={(e) => {
                  const d = new Date(e.target.value);
                  if (!isNaN(d.getTime())) onChange({ ...range, end: d });
                }}
                className={cn(
                  "flex-1 rounded-lg border-0 bg-zinc-50 dark:bg-zinc-800",
                  "px-2 py-1.5 text-[10px] text-zinc-700 dark:text-zinc-300",
                  "ring-1 ring-zinc-200/50 dark:ring-zinc-700/50",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                )}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
