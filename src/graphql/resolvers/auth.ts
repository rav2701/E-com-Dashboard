import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import type { GraphQLContext } from "../context";

// ───────────────────────────────────────────────────────────────
//  JWT config
// ───────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || "fallback-dev-secret-change-me";
const JWT_EXPIRES_IN = "7d";

// ───────────────────────────────────────────────────────────────
//  Helpers
// ───────────────────────────────────────────────────────────────

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

function signToken(userId: string, email: string, role: string): string {
  return jwt.sign({ userId, email, role } satisfies JwtPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

// ───────────────────────────────────────────────────────────────
//  Resolvers
// ───────────────────────────────────────────────────────────────

interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface ForgotPasswordInput {
  email: string;
}

/**
 * Register a new user.
 * Validates that the email is not already taken, hashes the password,
 * creates the user, and returns a JWT token.
 */
export async function register(
  _parent: unknown,
  args: { input: RegisterInput },
  _ctx: GraphQLContext
) {
  const { firstName, lastName, email, password } = args.input;
  const normalizedEmail = email.toLowerCase().trim();

  // Check for existing user
  const existing = await db.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    throw new Error("An account with this email already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
  const user = await db.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      firstName,
      lastName,
    },
  });

  // Sign JWT
  const token = signToken(user.id, user.email, user.role);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    },
  };
}

/**
 * Authenticate a user with email and password.
 * Verifies credentials, updates lastLoginAt, and returns a JWT token.
 */
export async function login(
  _parent: unknown,
  args: { input: LoginInput },
  _ctx: GraphQLContext
) {
  const { email, password } = args.input;
  const normalizedEmail = email.toLowerCase().trim();

  // Find user
  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check if account is active
  if (!user.isActive) {
    throw new Error("This account has been deactivated");
  }

  // Verify password
  if (!user.passwordHash) {
    throw new Error(
      "This account does not have a password set. Please use the forgot password option."
    );
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error("Invalid email or password");
  }

  // Update last login
  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Sign JWT
  const token = signToken(user.id, user.email, user.role);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    },
  };
}

/**
 * Initiate password reset flow.
 * Always returns true to prevent email enumeration attacks.
 */
export async function forgotPassword(
  _parent: unknown,
  args: { input: ForgotPasswordInput },
  _ctx: GraphQLContext
) {
  const { email } = args.input;
  const normalizedEmail = email.toLowerCase().trim();

  // Look up user (don't reveal if they exist)
  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (user) {
    // In production, send a password reset email here
    // For now, log the event (would integrate with an email service)
    console.log(
      `[forgot-password] Reset requested for ${normalizedEmail}`
    );
  }

  // Always return true to prevent email enumeration
  return true;
}

/**
 * Returns the currently authenticated user's profile.
 * The user ID is extracted from the JWT in the context.
 */
export async function me(
  _parent: unknown,
  _args: unknown,
  ctx: GraphQLContext
) {
  if (!ctx.userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: ctx.userId },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}
