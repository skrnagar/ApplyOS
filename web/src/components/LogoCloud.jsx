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
    <section className="py-16 border-y border-white/5 relative overflow-hidden">
      <div className="container mx-auto px-6 mb-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[11px] tracking-[0.4em] uppercase text-neutral-500"
        >
          Customers Hired At
        </motion.p>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

        <div className="flex gap-16 whitespace-nowrap" style={{ animation: "marquee 38s linear infinite" }}>
          {[...logos, ...logos].map((logo, i) => (
            <span
              key={i}
              className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-500 hover:text-white transition-colors"
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
