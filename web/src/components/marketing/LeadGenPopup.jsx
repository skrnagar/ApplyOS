"use client";
import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router";
import { X, ArrowRight, Sparkles } from "lucide-react";
import useUser from "@/utils/useUser";
import { getLocalSession } from "@/utils/localAuth";
import LeadGenPopupProof from "./LeadGenPopupProof";
import { captureLead } from "@/utils/captureLead";

const STORAGE_KEY = "hireorbit_lead_popup_dismissed";
const LEADS_KEY = "hireorbit_lead_captures";
const DELAY_MS = 3500;

function shouldShowOnPath(pathname) {
  if (!pathname) return false;
  if (pathname.startsWith("/account")) return false;
  if (pathname.startsWith("/dashboard")) return false;
  if (pathname.startsWith("/api")) return false;
  return true;
}

function isDismissed() {
  if (typeof window === "undefined") return true;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const { until } = JSON.parse(raw);
    return typeof until === "number" && Date.now() < until;
  } catch {
    return false;
  }
}

function dismissPopup() {
  const until = Date.now() + 1000 * 60 * 60 * 24;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ until }));
}

function saveLead({ email, name }) {
  const entry = {
    email,
    name: name || "",
    capturedAt: new Date().toISOString(),
    source: "lead_popup",
  };
  try {
    const existing = JSON.parse(localStorage.getItem(LEADS_KEY) || "[]");
    const list = Array.isArray(existing) ? existing : [];
    if (!list.some((l) => l.email === email)) {
      list.push(entry);
      localStorage.setItem(LEADS_KEY, JSON.stringify(list.slice(-50)));
    }
  } catch {
    localStorage.setItem(LEADS_KEY, JSON.stringify([entry]));
  }
}

export default function LeadGenPopup() {
  const { pathname } = useLocation();
  const { data: user, loading } = useUser();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const close = useCallback(() => {
    dismissPopup();
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!shouldShowOnPath(pathname)) return;
    if (isDismissed()) return;
    if (loading) return;
    if (user || getLocalSession()) return;

    const delay = DELAY_MS + Math.floor(Math.random() * 500);
    const timer = window.setTimeout(() => {
      if (!isDismissed() && shouldShowOnPath(window.location.pathname)) {
        setOpen(true);
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [pathname, loading, user]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email.");
      return;
    }
    setSubmitting(true);
    saveLead({ email: trimmed, name: name.trim() });
    await captureLead({
      email: trimmed,
      name: name.trim() || undefined,
      source: "lead_popup",
    });
    setSubmitted(true);
    setSubmitting(false);
    window.setTimeout(() => {
      const params = new URLSearchParams({ email: trimmed });
      if (name.trim()) params.set("name", name.trim());
      window.location.href = `/account/signup?${params.toString()}`;
    }, 900);
  };

  if (!shouldShowOnPath(pathname)) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="lead-popup-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-6"
        >
          <button
            type="button"
            className="absolute inset-0 bg-neutral-900/55 backdrop-blur-[2px]"
            aria-label="Close popup"
            onClick={close}
          />

          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative w-full max-w-md sm:max-w-lg max-h-[min(92vh,680px)] overflow-y-auto rounded-2xl sm:rounded-3xl border border-neutral-200/90 bg-white shadow-[0_32px_80px_-24px_rgba(15,23,42,0.35)]"
          >
            <button
              type="button"
              onClick={close}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 shadow-sm"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="p-5 sm:p-6 border-b border-neutral-100 bg-gradient-to-b from-[#f0f4f8] to-white">
              <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-neutral-500 mb-1 pr-10">
                Straight from our DMs
              </p>
              <p className="text-sm font-semibold text-neutral-900 mb-4 leading-snug">
                Real chatter from people dodging burnout.
              </p>
              <LeadGenPopupProof />
            </div>

            <div className="p-5 sm:p-6">
              <div className="inline-flex items-center gap-1.5 w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 mb-3">
                <Sparkles size={12} aria-hidden />
                Free to start
              </div>

              <h2
                id="lead-popup-title"
                className="text-xl font-semibold tracking-tight text-neutral-900 text-balance"
              >
                We apply to jobs so you don&apos;t have to.
              </h2>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                Curated applications, human review, and daily pipeline updates.
              </p>

              {submitted ? (
                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-900 text-sm">
                  You&apos;re in — taking you to create your account…
                </div>
              ) : (
                <form onSubmit={onSubmit} className="mt-5 space-y-3">
                  <div>
                    <label htmlFor="lead-name" className="sr-only">
                      Name
                    </label>
                    <input
                      id="lead-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      autoComplete="name"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/80 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="lead-email" className="sr-only">
                      Email
                    </label>
                    <input
                      id="lead-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      required
                      autoComplete="email"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/80 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60 text-sm"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-60 shadow-sm"
                  >
                    {submitting ? "Saving…" : "Start free — claim your pipeline"}
                    <ArrowRight size={16} aria-hidden />
                  </button>
                </form>
              )}

              <p className="mt-4 text-[11px] text-neutral-500 leading-relaxed">
                No spam. Prefer a human?{" "}
                <a
                  href="/contact#schedule"
                  className="font-semibold text-emerald-700 hover:underline"
                  onClick={close}
                >
                  Schedule a call
                </a>
                .
              </p>

              <button
                type="button"
                onClick={close}
                className="mt-3 text-xs text-neutral-400 hover:text-neutral-600"
              >
                Not now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
