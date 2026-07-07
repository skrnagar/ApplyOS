"use client";
import React from "react";
import { TrendingUp } from "lucide-react";

/** Mini collage — chat wins + proof stats (popup / compact layouts). */
export default function LeadGenSocialProof({ compact = false }) {
  const gridClass = compact
    ? "grid grid-cols-2 gap-2"
    : "grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5";

  return (
    <div className={gridClass}>
      <ChatCard
        theme="wa"
        name="Rohan M."
        status="online"
        lines={["Amazon SDE II offer 🎉", "Resume + mocks — worth it."]}
        compact={compact}
      />
      <ChatCard
        theme="dark"
        name="Neha S."
        status="online"
        lines={["Accepted Google Data Analyst!", "AI resume tips worked."]}
        compact={compact}
      />
      <ChatCard
        theme="tg"
        name="Arjun P."
        status="recently"
        lines={["Microsoft SDE intern ✓", "100+ apps, no burnout."]}
        compact={compact}
      />
      <StatsCard compact={compact} />
      <AtsCard compact={compact} />
      <OfferCard compact={compact} />
    </div>
  );
}

function ChatCard({ theme, name, status, lines, compact, className = "" }) {
  const themes = {
    wa: "bg-[#e5ddd5] border-[#d1c9c0]",
    dark: "bg-neutral-950 border-neutral-800 text-white",
    tg: "bg-[#dbeafe] border-sky-200",
  };
  const bubble =
    theme === "dark"
      ? "bg-violet-600/90 text-white"
      : theme === "tg"
        ? "bg-white text-neutral-800 border border-sky-100"
        : "bg-white text-neutral-800 border border-neutral-200/80";

  return (
    <div className={`rounded-xl border p-2 sm:p-2.5 shadow-sm overflow-hidden ${themes[theme]} ${className}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="h-5 w-5 rounded-full bg-emerald-500/90 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className={`text-[10px] font-semibold truncate ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>
            {name}
          </p>
          <p className={`text-[8px] ${theme === "dark" ? "text-neutral-400" : "text-neutral-500"}`}>{status}</p>
        </div>
      </div>
      <div className="space-y-1">
        {lines.map((line) => (
          <p
            key={line}
            className={`text-[9px] sm:text-[10px] leading-snug rounded-lg px-2 py-1 ${bubble} ${compact ? "line-clamp-2" : ""}`}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function StatsCard({ compact }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-2 sm:p-2.5 shadow-sm">
      <p className="text-[9px] font-semibold text-neutral-900 mb-1">My progress</p>
      <div className="grid grid-cols-2 gap-1 text-center mb-1.5">
        {[
          ["128", "Apps"],
          ["11", "Calls"],
        ].map(([n, l]) => (
          <div key={l} className="rounded-md bg-neutral-50 py-1">
            <p className="text-[11px] font-bold text-violet-700">{n}</p>
            <p className="text-[7px] text-neutral-500 uppercase">{l}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-1 rounded-md bg-violet-50 px-1.5 py-1">
        <span className="text-[8px] text-neutral-600">Interview calls</span>
        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700">
          <TrendingUp size={10} aria-hidden />
          450%
        </span>
      </div>
      {!compact && <p className="text-[8px] text-neutral-500 mt-1 leading-tight">0 → 11 calls in 2 weeks</p>}
    </div>
  );
}

function AtsCard({ compact }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-2 sm:p-2.5 shadow-sm">
      <p className="text-[9px] font-semibold text-neutral-900 mb-1.5">ATS score</p>
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <span className="rounded-md bg-red-50 border border-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
          42
        </span>
        <span className="text-[8px] text-neutral-400">→</span>
        <span className="rounded-md bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
          91
        </span>
      </div>
      <ul className="space-y-0.5">
        {["Keywords", "Skills", "ATS-ready"].map((t) => (
          <li key={t} className="text-[8px] text-emerald-700 flex gap-1">
            <span>✓</span> {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function OfferCard({ compact }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-2 sm:p-2.5 shadow-sm">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-[10px] font-bold text-orange-600">amazon</span>
        <span className="text-[7px] text-neutral-400 ml-auto">Offer</span>
      </div>
      <p className="text-[8px] font-semibold text-neutral-900 leading-tight">SDE II · Bangalore</p>
      <p className="text-[9px] text-emerald-700 font-bold mt-1">₹28L CTC</p>
      {!compact && <p className="text-[7px] text-neutral-500 mt-1">Real outcomes, real offers.</p>}
    </div>
  );
}
