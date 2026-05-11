"use client";
import React from "react";
import MarketingShell from "@/components/marketing/MarketingShell";
import { FileText, Linkedin, Mic, Sparkles } from "lucide-react";

const tools = [
  {
    id: "resume",
    title: "Resume readiness checklist",
    icon: FileText,
    body: "Structure, metrics, and keyword alignment before you upload — mirrors what HireOrbit assistants optimize first.",
  },
  {
    id: "linkedin",
    title: "LinkedIn headline formulas",
    icon: Linkedin,
    body: "Three headline patterns for senior IC, manager, and career-switch narratives — same frameworks we use in onboarding.",
  },
  {
    id: "interview",
    title: "Interview story bank",
    icon: Mic,
    body: "STAR prompts for impact, conflict, and scope — prep material that pairs with mock interviews inside HireOrbit.",
  },
  {
    id: "ats",
    title: "ATS hygiene tips",
    icon: Sparkles,
    body: "File format, section order, and parsing pitfalls — the baseline our Resume Lab scores against.",
  },
];

export default function FreeToolsPage() {
  return (
    <MarketingShell>
      <div className="pt-28 pb-20 md:pb-28 container mx-auto px-5 sm:px-6 max-w-4xl">
        <p className="text-xs uppercase tracking-[0.28em] text-emerald-700 font-semibold mb-4">
          Free tools
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold text-neutral-900 mb-4 text-balance tracking-tight">
          Practical guides, HireOrbit-grade
        </h1>
        <p className="text-lg text-neutral-600 mb-12 max-w-2xl leading-relaxed">
          No login required. Use these to sharpen your materials; connect with us when
          you want assistants, analytics, and full pipeline execution inside the product.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <section
                key={t.id}
                id={t.id}
                className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-7 md:p-8 hover:border-emerald-200/80 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                  <Icon className="text-emerald-700" size={22} aria-hidden />
                </div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">{t.title}</h2>
                <p className="text-sm text-neutral-600 leading-relaxed">{t.body}</p>
              </section>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <p className="text-neutral-600 mb-5 text-sm md:text-base">
            Ready for full execution, transparency, and analytics?
          </p>
          <a
            href="/account/signup"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Sign up — HireOrbit
          </a>
        </div>
      </div>
    </MarketingShell>
  );
}
