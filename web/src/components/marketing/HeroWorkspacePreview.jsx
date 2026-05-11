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
  },
  {
    company: "Microsoft",
    title: "Data Analyst - FTE (Entry Level)",
    location: "Redmond, WA (Hybrid)",
    age: "3 days ago",
    status: "Actively hiring",
  },
  {
    company: "Meta",
    title: "AI/ML Engineer Intern - Summer",
    location: "Menlo Park, CA (On-site)",
    age: "1 week ago",
    status: "Actively hiring",
  },
  {
    company: "Apple",
    title: "Junior iOS Developer",
    location: "Cupertino, CA (On-site)",
    age: "5 days ago",
    status: "Priority match",
    active: true,
  },
];

export default function HeroWorkspacePreview({ className = "" }) {
  const activeRole = roles.find((r) => r.active) ?? roles[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: 0.12 }}
      className={`rounded-3xl border border-neutral-200/90 bg-white/95 p-3 shadow-[0_2px_0_rgba(15,23,42,0.02),0_30px_60px_-24px_rgba(15,23,42,0.2)] ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-[0.95fr_1.55fr] gap-3">
        <aside className="rounded-2xl border border-neutral-200/90 bg-[#fafbfc] overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200/80">
            <p className="text-sm font-semibold text-neutral-900">Recommended for you</p>
            <p className="text-[11px] text-neutral-500">Based on your profile + goals</p>
          </div>
          <ul className="divide-y divide-neutral-200/80">
            {roles.map((role) => (
              <li
                key={`${role.company}-${role.title}`}
                className={`px-3 py-2.5 transition-colors ${
                  role.active ? "bg-sky-50/70 border-l-2 border-sky-500" : "hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-500">
                    <Building2 size={14} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold leading-tight text-neutral-900 line-clamp-2">
                        {role.title}
                      </p>
                      <ChevronRight size={13} className="text-neutral-400 shrink-0 mt-0.5" aria-hidden />
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">{role.company}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">{role.location}</p>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-neutral-400">{role.age}</span>
                      <span
                        className={`text-[10px] font-medium ${
                          role.active ? "text-sky-700" : "text-emerald-700"
                        }`}
                      >
                        {role.status}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        <section className="rounded-2xl border border-neutral-200/90 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200/80 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-lg font-semibold text-neutral-900 truncate">{activeRole.title}</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {activeRole.company} · {activeRole.location} · Full-time
              </p>
              <p className="text-xs font-medium text-neutral-700 mt-1">$95,000/yr - $125,000/yr</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Apply
                <Send size={12} aria-hidden />
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                <Bookmark size={12} aria-hidden />
                Save
              </button>
            </div>
          </div>

          <div className="px-4 py-3 border-b border-neutral-200/80">
            <h4 className="text-sm font-semibold text-neutral-900 mb-2">About the role</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              We are seeking a Junior iOS Developer with hands-on Swift and UIKit experience.
              You will build and test high quality iOS features, collaborate with design, and
              ship updates in a modern CI/CD pipeline.
            </p>
          </div>

          <div className="px-4 py-3 border-b border-neutral-200/80 rounded-xl mx-4 my-3 bg-neutral-50/90">
            <p className="text-sm font-semibold text-neutral-900">Premium accelerator</p>
            <p className="text-xs text-neutral-600 mt-1">
              Get role-specific outreach templates, company insights, and interview prep prompts.
            </p>
            <button
              type="button"
              className="mt-2 rounded-full bg-amber-300 px-3.5 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-200"
            >
              Try premium for $0
            </button>
          </div>

          <div className="px-4 py-3 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-neutral-500">
              <MapPin size={12} aria-hidden />
              Cupertino, CA · 10,001+ employees
            </div>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck size={12} aria-hidden />
              Assistant verified
            </span>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
