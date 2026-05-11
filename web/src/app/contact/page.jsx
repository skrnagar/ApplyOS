"use client";
import React from "react";
import MarketingShell from "@/components/marketing/MarketingShell";
import { Mail, MessageCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <MarketingShell>
      <div className="pt-28 pb-20 md:pb-28 container mx-auto px-5 sm:px-6 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.28em] text-emerald-700 font-semibold mb-4">
          Talk to us
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold text-neutral-900 mb-4 text-balance tracking-tight">
          Book a call or write the team
        </h1>
        <p className="text-lg text-neutral-600 mb-10 leading-relaxed">
          Tell us about your role targets, timeline, and how aggressive you want applications.
          We&apos;ll map a HireOrbit plan — same transparency standards we ship in-product.
        </p>

        <div className="space-y-4 mb-12">
          <a
            href="mailto:hello@hireorbit.com"
            className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 hover:border-emerald-300/70 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
              <Mail className="text-sky-700" size={22} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-neutral-500 mb-1">Email</p>
              <p className="text-neutral-900 font-semibold truncate">hello@hireorbit.com</p>
              <p className="text-xs text-neutral-500 mt-1">
                Replace with your live address in production.
              </p>
            </div>
          </a>

          <a
            href="/account/signup"
            className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 hover:border-emerald-300/70 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <MessageCircle className="text-emerald-700" size={22} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-neutral-500 mb-1">Self-serve</p>
              <p className="text-neutral-900 font-semibold">Create an account</p>
              <p className="text-xs text-neutral-500 mt-1">
                Start with the dashboard, then loop in our team from in-app chat.
              </p>
            </div>
          </a>
        </div>

        <section id="privacy" className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-neutral-900 mb-2">Privacy</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            HireOrbit is designed for minimal data retention and clear consent. A full policy
            URL can replace this placeholder when legal copy is ready.
          </p>
        </section>

        <section id="terms" className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-neutral-900 mb-2">Terms</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Service terms, SLA expectations, and refund rules belong here — wire to your counsel
            before launch.
          </p>
        </section>
      </div>
    </MarketingShell>
  );
}
