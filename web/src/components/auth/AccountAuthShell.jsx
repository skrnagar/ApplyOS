"use client";
import React from "react";
import HireOrbitLogo from "@/components/ui/HireOrbitLogo";

/**
 * Shared account pages shell — matches marketing light UI (readable, professional).
 */
export default function AccountAuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-[#f4f6f8] text-neutral-900 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
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

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex justify-center mb-6">
            <HireOrbitLogo size="lg" variant="light" />
          </a>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 mb-2">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">{subtitle}</p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-neutral-200/90 bg-white/95 backdrop-blur-md shadow-[0_24px_64px_-32px_rgba(15,23,42,0.18)] p-6 sm:p-8">
          {children}
        </div>

        {footer ? <div className="mt-8 text-center text-sm text-neutral-500">{footer}</div> : null}
      </div>
    </div>
  );
}
