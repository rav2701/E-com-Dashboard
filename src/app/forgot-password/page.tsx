"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, CheckCircle } from "lucide-react";
import { AuthBackground } from "@/components/ui/auth-background";
import { graphql } from "@/lib/graphql";

// ───────────────────────────────────────────────────────────────
//  Validation schema
// ───────────────────────────────────────────────────────────────

const forgotSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

// ───────────────────────────────────────────────────────────────
//  GraphQL mutation
// ───────────────────────────────────────────────────────────────

const FORGOT_PASSWORD_MUTATION = `
  mutation ForgotPassword($input: ForgotPasswordInput!) {
    forgotPassword(input: $input)
  }
`;

// ───────────────────────────────────────────────────────────────
//  Page
// ───────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await graphql<{ forgotPassword: boolean }>(FORGOT_PASSWORD_MUTATION, {
        input: { email: data.email },
      });

      setIsSubmitting(false);
      setIsSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  if (isSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <AuthBackground />

        <div className="relative w-full max-w-md text-center">
          <div className="rounded-2xl bg-white/70 p-8 shadow-sm ring-1 ring-zinc-200/50 backdrop-blur-xl dark:bg-zinc-900/70 dark:ring-zinc-800/50">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 ring-1 ring-emerald-200/30 dark:ring-emerald-800/30">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Check your email
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              We&apos;ve sent a password reset link to your email address. It may take a few minutes to arrive.
            </p>
            <Link
              href="/login"
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all",
                "bg-gradient-to-r from-indigo-600 to-purple-600 text-white",
                "hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-indigo-500/25"
              )}
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <AuthBackground />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <span className="text-lg font-bold text-white">ED</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Forgot password?
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Enter your email and we&apos;ll send you a reset link
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
                <Mail className="h-4 w-4" />
              )}
              {isSubmitting ? "Sending link..." : "Send reset link"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
