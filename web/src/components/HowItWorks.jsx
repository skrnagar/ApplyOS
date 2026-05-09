"use client";
import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Upload, Target, CheckCircle } from "lucide-react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

const steps = [
  {
    title: "Upload Your Resume",
    description:
      "Our AI analyzes your experience and identifies high-impact keywords to beat ATS filters.",
    icon: Upload,
    color: "from-blue-500 to-cyan-400",
  },
  {
    title: "Define Your Target",
    description:
      "Tell us your dream roles, salary expectations, and preferred companies. We handle the rest.",
    icon: Target,
    color: "from-green-500 to-emerald-400",
  },
  {
    title: "Daily Applications",
    description:
      "Your dedicated assistant applies to curated jobs daily, sending you real-time updates.",
    icon: CheckCircle,
    color: "from-purple-500 to-pink-500",
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
          { opacity: 0.4, y: 60, scale: 0.92 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 82%",
              end: "top 45%",
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
      className="py-32 bg-black relative overflow-hidden"
    >
      <div className="container mx-auto px-6">
        <div className="mb-20 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            A Cinematic Approach To <br />
            <span className="text-neutral-500">Your Next Career Move</span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 hidden md:block" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group relative p-8 rounded-3xl bg-neutral-900/50 border border-white/5 backdrop-blur-sm hover:border-white/20 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-blue-500/0 via-blue-400 to-green-400/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg shadow-black/50 group-hover:scale-110 transition-transform duration-500`}
                >
                  <Icon size={28} className="text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-neutral-400 leading-relaxed">
                  {step.description}
                </p>

                <div className="mt-8 flex items-center gap-2 text-sm font-medium text-neutral-500">
                  <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    0{index + 1}
                  </span>
                  Step
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-500/10 blur-[120px] rounded-full" />
      </div>
    </section>
  );
}
