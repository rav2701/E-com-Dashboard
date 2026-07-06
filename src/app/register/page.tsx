"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, Loader2, CheckCircle } from "lucide-react";
import { AuthBackground } from "@/components/ui/auth-background";
import { graphql } from "@/lib/graphql";

// ───────────────────────────────────────────────────────────────
//  Validation schema
// ───────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Must include uppercase, lowercase, and a number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

// ───────────────────────────────────────────────────────────────
//  GraphQL mutation
// ───────────────────────────────────────────────────────────────

const REGISTER_MUTATION = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

// ───────────────────────────────────────────────────────────────
//  Page
// ───────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const parseName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || firstName;
    return { firstName, lastName };
  };

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const { firstName, lastName } = parseName(data.name);

      const response = await graphql<{
        register: { token: string; user: { id: string; email: string; firstName: string; lastName: string } };
      }>(REGISTER_MUTATION, {
        input: {
          firstName,
          lastName,
          email: data.email,
          password: data.password,
        },
      });

      // Store JWT token
      localStorage.setItem("ecomdash_token", response.data.register.token);

      // Show success screen
      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <AuthBackground />

        <div className="relative w-full max-w-md text-center">
          <div className="rounded-2xl bg-white/70 p-8 shadow-sm ring-1 ring-zinc-200/50 backdrop-blur-xl dark:bg-zinc-900/70 dark:ring-zinc-800/50">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 ring-1 ring-emerald-200/30 dark:ring-emerald-800/30">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Account created!
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Your account has been created successfully. You can now sign in.
            </p>
            <Link
              href="/login"
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all",
                "bg-gradient-to-r from-indigo-600 to-purple-600 text-white",
                "hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-indigo-500/25"
              )}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <AuthBackground />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <span className="text-lg font-bold text-white">ED</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Get started with EcomDash in minutes
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl bg-white/70 p-6 shadow-sm ring-1 ring-zinc-200/50 backdrop-blur-xl dark:bg-zinc-900/70 dark:ring-zinc-800/50 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Error banner */}
            {error && (
              <div className="rounded-xl bg-red-50/80 px-4 py-3 text-xs font-medium text-red-600 ring-1 ring-red-200/50 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-800/30">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                {...register("name")}
                className={cn(
                  "w-full rounded-xl border bg-white/80 px-4 py-2.5 text-sm transition-all",
                  "placeholder:text-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
                  "dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-indigo-500",
                  errors.name
                    ? "border-red-300 focus:border-red-400 focus:ring-red-500/20 dark:border-red-700"
                    : "border-zinc-200 dark:border-zinc-700"
                )}
              />
              {errors.name && (
                <p className="mt-1.5 text-[11px] font-medium text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
                className={cn(
                  "w-full rounded-xl border bg-white/80 px-4 py-2.5 text-sm transition-all",
                  "placeholder:text-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
                  "dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-indigo-500",
                  errors.email
                    ? "border-red-300 focus:border-red-400 focus:ring-red-500/20 dark:border-red-700"
                    : "border-zinc-200 dark:border-zinc-700"
                )}
              />
              {errors.email && (
                <p className="mt-1.5 text-[11px] font-medium text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  {...register("password")}
                  className={cn(
                    "w-full rounded-xl border bg-white/80 px-4 py-2.5 pr-10 text-sm transition-all",
                    "placeholder:text-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
                    "dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-indigo-500",
                    errors.password
                      ? "border-red-300 focus:border-red-400 focus:ring-red-500/20 dark:border-red-700"
                      : "border-zinc-200 dark:border-zinc-700"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-[11px] font-medium text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  {...register("confirmPassword")}
                  className={cn(
                    "w-full rounded-xl border bg-white/80 px-4 py-2.5 pr-10 text-sm transition-all",
                    "placeholder:text-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
                    "dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-indigo-500",
                    errors.confirmPassword
                      ? "border-red-300 focus:border-red-400 focus:ring-red-500/20 dark:border-red-700"
                      : "border-zinc-200 dark:border-zinc-700"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-[11px] font-medium text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                "bg-gradient-to-r from-indigo-600 to-purple-600 text-white",
                "hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-indigo-500/25",
                "disabled:cursor-not-allowed disabled:opacity-60"
              )}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
