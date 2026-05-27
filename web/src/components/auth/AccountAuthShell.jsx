"use client";
import React from "react";
import { ChevronLeft } from "lucide-react";
import HireOrbitalLogo from "@/components/ui/HireOrbitalLogo";

/**
 * Shared account pages shell — matches marketing light UI (readable, professional).
 */
export default function AccountAuthShell({
  title,
  subtitle,
  children,
  footer,
  banner,
  backHref = "/",
  backLabel = "Back to home",
  secondaryBackHref,
  secondaryBackLabel,
}) {
  return (
    <div className="min-h-screen bg-[#f4f6f8] text-neutral-900 flex flex-col relative overflow-hidden">
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage: `
            linear-gradient(to bottom, rgba(15, 23, 42, 0.05) 1px, transparent 1px),
            linear-gradient(to right, rgba(15, 23, 42, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "100% 28px, 56px 56px",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-[min(45vh,420px)] bg-gradient-to-b from-white/90 via-white/40 to-transparent pointer-events-none" />

      {/* Mobile back bar */}
      <div
        className="md:hidden fixed top-0 inset-x-0 z-50 flex items-center justify-between gap-2 px-3 py-2.5 bg-white/95 backdrop-blur-md border-b border-neutral-200/90"
        style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top, 0px))" }}
      >
        <a
          href={backHref}
          className="inline-flex items-center gap-1 min-h-[44px] min-w-[44px] -ml-1 px-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 rounded-lg active:bg-neutral-100"
        >
          <ChevronLeft size={20} className="shrink-0" aria-hidden />
          <span className="truncate max-w-[9rem]">{backLabel}</span>
        </a>
        {secondaryBackHref ? (
          <a
            href={secondaryBackHref}
            className="shrink-0 min-h-[44px] inline-flex items-center px-3 text-sm font-semibold text-emerald-700 hover:text-emerald-800 rounded-lg active:bg-emerald-50"
          >
            {secondaryBackLabel}
          </a>
        ) : (
          <span className="w-11" aria-hidden />
        )}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 pt-[calc(3.25rem+env(safe-area-inset-top,0px))] md:pt-6 relative z-10 w-full">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <a href="/" className="inline-flex justify-center mb-6">
              <HireOrbitalLogo size="lg" variant="light" />
            </a>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 mb-2">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">{subtitle}</p>
            ) : null}
          </div>

          {banner ? <div className="mb-4">{banner}</div> : null}

          <div
            className="rounded-2xl border border-neutral-200/90 bg-white/95 backdrop-blur-md shadow-[0_24px_64px_-32px_rgba(15,23,42,0.18)] p-6 sm:p-8"
            suppressHydrationWarning
          >
            {children}
          </div>

          {/* Desktop back links */}
          <div className="hidden md:flex mt-6 items-center justify-center gap-4 text-sm">
            <a
              href={backHref}
              className="inline-flex items-center gap-1 text-neutral-600 hover:text-neutral-900 font-medium"
            >
              <ChevronLeft size={16} aria-hidden />
              {backLabel}
            </a>
            {secondaryBackHref ? (
              <>
                <span className="text-neutral-300" aria-hidden>
                  ·
                </span>
                <a href={secondaryBackHref} className="font-semibold text-emerald-700 hover:text-emerald-800">
                  {secondaryBackLabel}
                </a>
              </>
            ) : null}
          </div>

          {footer ? <div className="mt-6 md:mt-8 text-center text-sm text-neutral-500">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
