"use client";
import React from "react";
import { motion } from "motion/react";
import { ArrowRight, PhoneCall, Sparkles, ShieldCheck, Clock3 } from "lucide-react";
import MagneticButton from "./ui/MagneticButton";
import AnimatedCounter from "./ui/AnimatedCounter";
import HeroWorkspacePreview from "./marketing/HeroWorkspacePreview";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f4f6f8]">
      {/* CSS-only atmosphere — no WebGL / scroll-jacking */}
      <div className="pointer-events-none absolute inset-0 hero-atmosphere" aria-hidden />
      <div className="pointer-events-none absolute inset-0 hero-atmosphere-grid opacity-[0.55]" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#f4f6f8] via-[#f4f6f8]/80 to-transparent" aria-hidden />

      <div className="relative z-10 container mx-auto px-5 sm:px-6 pt-24 sm:pt-28 pb-16 md:pb-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-16 items-start max-w-6xl mx-auto">
          <div className="order-1 space-y-7">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200/90 bg-white/90 text-[11px] sm:text-xs font-medium text-emerald-800 shadow-sm"
            >
              <Sparkles size={12} className="text-emerald-600 shrink-0" aria-hidden />
              <span className="tracking-wide uppercase">HireOrbit · AI career OS</span>
            </motion.div>

            <h1 className="text-[clamp(2.35rem,7vw,4.25rem)] font-semibold tracking-[-0.04em] leading-[1.05] text-neutral-900">
              <motion.span
                className="block bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-700 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                We apply to jobs
              </motion.span>
              <motion.span
                className="block mt-1 md:mt-2 text-emerald-600"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
              >
                so you don&rsquo;t have to.
              </motion.span>
            </h1>

            <motion.p
              className="max-w-xl text-neutral-600 text-sm sm:text-base leading-relaxed text-balance"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.45 }}
            >
              HireOrbit runs your job search end-to-end: curated applications, resume + LinkedIn
              upgrades, outreach, and interview prep, all with transparent assistant updates.
            </motion.p>

            <motion.div
              className="h-px max-w-sm bg-gradient-to-r from-emerald-400/40 to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <MagneticButton href="/account/signup" variant="cta" icon={ArrowRight} className="w-full sm:w-auto justify-center">
                Start free
              </MagneticButton>
              <MagneticButton href="/contact" variant="outline" icon={PhoneCall} className="w-full sm:w-auto justify-center">
                Talk to an expert
              </MagneticButton>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 text-[11px] sm:text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-neutral-700">
                <ShieldCheck size={13} className="text-emerald-600" />
                Human-reviewed applications
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-neutral-700">
                <Clock3 size={13} className="text-sky-600" />
                Live daily pipeline updates
              </span>
            </div>

            <ul className="space-y-2 text-sm text-neutral-600 max-w-md mx-auto lg:mx-0">
              <li className="flex gap-2">
                <span className="text-emerald-600 font-semibold">→</span>
                Dedicated assistants + full dashboard visibility
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600 font-semibold">→</span>
                ATS-aware resume workflow from day one
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600 font-semibold">→</span>
                Pricing tiers from 250 to 1,200+ applications per month
              </li>
            </ul>
          </div>

          <div className="order-2 w-full max-w-md md:max-w-2xl mx-auto lg:max-w-none">
            <HeroWorkspacePreview className="w-full" />
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-10 md:mt-12">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto lg:mx-0">
            <Stat label="Customers" value={700} suffix="+" />
            <Stat label="Applications" value={250} suffix="K+" />
            <Stat label="Avg. rating" value={4.9} decimals={1} suffix="" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, suffix = "", decimals = 0 }) {
  return (
    <div className="text-center lg:text-left border-l border-neutral-200/90 pl-3 sm:pl-4 first:border-l-0 first:pl-0">
      <div className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">
        <AnimatedCounter value={value} suffix={suffix} decimals={decimals} />
        {label === "Avg. rating" && (
          <span className="text-amber-500 text-xl sm:text-2xl md:text-3xl">★</span>
        )}
      </div>
      <div className="mt-1 text-[10px] sm:text-xs tracking-wide uppercase text-neutral-500 font-medium">
        {label}
      </div>
    </div>
  );
}
