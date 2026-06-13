"use client";
import { useEffect, useState } from "react";
import useAuth from "@/utils/useAuth";
import useRedirectIfAuthenticated from "@/utils/useRedirectIfAuthenticated";
import { isServerAuthEnabled, isSupabaseAuthEnabled } from "@/utils/authMode";
import { metaForPath } from "@/utils/seo";

export function meta() {
  return metaForPath("/account/signup");
}
import { Eye, EyeOff, Calendar } from "lucide-react";
import AccountAuthShell from "@/components/auth/AccountAuthShell";
import { AccountInput } from "@/components/auth/AccountInput";
import { captureLead } from "@/utils/captureLead";
import { validateOptionalPhone } from "@/utils/phone";

const FIELD_ERRORS = {
  CredentialsSignin: "This email is already registered. Try signing in.",
  UserAlreadyRegistered: "This email is already registered. Try signing in.",
  AccessDenied: "Unable to create account. Please try again.",
  Configuration:
    "Authentication is not configured in production. Add NEXT_PUBLIC_SUPABASE_* (or AUTH_SECRET + database) and redeploy.",
  EmailConfirmationRequired:
    "Check your email to confirm your account before signing in. (You can disable email confirmation in Supabase for local dev.)",
};

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromLeadPopup, setFromLeadPopup] = useState(false);
  const { signUpWithCredentials } = useAuth();
  const serverAuth = isServerAuthEnabled();
  const supabaseAuth = isSupabaseAuthEnabled();
  const { checking } = useRedirectIfAuthenticated();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromEmail = params.get("email");
    const fromName = params.get("name");
    const fromPhone = params.get("phone");
    if (fromEmail) setEmail(fromEmail);
    if (fromName) setName(fromName);
    if (fromPhone) setPhone(fromPhone);
    if (params.get("from") === "lead_popup") setFromLeadPopup(true);

    const next = new URL(window.location.href);
    if (next.searchParams.has("from")) {
      next.searchParams.delete("from");
      window.history.replaceState({}, "", next.pathname + next.search);
    }
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!email?.trim() || !password) {
      setError("Please fill in email and password");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }
    const pv = validateOptionalPhone(phone);
    if (!pv.ok) {
      setError(pv.error);
      setLoading(false);
      return;
    }
    try {
      await captureLead({
        email: email.trim(),
        name: name.trim() || undefined,
        phone: pv.phone || undefined,
        source: "signup",
      });
      await signUpWithCredentials({
        email: email.trim(),
        password,
        name: name.trim(),
        phone: pv.phone,
        redirect: true,
      });
    } catch (err) {
      setError(
        FIELD_ERRORS[err?.message] ||
          (err?.message === "This email is already registered."
            ? err.message
            : null) ||
          err?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-3">
        <div
          className="h-10 w-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"
          aria-hidden
        />
        <p className="text-sm text-neutral-500">Opening your workspace…</p>
      </div>
    );
  }

  return (
    <AccountAuthShell
      title="Create your account"
      subtitle="Launch your job search pipeline with HireOrbital."
      backHref="/"
      backLabel="Home"
      secondaryBackHref="/account/signin"
      secondaryBackLabel="Sign in"
      banner={
        fromLeadPopup ? (
          <p className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950 leading-relaxed">
            You&apos;re one step away — create a password to start your job search pipeline.
          </p>
        ) : !serverAuth && !supabaseAuth ? (
          <p className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 leading-relaxed">
            Demo mode: your account is saved in this browser until you configure Supabase (
            <code className="text-xs">NEXT_PUBLIC_SUPABASE_*</code>) or server auth (
            <code className="text-xs">AUTH_SECRET</code> + database).
          </p>
        ) : null
      }
      footer={
        <>
          <p>
            Already have an account?{" "}
            <a href="/account/signin" className="font-semibold text-emerald-700 hover:text-emerald-800">
              Sign in
            </a>
          </p>
          <p className="mt-4">
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 font-semibold text-neutral-700 hover:text-emerald-800"
            >
              <Calendar size={16} aria-hidden />
              Schedule a call
            </a>
          </p>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <AccountInput
          id="signup-name"
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Alex Morgan"
          autoComplete="name"
        />

        <AccountInput
          id="signup-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />

        <AccountInput
          id="signup-phone"
          label="Mobile number (optional)"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 555 123 4567"
          autoComplete="tel"
        />

        <div className="space-y-1.5">
          <label htmlFor="signup-password" className="text-sm font-medium text-neutral-700">
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-neutral-200 bg-neutral-50/80 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60 transition-shadow"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-neutral-500 hover:text-neutral-800 rounded-lg"
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? "Creating account…" : "Create free account"}
        </button>

        <p className="text-center text-xs text-neutral-500 leading-relaxed">
          By signing up, you agree to our{" "}
          <a href="/contact#terms" className="text-emerald-700 font-medium hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="/contact#privacy" className="text-emerald-700 font-medium hover:underline">
            Privacy
          </a>
          .
        </p>
      </form>
    </AccountAuthShell>
  );
}
