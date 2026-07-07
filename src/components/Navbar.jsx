"use client";
import React, { useState, useEffect, useSyncExternalStore } from "react";
import useUser from "@/utils/useUser";
import { Menu, X } from "lucide-react";
import HireOrbitalLogo from "@/components/ui/HireOrbitalLogo";
import { Link } from "react-router";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "Free Tools", href: "/tools" },
  { label: "Talk to Us", href: "/contact" },
];

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function Navbar() {
  const { data: user, loading } = useUser();
  const hydrated = useHydrated();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const showAuthed = hydrated && !loading && Boolean(user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all ${
          scrolled
            ? "py-2.5 md:py-3 backdrop-blur-xl bg-white/90 border-b border-neutral-200/90 shadow-sm"
            : "py-3 md:py-4 backdrop-blur-md bg-white/70 border-b border-transparent"
        }`}
      >
        <div className="container mx-auto px-5 sm:px-6 lg:px-8 xl:px-10 max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1536px] flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center group min-w-0">
            <HireOrbitalLogo size="md" variant="light" />
          </Link>

          <div className="hidden md:flex items-center gap-0.5 px-1 py-1 rounded-full border border-neutral-200/80 bg-white/80">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="relative px-3.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-100"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/#difference"
              className="relative px-3.5 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-100"
            >
              The difference
            </Link>
            <Link
              to="/#how-it-works"
              className="relative px-3.5 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-100"
            >
              How it works
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-2 min-h-[36px]">
            {showAuthed ? (
              <Link
                to="/dashboard"
                className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors"
              >
                Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/account/signin"
                  className="text-xs font-medium text-neutral-600 hover:text-neutral-900 px-3 py-2"
                >
                  Log In
                </Link>
                <Link
                  to="/account/signup"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
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
      </nav>

      {mobileOpen ? (
        <div className="fixed inset-x-0 top-[56px] z-40 md:hidden px-4 pb-3 hero-fade-in">
          <div className="rounded-2xl border border-neutral-200 bg-white shadow-lg p-2 space-y-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/#difference"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium text-neutral-800 hover:bg-neutral-50"
              >
                The difference
              </Link>
              <Link
                to="/#how-it-works"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium text-neutral-800 hover:bg-neutral-50"
              >
                How it works
              </Link>
              <div className="grid grid-cols-2 gap-2 p-2 pt-1">
                {showAuthed ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="col-span-2 text-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-neutral-900"
                  >
                    Dashboard →
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/account/signin"
                      onClick={() => setMobileOpen(false)}
                      className="text-center px-4 py-3 rounded-xl text-sm font-semibold text-neutral-800 border border-neutral-200 hover:bg-neutral-50"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/account/signup"
                      onClick={() => setMobileOpen(false)}
                      className="text-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
