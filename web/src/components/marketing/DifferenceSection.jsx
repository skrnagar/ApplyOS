"use client";
import React from "react";
import { motion } from "motion/react";
import { X, Check } from "lucide-react";

const diy = [
  "Nights lost to repetitive forms",
  "Spray‑and‑pray with no funnel visibility",
  "Resume tweaks that never stay consistent",
  "Interview prep scattered across tabs",
];

const hireorbit = [
  "Curated applications with targeting rules",
  "Dashboard + assistant notes per submission",
  "Resume & LinkedIn upgrades in lockstep",
  "Mock loops + negotiation support on higher tiers",
];

export default function DifferenceSection() {
  return (
    <section id="difference" className="py-20 md:py-28 relative scroll-mt-28">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
          <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-emerald-700 mb-4">
            The difference
          </p>
          <h2 className="text-3xl md:text-[2.65rem] font-semibold tracking-tight text-neutral-900 text-balance leading-tight">
            Job search gravity pulls you inward. HireOrbit pushes outcomes forward.
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-5 lg:gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-8 shadow-sm"
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-6">
              Posting solo
            </h3>
            <ul className="space-y-4">
              {diy.map((t) => (
                <li key={t} className="flex gap-3 text-neutral-700 text-sm md:text-[15px] leading-snug">
                  <span className="mt-0.5 shrink-0 w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center border border-neutral-200">
                    <X size={14} className="text-neutral-500" aria-hidden />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.06 }}
            className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/90 to-white p-6 md:p-8 shadow-[0_0_0_1px_rgba(16,185,129,0.08)]"
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-800 mb-6">
              With HireOrbit
            </h3>
            <ul className="space-y-4">
              {hireorbit.map((t) => (
                <li key={t} className="flex gap-3 text-neutral-800 text-sm md:text-[15px] leading-snug font-medium">
                  <span className="mt-0.5 shrink-0 w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                    <Check size={15} aria-hidden strokeWidth={2.5} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
