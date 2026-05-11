"use client";
import React from "react";

const sizes = {
  sm: { box: 28, ring: 26, stroke: 1.5 },
  md: { box: 36, ring: 32, stroke: 2 },
  lg: { box: 44, ring: 40, stroke: 2.25 },
};

/**
 * HireOrbit mark: dual orbit rings + core — premium SaaS, space‑career metaphor.
 */
export default function HireOrbitLogo({
  size = "md",
  showWordmark = true,
  variant = "dark",
  className = "",
}) {
  const s = sizes[size] ?? sizes.md;
  const textClass =
    variant === "light"
      ? "text-neutral-900 font-semibold tracking-tight"
      : "text-white font-semibold tracking-tight";
  const sizeClass = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
  const orbitWordClass =
    variant === "light" ? "text-emerald-600" : "text-emerald-400/95";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={s.box}
        height={s.box}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="shrink-0"
      >
        <defs>
          <linearGradient id="ho-orbit-a" x1="4" y1="8" x2="36" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22d3ee" />
            <stop offset="0.45" stopColor="#34d399" />
            <stop offset="1" stopColor="#60a5fa" />
          </linearGradient>
          <linearGradient id="ho-orbit-b" x1="36" y1="10" x2="6" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a78bfa" />
            <stop offset="0.55" stopColor="#2dd4bf" />
            <stop offset="1" stopColor="#38bdf8" />
          </linearGradient>
          <radialGradient id="ho-core" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20 20) rotate(90) scale(10)">
            <stop stopColor="#ecfdf5" />
            <stop offset="0.55" stopColor="#34d399" />
            <stop offset="1" stopColor="#0f766e" />
          </radialGradient>
        </defs>
        {/* Outer tilted orbit */}
        <ellipse
          cx="20"
          cy="20"
          rx="15"
          ry="7.5"
          stroke="url(#ho-orbit-a)"
          strokeWidth={s.stroke}
          transform="rotate(-28 20 20)"
          opacity="0.95"
        />
        {/* Inner orbit */}
        <ellipse
          cx="20"
          cy="20"
          rx="11"
          ry="6"
          stroke="url(#ho-orbit-b)"
          strokeWidth={s.stroke * 0.85}
          transform="rotate(38 20 20)"
          opacity="0.85"
        />
        {/* Core planet */}
        <circle cx="20" cy="20" r="5.2" fill="url(#ho-core)" />
        <circle cx="20" cy="20" r="5.2" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" />
        {/* Orbit highlight */}
        <circle cx="31" cy="12" r="1.2" fill="#f0fdfa" opacity="0.9" />
      </svg>
      {showWordmark && (
        <span className={`${sizeClass} ${textClass}`}>
          Hire<span className={orbitWordClass}>Orbit</span>
        </span>
      )}
    </span>
  );
}
