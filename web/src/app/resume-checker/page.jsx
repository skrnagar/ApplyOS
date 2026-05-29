"use client";
import React from "react";
import MarketingShell from "@/components/marketing/MarketingShell";
import ResumeUploadZone from "@/components/ResumeUploadZone";
import { Check, Shield, Sparkles, Zap } from "lucide-react";
import { metaForPath } from "@/utils/seo";

export function meta() {
  return metaForPath("/resume-checker");
}

const perks = [
  "Instant score — no login required",
  "Works with PDF, DOC, and DOCX",
  "Same checks used for LinkedIn & Naukri applies",
  "Full report with category breakdown",
];

export default function ResumeCheckerPage() {
  return (
    <MarketingShell>
      <div className="pt-28 pb-20 md:pb-28">
        <div className="container mx-auto px-5 sm:px-6 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-700 font-semibold mb-4">
                Free ATS resume checker
              </p>
              <h1 className="text-4xl md:text-5xl font-semibold text-neutral-900 mb-5 tracking-tight text-balance">
                Will your resume pass{" "}
                <span className="text-emerald-700">ATS screening?</span>
              </h1>
              <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
                Upload once and get an instant compatibility score with actionable feedback —
                the same analysis HireOrbital uses before applying on LinkedIn, Naukri, Indeed,
                and company career pages.
              </p>

              <ul className="space-y-3 mb-8">
                {perks.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-neutral-800 text-sm">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200/80 mt-0.5">
                      <Check size={14} className="text-emerald-700" aria-hidden />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { icon: Zap, label: "Instant results" },
                  { icon: Shield, label: "Private & secure" },
                  { icon: Sparkles, label: "Actionable tips" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-neutral-200 bg-white px-4 py-3 flex items-center gap-2 text-sm font-medium text-neutral-700"
                  >
                    <Icon size={16} className="text-emerald-600 shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-[0_24px_48px_-16px_rgba(15,23,42,0.1)]">
              <h2 className="text-lg font-semibold text-neutral-900 mb-1">Upload your resume</h2>
              <p className="text-sm text-neutral-500 mb-6">
                PDF, DOC, DOCX · up to 8 MB · results in seconds
              </p>
              <ResumeUploadZone
                variant="marketing"
                redirectToResults
                hideInlineResult
              />
            </div>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
