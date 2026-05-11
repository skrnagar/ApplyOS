"use client";
import React from "react";

/** Subtle Hiredeasy-style canvas: soft tint + faint grid/lines — no heavy blur meshes. */
export default function ProMarketingBackdrop() {
  return (
    <div aria-hidden className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#f4f6f8]">
      {/* Very light vertical rhythm (horizontal lines) */}
      <div
        className="absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.06) 1px, transparent 1px)`,
          backgroundSize: "100% 32px",
        }}
      />
      {/* Faint orthogonal grid */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(15, 23, 42, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15, 23, 42, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)",
        }}
      />
      {/* Top wash — avoids harsh flat gray */}
      <div className="absolute inset-x-0 top-0 h-[min(55vh,520px)] bg-gradient-to-b from-white/80 via-white/25 to-transparent" />
    </div>
  );
}
