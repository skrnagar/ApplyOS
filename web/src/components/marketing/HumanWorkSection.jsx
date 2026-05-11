"use client";
import React from "react";
import { motion } from "motion/react";
import { Bot, Headphones, MessageCircle } from "lucide-react";

const pillars = [
  {
    icon: Headphones,
    title: "Human assistants",
    body: "Real operators who own your queue, escalate edge cases, and keep tone aligned with your profile.",
  },
  {
    icon: Bot,
    title: "AI acceleration",
    body: "Models draft, score, and route — humans approve. You get speed without losing accountability.",
  },
  {
    icon: MessageCircle,
    title: "Always-on comms",
    body: "Slack-style updates in-product: what shipped, who replied, and what to prep for next.",
  },
];

export default function HumanWorkSection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: `linear-gradient(105deg, transparent 40%, rgba(16,185,129,0.06) 50%, transparent 60%)`,
        }}
      />
      <div className="container mx-auto px-5 sm:px-6 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-emerald-700 mb-4">
              Human + AI
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-semibold tracking-tight text-neutral-900 leading-[1.12] text-balance">
              Let another human do the{' '}
              <span className="text-emerald-700">high-friction work</span>.
            </h2>
            <p className="mt-5 text-neutral-600 text-base md:text-lg leading-relaxed max-w-xl">
              Forms, follow-ups, rewrites, and scheduling — the parts that drain you — run through HireOrbit’s
              assistant layer. You stay in decision mode: targets, stories, and offers.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-neutral-700">
              {["No black-box bots", "Exportable apply log", "Escalation to humans on every tier"].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {x}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="rounded-2xl border border-neutral-200/90 bg-white p-5 md:p-6 shadow-sm flex gap-4"
                >
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                    <Icon size={20} aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">{p.title}</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">{p.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
