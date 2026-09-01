"use client";
import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, ArrowUpRight } from "lucide-react";
import { SITE_NAME } from "@/config/site";
import {
  WHATSAPP_TOPICS,
  buildWhatsAppUrl,
  isSupportOnline,
  isWhatsAppConfigured,
  supportHoursLabel,
  whatsAppDisplayNumber,
} from "@/utils/whatsapp";

const NUDGE_KEY = "hireorbital_whatsapp_nudge_dismissed";
const NUDGE_DELAY_MS = 0;

function useIsMounted() {
  return useSyncExternalStore(
    () => () => { },
    () => true,
    () => false,
  );
}

function nudgeDismissed() {
  if (typeof window === "undefined") return true;
  try {
    return sessionStorage.getItem(NUDGE_KEY) === "1";
  } catch {
    return false;
  }
}

function dismissNudge() {
  try {
    sessionStorage.setItem(NUDGE_KEY, "1");
  } catch {
    /* private mode — the nudge simply returns next load */
  }
}

/** Official WhatsApp glyph — lucide has no brand mark. */
function WhatsAppGlyph({ size = 26, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.174.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.15-.174.199-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.896 9.83 9.83 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.945c0 2.096.549 4.14 1.595 5.945L0 24l6.305-1.654a11.9 11.9 0 0 0 5.683 1.448h.005c6.582 0 11.941-5.359 11.944-11.945a11.86 11.86 0 0 0-3.417-8.4" />
    </svg>
  );
}

export default function WhatsAppWidget({ context = "the HireOrbital website" }) {
  const mounted = useIsMounted();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [message, setMessage] = useState("");
  const [online, setOnline] = useState(false);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const textareaRef = useRef(null);

  // Resolve online state on the client only — server and client clocks differ,
  // and rendering it during SSR would cause a hydration mismatch.
  useEffect(() => {
    const sync = () => setOnline(isSupportOnline());
    sync();
    const id = window.setInterval(sync, 60_000);
    return () => window.clearInterval(id);
  }, []);

  // First-visit nudge bubble, once per session.
  useEffect(() => {
    if (nudgeDismissed()) return;
    const timer = window.setTimeout(() => setShowNudge(true), NUDGE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const closeNudge = useCallback(() => {
    dismissNudge();
    setShowNudge(false);
  }, []);

  const close = useCallback(({ restoreFocus = true } = {}) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }, []);

  const toggle = useCallback(() => {
    closeNudge();
    setOpen((prev) => !prev);
  }, [closeNudge]);

  // Escape to close + click-outside, and move focus into the panel on open.
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    const onPointerDown = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      if (buttonRef.current?.contains(e.target)) return;
      close({ restoreFocus: false });
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);

    const focusTimer = window.setTimeout(() => textareaRef.current?.focus(), 220);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
      window.clearTimeout(focusTimer);
    };
  }, [open, close]);

  const openChat = useCallback(
    (text) => {
      const url = buildWhatsAppUrl(text, { context });
      const win = window.open(url, "_blank", "noopener,noreferrer");
      // Popup blockers return null — fall back to a same-tab navigation.
      if (!win) window.location.href = url;
      setMessage("");
      close({ restoreFocus: false });
    },
    [context, close],
  );

  const onSubmit = (e) => {
    e.preventDefault();
    openChat(message.trim() || `Hi ${SITE_NAME} team, I have a question.`);
  };

  // Enter sends, Shift+Enter adds a newline — matches chat conventions.
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  if (!isWhatsAppConfigured()) {
    if (import.meta.env.DEV && mounted) {
      console.warn(
        "[WhatsAppWidget] hidden — set NEXT_PUBLIC_WHATSAPP_NUMBER (digits only, country code first) or WHATSAPP_NUMBER in src/config/site.js.",
      );
    }
    return null;
  }
  if (!mounted) return null;

  return createPortal(
    <div className="fixed right-4 md:right-6 z-[52] flex flex-col items-end gap-3 pointer-events-none bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:bottom-6">
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label={`Chat with ${SITE_NAME} on WhatsApp`}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            style={{ transformOrigin: "bottom right" }}
            className="pointer-events-auto w-[calc(100vw-2rem)] max-w-[22rem] overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-[0_24px_60px_-16px_rgba(15,23,42,0.35)]"
          >
            <div className="relative bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 px-4 py-4 text-white">
              <button
                type="button"
                onClick={() => close()}
                className="absolute top-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 hover:text-white"
                aria-label="Close chat"
              >
                <X size={17} />
              </button>

              <div className="flex items-center gap-3 pr-10">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
                  <WhatsAppGlyph size={24} className="text-white" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{SITE_NAME} Support</p>
                  <p className="flex items-center gap-1.5 text-[11px] text-emerald-50/90">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${online ? "bg-emerald-300" : "bg-amber-300"
                        }`}
                      aria-hidden
                    />
                    {online ? "Online now" : "Away — we reply next working hour"}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 pt-4">
              <div className="rounded-2xl rounded-tl-sm border border-neutral-200 bg-neutral-50 px-3.5 py-3 text-sm leading-relaxed text-neutral-700">
                Hi there 👋 Ask us anything about applications, pricing, or your
                resume — we usually reply within a few minutes.
              </div>
              <p className="mt-2 px-1 text-[11px] text-neutral-400">
                {supportHoursLabel()}
              </p>
            </div>

            <div className="px-4 pt-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                Popular questions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {WHATSAPP_TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => openChat(topic.message)}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 transition-colors hover:border-emerald-300 hover:bg-emerald-100"
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={onSubmit} className="p-4 pt-3">
              <label htmlFor={`${panelId}-message`} className="sr-only">
                Your message
              </label>
              <div className="flex items-end gap-2 rounded-xl border border-neutral-200 bg-white p-1.5 transition-shadow focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/25">
                <textarea
                  id={`${panelId}-message`}
                  ref={textareaRef}
                  rows={1}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Type your message…"
                  maxLength={900}
                  className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-base leading-snug text-neutral-900 outline-none placeholder:text-neutral-400 sm:text-sm"
                />
                <button
                  type="submit"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white transition-colors hover:bg-emerald-700 active:bg-emerald-800"
                  aria-label="Send on WhatsApp"
                >
                  <Send size={16} aria-hidden />
                </button>
              </div>
              <p className="mt-2 flex items-center gap-1 text-[11px] text-neutral-400">
                <ArrowUpRight size={12} aria-hidden />
                Opens WhatsApp · {whatsAppDisplayNumber()}
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNudge && !open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="pointer-events-auto relative max-w-[15rem] rounded-2xl rounded-br-sm border border-neutral-200 bg-white py-2.5 pl-3.5 pr-8 text-[13px] leading-snug text-neutral-700 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.3)]"
          >
            <button
              type="button"
              onClick={toggle}
              className="text-left after:absolute after:inset-0 after:content-['']"
            >
              Questions about your job search? Chat with us on WhatsApp.
            </button>
            <button
              type="button"
              onClick={closeNudge}
              className="absolute top-1.5 right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
              aria-label="Dismiss"
            >
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={open ? "Close WhatsApp chat" : "Chat with us on WhatsApp"}
        className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-900/25 ring-4 ring-white transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-emerald-600 active:scale-95"
      >
        {!open && !showNudge && (
          <span
            className="absolute inset-0 rounded-full bg-[#25D366] motion-safe:animate-ping motion-safe:[animation-duration:2.4s]"
            aria-hidden
          />
        )}
        <span className="relative flex items-center justify-center">
          {open ? <X size={24} /> : <WhatsAppGlyph size={27} />}
        </span>
      </button>
    </div>,
    document.body,
  );
}
