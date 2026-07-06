# 🚀 EcomDash — Enterprise E-commerce Dashboard

Welcome to **EcomDash**, a powerful, real-time analytics dashboard for managing and monitoring an online store. This tool helps you understand your business performance at a glance — tracking sales, orders, customers, products, and more.

> **Dashboard URL:** [http://localhost:3000](http://localhost:3000)
>
> **Health Check:** [http://localhost:3000/api/status](http://localhost:3000/api/status)

---

## 📖 Table of Contents

- [What Is This?](#-what-is-this)
- [How It Works (Plain English)](#-how-it-works-plain-english)
- [Technology Stack](#-technology-stack)
- [Quick Start — How to Run It](#-quick-start--how-to-run-it)
- [Dashboard Tour — Every Section Explained](#-dashboard-tour--every-section-explained)
- [What Data Does It Show?](#-what-data-does-it-show)
- [API & Health Check](#-api--health-check)
- [Project File Structure](#-project-file-structure)
- [Useful Commands](#-useful-commands)
- [One-Click Startup Scripts](#-one-click-startup-scripts)
- [Troubleshooting](#-troubleshooting)

---

## 🧭 What Is This?

EcomDash is a **business intelligence dashboard** for an e-commerce company. Think of it as the control center of an online store — it pulls data from a database and shows you everything that matters:

- **💰 How much money** the store is making
- **📦 How many orders** are coming in
- **👥 Who the customers** are
- **⭐ Which products** are selling best
- **📊 Where traffic** is coming from (direct visits, social media, ads, etc.)
- **📱 What devices** customers are using (phone, tablet, computer)
- **⚠️ Any problems** that need attention (low stock, alerts)

Everything updates live and is presented in a clean, modern interface with charts, graphs, and interactive 3D visuals.

---

## 🧠 How It Works (Plain English)

Here's a simple breakdown of what happens when you open the dashboard:

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│  Your       │────▶│  Server      │────▶│  Database        │
│  Browser    │     │  (Next.js)   │     │  (PostgreSQL)    │
│             │◀────│              │◀────│                  │
│  Shows the  │     │  Fetches     │     │  50 products     │
│  dashboard  │     │  data from   │     │  350 users       │
│  as a       │     │  the         │     │  1,200 orders    │
│  web page   │     │  database    │     │                  │
└─────────────┘     └──────────────┘     └──────────────────┘
```

1. **Your browser** (Chrome, Edge, etc.) visits `http://localhost:3000`
2. The **server** (a program running on your computer) receives the request
3. The server asks the **database** (PostgreSQL — a storage system) for the latest numbers
4. The database sends back the data (total revenue, recent orders, top products, etc.)
5. The server packages it all up and sends it to your browser as a beautiful dashboard
6. Your browser displays the dashboard with all the charts, numbers, and visuals

The **GraphQL API** is the middleman that handles all data requests. It has 7 different queries, each fetching a specific piece of the dashboard:

| Query | What It Fetches |
|-------|----------------|
| `getDashboardKPIs` | Revenue, orders, conversion rate |
| `getSalesTimeline` | Revenue over time (monthly chart) |
| `getTopProducts` | Best-selling products ranked |
| `getRecentOrders` | Latest customer orders |
| `getTrafficSources` | Where visitors come from |
| `getDeviceBreakdown` | Phone vs tablet vs computer |
| `getAlerts` | Problems needing attention |

---

## 🛠 Technology Stack

Think of this as the ingredient list for building the dashboard. Each tool has a specific job.

| Technology | What It Does | Why We Chose It |
|-----------|-------------|-----------------|
| **Next.js 16** | The main framework that runs the server and builds the web pages | Industry standard for modern web apps; fast and reliable |
| **React 19** | The library that builds the user interface (buttons, charts, tables) | The most popular UI library; huge ecosystem |
| **TypeScript** | A stricter version of JavaScript that catches bugs early | Prevents errors before the app even runs |
| **PostgreSQL 16** | The database that stores all the data | Powerful, free, and widely used |
| **Prisma 7** | A tool that talks to the database in a safe, easy way | Makes database queries simple and bug-free |
| **GraphQL Yoga** | A flexible API layer that fetches exactly the data needed | Avoids downloading extra data (faster loading) |
| **Tailwind CSS 3** | A styling system for making the dashboard look good | Fast to build beautiful interfaces |
| **Three.js** | Creates the 3D product visualization | Powers the interactive 3D model on the dashboard |
| **GSAP** | Adds smooth animations (cards sliding in, chart transitions) | Premium-grade animation library |
| **Lenis** | Enables smooth, butter-like scrolling | Makes the dashboard feel premium |
| **Zustand** | A tiny state manager (tracks sidebar open/closed, theme) | Simple and lightweight |
| **Docker** | Runs PostgreSQL in an isolated container | No need to install PostgreSQL manually |
| **Faker.js** | Generates realistic fake data for the seed script | Creates believable products, users, and orders |
| **Google Gemini** | AI model powering the chat feature (via Vercel AI SDK) | Free tier with 1M token context window — no billing needed |
| **Vercel AI SDK** | Unified streaming API for AI chat (tool calling, SSE) | Provider-agnostic — swap models without changing code |
| **AI SDK Google Provider** | `@ai-sdk/google` — connects the AI SDK to Gemini | Seamless integration with `streamText` and tool calling |

---

## 🚀 Quick Start — How to Run It

### What You Need First

Before you can run the dashboard, make sure you have these installed on your computer:

1. **Node.js** (version 18 or higher) — [Download here](https://nodejs.org/)
   - *Check if installed:* Open a terminal and type `node --version`
2. **Docker Desktop** — [Download here](https://www.docker.com/products/docker-desktop/)
   - *This runs the database in a container — you don't need to install PostgreSQL separately*
   - Make sure Docker Desktop is **running** (you'll see the Docker icon in your system tray)

### Option A: One-Click Startup (Easiest)

**Windows:** Double-click **`start-simple.bat`** or **`start.bat`** in the project folder.

**PowerShell:** Right-click **`start.ps1`** and select "Run with PowerShell."

These scripts will do everything automatically:
1. ✅ Check that Node.js and Docker are installed
2. ✅ Install project dependencies
3. ✅ Start the PostgreSQL database inside Docker
4. ✅ Set up the database tables (run migrations)
5. ✅ Fill the database with sample data (50 products, 350 users, 1,200 orders)
6. ✅ Launch the dashboard on http://localhost:3000

### Option B: Manual Step-by-Step

If you prefer to run each step yourself:

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL (in Docker)
docker compose up -d

# 3. Generate the database client
npx prisma generate

# 4. Apply database migrations (create tables)
npx prisma migrate deploy
# (If that doesn't work, try: npx prisma migrate dev)

# 5. Seed the database with sample data
npm run db:seed

# 6. Start the development server
npm run dev
```

Then open **http://localhost:3000** in your browser.

### Option C: NPM Shortcut

```bash
npm run setup
```

This runs steps 1–5 in sequence (Docker → migrations → seed).

---

## 🖥 Dashboard Tour — Every Section Explained

Once you open the dashboard, here's everything you'll see:

### 1. Page Header

At the very top, you'll see:
- **"Dashboard"** — the title
- **"Your e-commerce overview"** — a subtitle
- A badge showing how many orders are being tracked (e.g., "1,200 orders tracked")

### 2. KPI Cards (The Big Numbers)

Four large cards show the most important numbers for your business:

| Card | What It Shows |
|------|--------------|
| **Gross Volume** | Total revenue from all orders (e.g., $1.83M) |
| **Total Orders** | How many orders have been placed (e.g., 1,200) |
| **Conversion Rate** | What percentage of visitors actually buy something |
| **Active Users** | How many unique customers have placed orders |

Each card shows:
- A **trend indicator** (↗ up or ↘ down) showing if things are improving
- **Detail chips** at the bottom with related stats (e.g., average order value, fulfillment rate)

The cards animate in with a sliding effect when the page loads.

### 3. 3D Product Viewer

An interactive 3D visualization of a product concept. You can switch between three views:

| View Tab | What It Does |
|----------|-------------|
| **Overview Analysis** | Default view — shows the product rotating slowly in a purple/blue color scheme |
| **Returns & Defect Logs** | A red-themed view from a different camera angle |
| **Global Distribution Maps** | A blue/green view from above |

The camera smoothly glides between angles when you click a different tab. The product model is a complex geometric shape (torus knot) with floating particles around it.

### 4. Revenue Timeline (Bar Chart)

A vertical bar chart showing revenue trends over time (month by month). Each bar represents one month:

- **Taller bars** = more revenue
- **Hover over a bar** to see the exact dollar amount
- Below the chart, you'll see:
  - **Total revenue** across all periods shown
  - **Average order value** (how much customers spend per order on average)

### 5. Traffic Sources

Shows where your website visitors are coming from:

| Source | Example |
|--------|---------|
| **Direct** | People typing the URL directly |
| **Organic** | People finding the site via Google search |
| **Social** | People coming from Instagram, Facebook, etc. |
| **Referral** | People clicking links from other websites |
| **Email** | People clicking links in marketing emails |

Each source shows a **progress bar** and a **visit count**.

### 6. Device Breakdown

Shows what devices customers use to browse and shop:

- **Desktop** — ~51% (computers and laptops)
- **Mobile** — ~33% (phones)
- **Tablet** — ~16% (iPads, etc.)

Each device type has a progress bar and percentage.

### 7. Top Products

A ranked list of best-selling products, sorted by revenue. Each row shows:

- **Rank number** (1, 2, 3, ...)
- **Product name** and **SKU** (a product code)
- **Category** (e.g., Electronics, Fashion)
- **Revenue generated** (how much money this product brought in)
- **Units sold** (how many were bought)
- **Star rating** (customer satisfaction score, 1–5)

The top 3 products are highlighted with a special badge color.

### 8. Recent Orders

A table showing the most recent customer orders with:

| Column | What It Shows |
|--------|--------------|
| **Order** | The order number (e.g., ORD-242001) |
| **Customer** | The customer's name and email |
| **Product** | What product was bought |
| **Amount** | How much the order was worth |
| **Date** | When the order was placed |
| **Status** | Current state (Confirmed, Shipped, Delivered, etc.) |

Each status has a color:
- 🟢 **Delivered** — green
- 🔵 **Shipped** — blue
- 🟡 **Processing** — amber
- 🔴 **Cancelled** — red

### 9. Satisfaction Gauge

A circular gauge showing overall customer satisfaction (94%). Below it:
- **5 gold stars** indicating top ratings
- A note saying "Based on X orders"

### 10. Alerts

Important notifications that need attention:

- 🔴 **Red alerts** — Critical (e.g., Inventory low)
- 🟡 **Amber alerts** — Warning
- 🔵 **Blue alerts** — Informational

Each alert has a title and a short description.

### 11. Key Metrics (Quick Stats)

Three summary metrics displayed side-by-side:

| Metric | What It Measures |
|--------|-----------------|
| **Avg. Order Value** | How much customers typically spend per order |
| **Fulfillment Rate** | Percentage of orders successfully delivered |
| **Conversion Rate** | Percentage of visitors who become customers |

Each shows a trend indicator (e.g., "+5.2%" in green).

### 12. AI Chat Page (`/chat`)

An interactive chat interface that uses Google Gemini to answer questions about your product catalog.

**What you can ask:**
- *"Show me your top products"* — Returns the best-selling items in a rich visual card
- *"What electronics are under $200?"* — Filters by category and price
- *"Compare our best-rated items"* — Sorts by customer rating
- *"Show me the most popular accessories"* — Filters by category and popularity

The AI uses **tool calling** to execute product searches against your catalog and returns results as live React components (not just text). When the API is unavailable, it seamlessly falls back to offline mock data with an amber "Offline Mode" badge.

### 13. Sidebar Navigation

A panel on the left side of the screen with navigation links:

- **Dashboard** — Home (where you are now)
- **Analytics** — Deeper data analysis
- **Orders** — Order management
- **Products** — Product catalog
- **Customers** — Customer list
- **Reports** — Business reports
- **Notifications** — System notifications
- **Settings** — Configuration options
- **AI Chat** — Interactive AI-powered product search and recommendations

#### AI Chat Page (`/chat`)

The AI Chat is an interactive conversational interface that lets you explore your product catalog using natural language:

- **Streaming responses** — Text streams in real-time as the AI generates it
- **Product Showcase** — When you ask about products, the AI automatically renders a **bento-grid dashboard** card with visual product data (prices, ratings, stock status, conversion rates)
- **Suggestion chips** — One-click prompts like "Show me your top products" to get started quickly
- **Stop button** — Cancel a running generation at any time
- **Offline fallback** — If the AI API key isn't configured, the chat gracefully falls back to mock data with a visible "Offline Mode" badge

**Technical details:**
| Feature | Details |
|---------|---------|
| **AI Model** | Google Gemini 2.5 Flash (free, 1M token context) |
| **Streaming** | Custom SSE parser on the client, Vercel AI SDK on the server |
| **Tool calling** | AI decides when to fetch products; results render as live React components |
| **Fallback** | When API key is missing, returns offline mock data with a visual badge |
| **Lenis-safe** | Scroll container uses `data-lenis-prevent` to avoid smooth-scroll conflicts |

The chat is built with a modular architecture:
- **`ChatSandbox`** — Orchestrator managing state, SSE parsing, and tool rendering
- **`ChatHistory`** — Scrollable message viewport with smart auto-scroll during streaming
- **`ChatBubble`** — Glassmorphic user/assistant bubbles with streaming indicators
- **`ChatInput`** — Auto-resizing textarea with Enter-to-send, sticky positioning
- **`ChatSidebar`** — Session list with timestamps and delete actions
- **`ProductShowcase`** — Bento-box styled card with GSAP animations showing 3 top-tier products
- **`ProductShowcaseSkeleton`** — Animated pulse-placeholder while tool executes

**Features:**
- Click the **collapse button** (chevron icon) to shrink the sidebar to icons-only mode
- On **mobile phones**, the sidebar becomes a sliding drawer — tap the hamburger menu (☰) to open it
- The **active page** is highlighted with a purple accent

---

## 📊 What Data Does It Show?

The dashboard ships with realistic sample data generated by a seed script. Here's exactly what's in the database:

| Item | Count | Details |
|------|-------|---------|
| **Products** | 50 | 15 budget items, 20 mid-range, 15 premium — across 4 categories (Electronics, Home & Living, Fashion, Sports & Outdoors) |
| **Users** | 350 | Fictional customers from 20+ cities worldwide |
| **Orders** | 1,200 | Placed over 12 months with realistic seasonal patterns |
| **Order Items** | ~3,300 | Each order has 1–5 products |

### 🎯 Seasonal Patterns in the Data

The order data is designed to mimic real shopping behavior:

| Season | Pattern |
|--------|---------|
| **December** 📈 | Highest sales (holiday shopping) |
| **November** 📈 | Black Friday / Cyber Monday spike |
| **July** 📉 | Slowest month (summer lull) |
| **August–September** 📈 | Back-to-school bump |
| **Weekends** | More orders than weekdays |
| **Weekdays** | Tuesday/Wednesday are busiest |

### 🌍 Geographic Distribution

Orders come from real cities worldwide:

| Region | Share |
|--------|-------|
| **North America** | 40% (New York, LA, Chicago, Toronto...) |
| **Europe** | 30% (London, Berlin, Paris, Amsterdam...) |
| **Asia-Pacific** | 15% (Tokyo, Sydney, Singapore, Seoul...) |
| **Latin America** | 10% (São Paulo, Mexico City, Buenos Aires...) |
| **Middle East & Africa** | 5% (Dubai, Cape Town, Tel Aviv...) |

---

## 🔌 API & Health Check

### Health Check Endpoint

**`GET /api/status`** — A built-in health check that tells you if everything is working.

Example response:
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "uptime": 895,
  "timestamp": "2026-07-06T14:30:00.000Z",
  "checks": {
    "database": {
      "status": "ok",
      "latencyMs": 2
    },
    "graphql": {
      "status": "ok",
      "queryCount": 7
    },
    "memory": {
      "status": "ok",
      "heapUsedMb": 139.2,
      "heapTotalMb": 200.5,
      "rssMb": 884.1
    }
  }
}
```

**What each check means:**

| Check | What It Tests | What "ok" Means |
|-------|--------------|-----------------|
| **Database** | Can the server talk to PostgreSQL? | Database is reachable and responding |
| **GraphQL** | Is the API schema loaded correctly? | All 7 queries are defined and ready |
| **Memory** | Is the server using too much RAM? | Memory usage is within safe limits |

**HTTP Status Codes:**
- **200** — All healthy 🟢
- **207** — Degraded (some checks failed) 🟡
- **503** — Unhealthy (major problems) 🔴

### GraphQL API Endpoint

**`POST /api/graphql`** — The main data API. All dashboard data flows through this single endpoint. This is where the frontend sends queries like "give me the top products" and gets back JSON data.

You can explore the API using an interactive tool called **GraphiQL** — it's available at `/api/graphql` when running in development mode.

---

## 📁 Project File Structure

Here's how the project files are organized, explained in plain English:

```
E-com Dashboard/
│
├── 📄 README.md              ← This file — explains the whole project
├── 📄 package.json            ← Recipe file: lists all ingredients (packages) and commands
├── 📄 next.config.ts          ← Next.js settings (mostly default)
├── 📄 tailwind.config.ts      ← Visual theme: colors, fonts, animations
├── 📄 postcss.config.mjs      ← CSS processing setup
├── 📄 tsconfig.json           ← TypeScript settings
├── 📄 .env                    ← Environment variables (database URL, etc.)
├── 📄 docker-compose.yml      ← Docker configuration (tells Docker how to run PostgreSQL)
│
├── 🖥 Start Scripts:
│   ├── start.bat              ← Full startup with error handling (double-click)
│   ├── start-simple.bat       ← Minimal startup (double-click)
│   └── start.ps1              ← PowerShell version with colored output
│
├── 📂 prisma/                 ← Database layer
│   ├── schema.prisma          ← Database blueprint (defines all tables)
│   ├── seed.ts                ← Script that fills the database with sample data
│   └── migrations/            ← History of database changes
│
├── 📂 src/                    ← All the application code
│   ├── 📂 app/                ← Pages and API routes
│   │   ├── page.tsx           ← Main dashboard page (the homepage)
│   │   ├── layout.tsx         ← Page wrapper (sidebar, fonts, smooth scrolling)
│   │   ├── globals.css        ← Global styles (colors, scrollbar, animations)
│   │   ├── 📂 chat/           ← AI Chat page
│   │   │   └── page.tsx       ← Chat sandbox layout (Lenis-isolated)
│   │   └── 📂 api/            ← API endpoints
│   │       ├── chat/route.ts      ← AI Chat API: Gemini streaming + offline fallback
│   │       ├── graphql/route.ts   ← GraphQL API (feeds data to the dashboard)
│   │       └── status/route.ts    ← Health check endpoint
│   │
│   ├── 📂 lib/                ← Shared utilities
│   │   ├── db.ts              ← Database connection (Prisma client)
│   │   ├── graphql.ts         ← Client for making GraphQL requests from the browser
│   │   └── utils.ts           ← Helper functions (CSS class merging)
│   │
│   ├── 📂 graphql/            ← GraphQL schema and resolvers
│   │   ├── schema.ts          ← Schema definition (what data is available)
│   │   ├── resolvers.ts       ← Logic that fetches the actual data from the database
│   │   ├── context.ts         ← Creates the data-loading environment
│   │   └── loaders.ts         ← Batch-loading optimizations (speeds up queries)
│   │
│   ├── 📂 components/         ← UI building blocks
│   │   ├── 📂 dashboard/      ← Dashboard-specific widgets
│   │   │   ├── kpi-grid.tsx       ← The 4 big number cards at the top
│   │   │   ├── product-viewer.tsx ← The 3D interactive product model
│   │   │   ├── sales-timeline.tsx ← The bar chart showing revenue over time
│   │   │   └── top-products.tsx   ← The ranked product list
│   │   ├── 📂 layout/         ← Page structure
│   │   │   ├── sidebar.tsx        ← The left navigation panel
│   │   │   └── main-content.tsx   ← The main content area (adjusts width for sidebar)
│   │   ├── 📂 ui/             ← Reusable UI elements
│   │   │   ├── bento-grid.tsx     ← The grid layout for dashboard cards
│   │   │   ├── bento-card.tsx     ← A single card in the grid
│   │   │   └── skeleton.tsx       ← Loading placeholders (pulsing gray shapes)
│   │   └── 📂 providers/      ← App-wide services
│   │       ├── lenis-provider.tsx  ← Smooth scrolling engine
│   │       └── store-provider.tsx  ← State management setup
│   │
│   ├── 📂 hooks/              ← Custom React hooks
│   │   └── use-dashboard.ts       ← Fetches all dashboard data in one go
│   │
│   ├── 📂 stores/             ← State management (Zustand)
│   │   ├── sidebar-store.ts       ← Tracks sidebar open/collapsed state
│   │   └── theme-store.ts         ← Tracks light/dark theme
│   │
│   └── 📂 generated/          ← Auto-generated code (don't edit)
│       └── prisma/                ← Prisma Client (generated by `npx prisma generate`)
```

---

## 📋 Useful Commands

Here are the most important commands you can run in the terminal (from the project folder):

### Database Commands

| Command | What It Does |
|---------|-------------|
| `npm run db:seed` | Fill the database with sample data (50 products, 350 users, 1,200 orders) |
| `npm run db:reset` | Wipe and recreate the database from scratch |
| `npm run db:migrate` | Apply any pending database changes |
| `npm run db:studio` | Open a visual database browser in your browser |
| `npm run db:generate` | Regenerate the database client code |
| `npx prisma studio` | Same as above — browse data visually |

### Docker Commands

| Command | What It Does |
|---------|-------------|
| `npm run start:docker` | Start the PostgreSQL database (in Docker) |
| `npm run stop:docker` | Stop the PostgreSQL database |
| `docker compose down` | Stop and remove the database container |
| `docker compose down -v` | Stop, remove container, AND delete all data |

### Development Commands

| Command | What It Does |
|---------|-------------|
| `npm run dev` | Start the dashboard on http://localhost:3000 (with live updates) |
| `npm run build` | Build the dashboard for production |
| `npm run start` | Run the production build |
| `npm run lint` | Check code for style issues |
| `npx tsc --noEmit` | Check code for type errors |

---

## 🎬 One-Click Startup Scripts

Three startup scripts are included for convenience:

### `start-simple.bat` (The Easy One)
- Double-click to run
- Runs everything in sequence: install → Docker → migrate → seed → dev
- No error handling, just goes step by step
- **Best for:** First-time users who just want to see the dashboard

### `start.bat` (The Smart One)
- Double-click to run
- Checks that Node.js and Docker are installed before starting
- Starts Docker Desktop automatically if it's not running
- Waits for PostgreSQL to be ready (health check loop)
- Only seeds if the database is empty (won't overwrite your data)
- **Best for:** Daily use — it handles edge cases

### `start.ps1` (PowerShell — Fancy Output)
- Right-click → "Run with PowerShell"
- Same logic as `start.bat` but with colored, formatted output
- Shows progress steps with icons (✓, ✗, !)
- **Best for:** Users who prefer PowerShell

---

## 🔧 Troubleshooting

### "Port 3000 is already in use"

Something else is already running on port 3000 (maybe a previous instance of the dashboard).

**Fix:** 
```bash
# On Windows (in PowerShell):
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess
# Note the PID, then:
Stop-Process -Id [PID] -Force
```

### "Database connection refused"

PostgreSQL isn't running. Make sure Docker Desktop is open and the container is started.

**Fix:**
```bash
npm run start:docker
# Or check with:
docker ps
```

### "PrismaClient is not generated"

The database client code hasn't been generated yet.

**Fix:**
```bash
npx prisma generate
```

### "Relation 'orders' does not exist"

The database tables haven't been created yet. You need to run migrations.

**Fix:**
```bash
npx prisma migrate dev
```

### "No seed data — dashboard shows 0s"

The database is empty. You need to run the seed script.

**Fix:**
```bash
npm run db:seed
```

### Server won't start (Turbopack errors on Windows)

If you see errors related to CSS imports starting with `nul`, this is a known issue with Turbopack (Next.js's fast bundler) on Windows.

**Fix:** This project uses Tailwind CSS v3, which avoids this issue. If you still see problems:
1. Stop the server (`Ctrl+C`)
2. Restart with: `npm run dev`
3. If that fails, try: `npx next dev --no-turbopack`

### Docker Desktop won't start

Docker Desktop can sometimes be slow to initialize.

**Fix:**
1. Open Docker Desktop manually from the Start Menu
2. Wait for the Docker icon in your system tray to stop animating
3. Then run `start-simple.bat` again

---

## 🙏 Need Help?

- **Dashboard:** Open [http://localhost:3000](http://localhost:3000) in your browser
- **Health Check:** [http://localhost:3000/api/status](http://localhost:3000/api/status) — shows if everything is working
- **Database Browser:** Run `npx prisma studio` to see all data in a visual interface
- **Documentation:** Check [codebuff.com/docs](https://codebuff.com/docs) for more info

---

*Built with ❤️ using Next.js, React, TypeScript, PostgreSQL, and Three.js.*
