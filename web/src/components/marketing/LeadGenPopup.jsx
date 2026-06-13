"use client";
import React, { useCallback, useEffect, useId, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useLocation, useNavigate } from "react-router";
import { X, ArrowRight, Sparkles } from "lucide-react";
import useUser from "@/utils/useUser";
import { getLocalSession } from "@/utils/localAuth";
import LeadGenPopupPreview from "./LeadGenPopupPreview";
import { captureLead } from "@/utils/captureLead";
import { validateOptionalPhone } from "@/utils/phone";

const STORAGE_KEY = "hireorbital_lead_popup_dismissed";
const LEADS_KEY = "hireorbital_lead_captures";
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

function saveLead({ email, name, phone }) {
  const entry = {
    email,
    name: name || "",
    phone: phone || "",
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

const inputClass =
  "w-full px-4 py-3 min-h-[48px] rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-shadow";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function LeadGenPopup() {
  const formId = useId();
  const mounted = useIsMounted();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { data: user, loading } = useUser();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState("/account/signup");
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
      setError("Enter a valid email address.");
      return;
    }
    const pv = validateOptionalPhone(phone);
    if (!pv.ok) {
      setError(pv.error);
      return;
    }
    setSubmitting(true);
    saveLead({ email: trimmed, name: name.trim(), phone: pv.phone });
    const leadResult = await captureLead({
      email: trimmed,
      name: name.trim() || undefined,
      phone: pv.phone || undefined,
      source: "lead_popup",
    });
    if (!leadResult.stored && leadResult.error) {
      console.warn("Lead capture:", leadResult.error);
    }

    const hasAccount = leadResult.ok && leadResult.accountExists === true;
    const authPath = hasAccount ? "/account/signin" : "/account/signup";
    setRedirectTarget(authPath);

    const params = new URLSearchParams({
      email: trimmed,
      callbackUrl: "/dashboard",
    });
    if (!hasAccount && name.trim()) params.set("name", name.trim());
    if (pv.phone) params.set("phone", pv.phone);
    params.set("from", "lead_popup");

    setSubmitted(true);
    setSubmitting(false);
    dismissPopup();
    setOpen(false);

    window.setTimeout(() => {
      navigate(`${authPath}?${params.toString()}`, { replace: true });
    }, 600);
  };

  if (!shouldShowOnPath(pathname) || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="lead-popup-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6"
        >
          <button
            type="button"
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            aria-label="Close popup"
            onClick={close}
          />

          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ type: "spring", stiffness: 400, damping: 34 }}
            className="relative w-full sm:max-w-xl md:max-w-3xl lg:max-w-4xl max-h-[92vh] sm:max-h-[min(90vh,640px)] overflow-hidden rounded-t-3xl sm:rounded-3xl border border-neutral-200/90 bg-white shadow-[0_32px_80px_-24px_rgba(15,23,42,0.4)] flex flex-col sm:flex-row"
          >
            <button
              type="button"
              onClick={close}
              className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-white/95 border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Visual panel — hidden on narrow phones, shown sm+ */}
            <div className="hidden sm:flex sm:w-[42%] md:w-[44%] flex-col justify-center bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-6 md:p-8 text-white shrink-0">
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-emerald-100/90 mb-2">
                Pipeline preview
              </p>
              <p className="text-lg md:text-xl font-semibold leading-snug text-balance mb-5 pr-6">
                See momentum in week one — not vanity metrics.
              </p>
              <div className="[&_*]:text-emerald-950 [&_p]:text-emerald-950/80">
                <LeadGenPopupPreview />
              </div>
            </div>

            {/* Form panel */}
            <div className="flex-1 overflow-y-auto overscroll-contain pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="p-5 sm:p-6 md:p-8">
                <div className="sm:hidden mb-4 pr-10">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 mb-3">
                    <Sparkles size={12} aria-hidden />
                    Free to start
                  </div>
                  <LeadGenPopupPreview compact />
                </div>

                <div className="hidden sm:block">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 mb-4">
                    <Sparkles size={12} aria-hidden />
                    Free to start
                  </div>
                </div>

                <h2
                  id="lead-popup-title"
                  className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 text-balance pr-8 sm:pr-0"
                >
                  We apply to jobs so you don&apos;t have to.
                </h2>
                <p className="mt-2 text-sm sm:text-[15px] text-neutral-600 leading-relaxed">
                  Curated applications, human review, and daily updates in your dashboard.
                </p>

                {submitted ? (
                  <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-900 text-sm">
                    {redirectTarget === "/account/signin"
                      ? "Welcome back — taking you to sign in…"
                      : "You're in — taking you to create your account…"}
                  </div>
                ) : (
                  <form id={formId} onSubmit={onSubmit} className="mt-6 space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="lead-name" className="block text-xs font-medium text-neutral-700">
                        Name <span className="text-neutral-400 font-normal">(optional)</span>
                      </label>
                      <input
                        id="lead-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Chen"
                        autoComplete="name"
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="lead-phone" className="block text-xs font-medium text-neutral-700">
                        Mobile number <span className="text-neutral-400 font-normal">(optional)</span>
                      </label>
                      <input
                        id="lead-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 555 123 4567"
                        autoComplete="tel"
                        inputMode="tel"
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="lead-email" className="block text-xs font-medium text-neutral-700">
                        Work or personal email
                      </label>
                      <input
                        id="lead-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        required
                        autoComplete="email"
                        inputMode="email"
                        className={inputClass}
                      />
                    </div>

                    {error && (
                      <p
                        role="alert"
                        className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5"
                      >
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full inline-flex items-center justify-center gap-2 min-h-[48px] py-3.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 active:bg-emerald-800 transition-colors disabled:opacity-60 shadow-sm"
                    >
                      {submitting ? "Saving…" : "Start free — open my dashboard"}
                      <ArrowRight size={16} aria-hidden />
                    </button>
                  </form>
                )}

                <p className="mt-4 text-xs text-neutral-500 leading-relaxed">
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
                  className="mt-4 w-full sm:w-auto text-sm text-neutral-400 hover:text-neutral-600 py-2 min-h-[44px] sm:min-h-0"
                >
                  Not now
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
