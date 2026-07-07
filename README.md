# 🚀 EcomDash — Enterprise E-commerce Dashboard

Welcome to **EcomDash**, a powerful, real-time analytics dashboard for managing and monitoring an online store. This tool helps you understand your business performance at a glance — tracking sales, orders, customers, products, and more.

> **Dashboard URL:** [http://localhost:3000](http://localhost:3000)
>
> **Health Check:** [http://localhost:3000/api/status](http://localhost:3000/api/status)

---

## 📖 Table of Contents

- [What Is This?](#-what-is-this)
- [Technology Stack](#-technology-stack)
- [Quick Start — How to Run It](#-quick-start--how-to-run-it)
- [Dashboard Tour — Every Section Explained](#-dashboard-tour--every-section-explained)
- [What Data Does It Show?](#-what-data-does-it-show)
- [Project File Structure](#-project-file-structure)
- [Useful Commands](#-useful-commands)
- [Troubleshooting](#-troubleshooting)

---

## 🧭 What Is This?

EcomDash is a **business intelligence dashboard** for an e-commerce company. Think of it as the control center of an online store — it pulls data from multiple APIs and shows you everything that matters:

- **💰 Revenue metrics** across product categories
- **📦 Inventory health** — in-stock, low-stock, out-of-stock
- **⭐ Product ratings** and customer analytics
- **📊 Interactive reports** with 6 chart types powered by Recharts
- **📱 Product catalog** sourced from FakeStore & DummyJSON APIs
- **🛒 Working cart system** with sidebar drawer
- **💬 AI Chat** powered by Google Gemini

Everything is presented in a clean, modern interface with charts, animated transitions, and interactive data visualization.

---

## 🛠 Technology Stack

| Technology | What It Does | Why We Chose It |
|-----------|-------------|-----------------|
| **Next.js 16** | The main framework that runs the server and builds the web pages | Industry standard for modern web apps; fast and reliable |
| **React 19** | The library that builds the user interface (buttons, charts, tables) | The most popular UI library; huge ecosystem |
| **TypeScript** | A stricter version of JavaScript that catches bugs early | Prevents errors before the app even runs |
| **PostgreSQL 16** | The database that stores dashboard analytics data | Powerful, free, and widely used |
| **Prisma 7** | A tool that talks to the database in a safe, easy way | Makes database queries simple and bug-free |
| **GraphQL Yoga** | A flexible API layer for the analytics dashboard | Avoids downloading extra data (faster loading) |
| **Tailwind CSS 3** | A styling system for making the dashboard look good | Fast to build beautiful interfaces |
| **Three.js** | Creates the 3D product visualization | Powers the interactive 3D model on the dashboard |
| **GSAP** | Adds smooth animations (cards sliding in, chart transitions) | Premium-grade animation library |
| **Recharts** | Interactive charting library for the Reports section | 6 chart types — bar, line, area, pie, stacked, composed |
| **@react-pdf/renderer** | Generate PDF reports client-side | Professional document export with tables |
| **react-csv** | Simple CSV file downloads | Lightweight and reliable |
| **Zustand** | A tiny state manager (cart, sidebar, theme) | Simple and lightweight |
| **Docker** | Runs PostgreSQL in an isolated container | No need to install PostgreSQL manually |
| **Faker.js** | Generates realistic fake data for the seed script | Creates believable products, users, and orders |
| **Google Gemini** | AI model powering the chat feature (via Vercel AI SDK) | Free tier with 1M token context window |
| **Vercel AI SDK** | Unified streaming API for AI chat | Provider-agnostic — swap models without changing code |

---

## 🚀 Quick Start — How to Run It

### What You Need First

1. **Node.js** (version 18 or higher) — [Download here](https://nodejs.org/)
2. **Docker Desktop** — [Download here](https://www.docker.com/products/docker-desktop/)

### One-Click Startup (Easiest)

**Windows:** Double-click **`start.bat`** in the project folder.

### Manual Step-by-Step

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL (in Docker)
docker compose up -d

# 3. Generate the database client
npx prisma generate

# 4. Apply database migrations
npx prisma migrate deploy

# 5. Seed the database with sample data
npm run db:seed

# 6. Start the development server
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## 🖥 Dashboard Tour — Every Section Explained

### 1. Dashboard (Home Page)

The main dashboard shows KPI cards (revenue, orders, conversion rate), a 3D product viewer, revenue timeline chart, traffic sources, device breakdown, top products, recent orders, and alerts — all powered by PostgreSQL data via the GraphQL API.

### 2. Products Page (`/products`)

The product catalog is sourced from **two live APIs** in parallel:

| Source | Products | Categories |
|--------|----------|------------|
| **FakeStore API** | 20 products | electronics, jewelery, men's clothing, women's clothing |
| **DummyJSON API** | 100 products | beauty, fragrances, furniture, groceries, smartphones, laptops, sports, and more |

**Features:**
- **Search** — filter products by name, category, or SKU
- **Category filter** — dropdown to narrow by category
- **Sort** — by name, price (low/high), or rating
- **Wishlist** — heart button on each card (persisted in state)
- **Add to Cart** — pushes items to a global cart store with auto-opening drawer
- **Product Lightbox** — click any card to open a full-screen product viewer with navigation
- **Real product images** — each product uses its own unique image from the source API (no placeholder photos)

**Layout:** Responsive grid (1 column mobile → 4 columns desktop) with glassmorphic cards, hover animations, and stock/badge indicators.

### 3. Reports Page (`/reports`)

A full interactive business intelligence suite powered by **Recharts** with 6 live chart types:

| Report | Chart Type | What It Shows |
|--------|-----------|---------------|
| **Monthly Sales Summary** | Vertical bar | Product count by category |
| **Inventory Status Report** | Stacked bar | In-stock (green) / Low-stock (amber) / Out-of-stock (red) by category |
| **Customer Analytics** | Donut + horizontal bar | Category distribution + top-rated categories by avg rating |
| **P&L Statement** | Grouped bar | Estimated revenue vs discounted pricing by category |
| **Tax Summary Report** | Area chart | Average rating trend across categories |
| **Shipping & Logistics** | Horizontal bar | Product availability density by category |

**Interactive features:**
- **Date range filter** — 6 presets (7d, 30d, 90d, 6m, 12m, All time) + custom date picker
- **CSV export** — one-click download of report data as `.csv`
- **PDF export** — generates a professionally formatted `.pdf` with title, table, and footer
- **Drill-down** — click any report card to see the full-screen chart view
- **Live data** — charts update as the date range or product data changes

### 4. AI Chat (`/chat`)

An interactive chat interface using **Google Gemini** to explore the product catalog:

- **Streaming responses** with real-time text
- **Product Showcase** — AI renders rich visual product cards
- **Suggestion chips** — one-click prompts to get started
- **Offline fallback** — graceful degradation when API key is unavailable
- **Chat history** with session management

### 5. Cart System

A global shopping cart accessible from any page:

- **Floating trigger button** (bottom-right) with animated item count badge
- **Slide-in drawer** from the right with GSAP entrance animation
- **Quantity controls** (+/-) and remove button per item
- **Running totals** — subtotal, shipping ($9.99, free over $100), total
- **Checkout button** and clear cart link
- **Escape key** and backdrop click to close

### 6. Other Pages

| Page | Description |
|------|-------------|
| **Analytics** | Deeper data analysis with metrics |
| **Orders** | Order management table |
| **Customers** | Customer list |
| **Notifications** | System alerts |
| **Settings** | Configuration options |
| **Login / Register** | Authentication pages |
| **Forgot Password** | Password recovery |

---

## 📊 What Data Does It Show?

### Live API Data (Products & Reports)

| Source | Endpoint | Data |
|--------|----------|------|
| **FakeStore API** | `fakestoreapi.com/products` | 20 products with images, prices, ratings |
| **DummyJSON API** | `dummyjson.com/products` | 100 products with thumbnails, discounts, stock, brands |

The **Reports** section processes this data into aggregated metrics (category distribution, stock levels, rating averages, P&L estimates). Each product has a synthetic `createdAt` timestamp derived from DummyJSON's `meta.createdAt` field (or randomly generated for FakeStore) to enable date range filtering.

### Database Data (Dashboard Analytics)

The main dashboard page uses PostgreSQL data generated by the seed script:

| Item | Count |
|------|-------|
| **Products** | 50 |
| **Users** | 350 |
| **Orders** | 1,200 |
| **Order Items** | ~3,300 |

Data includes realistic seasonal patterns (holiday spikes, summer lulls) and global geographic distribution.

---

## 📁 Project File Structure

```
E-com Dashboard/
│
├── README.md
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── docker-compose.yml
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── src/
│   ├── app/
│   │   ├── page.tsx                    ← Main dashboard
│   │   ├── layout.tsx                  ← App shell (sidebar, cart)
│   │   ├── globals.css
│   │   ├── products/page.tsx           ← Product catalog (FakeStore + DummyJSON)
│   │   ├── reports/page.tsx            ← Reports with Recharts + exports
│   │   ├── chat/page.tsx               ← AI Chat page
│   │   └── api/
│   │       ├── chat/route.ts
│   │       ├── graphql/route.ts
│   │       └── status/route.ts
│   │
│   ├── components/
│   │   ├── dashboard/                  ← KPI grid, product viewer, charts
│   │   ├── layout/                     ← App shell, sidebar
│   │   ├── cart/                       ← Cart drawer, cart trigger
│   │   ├── reports/                    ← 6 Recharts chart components
│   │   │   ├── sales-summary-chart.tsx
│   │   │   ├── inventory-chart.tsx
│   │   │   ├── analytics-chart.tsx
│   │   │   ├── pnl-chart.tsx
│   │   │   ├── tax-chart.tsx
│   │   │   ├── logistics-chart.tsx
│   │   │   ├── date-range-picker.tsx   ← Date filter with presets
│   │   │   └── export-buttons.tsx      ← CSV + PDF export
│   │   ├── chat/                       ← Chat bubbles, sandbox, product showcase
│   │   ├── ui/                         ← Bento grid, skeleton, auth background
│   │   └── providers/                  ← Theme, store, smooth scroll
│   │
│   ├── hooks/
│   │   ├── use-dashboard.ts            ← Dashboard data (DB)
│   │   ├── use-fakestore-products.ts   ← FakeStore + DummyJSON fetch
│   │   ├── use-report-data.ts          ← Transforms product data into chart datasets
│   │   └── use-analytics.ts
│   │
│   ├── lib/
│   │   ├── db.ts                       ← Prisma client
│   │   ├── graphql.ts                  ← GraphQL client
│   │   ├── utils.ts                    ← cn() helper
│   │   └── fakestore-data.ts           ← Static fallback for FakeStore
│   │
│   ├── stores/
│   │   ├── cart-store.ts               ← Zustand cart (add/remove/quantities)
│   │   └── sidebar-store.ts
│   │
│   └── graphql/
│       ├── schema.ts
│       ├── resolvers/
│       └── context.ts
```

---

## 📋 Useful Commands

### Database Commands

| Command | What It Does |
|---------|-------------|
| `npm run db:seed` | Fill database with sample data |
| `npm run db:reset` | Wipe and recreate the database |
| `npm run db:studio` | Open visual database browser |
| `npm run db:generate` | Regenerate Prisma client |

### Development Commands

| Command | What It Does |
|---------|-------------|
| `npm run dev` | Start the dashboard on http://localhost:3000 |
| `npm run build` | Build for production |
| `npm run lint` | Check code for style issues |
| `npx tsc --noEmit` | Check code for type errors |

---

## 🔧 Troubleshooting

### "Port 3000 is already in use"
```bash
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess
Stop-Process -Id [PID] -Force
```

### "Database connection refused"
```bash
npm run start:docker
```

### API products not loading
The products page fetches from `fakestoreapi.com` and `dummyjson.com` at runtime. If those APIs are down, it falls back to static data. Check your internet connection or open the browser console to see which API failed.

---

*Built with ❤️ using Next.js, React, TypeScript, Recharts, and Three.js.*
