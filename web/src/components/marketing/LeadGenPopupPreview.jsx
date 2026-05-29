"use client";
import React from "react";
import { Briefcase, MessageSquare, CalendarCheck, CheckCircle2 } from "lucide-react";

const weekStats = [
  { icon: Briefcase, label: "Tailored applications", value: "42", pct: 84 },
  { icon: MessageSquare, label: "Recruiter replies", value: "8", pct: 62 },
  { icon: CalendarCheck, label: "Interviews booked", value: "2", pct: 40 },
];

const checklist = [
  "Human-reviewed before every send",
  "Daily digest in your dashboard",
  "You approve role targets & filters",
];

/** Compact pipeline preview for the lead popup — no chat/DM mimicry. */
export default function LeadGenPopupPreview({ compact = false }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/60 bg-white/90 backdrop-blur-sm p-4 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-800 mb-3">
          Your first week
        </p>
        <div className="space-y-3">
          {weekStats.map(({ icon: Icon, label, value, pct }) => (
            <div key={label}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 text-xs text-neutral-700 min-w-0">
                  <Icon size={14} className="text-emerald-600 shrink-0" aria-hidden />
                  <span className="truncate">{label}</span>
                </span>
                <span className="text-sm font-bold text-neutral-900 tabular-nums shrink-0">{value}</span>
              </div>
              <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {!compact && (
        <ul className="space-y-2">
          {checklist.map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs text-emerald-950/90">
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
