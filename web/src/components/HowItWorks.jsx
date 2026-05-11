"use client";
import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Upload, Target, CheckCircle } from "lucide-react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

const steps = [
  {
    title: "Upload your resume",
    description:
      "Our AI analyzes your experience and surfaces high-impact keywords to clear ATS gates.",
    icon: Upload,
    color: "from-sky-500 to-cyan-500",
  },
  {
    title: "Define your target",
    description:
      "Roles, salary bands, geography, and must-haves — we align search rules to your story.",
    icon: Target,
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: "Daily applications",
    description:
      "Assistants execute a steady cadence of curated submissions with transparent updates.",
    icon: CheckCircle,
    color: "from-violet-500 to-indigo-500",
  },
];

export default function HowItWorks() {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0.5, y: 48, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              end: "top 48%",
              scrub: true,
            },
          },
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="py-20 md:py-28 bg-[#fafbfc] relative overflow-hidden border-y border-neutral-200/70"
    >
      <div className="container mx-auto px-5 sm:px-6">
        <div className="mb-14 md:mb-16 text-center max-w-2xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-semibold text-neutral-900 tracking-tight"
          >
            A clear playbook for{' '}
            <span className="text-neutral-500">your next move</span>
          </motion.h2>
          <p className="mt-4 text-neutral-600 text-sm md:text-base leading-relaxed">
            No mystery mechanics — upload, aim, execute. Visibility lives in your dashboard from day one.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6 relative">
          <div className="absolute top-[42%] left-0 w-full h-px bg-neutral-200/90 hidden md:block pointer-events-none" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="group relative p-6 md:p-7 rounded-2xl bg-white border border-neutral-200/90 shadow-sm hover:border-emerald-200/80 hover:shadow-md transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 shadow-md shadow-neutral-900/10`}
                >
                  <Icon size={24} className="text-white" aria-hidden />
                </div>

                <h3 className="text-lg md:text-xl font-semibold text-neutral-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-neutral-600 text-sm md:text-[15px] leading-relaxed">
                  {step.description}
                </p>

                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  <span className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center border border-neutral-200 text-neutral-800 tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  Step
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
