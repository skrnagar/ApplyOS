"use client";
import React from "react";
import { motion } from "motion/react";
import { Quote } from "lucide-react";

const stories = [
  {
    quote:
      "I stopped rewriting the same cover letter at midnight. The team shipped relevant apps while I prepped for screens.",
    name: "Maya R.",
    role: "Product Manager",
    outcome: "3 screens in 12 days",
    delay: 0,
  },
  {
    quote:
      "Every application showed up in my tracker with notes. Recruiters stopped asking me to explain gaps in my story.",
    name: "Jordan K.",
    role: "Software Engineer",
    outcome: "Offer in 5 weeks",
    delay: 0.06,
  },
  {
    quote:
      "Outbound emails sounded like me — not templates. That alone was worth switching from solo applying.",
    name: "Alex T.",
    role: "Product Designer",
    outcome: "2× reply rate",
    delay: 0.12,
  },
];

export default function DMSection() {
  return (
    <section className="py-16 sm:py-20 md:py-28 bg-[#f8faf9] border-y border-neutral-200/80">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
          <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-emerald-700 mb-3">
            Member outcomes
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 text-balance">
            Less grind. More conversations that matter.
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-neutral-600 leading-relaxed max-w-lg mx-auto">
            Real feedback from people who wanted momentum without burning out on job boards.
          </p>
        </div>

        {/* Mobile: horizontal snap scroll */}
        <div className="md:hidden -mx-4 px-4">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide">
            {stories.map((s) => (
              <StoryCard key={s.name} {...s} className="min-w-[min(88vw,320px)] snap-center shrink-0" />
            ))}
          </div>
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-5 lg:gap-6 max-w-6xl mx-auto">
          {stories.map((s) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: s.delay }}
            >
              <StoryCard {...s} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StoryCard({ quote, name, role, outcome, className = "" }) {
  return (
    <article
      className={`flex flex-col h-full rounded-2xl border border-neutral-200/90 bg-white p-5 sm:p-6 shadow-sm ${className}`}
    >
      <Quote size={20} className="text-emerald-500/80 mb-3 shrink-0" aria-hidden />
      <blockquote className="text-sm sm:text-[15px] leading-relaxed text-neutral-700 flex-1">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <footer className="mt-5 pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-neutral-900">{name}</p>
          <p className="text-xs text-neutral-500">{role}</p>
        </div>
        <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
          {outcome}
        </span>
      </footer>
    </article>
  );
}
