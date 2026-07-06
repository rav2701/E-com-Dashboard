import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Singleton PrismaClient for Next.js App Router.
 * Prevents multiple instances during hot-reload in development.
 *
 * Uses @prisma/adapter-pg with a pg.Pool for Prisma v7 direct PostgreSQL connectivity.
 */
const globalForPrisma = globalThis as typeof globalThis & {
  __prisma?: PrismaClient;
};

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = db;
}

export type {
  User,
  Product,
  ProductCategory,
  Order,
  OrderItem,
  ProductStatus,
  OrderStatus,
  PaymentStatus,
  CurrencyCode,
} from "@/generated/prisma/client";
