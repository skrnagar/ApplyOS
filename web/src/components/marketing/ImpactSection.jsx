"use client";
import React from "react";
import { motion } from "motion/react";
import { TrendingUp, Users, Timer } from "lucide-react";

const metrics = [
  {
    icon: TrendingUp,
    value: "3.2×",
    label: "More qualified interviews vs. self-apply baselines we track in onboarding.",
  },
  {
    icon: Users,
    value: "700+",
    label: "Professionals who trust HireOrbit for transparent, high-velocity search.",
  },
  {
    icon: Timer,
    value: "Days, not months",
    label: "Structured weekly cadence so momentum doesn’t stall between interviews.",
  },
];

export default function ImpactSection() {
  return (
    <section className="py-20 md:py-28 relative">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
          <p className="text-[11px] tracking-[0.35em] uppercase text-emerald-700 mb-4 font-semibold">
            Built for impact
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900 text-balance">
            Results you can explain to recruiters — and yourself.
          </h2>
          <p className="mt-4 text-neutral-600 leading-relaxed text-base md:text-lg">
            We obsess over relevance, reply quality, and a search that stays legible inside your
            HireOrbit workspace — not noisy spray-and-pray bots.
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-3">
          {metrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Icon size={20} aria-hidden />
                </div>
                <p className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 mb-2">
                  {m.value}
                </p>
                <p className="text-sm text-neutral-600 leading-relaxed">{m.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
