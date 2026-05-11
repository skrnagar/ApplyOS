"use client";
import React from "react";
import { motion } from "motion/react";
import { ChevronRight, MapPin, Building2, Bookmark, Send, ShieldCheck } from "lucide-react";

const roles = [
  {
    company: "Google",
    title: "Software Engineer, New Grad 2026",
    location: "Sunnyvale, CA (On-site)",
    age: "2 weeks ago",
    status: "Actively hiring",
    salary: "$135k – $165k/yr",
    about:
      "Build distributed systems with strong mentorship. You will ship features used by billions, partner with senior engineers on design reviews, and grow through structured onboarding.",
    companyMeta: "Sunnyvale, CA · 10,001+ employees",
    active: false,
  },
  {
    company: "Microsoft",
    title: "Data Analyst - FTE (Entry Level)",
    location: "Redmond, WA (Hybrid)",
    age: "3 days ago",
    status: "Actively hiring",
    salary: "$92k – $118k/yr",
    about:
      "Turn product questions into dashboards and insights. Work with stakeholders across Azure and Office, own reporting pipelines, and present findings that influence roadmap decisions.",
    companyMeta: "Redmond, WA · 10,001+ employees",
    active: false,
  },
  {
    company: "Meta",
    title: "AI/ML Engineer Intern - Summer",
    location: "Menlo Park, CA (On-site)",
    age: "1 week ago",
    status: "Actively hiring",
    salary: "$8.2k – $9.8k/mo",
    about:
      "Prototype and evaluate ML models for ranking and integrity. Collaborate with researchers, write clean Python, and ship experiments behind feature flags with strong observability.",
    companyMeta: "Menlo Park, CA · 10,001+ employees",
    active: false,
  },
  {
    company: "Apple",
    title: "Junior iOS Developer",
    location: "Cupertino, CA (On-site)",
    age: "5 days ago",
    status: "Priority match",
    salary: "$95k – $125k/yr",
    about:
      "Hands-on Swift, UIKit, and SwiftUI. You will build and test high-quality iOS features, collaborate with design, and ship updates through a modern CI/CD pipeline.",
    companyMeta: "Cupertino, CA · 10,001+ employees",
    active: true,
  },
];

export default function HeroWorkspacePreview({ className = "" }) {
  const [activeIndex, setActiveIndex] = React.useState(
    Math.max(
      0,
      roles.findIndex((r) => r.active),
    ),
  );
  const activeRole = roles[activeIndex] ?? roles[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: 0.12 }}
      className={`rounded-3xl border border-neutral-200/90 bg-white/95 p-3 sm:p-4 lg:p-4 xl:p-5 shadow-[0_2px_0_rgba(15,23,42,0.02),0_30px_60px_-24px_rgba(15,23,42,0.2)] ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(200px,26%)_minmax(0,1fr)] xl:grid-cols-[minmax(228px,24%)_minmax(0,1fr)] gap-3 sm:gap-4 lg:gap-4 xl:gap-5 items-stretch min-h-0">
        <aside className="rounded-2xl border border-neutral-200/90 bg-[#fafbfc] overflow-hidden min-h-[420px] md:min-h-[560px] lg:min-h-[600px] xl:min-h-[660px] 2xl:min-h-[720px] h-full flex flex-col">
          <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-neutral-200/80 shrink-0">
            <p className="text-sm sm:text-base font-semibold text-neutral-900">Recommended for you</p>
            <p className="text-[11px] sm:text-xs text-neutral-500">Based on your profile + goals</p>
          </div>
          <ul className="divide-y divide-neutral-200/80 flex-1 min-h-0 overflow-y-auto overscroll-contain">
            {roles.map((role, index) => {
              const isActive = index === activeIndex;
              return (
                <li key={`${role.company}-${role.title}`}>
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`w-full text-left px-3 py-3 sm:px-4 sm:py-3.5 lg:py-4 transition-colors ${
                      isActive
                        ? "bg-sky-50/70 border-l-2 border-sky-500"
                        : "hover:bg-neutral-50 border-l-2 border-transparent"
                    }`}
                    aria-pressed={isActive}
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500">
                        <Building2 size={16} aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs sm:text-sm font-semibold leading-tight text-neutral-900 line-clamp-2">
                            {role.title}
                          </p>
                          <ChevronRight size={14} className="text-neutral-400 shrink-0 mt-0.5" aria-hidden />
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5">{role.company}</p>
                        <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">{role.location}</p>
                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-neutral-400">{role.age}</span>
                          <span
                            className={`text-[10px] font-medium ${
                              isActive ? "text-sky-700" : "text-emerald-700"
                            }`}
                          >
                            {role.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="rounded-2xl border border-neutral-200/90 bg-gradient-to-b from-white to-neutral-50/40 overflow-hidden min-h-[420px] md:min-h-[560px] lg:min-h-[600px] xl:min-h-[660px] 2xl:min-h-[720px] h-full flex flex-col min-w-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <header className="px-5 py-4 sm:px-6 sm:py-5 lg:px-6 lg:py-5 xl:px-8 xl:py-6 border-b border-neutral-200/90 bg-white/80 shrink-0 space-y-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between xl:gap-8">
              <div className="min-w-0 flex-1 space-y-2.5">
                <h3 className="text-xl sm:text-2xl lg:text-2xl xl:text-[1.875rem] 2xl:text-[2rem] font-semibold tracking-tight text-neutral-900 leading-[1.15] text-balance">
                  {activeRole.title}
                </h3>
                <p className="text-sm sm:text-[15px] lg:text-base text-neutral-500 leading-snug">
                  {activeRole.company} · {activeRole.location} · Full-time
                </p>
                <p className="text-base sm:text-lg xl:text-xl font-semibold tabular-nums text-emerald-800 tracking-tight">
                  {activeRole.salary}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0 xl:pt-1">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 min-h-[44px] min-w-[7.5rem]"
                >
                  Apply
                  <Send size={15} className="opacity-95" aria-hidden />
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50 min-h-[44px] min-w-[7.25rem]"
                >
                  <Bookmark size={15} aria-hidden />
                  Save
                </button>
              </div>
            </div>
          </header>

          <div className="px-5 py-5 sm:px-6 sm:py-6 lg:px-6 lg:py-6 xl:px-8 xl:py-7 border-b border-neutral-200/80 flex-1 min-h-0 overflow-y-auto bg-white/50">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-3">
              About the role
            </p>
            <p className="text-sm sm:text-[15px] lg:text-[15px] xl:text-base text-neutral-600 leading-[1.7] text-pretty">
              {activeRole.about}
            </p>
          </div>

          <div className="mx-4 my-3 sm:mx-5 sm:my-4 lg:mx-5 lg:my-4 xl:mx-6 xl:my-5 shrink-0 rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/90 to-amber-100/40 px-4 py-4 sm:px-5 sm:py-5 xl:px-6 xl:py-5 shadow-sm">
            <p className="text-base sm:text-lg font-semibold text-neutral-900">Premium accelerator</p>
            <p className="mt-2 text-sm sm:text-[15px] text-neutral-600 leading-relaxed max-w-prose">
              Get role-specific outreach templates, company insights, and interview prep prompts.
            </p>
            <button
              type="button"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-amber-300 px-5 py-2.5 text-sm font-semibold text-amber-950 shadow-sm hover:bg-amber-200 min-h-[44px]"
            >
              Try premium for $0
            </button>
          </div>

          <footer className="px-5 py-3.5 sm:px-6 sm:py-4 lg:px-6 xl:px-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 text-sm lg:text-[15px] text-neutral-600 bg-white/70 border-t border-neutral-200/80 mt-auto shrink-0">
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              <MapPin size={16} className="shrink-0 text-neutral-400 mt-0.5" aria-hidden />
              <span className="leading-snug text-pretty break-words">
                {activeRole.companyMeta}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold shrink-0 whitespace-nowrap">
              <ShieldCheck size={16} className="shrink-0" aria-hidden />
              Assistant verified
            </span>
          </footer>
        </section>
      </div>
    </motion.div>
  );
}
