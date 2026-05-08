"use client";
import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, PhoneCall, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroScene from "./three/HeroScene";
import MagneticButton from "./ui/MagneticButton";
import AnimatedCounter from "./ui/AnimatedCounter";

export default function Hero() {
  const heroRef = useRef(null);
  const sceneRef = useRef(null);
  const scrollProgressRef = useRef(0);
  const headlineRef = useRef(null);

  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 600], [1, 0]);
  const blur = useTransform(scrollY, [0, 600], ["0px", "8px"]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      const trigger = ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          scrollProgressRef.current = self.progress;
        },
      });

      if (headlineRef.current) {
        const lines = headlineRef.current.querySelectorAll(".reveal-line span");
        gsap.from(lines, {
          y: 80,
          opacity: 0,
          rotateX: -45,
          stagger: 0.08,
          duration: 1.1,
          ease: "expo.out",
          delay: 0.2,
        });
      }

      return () => trigger.kill();
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100svh] flex flex-col items-center justify-center pt-24 overflow-hidden"
    >
      {/* 3D Cinematic Scene */}
      <div
        ref={sceneRef}
        className="absolute inset-0 -z-10"
        style={{ pointerEvents: "auto" }}
      >
        <HeroScene scrollProgress={scrollProgressRef} />
      </div>

      {/* Ambient gradient mesh */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[12%] w-[42rem] h-[42rem] rounded-full bg-blue-500/12 blur-[140px]" />
        <div className="absolute bottom-[6%] right-[10%] w-[38rem] h-[38rem] rounded-full bg-emerald-500/12 blur-[140px]" />
        <div className="absolute top-[40%] left-[40%] w-[26rem] h-[26rem] rounded-full bg-purple-500/8 blur-[120px]" />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 -z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.85)_85%)]" />

      <motion.div
        style={{ opacity, filter: blur }}
        className="container mx-auto px-6 z-10 relative"
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-emerald-300 mb-10 backdrop-blur-xl"
          >
            <Sparkles size={12} className="text-emerald-400" />
            <span className="tracking-[0.18em] uppercase">
              AI-Powered Career Acceleration
            </span>
            <span className="relative flex h-1.5 w-1.5 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
          </motion.div>

          <h1
            ref={headlineRef}
            className="text-[clamp(2.5rem,7vw,6.5rem)] font-semibold tracking-[-0.04em] leading-[0.95] text-white mb-7"
            style={{ perspective: 800 }}
          >
            <div className="reveal-line overflow-hidden">
              <span className="inline-block">We Apply To Jobs</span>
            </div>
            <div className="reveal-line overflow-hidden">
              <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 [text-shadow:0_0_60px_rgba(34,197,94,0.3)]">
                So You Don&rsquo;t Have To.
              </span>
            </div>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className="text-base md:text-lg text-neutral-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Dedicated assistants applying to hundreds of curated jobs while you
            focus on interviews. Real humans, AI velocity, zero busywork.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <MagneticButton href="/account/signup" variant="primary" icon={ArrowRight}>
              Get Started
            </MagneticButton>
            <MagneticButton href="#contact" variant="secondary" icon={PhoneCall}>
              Book Free Call
            </MagneticButton>
          </motion.div>

          {/* Trust stats */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.1 }}
            className="mt-24 grid grid-cols-3 gap-6 md:gap-12 max-w-3xl mx-auto"
          >
            <Stat label="Customers" value={700} suffix="+" />
            <Stat label="Applications Sent" value={250} suffix="K+" />
            <Stat label="Average Rating" value={4.9} decimals={1} suffix="★" />
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[10px] tracking-[0.4em] uppercase text-neutral-500 z-10"
      >
        <span>Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          className="w-px h-10 bg-gradient-to-b from-emerald-400/0 via-emerald-400 to-emerald-400/0"
        />
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black pointer-events-none" />
    </section>
  );
}

function Stat({ label, value, suffix = "", decimals = 0 }) {
  return (
    <div className="text-left md:text-center border-l md:border-l-0 md:border-t border-white/5 pl-4 md:pl-0 md:pt-6">
      <div className="text-3xl md:text-5xl font-semibold tracking-tight text-white">
        <AnimatedCounter value={value} suffix={suffix} decimals={decimals} />
      </div>
      <div className="mt-2 text-[10px] md:text-xs tracking-[0.3em] uppercase text-neutral-500 font-medium">
        {label}
      </div>
    </div>
  );
}
