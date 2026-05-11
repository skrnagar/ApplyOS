"use client";
import React from "react";
import { motion } from "motion/react";

const logos = [
  "Stripe",
  "OpenAI",
  "Linear",
  "Vercel",
  "Notion",
  "Airbnb",
  "Figma",
  "Datadog",
  "Anthropic",
  "Shopify",
  "Ramp",
  "Plaid",
];

export default function LogoCloud() {
  return (
    <section className="py-12 md:py-14 border-y border-neutral-200/80 bg-white/50 relative overflow-hidden">
      <div className="container mx-auto px-5 sm:px-6 mb-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[11px] tracking-[0.35em] uppercase text-neutral-500 font-semibold"
        >
          Companies &amp; teams our customers join
        </motion.p>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-[#f4f6f8] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-[#f4f6f8] to-transparent z-10 pointer-events-none" />

        <div className="flex gap-12 md:gap-16 whitespace-nowrap" style={{ animation: "marquee 38s linear infinite" }}>
          {[...logos, ...logos].map((logo, i) => (
            <span
              key={i}
              className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-neutral-400 hover:text-neutral-700 transition-colors"
              style={{ fontFamily: "ui-serif, Georgia, serif", letterSpacing: "-0.02em" }}
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
