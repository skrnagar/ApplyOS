"use client";
import React from "react";

const variants = {
  primary:
    "bg-white text-black hover:bg-neutral-100 shadow-[0_8px_30px_rgba(15,23,42,0.08)] border border-neutral-200/80",
  secondary:
    "bg-white/[0.04] text-white border border-white/10 hover:bg-white/[0.08] hover:border-white/30 backdrop-blur-xl",
  glow:
    "bg-gradient-to-r from-green-500 to-emerald-400 text-black shadow-[0_8px_40px_rgba(34,197,94,0.45)] hover:shadow-[0_8px_50px_rgba(34,197,94,0.65)]",
  cta: "bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-700/20 shadow-sm hover:shadow-md",
  outline:
    "bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300",
};

/** Lightweight CTA button — no motion springs on the critical path. */
export default function MarketingButton({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  icon: Icon,
}) {
  const Component = href ? "a" : "button";

  return (
    <Component
      href={href}
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-semibold tracking-tight transition-colors duration-200 ${variants[variant]} ${className}`}
    >
      {children}
      {Icon ? (
        <Icon size={18} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
      ) : null}
    </Component>
  );
}
