"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import useUser from "@/utils/useUser";
import { Menu, X } from "lucide-react";
import HireOrbitLogo from "@/components/ui/HireOrbitLogo";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "Free Tools", href: "/tools" },
  { label: "Talk to Us", href: "/contact" },
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
            ? "py-2.5 md:py-3 backdrop-blur-xl bg-white/90 border-b border-neutral-200/90 shadow-sm"
            : "py-3 md:py-4 backdrop-blur-md bg-white/70 border-b border-transparent"
        }`}
      >
        <div className="container mx-auto px-5 sm:px-6 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center group min-w-0">
            <HireOrbitLogo size="md" variant="light" />
          </a>

          <div className="hidden md:flex items-center gap-0.5 px-1 py-1 rounded-full border border-neutral-200/80 bg-white/80">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative px-3.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-100"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#difference"
              className="relative px-3.5 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-100"
            >
              The difference
            </a>
            <a
              href="#how-it-works"
              className="relative px-3.5 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-100"
            >
              How it works
            </a>
            <a
              href="#signup"
              className="relative px-3.5 py-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900 transition-colors rounded-full hover:bg-emerald-50"
            >
              Sign up
            </a>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {!loading && user ? (
              <a
                href="/dashboard"
                className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors"
              >
                Dashboard →
              </a>
            ) : (
              <>
                <a
                  href="/account/signin"
                  className="text-xs font-medium text-neutral-600 hover:text-neutral-900 px-3 py-2"
                >
                  Log In
                </a>
                <a
                  href="/account/signup"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Sign Up
                </a>
              </>
            )}
          </div>

          <button
            type="button"
            className="md:hidden p-2 text-neutral-800 -mr-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-[56px] z-40 md:hidden px-4 pb-3"
          >
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-lg p-2 space-y-0.5">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#difference"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium text-neutral-800 hover:bg-neutral-50"
              >
                The difference
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium text-neutral-800 hover:bg-neutral-50"
              >
                How it works
              </a>
              <a
                href="#signup"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
              >
                Sign up form
              </a>
              <div className="grid grid-cols-2 gap-2 p-2 pt-1">
                <a
                  href="/account/signin"
                  onClick={() => setMobileOpen(false)}
                  className="text-center px-4 py-3 rounded-xl text-sm font-semibold text-neutral-800 border border-neutral-200 hover:bg-neutral-50"
                >
                  Log In
                </a>
                <a
                  href="/account/signup"
                  onClick={() => setMobileOpen(false)}
                  className="text-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600"
                >
                  Sign Up
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
