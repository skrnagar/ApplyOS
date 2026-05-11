"use client";
import React from "react";
import { motion } from "motion/react";
import { Building2, MapPin, Briefcase } from "lucide-react";

const jobs = [
  {
    company: "Nova Labs",
    title: "Senior Product Designer",
    location: "Remote · US",
    salary: "$165k – $210k",
    posted: "2d ago",
    tags: ["Figma", "B2B"],
  },
  {
    company: "Northwind AI",
    title: "Staff Software Engineer",
    location: "SF / Hybrid",
    salary: "$210k – $260k",
    posted: "Today",
    tags: ["TypeScript", "Infra"],
  },
  {
    company: "Helix Health",
    title: "Engineering Manager",
    location: "NYC · Hybrid",
    salary: "$195k – $235k",
    posted: "1d ago",
    tags: ["Leadership"],
  },
];

export default function JobFeedMock({ className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className={`rounded-2xl border border-neutral-200/90 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04),0_24px_48px_-12px_rgba(15,23,42,0.08)] ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <Briefcase size={15} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              HireOrbit pipeline
            </p>
            <p className="truncate text-sm font-semibold text-neutral-900">This week’s top matches</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-neutral-600">
          Live pipeline
        </span>
      </div>

      <ul className="divide-y divide-neutral-100 px-3 py-2 sm:px-4">
        {jobs.map((j) => (
          <li
            key={`${j.company}-${j.title}`}
            className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                <Building2 size={14} className="shrink-0 text-neutral-400" aria-hidden />
                <span className="truncate">{j.company}</span>
              </div>
              <p className="text-[15px] font-medium leading-snug text-neutral-800">{j.title}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={11} aria-hidden /> {j.location}
                </span>
                <span className="text-neutral-400">{j.posted}</span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
              <span className="text-xs font-semibold text-emerald-700">{j.salary}</span>
              <div className="flex flex-wrap justify-end gap-1">
                {j.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-medium text-neutral-600"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="border-t border-neutral-100 px-4 py-3 text-center sm:px-5">
        <p className="text-xs text-neutral-500">
          Every apply is reviewed by assistants before submission, then tracked in your dashboard.
        </p>
      </div>
    </motion.div>
  );
}
