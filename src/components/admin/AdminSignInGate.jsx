"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Shield, Lock, LogIn, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import useAuth from "@/utils/useAuth";
import { isSupabaseAuthEnabled } from "@/utils/authMode";
import { getAdminSecret, setAdminSecret } from "@/utils/adminClient";
import { Link } from "react-router";

const AUTH_ERRORS = {
  CredentialsSignin:
    "Incorrect email or password. Your account must exist in Supabase Authentication (Dashboard → Authentication → Users) — not only in the profiles table.",
  EmailNotConfirmed:
    "Confirm your email first. Check your inbox, then try signing in again.",
  Configuration:
    "Supabase is not configured on this site. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, then redeploy.",
  SessionNotEstablished:
    "Sign-in succeeded but the session did not start. Try the main sign-in page or clear site cookies.",
};

function mapAuthError(message) {
  return AUTH_ERRORS[message] || message || "Sign-in failed. Please try again.";
}

export default function AdminSignInGate({
  authUser,
  initialError = null,
  initialHint = null,
  onUnlocked,
  onSecretUnlock,
  verifyAdminAccess,
}) {
  const { signInWithCredentials, signOut } = useAuth();
  const supabaseAuth = isSupabaseAuthEnabled();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(initialError);
  const [errorHint, setErrorHint] = useState(initialHint);
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [showSecretLogin, setShowSecretLogin] = useState(false);
  const [secretInput, setSecretInput] = useState("");

  useEffect(() => {
    if (authUser?.email && !email) setEmail(authUser.email);
  }, [authUser?.email, email]);

  useEffect(() => {
    if (initialError) setError(initialError);
    if (initialHint) setErrorHint(initialHint);
  }, [initialError, initialHint]);

  const runAdminCheck = async (signedInEmail) => {
    setChecking(true);
    setError(null);
    setErrorHint(null);
    try {
      const session = await verifyAdminAccess();
      if (session?.admin) {
        onUnlocked(session.email || signedInEmail || authUser?.email);
        return true;
      }
      const who = signedInEmail || authUser?.email || email.trim();
      setError(session?.error || "This account does not have admin access.");
      setErrorHint(
        session?.hint ||
          (who
            ? `In Supabase SQL Editor run: update public.profiles set is_admin = true where lower(email) = lower('${who}');`
            : "Grant admin in Supabase: profiles.is_admin = true for your email."),
      );
      return false;
    } finally {
      setChecking(false);
    }
  };

  const onInlineSignIn = async (e) => {
    e.preventDefault();
    setSigningIn(true);
    setError(null);
    setErrorHint(null);
    try {
      await signInWithCredentials({
        email: email.trim(),
        password,
        redirect: false,
      });
      await runAdminCheck(email.trim());
    } catch (err) {
      setError(mapAuthError(err?.message));
      if (err?.message === "CredentialsSignin") {
        setErrorHint(
          "is_admin on profiles does not replace sign-in. Create the user under Supabase → Authentication, or reset the password if you forgot it.",
        );
      }
    } finally {
      setSigningIn(false);
    }
  };

  const onSecretSubmit = (e) => {
    e.preventDefault();
    if (!secretInput.trim()) return;
    setAdminSecret(secretInput.trim());
    onSecretUnlock();
    setSecretInput("");
    setError(null);
  };

  const signedInEmail = authUser?.email;
  const signInHref = `/account/signin?callbackUrl=${encodeURIComponent("/admin")}${email.trim() ? `&email=${encodeURIComponent(email.trim())}` : ""}`;

  return (
    <motion.div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
            <Shield className="text-emerald-700" size={24} />
          </div>
          <h1 className="text-xl font-semibold text-neutral-900">HireOrbital Admin</h1>
          <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
            Two steps: <strong>sign in</strong> with your Supabase account, then your email must
            have <code className="text-xs bg-neutral-100 px-1 rounded">profiles.is_admin = true</code>.
          </p>

          <div className="mt-5 grid gap-2 text-xs text-neutral-600">
            <div className="flex gap-2 items-start rounded-lg bg-neutral-50 border border-neutral-100 px-3 py-2">
              <span className="font-bold text-emerald-700 shrink-0">1</span>
              <span>Sign in — same email/password as the main app (Supabase Auth).</span>
            </div>
            <div className="flex gap-2 items-start rounded-lg bg-neutral-50 border border-neutral-100 px-3 py-2">
              <span className="font-bold text-emerald-700 shrink-0">2</span>
              <span>
                Admin flag — in Supabase SQL:{" "}
                <code className="block mt-1 text-[10px] bg-white px-1.5 py-1 rounded border border-neutral-200 break-all">
                  update public.profiles set is_admin = true where email = &apos;you@email.com&apos;;
                </code>
              </span>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 space-y-1">
              <p className="font-medium flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {error}
              </p>
              {errorHint && <p className="text-xs text-red-900/85 pl-6">{errorHint}</p>}
            </div>
          )}

          {signedInEmail ? (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 space-y-3">
              <p className="text-sm text-emerald-900 flex items-center gap-2">
                <CheckCircle2 size={16} />
                Signed in as <strong>{signedInEmail}</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  disabled={checking}
                  onClick={() => runAdminCheck(signedInEmail)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {checking ? "Checking access…" : "Continue to admin"}
                </button>
                <button
                  type="button"
                  onClick={() => signOut({ redirect: false }).then(() => window.location.reload())}
                  className="px-4 py-2.5 rounded-xl border border-emerald-300 text-sm text-emerald-900 hover:bg-white"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : supabaseAuth ? (
            <div className="mt-6 space-y-3">
              <Link
                to={signInHref}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-neutral-900 text-white font-semibold text-sm hover:bg-neutral-800"
              >
                <LogIn size={18} />
                Sign in on main page
              </Link>
              <p className="text-xs text-center text-neutral-500">
                Recommended — returns here automatically after sign-in.
              </p>
              <button
                type="button"
                onClick={() => setShowInlineForm((v) => !v)}
                className="w-full text-xs text-neutral-500 hover:text-neutral-800 py-1"
              >
                {showInlineForm ? "Hide" : "Sign in here instead"}
              </button>
            </div>
          ) : (
            <p className="mt-5 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              Configure <code className="text-xs">NEXT_PUBLIC_SUPABASE_*</code> in .env.local or
              Vercel, then redeploy.
            </p>
          )}

          {showInlineForm && supabaseAuth && !signedInEmail && (
            <form onSubmit={onInlineSignIn} className="mt-4 space-y-3 pt-4 border-t border-neutral-100">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm"
                autoComplete="email"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm"
                autoComplete="current-password"
                required
              />
              <button
                type="submit"
                disabled={signingIn}
                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50"
              >
                {signingIn ? "Signing in…" : "Sign in"}
              </button>
              <p className="text-xs text-center">
                <Link to="/account/forgot-password" className="text-emerald-700 hover:underline">
                  Forgot password?
                </Link>
              </p>
            </form>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowSecretLogin((v) => !v)}
          className="w-full text-xs text-neutral-500 hover:text-neutral-800 flex items-center justify-center gap-1"
        >
          <KeyRound size={14} />
          {showSecretLogin ? "Hide" : "Use"} legacy admin secret
        </button>

        {showSecretLogin && (
          <form
            onSubmit={onSecretSubmit}
            className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <Lock className="text-neutral-500" size={18} />
              <span className="text-sm font-medium text-neutral-800">Admin secret</span>
            </div>
            <input
              type="password"
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              placeholder="ADMIN_SECRET from server env"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 mb-3 text-sm"
              autoComplete="off"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl border border-neutral-300 text-sm font-medium hover:bg-neutral-50"
            >
              Unlock with secret
            </button>
            {getAdminSecret() ? (
              <p className="text-xs text-neutral-500 mt-2">Secret is stored for this browser tab.</p>
            ) : null}
          </form>
        )}
      </div>
    </motion.div>
  );
}
