"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import useAuth from "@/utils/useAuth";
import { AccountInput } from "@/components/auth/AccountInput";

/**
 * On-site registration — same flow as `/account/signup` (server auth + local fallback).
 */
export default function NewUserSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!email?.trim() || !password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      setLoading(false);
      return;
    }
    try {
      await signUpWithCredentials({
        email: email.trim(),
        password,
        name: name.trim(),
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (err) {
      const msg =
        err?.message === "This email is already registered."
          ? "That email is already registered — try signing in."
          : err?.message || "Something went wrong. Try again or use the full sign-up page.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <section id="signup" className="py-20 md:py-28 scroll-mt-28 border-t border-neutral-200/80 bg-gradient-to-b from-white to-[#fafbfc]">
      <div className="container mx-auto px-5 sm:px-6 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-emerald-700 mb-4">
              New to HireOrbit
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 text-balance leading-tight">
              Create your account and open the dashboard in one step.
            </h2>
            <p className="mt-4 text-neutral-600 leading-relaxed max-w-md">
              Same secure flow as our dedicated sign-up page: email + password, then you land on your
              workspace. Works offline-first with local session when hosted auth isn&apos;t wired yet.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-neutral-700">
              {[
                "Resume upload & preferences inside the app",
                "Application tracker and assistant messaging",
                "Upgrade plans when you are ready",
              ].map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  {line}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-neutral-500">
              Prefer the full page?{" "}
              <a href="/account/signup" className="font-semibold text-emerald-700 hover:underline">
                Open sign-up
              </a>{" "}
              · Already registered?{" "}
              <a href="/account/signin" className="font-semibold text-neutral-800 hover:underline">
                Sign in
              </a>
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-8 shadow-[0_24px_64px_-32px_rgba(15,23,42,0.15)]"
          >
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">Start free</h3>
            <p className="text-sm text-neutral-500 mb-6">No credit card to explore the dashboard.</p>

            <form onSubmit={onSubmit} className="space-y-4">
              <AccountInput
                id="home-signup-name"
                label="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                autoComplete="name"
              />
              <AccountInput
                id="home-signup-email"
                label="Work email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
              />

              <div className="space-y-1.5">
                <label htmlFor="home-signup-password" className="text-sm font-medium text-neutral-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="home-signup-password"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="8+ characters"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-neutral-200 bg-neutral-50/80 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60"
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

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                {loading ? "Creating account…" : "Create account & go to dashboard"}
                {!loading ? <ArrowRight size={18} aria-hidden /> : null}
              </button>

              <p className="text-[11px] text-neutral-500 text-center leading-relaxed">
                By continuing you agree to our{" "}
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
