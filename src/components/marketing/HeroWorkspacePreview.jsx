"use client";
import React from "react";
import { ChevronRight, MapPin, Building2, Bookmark, Send, ShieldCheck } from "lucide-react";

const roles = [
  {
    company: "Google",
    title: "Software Engineer, New Grad 2026",
    location: "Sunnyvale, CA",
    age: "2w ago",
    status: "Actively hiring",
    salary: "$135k – $165k/yr",
    about:
      "Build distributed systems with mentorship. Ship features used by billions and grow through structured onboarding.",
    companyMeta: "Sunnyvale, CA · 10,001+ employees",
    active: false,
  },
  {
    company: "Microsoft",
    title: "Data Analyst — Entry Level",
    location: "Redmond, WA",
    age: "3d ago",
    status: "Actively hiring",
    salary: "$92k – $118k/yr",
    about:
      "Turn product questions into dashboards. Work with Azure and Office stakeholders and own reporting pipelines.",
    companyMeta: "Redmond, WA · 10,001+ employees",
    active: false,
  },
  {
    company: "Meta",
    title: "AI/ML Engineer Intern",
    location: "Menlo Park, CA",
    age: "1w ago",
    status: "Actively hiring",
    salary: "$8.2k – $9.8k/mo",
    about:
      "Prototype ML models for ranking. Collaborate with researchers and ship experiments behind feature flags.",
    companyMeta: "Menlo Park, CA · 10,001+ employees",
    active: false,
  },
  {
    company: "Apple",
    title: "Junior iOS Developer",
    location: "Cupertino, CA",
    age: "5d ago",
    status: "Priority match",
    salary: "$95k – $125k/yr",
    about:
      "Build SwiftUI features with design and ship through modern CI/CD. Strong mentorship from day one.",
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
    <div
      className={`rounded-2xl sm:rounded-3xl border border-neutral-200/90 bg-white shadow-[0_24px_48px_-28px_rgba(15,23,42,0.18)] overflow-hidden ${className}`}
    >
      {/* Mobile: compact single-panel preview */}
      <div className="lg:hidden">
        <div className="px-4 py-3 border-b border-neutral-100 bg-[#fafbfc] flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-neutral-900">Recommended for you</p>
            <p className="text-[11px] text-neutral-500">Assistant applying on your behalf</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
            <ShieldCheck size={12} aria-hidden />
            Verified
          </span>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <p className="text-base font-semibold text-neutral-900 leading-snug">{activeRole.title}</p>
            <p className="text-sm text-neutral-500 mt-0.5">
              {activeRole.company} · {activeRole.location}
            </p>
            <p className="text-sm font-semibold text-emerald-800 mt-1">{activeRole.salary}</p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white text-xs font-semibold px-4 py-2">
              Apply <Send size={13} aria-hidden />
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 text-xs font-semibold px-4 py-2 text-neutral-800">
              <Bookmark size={13} aria-hidden /> Save
            </span>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3">{activeRole.about}</p>
        </div>
        <div className="px-4 pb-4 flex gap-2 overflow-x-auto">
          {roles.map((role, index) => (
            <button
              key={`${role.company}-mobile-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`shrink-0 rounded-xl border px-3 py-2 text-left transition-colors ${
                index === activeIndex
                  ? "border-emerald-300 bg-emerald-50/80"
                  : "border-neutral-200 bg-white hover:bg-neutral-50"
              }`}
            >
              <p className="text-[11px] font-semibold text-neutral-900">{role.company}</p>
              <p className="text-[10px] text-neutral-500 mt-0.5 max-w-[120px] truncate">{role.title}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: two-panel workspace */}
      <div className="hidden lg:grid lg:grid-cols-[minmax(220px,34%)_minmax(0,1fr)] min-h-[440px] xl:min-h-[500px] 2xl:min-h-[520px]">
        <aside className="border-r border-neutral-200/90 bg-[#fafbfc] flex flex-col min-h-0">
          <div className="px-4 py-3.5 border-b border-neutral-200/80 shrink-0">
            <p className="text-sm font-semibold text-neutral-900">Recommended for you</p>
            <p className="text-[11px] text-neutral-500">Based on your profile + goals</p>
          </div>
          <ul className="divide-y divide-neutral-200/80 flex-1 min-h-0 overflow-y-auto">
            {roles.map((role, index) => {
              const isActive = index === activeIndex;
              return (
                <li key={`${role.company}-${role.title}`}>
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`w-full text-left px-3 py-3 transition-colors ${
                      isActive
                        ? "bg-sky-50/70 border-l-2 border-sky-500"
                        : "hover:bg-neutral-50 border-l-2 border-transparent"
                    }`}
                    aria-pressed={isActive}
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500">
                        <Building2 size={15} aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold leading-tight text-neutral-900 line-clamp-2">
                          {role.title}
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">{role.company}</p>
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
                      <ChevronRight size={14} className="text-neutral-400 shrink-0 mt-0.5" aria-hidden />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="flex flex-col min-h-0 min-w-0 bg-gradient-to-b from-white to-neutral-50/50">
          <header className="px-5 py-4 xl:px-6 border-b border-neutral-200/90 shrink-0">
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
              <div className="min-w-0 space-y-1.5">
                <h3 className="text-lg xl:text-xl font-semibold tracking-tight text-neutral-900 leading-snug">
                  {activeRole.title}
                </h3>
                <p className="text-sm text-neutral-500">
                  {activeRole.company} · {activeRole.location} · Full-time
                </p>
                <p className="text-base font-semibold tabular-nums text-emerald-800">{activeRole.salary}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">
                  Apply <Send size={14} aria-hidden />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800">
                  <Bookmark size={14} aria-hidden /> Save
                </span>
              </div>
            </div>
          </header>

          <div className="px-5 py-4 xl:px-6 flex-1 min-h-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-2">
              About the role
            </p>
            <p className="text-sm text-neutral-600 leading-relaxed line-clamp-4">{activeRole.about}</p>
          </div>

          <footer className="px-5 py-3 xl:px-6 flex items-center justify-between gap-3 text-sm text-neutral-600 border-t border-neutral-200/80 bg-white/80 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin size={15} className="shrink-0 text-neutral-400" aria-hidden />
              <span className="truncate text-xs sm:text-sm">{activeRole.companyMeta}</span>
            </div>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs shrink-0">
              <ShieldCheck size={14} aria-hidden />
              Assistant verified
            </span>
          </footer>
        </section>
      </div>
    </div>
  );
}
