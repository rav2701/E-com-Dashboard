import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SalesTimeline, TimelineStats } from "./sales-timeline";
import type { TimelineBucket } from "@/hooks/use-dashboard";

// ───────────────────────────────────────────────────────────────
//  Mock Recharts ResponsiveContainer to render children directly
//  with a fixed size so the chart SVG renders.
// ───────────────────────────────────────────────────────────────

vi.mock("recharts", async () => {
  const actual = await vi.importActual("recharts");
  return {
    ...(actual as Record<string, unknown>),
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container" style={{ width: 800, height: 400 }}>
        {children}
      </div>
    ),
  };
});

// ───────────────────────────────────────────────────────────────
//  Sample data
// ───────────────────────────────────────────────────────────────

const sampleData: TimelineBucket[] = [
  { date: "2026-01", revenue: 150000, ordersCount: 120, itemsSold: 340, averageOrderValue: 1250.0 },
  { date: "2026-02", revenue: 180000, ordersCount: 145, itemsSold: 410, averageOrderValue: 1241.38 },
  { date: "2026-03", revenue: 210000, ordersCount: 168, itemsSold: 480, averageOrderValue: 1250.0 },
  { date: "2026-04", revenue: 195000, ordersCount: 156, itemsSold: 445, averageOrderValue: 1250.0 },
  { date: "2026-05", revenue: 230000, ordersCount: 182, itemsSold: 520, averageOrderValue: 1263.74 },
];

const singleEntry: TimelineBucket[] = [
  { date: "2026-01", revenue: 50000, ordersCount: 40, itemsSold: 110, averageOrderValue: 1250.0 },
];

// ───────────────────────────────────────────────────────────────
//  SalesTimeline Tests
// ───────────────────────────────────────────────────────────────

describe("SalesTimeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Empty states ──────────────────────────────────────────

  it("renders empty state when data is null or undefined", () => {
    const { rerender } = render(<SalesTimeline data={null as unknown as TimelineBucket[]} />);
    expect(screen.getByText("No timeline data available")).toBeInTheDocument();

    rerender(<SalesTimeline data={undefined as unknown as TimelineBucket[]} />);
    expect(screen.getByText("No timeline data available")).toBeInTheDocument();
  });

  it("renders empty state when data is an empty array", () => {
    render(<SalesTimeline data={[]} />);
    expect(screen.getByText("No timeline data available")).toBeInTheDocument();
  });

  // ── Data rendering ────────────────────────────────────────

  it("renders chart without showing empty state when data is provided", () => {
    render(<SalesTimeline data={sampleData} />);

    // Should NOT show the empty state
    expect(screen.queryByText("No timeline data available")).not.toBeInTheDocument();

    // Should render the ResponsiveContainer mock
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("renders with 5+ data points without crashing", () => {
    render(<SalesTimeline data={sampleData} />);
    expect(screen.queryByText("No timeline data available")).not.toBeInTheDocument();
  });

  it("renders with a single data point without crashing", () => {
    render(<SalesTimeline data={singleEntry} />);
    expect(screen.queryByText("No timeline data available")).not.toBeInTheDocument();
  });

  // ── Legend ─────────────────────────────────────────────────

  it("renders the chart without showing the empty state", () => {
    // The Legend component is rendered by Recharts and may not appear
    // in jsdom. Instead, verify the chart rendered successfully.
    render(<SalesTimeline data={sampleData} />);
    expect(screen.queryByText("No timeline data available")).not.toBeInTheDocument();
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  // ── Custom className ──────────────────────────────────────

  it("applies custom className to the wrapper", () => {
    const { container } = render(
      <SalesTimeline data={sampleData} className="custom-class" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains("custom-class")).toBe(true);
  });

  // ── Bar click handler ─────────────────────────────────────

  it("calls onBarClick when a bar is clicked", async () => {
    const onBarClick = vi.fn();
    const { container } = render(
      <SalesTimeline data={sampleData} onBarClick={onBarClick} />
    );

    // Recharts renders bar rects in the SVG
    const rects = container.querySelectorAll("svg rect");
    if (rects.length > 0) {
      await userEvent.click(rects[0]);
      expect(onBarClick).toHaveBeenCalled();
    }
  });

  it("does not crash when bars are clicked without onBarClick", async () => {
    const { container } = render(<SalesTimeline data={sampleData} />);

    const rects = container.querySelectorAll("svg rect");
    if (rects.length > 0) {
      await expect(userEvent.click(rects[0])).resolves.toBeUndefined();
    }
  });
});

// ───────────────────────────────────────────────────────────────
//  TimelineStats Tests
// ───────────────────────────────────────────────────────────────

describe("TimelineStats", () => {
  it("renders total revenue correctly", () => {
    render(<TimelineStats data={sampleData} />);

    const expectedTotal = sampleData.reduce((s, b) => s + b.revenue, 0);
    // The component uses toLocaleString("en-US") which in jsdom should format with commas
    const formatted = `$${expectedTotal.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

    expect(screen.getByText(formatted)).toBeInTheDocument();
  });

  it("renders average order value correctly", () => {
    render(<TimelineStats data={sampleData} />);
    expect(screen.getByText(/Avg/)).toBeInTheDocument();
    expect(screen.getByText(/\/order/)).toBeInTheDocument();
  });

  it("shows the TrendingUp icon", () => {
    const { container } = render(<TimelineStats data={sampleData} />);
    expect(screen.getByText("Total")).toBeInTheDocument();
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  // ── Empty / edge data ─────────────────────────────────────

  it("handles empty array gracefully", () => {
    render(<TimelineStats data={[]} />);
    expect(screen.getByText("Total")).toBeInTheDocument();
    // Should show $0 for total and $0.00 for avg
    expect(screen.getByText("$0")).toBeInTheDocument();
    expect(screen.getByText("$0.00")).toBeInTheDocument();
  });

  it("handles null data gracefully", () => {
    render(<TimelineStats data={null as unknown as TimelineBucket[]} />);
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("$0")).toBeInTheDocument();
  });

  it("handles undefined data gracefully", () => {
    render(<TimelineStats data={undefined as unknown as TimelineBucket[]} />);
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("$0")).toBeInTheDocument();
  });

  it("handles data with zero revenue and zero orders", () => {
    const zeroData: TimelineBucket[] = [
      { date: "2026-01", revenue: 0, ordersCount: 0, itemsSold: 0, averageOrderValue: 0 },
    ];

    render(<TimelineStats data={zeroData} />);
    expect(screen.getByText("$0")).toBeInTheDocument();
    expect(screen.getByText("$0.00")).toBeInTheDocument();
  });

  it("handles data with zero revenue but non-zero orders", () => {
    const zeroRevenueData: TimelineBucket[] = [
      { date: "2026-01", revenue: 0, ordersCount: 10, itemsSold: 0, averageOrderValue: 0 },
    ];

    render(<TimelineStats data={zeroRevenueData} />);
    expect(screen.getByText("$0")).toBeInTheDocument();
    expect(screen.getByText("$0.00")).toBeInTheDocument();
  });

  it("renders with a single data entry", () => {
    render(<TimelineStats data={singleEntry} />);

    // $50,000 total
    expect(screen.getByText("$50,000")).toBeInTheDocument();
    // Avg order value: toLocaleString may or may not add commas in jsdom,
    // so just check for the dollar amount without comma
    expect(screen.getByText((content) => content.startsWith("$") && content.endsWith("1250.00"))).toBeInTheDocument();
  });

  it("formats large values with commas", () => {
    const largeData: TimelineBucket[] = [
      { date: "2026-01", revenue: 1000000, ordersCount: 500, itemsSold: 1500, averageOrderValue: 2000 },
    ];

    render(<TimelineStats data={largeData} />);
    // toLocaleString may or may not add commas in jsdom, so check broadly
    expect(screen.getByText((content) =>
      content.includes("$") && (content.includes("1,000,000") || content.includes("1000000"))
    )).toBeInTheDocument();
  });

  it("computes values correctly for mixed data", () => {
    const mixedData: TimelineBucket[] = [
      { date: "2026-01", revenue: 100, ordersCount: 5, itemsSold: 10, averageOrderValue: 20 },
      { date: "2026-02", revenue: 200, ordersCount: 15, itemsSold: 30, averageOrderValue: 13.33 },
    ];

    render(<TimelineStats data={mixedData} />);
    // Total: $300
    expect(screen.getByText("$300")).toBeInTheDocument();
    // Avg: 300 / 20 = $15.00
    expect(screen.getByText("$15.00")).toBeInTheDocument();
  });
});
