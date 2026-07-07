export const typeDefs = /* GraphQL */ `
  """
  Root queries for the analytics dashboard.
  """
  type Query {
    """
    Aggregated dashboard key performance indicators: gross volume,
    fulfillment rate, conversion ratio, AOV, and active user count.
    """
    getDashboardKPIs: DashboardKPIs!

    """
    Time-bucketed sales data for line/bar charts. Returns records
    grouped by DAY, WEEK, or MONTH over a date range.
    """
    getSalesTimeline(input: SalesTimelineInput!): [SalesTimelineBucket!]!

    """
    Top-performing products ranked by revenue, units sold, or rating.
    """
    getTopProducts(input: TopProductsInput!): [ProductRanking!]!

    """
    Most recent orders with customer and product details.
    """
    getRecentOrders(limit: Int = 6): [RecentOrder!]!

    """
    Traffic source breakdown aggregated from user signup metadata.
    """
    getTrafficSources: [TrafficSource!]!

    """
    Device type breakdown across order sessions.
    """
    getDeviceBreakdown: [DeviceBreakdown!]!

    """
    Active alerts: low-stock products, pending reviews, system notices.
    """
    getAlerts: [Alert!]!

    """
    Returns the currently authenticated user's profile.
    Requires a valid JWT in the Authorization header.
    """
    me: UserProfile

    """
    Revenue breakdown by product category, sorted by revenue descending.
    Returns up to 10 categories.
    """
    getCategoryPerformance: [CategoryPerformance!]!

    """
    All active products in the catalog with their primary image.
    """
    getAllProducts: [ProductCatalogItem!]!

    """
    All product categories with active product counts.
    """
    getAllCategories: [CategoryInfo!]!
  }

  """
  Root mutations for authentication.
  """
  type Mutation {
    """
    Register a new user account. Returns a JWT token and user profile.
    """
    register(input: RegisterInput!): AuthPayload!

    """
    Authenticate with email and password. Returns a JWT token and user profile.
    """
    login(input: LoginInput!): AuthPayload!

    """
    Send a password reset email. Always returns true to prevent email enumeration.
    """
    forgotPassword(input: ForgotPasswordInput!): Boolean!
  }

  """
  Input fields for user registration.
  """
  input RegisterInput {
    "User's first name."
    firstName: String!
    "User's last name."
    lastName: String!
    "User's email address (must be unique)."
    email: String!
    "User's password (min 8 characters)."
    password: String!
  }

  """
  Input fields for user login.
  """
  input LoginInput {
    "User's email address."
    email: String!
    "User's password."
    password: String!
  }

  """
  Input fields for password reset request.
  """
  input ForgotPasswordInput {
    "Email address to send reset link to."
    email: String!
  }

  """
  Authentication payload returned on successful login or registration.
  """
  type AuthPayload {
    "JWT bearer token for subsequent authenticated requests."
    token: String!
    "The authenticated user's profile."
    user: UserProfile!
  }

  """
  Public user profile information.
  """
  type UserProfile {
    "User's unique identifier."
    id: ID!
    "User's email address."
    email: String!
    "User's first name."
    firstName: String!
    "User's last name."
    lastName: String!
    "URL to user's avatar image."
    avatarUrl: String
    "Whether the user account is active."
    isActive: Boolean!
    "Timestamp of the user's last login."
    lastLoginAt: String
    "Timestamp when the account was created."
    createdAt: String!
  }

  "Aggregated dashboard key performance indicators."
  type DashboardKPIs {
    "Total gross revenue across all orders (sum of totals)."
    grossVolume: Float!
    "Total number of orders (all statuses)."
    totalOrders: Int!
    "Percentage of non-cancelled orders that were delivered (0-100)."
    fulfillmentRate: Float!
    "Percentage of orders that reached paid status (0-100)."
    conversionRate: Float!
    "Average total per order across all orders."
    averageOrderValue: Float!
    "Number of unique customers with at least one order."
    activeUsers: Int!
    "Breakdown of gross revenue by component."
    revenueBreakdown: RevenueBreakdown!
  }

  "Revenue broken down by component for the donut chart."
  type RevenueBreakdown {
    "Sum of order subtotals."
    subtotal: Float!
    "Sum of shipping costs."
    shipping: Float!
    "Sum of tax amounts."
    taxes: Float!
    "Sum of discounts applied."
    discounts: Float!
    "Subtotal minus discounts (net merchandise revenue)."
    netRevenue: Float!
  }

  "Aggregation interval for timeline bucketing."
  enum TimelineInterval {
    DAY
    WEEK
    MONTH
  }

  "Input filter for the sales timeline query."
  input SalesTimelineInput {
    "Bucket size: DAY, WEEK, or MONTH."
    interval: TimelineInterval!
    "Start date (ISO 8601). Defaults to 12 months ago."
    from: String
    "End date (ISO 8601). Defaults to today."
    to: String
  }

  "A single time bucket with aggregated metrics."
  type SalesTimelineBucket {
    "Bucket label (YYYY-MM-DD, YYYY-Www, or YYYY-MM)."
    date: String!
    "Total revenue in this bucket."
    revenue: Float!
    "Number of orders placed in this bucket."
    ordersCount: Int!
    "Total quantity of items sold in this bucket."
    itemsSold: Int!
    "Average order value in this bucket."
    averageOrderValue: Float!
  }

  "Sort criterion for product rankings."
  enum ProductSortBy {
    "Rank by total revenue generated."
    REVENUE
    "Rank by total units sold."
    UNITS_SOLD
    "Rank by average customer rating."
    RATING
  }

  "Filter and limit for top products."
  input TopProductsInput {
    "Maximum number of products to return (default 10, max 100)."
    limit: Int = 10
    "Sort field (default REVENUE)."
    sortBy: ProductSortBy = REVENUE
  }

  "A product with its aggregated sales performance metrics."
  type ProductRanking {
    "Product unique identifier."
    id: ID!
    "Stock keeping unit."
    sku: String!
    "Product display name."
    name: String!
    "Category name (first parent if nested)."
    category: String
    "Current base price."
    basePrice: Float!
    "Units remaining in stock."
    stockLevel: Int!
    "Total revenue generated by this product."
    totalRevenue: Float!
    "Total units sold across all orders."
    unitsSold: Int!
    "Number of distinct orders containing this product."
    orderCount: Int!
    "Average customer rating (0-5 scale)."
    ratingAvg: Float
  }

  "A single recent order with customer and product details."
  type RecentOrder {
    "Order unique identifier."
    id: ID!
    "Order number (human-readable)."
    orderNumber: String!
    "Customer's full name."
    customer: String!
    "Customer's email address."
    customerEmail: String!
    "Product name (first item)."
    product: String!
    "Order total."
    amount: Float!
    "Order status."
    status: String!
    "Date the order was placed."
    date: String!
  }

  "Traffic source with percentage share and visit count."
  type TrafficSource {
    "Source name (Direct, Organic, Social, Referral, Email)."
    source: String!
    "Percentage of total traffic (0-100)."
    percentage: Int!
    "Formatted visit count."
    visits: String!
  }

  "Device type breakdown for session analysis."
  type DeviceBreakdown {
    "Device type name."
    type: String!
    "Percentage of total sessions (0-100)."
    percentage: Int!
  }

  "An active alert or notification requiring attention."
  type Alert {
    "Alert severity level."
    level: String!
    "Alert title."
    title: String!
    "Alert description."
    description: String!
  }

  """
  A product in the catalog with its details and primary image.
  """
  type ProductCatalogItem {
    "Product unique identifier."
    id: ID!
    "Stock keeping unit."
    sku: String!
    "Product display name."
    name: String!
    "Category name."
    category: String
    "Current base price."
    basePrice: Float!
    "Original/comparison price before discount (if any)."
    compareAtPrice: Float
    "Units remaining in stock."
    stockLevel: Int!
    "Average customer rating (0-5 scale)."
    ratingAvg: Float
    "Number of customer reviews."
    reviewCount: Int!
    "Primary product image URL (extracted from images JSONB)."
    imageUrl: String
    "Product status (ACTIVE, DRAFT, ARCHIVED, DISCONTINUED)."
    status: String!
    "Product creation timestamp (ISO 8601)."
    createdAt: String!
  }

  "A product category with its product count."
  type CategoryInfo {
    "Category unique identifier."
    id: ID!
    "Category display name."
    name: String!
    "URL-friendly slug."
    slug: String!
    "Number of active products in this category."
    productCount: Int!
  }

  """
  Revenue aggregated by product category, computed from order items.
  """
  type CategoryPerformance {
    "Category name."
    name: String!
    "Total revenue from items in this category."
    revenue: Float!
    "Total units sold in this category."
    unitsSold: Int!
    "Number of orders containing items from this category."
    orderCount: Int!
    "Percentage of total revenue this category represents (0-100)."
    percentage: Float!
  }

`;
