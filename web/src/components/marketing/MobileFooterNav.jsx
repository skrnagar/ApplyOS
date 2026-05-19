"use client";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  Tag,
  Wrench,
  MessageCircle,
  LayoutGrid,
  X,
  LogIn,
  LayoutDashboard,
  Sparkles,
  HelpCircle,
  GitCompare,
} from "lucide-react";
import useUser from "@/utils/useUser";

const primaryTabs = [
  { label: "Home", href: "/", icon: Home, match: (p) => p === "/" },
  { label: "Pricing", href: "/pricing", icon: Tag, match: (p) => p === "/pricing" },
  { label: "Contact", href: "/contact", icon: MessageCircle, match: (p) => p === "/contact" },
];

const moreLinks = [
  { label: "Free tools", href: "/tools", icon: Wrench },
  { label: "How it works", href: "/#how-it-works", icon: Sparkles },
  { label: "The difference", href: "/#difference", icon: GitCompare },
  { label: "FAQ", href: "/#faq", icon: HelpCircle },
  { label: "Create account", href: "/#signup", icon: Sparkles },
];

function isMarketingPath(pathname) {
  if (!pathname) return false;
  if (pathname.startsWith("/account")) return false;
  if (pathname.startsWith("/dashboard")) return false;
  return true;
}

export default function MobileFooterNav() {
  const { pathname } = useLocation();
  const { data: user, loading } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const visible = isMarketingPath(pathname);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  if (!visible) return null;

  return (
    <>
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-neutral-900/40 md:hidden"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="More navigation"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="fixed inset-x-3 z-[56] md:hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_-8px_40px_rgba(15,23,42,0.12)] overflow-hidden"
              style={{ bottom: "calc(4.75rem + env(safe-area-inset-bottom, 0px))" }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                <p className="text-sm font-semibold text-neutral-900">Menu</p>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="p-2 max-h-[min(50vh,320px)] overflow-y-auto">
                {moreLinks.map(({ label, href, icon: Icon }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                  >
                    <Icon size={18} className="text-neutral-500 shrink-0" aria-hidden />
                    {label}
                  </a>
                ))}
                <div className="grid grid-cols-2 gap-2 p-2 pt-3 border-t border-neutral-100 mt-1">
                  {!loading && user ? (
                    <a
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-neutral-900"
                    >
                      <LayoutDashboard size={16} aria-hidden />
                      Dashboard
                    </a>
                  ) : (
                    <>
                      <a
                        href="/account/signin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold text-neutral-800 border border-neutral-200"
                      >
                        <LogIn size={16} aria-hidden />
                        Log in
                      </a>
                      <a
                        href="/account/signup"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600"
                      >
                        Sign up
                      </a>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav
        className="fixed inset-x-0 bottom-0 z-[54] md:hidden border-t border-neutral-200/90 bg-white/95 backdrop-blur-xl shadow-[0_-4px_24px_rgba(15,23,42,0.08)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Mobile navigation"
      >
        <div className="grid grid-cols-5 items-end px-1 pt-1 pb-1 max-w-lg mx-auto">
          {primaryTabs.slice(0, 2).map(({ label, href, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <a
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-0 py-1.5 rounded-lg transition-colors ${
                  active ? "text-emerald-700" : "text-neutral-500 hover:text-neutral-800"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={20} strokeWidth={active ? 2.25 : 1.75} aria-hidden />
                <span className="text-[10px] font-medium">{label}</span>
              </a>
            );
          })}

          <a
            href="/account/signup"
            className="flex flex-col items-center justify-center -mt-4"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/35 ring-4 ring-white">
              <Sparkles size={20} aria-hidden />
            </span>
            <span className="text-[10px] font-semibold text-emerald-800 mt-1">Start free</span>
          </a>

          {primaryTabs.slice(2).map(({ label, href, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <a
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-0 py-1.5 rounded-lg transition-colors ${
                  active ? "text-emerald-700" : "text-neutral-500 hover:text-neutral-800"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={20} strokeWidth={active ? 2.25 : 1.75} aria-hidden />
                <span className="text-[10px] font-medium">{label}</span>
              </a>
            );
          })}

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg transition-colors ${
              menuOpen ? "text-emerald-700" : "text-neutral-500 hover:text-neutral-800"
            }`}
            aria-expanded={menuOpen}
          >
            <LayoutGrid size={20} strokeWidth={menuOpen ? 2.25 : 1.75} aria-hidden />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
