import "dotenv/config";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// ───────────────────────────────────────────────────────────────
//  Admin Seed — Creates the default admin account
// ───────────────────────────────────────────────────────────────
//  Run with: npx tsx prisma/admin-seed.ts
//
//  Credentials (change these in production!):
//    Email:    admin@ecomdash.com
//    Password: Admin@123456
// ───────────────────────────────────────────────────────────────

const ADMIN_EMAIL = "admin@ecomdash.com";
const ADMIN_PASSWORD = "Admin@123456";
const ADMIN_FIRST_NAME = "System";
const ADMIN_LAST_NAME = "Administrator";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("🔐 Admin seed starting...");

  // Check if admin already exists
  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existing) {
    console.log(`  Admin user already exists (${existing.email}). Updating role to ADMIN...`);
    await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: { role: "ADMIN" },
    });
    console.log("  ✓ Role updated to ADMIN");
    await prisma.$disconnect();
    process.exit(0);
  }

  // Create admin user
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

  const admin = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      passwordHash,
      firstName: ADMIN_FIRST_NAME,
      lastName: ADMIN_LAST_NAME,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log(`  ✓ Admin user created:`);
  console.log(`    Email:    ${admin.email}`);
  console.log(`    Password: ${ADMIN_PASSWORD}`);
  console.log(`    Role:     ${admin.role}`);
  console.log("\n  You can now log in at /login with these credentials.");

  await prisma.$disconnect();
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Admin seed failed:", e);
  process.exit(1);
});
