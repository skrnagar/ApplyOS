"use client";
import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import MagneticButton from "./ui/MagneticButton";

export default function CTA() {
  return (
    <section id="contact" className="py-20 md:py-28 relative bg-[#f4f6f8]">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden border border-neutral-200/90 bg-white shadow-[0_2px_0_rgba(15,23,42,0.04),0_32px_64px_-24px_rgba(15,23,42,0.12)]">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.4] pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)
              `,
              backgroundSize: "48px 48px",
            }}
          />
          <div className="absolute top-0 right-0 w-[min(100%,420px)] h-[min(100%,320px)] bg-gradient-to-bl from-emerald-100/80 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 px-6 py-14 md:px-16 md:py-20 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-[11px] font-semibold text-emerald-800 mb-6 tracking-wide uppercase"
            >
              <Sparkles size={12} className="text-emerald-600" aria-hidden />
              Limited beta spots
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.1] text-balance"
            >
              Your next offer
              <br />
              <span className="text-emerald-700">starts with momentum.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.06 }}
              className="mt-5 text-neutral-600 max-w-xl mx-auto text-base leading-relaxed"
            >
              Stop juggling tabs and ghost applications. HireOrbit coordinates outreach, applications,
              and prep so you walk into interviews ready.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.12 }}
              className="mt-9 flex flex-col sm:flex-row gap-3 justify-center items-center"
            >
              <MagneticButton href="/account/signup" variant="cta" icon={ArrowRight}>
                Launch your pipeline
              </MagneticButton>
              <MagneticButton href="#how-it-works" variant="outline">
                See how it works
              </MagneticButton>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
