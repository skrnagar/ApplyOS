"use client";
import React from "react";
import { motion } from "motion/react";
import { Zap, Target, LineChart } from "lucide-react";

const items = [
  {
    icon: Target,
    title: "Precision targeting",
    body: "Role, comp, industry, and company filters that stay aligned with your story — not generic keyword dumps.",
  },
  {
    icon: Zap,
    title: "Consistent execution",
    body: "A weekly application cadence with human + AI review so quality holds as volume scales.",
  },
  {
    icon: LineChart,
    title: "Clear visibility",
    body: "Pipeline analytics and assistant notes so you always know what shipped, when, and why.",
  },
];

/** Replaces heavy WebGL tunnel with a lightweight, readable band (Hiredeasy-adjacent professionalism). */
export default function LightFeatureBand() {
  return (
    <section className="py-16 md:py-24 border-y border-neutral-200/80 bg-white/60">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="max-w-2xl mb-10 md:mb-14">
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-emerald-700 mb-3">
            How we keep it professional
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-neutral-900 tracking-tight">
            A disciplined search engine — not a black box.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-neutral-200/90 bg-[#fafbfc] p-6 md:p-7"
              >
                <Icon className="text-emerald-700 mb-4" size={22} aria-hidden />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{item.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
