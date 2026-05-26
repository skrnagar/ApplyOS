"use client";
import React from "react";
import { TrendingUp } from "lucide-react";

const snippets = [
  {
    handle: "@maya · PM",
    msg: "40 tailored apps while I slept. Pipeline finally moved.",
    tone: "from",
  },
  {
    handle: "HireOrbital",
    msg: "12 new matches, 3 replies, 1 screen Thursday — all in your digest.",
    tone: "brand",
  },
];

/** Compact DM-style proof for the lead popup (no image). */
export default function LeadGenPopupProof() {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {snippets.map(({ handle, msg, tone }) => (
          <figure key={handle} className={tone === "brand" ? "flex flex-col items-end" : ""}>
            <figcaption
              className={`text-[9px] font-semibold uppercase tracking-wider mb-0.5 px-1 ${
                tone === "brand" ? "text-emerald-700" : "text-neutral-400"
              }`}
            >
              {handle}
            </figcaption>
            <blockquote
              className={`text-xs leading-snug rounded-xl px-3 py-2 border shadow-sm max-w-[92%] ${
                tone === "brand"
                  ? "bg-emerald-600 text-white border-emerald-700 rounded-br-sm ml-auto"
                  : "bg-white text-neutral-800 border-neutral-200/90 rounded-bl-sm"
              }`}
            >
              {msg}
            </blockquote>
          </figure>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-xl border border-neutral-200/90 bg-white/80 p-2.5">
        {[
          { n: "700+", l: "Customers" },
          { n: "250K+", l: "Applications" },
          { n: "4.9★", l: "Rating" },
        ].map(({ n, l }) => (
          <div key={l} className="text-center">
            <p className="text-sm font-bold text-neutral-900">{n}</p>
            <p className="text-[9px] text-neutral-500 uppercase tracking-wide">{l}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-violet-50 border border-violet-100 px-3 py-2">
        <TrendingUp size={14} className="text-emerald-600 shrink-0" aria-hidden />
        <p className="text-[11px] text-neutral-700 leading-snug">
          Members report more interview calls within the first two weeks.
        </p>
      </div>
    </div>
  );
}
