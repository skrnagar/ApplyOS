"use client";
import React from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

/** Hiredeasy-style “cost vs. opportunity” teaser — pushes toward pricing/signup without heavy visuals. */
export default function ValueTeaser() {
  return (
    <section className="py-14 md:py-20 relative">
      <div className="container mx-auto px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto rounded-2xl border border-neutral-200/90 bg-white px-6 py-8 md:px-10 md:py-10 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-neutral-500 mb-2">
                The real comparison
              </p>
              <h3 className="text-xl md:text-2xl font-semibold text-neutral-900 tracking-tight text-balance">
                One overlooked week of search can cost far more than a month of HireOrbit.
              </h3>
              <p className="mt-3 text-sm md:text-base text-neutral-600 leading-relaxed">
                Transparent applications, curated targets, assistant coverage, and the analytics to
                see what is working — without living inside job boards.
              </p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3">
              <a
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
              >
                View plans
                <ArrowRight size={16} aria-hidden />
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 px-6 py-3 text-sm font-semibold text-neutral-800 hover:bg-white transition-colors"
              >
                Talk to us
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
