"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import useUser from "@/utils/useUser";
import { Zap, Menu, X } from "lucide-react";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Stories", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const { data: user, loading } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all ${
          scrolled
            ? "py-3 backdrop-blur-2xl bg-black/50 border-b border-white/10"
            : "py-5 backdrop-blur-md bg-black/10 border-b border-transparent"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between gap-6">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 via-emerald-400 to-cyan-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap size={16} className="text-black" strokeWidth={2.5} />
              </div>
              <div className="absolute inset-0 rounded-xl ring-1 ring-white/30" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">
              ApplyAI
            </span>
          </a>

          <div className="hidden md:flex items-center gap-1 px-1 py-1 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative px-4 py-1.5 text-xs font-medium text-neutral-300 hover:text-white transition-colors rounded-full hover:bg-white/[0.06]"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {!loading && user ? (
              <a
                href="/dashboard"
                className="px-5 py-2 text-xs font-semibold text-black bg-white rounded-full hover:bg-neutral-200 transition-colors"
              >
                Dashboard →
              </a>
            ) : (
              <>
                <a
                  href="/account/signin"
                  className="text-xs font-medium text-neutral-300 hover:text-white px-3 py-2"
                >
                  Sign In
                </a>
                <a
                  href="/account/signup"
                  className="px-5 py-2 text-xs font-semibold text-black bg-white rounded-full hover:bg-neutral-100 transition-colors shadow-[0_8px_30px_rgba(255,255,255,0.18)]"
                >
                  Get Started
                </a>
              </>
            )}
          </div>

          <button
            type="button"
            className="md:hidden p-2 text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-[68px] z-40 md:hidden p-4"
          >
            <div className="rounded-2xl border border-white/10 bg-black/80 backdrop-blur-2xl p-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-neutral-200 hover:bg-white/[0.05]"
                >
                  {link.label}
                </a>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href="/account/signin"
                  className="text-center px-4 py-3 rounded-xl text-sm font-semibold text-neutral-200 border border-white/10 hover:bg-white/[0.05]"
                >
                  Sign In
                </a>
                <a
                  href="/account/signup"
                  className="text-center px-4 py-3 rounded-xl text-sm font-semibold text-black bg-white"
                >
                  Get Started
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
