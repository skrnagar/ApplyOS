"use client";
import { useState } from "react";
import useAuth from "@/utils/useAuth";
import { isSupabaseAuthEnabled } from "@/utils/authMode";
import AccountAuthShell from "@/components/auth/AccountAuthShell";
import { AccountInput } from "@/components/auth/AccountInput";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { requestPasswordReset } = useAuth();
  const supabaseAuth = isSupabaseAuthEnabled();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!email?.trim()) {
      setError("Enter your email address");
      setLoading(false);
      return;
    }
    try {
      await requestPasswordReset({ email: email.trim() });
      setSent(true);
    } catch (err) {
      if (err?.message === "EmailRequired") {
        setError("Enter your email address");
      } else {
        setError(err?.message || "Could not send reset email. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountAuthShell
      title="Reset your password"
      subtitle={
        sent
          ? "If an account exists for that email, we sent a reset link."
          : "We will email you a link to choose a new password."
      }
      backHref="/account/signin"
      backLabel="Sign in"
      banner={
        !supabaseAuth ? (
          <p className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 leading-relaxed">
            Password reset needs Supabase auth (
            <code className="text-xs">NEXT_PUBLIC_SUPABASE_*</code>).
          </p>
        ) : null
      }
    >
      {sent ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-neutral-600 leading-relaxed">
            If an account exists for that email, we sent a reset link. Check inbox and spam.
            The link opens this site where you can set a new password.
          </p>
          <p className="text-xs text-neutral-500 leading-relaxed">
            No email? Confirm you signed up with this address, add{" "}
            <code className="text-[11px] bg-neutral-100 px-1 rounded">RESEND_API_KEY</code> on
            Vercel for reliable delivery, and whitelist{" "}
            <code className="text-[11px] bg-neutral-100 px-1 rounded">/account/auth/callback</code>{" "}
            in Supabase → Authentication → URL Configuration.
          </p>
          <a
            href="/account/signin"
            className="inline-flex w-full justify-center py-3.5 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors"
          >
            Back to sign in
          </a>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <AccountInput
            id="forgot-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading || !supabaseAuth}
            className="w-full py-3.5 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </AccountAuthShell>
  );
}
