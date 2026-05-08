"use client";
import React, { useRef } from "react";
import { motion, useMotionValue, useMotionTemplate } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import MagneticButton from "./ui/MagneticButton";

export default function CTA() {
  const ref = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const spotlight = useMotionTemplate`radial-gradient(800px circle at calc(${mx} * 100%) calc(${my} * 100%), rgba(34,197,94,0.18), transparent 60%)`;

  const handleMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <section id="contact" className="py-32 relative">
      <div className="container mx-auto px-6">
        <div
          ref={ref}
          onMouseMove={handleMove}
          className="relative max-w-6xl mx-auto rounded-[3rem] overflow-hidden border border-white/10 bg-gradient-to-b from-[#080a0c] to-[#020203]"
        >
          <motion.div
            aria-hidden
            style={{ background: spotlight }}
            className="absolute inset-0"
          />

          {/* Animated grid */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.18] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.08) 1px,transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage:
                "radial-gradient(ellipse at center,black 30%,transparent 70%)",
            }}
          />

          {/* Floating orbs */}
          <motion.div
            aria-hidden
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-12 left-12 w-40 h-40 rounded-full bg-emerald-400/15 blur-3xl"
          />
          <motion.div
            aria-hidden
            animate={{ y: [0, 14, 0], x: [0, -8, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 right-12 w-52 h-52 rounded-full bg-blue-500/15 blur-3xl"
          />

          <div className="relative z-10 px-8 py-20 md:px-24 md:py-28 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-medium text-white mb-8 tracking-[0.18em] uppercase backdrop-blur-md"
            >
              <Sparkles size={12} className="text-emerald-300" />
              Limited Beta Spots
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-7xl font-semibold tracking-[-0.04em] text-white leading-[0.95]"
            >
              Your Dream Job
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400">
                Starts Here.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="mt-7 text-lg text-neutral-400 max-w-2xl mx-auto"
            >
              Stop scrolling endlessly. Let our AI-human team handle the heavy
              lifting. You walk into interviews ready.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center"
            >
              <MagneticButton href="/account/signup" variant="glow" icon={ArrowRight}>
                Start Applying Today
              </MagneticButton>
              <MagneticButton href="#how-it-works" variant="secondary">
                See How It Works
              </MagneticButton>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
