"use client";
import React, { useRef, useState } from "react";
import { motion, useMotionValue, useMotionTemplate } from "motion/react";
import { Check, Sparkles, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: 199,
    tagline: "Get the engine running.",
    features: [
      "60 Applications / month",
      "1 Dedicated Assistant",
      "Resume Review",
      "LinkedIn Makeover",
      "1 Mock Interview",
    ],
    accent: "#a3a3a3",
  },
  {
    name: "Standard",
    price: 250,
    tagline: "Most popular for early-career.",
    features: [
      "100 Applications / month",
      "1 Dedicated Assistant",
      "Resume + ATS Optimization",
      "LinkedIn Makeover",
      "2 Mock Interviews",
    ],
    accent: "#60a5fa",
  },
  {
    name: "Best Value",
    price: 350,
    tagline: "Senior-level acceleration.",
    features: [
      "150 Applications / month",
      "Priority Assistant",
      "Resume + ATS + Cover Letters",
      "LinkedIn Premium Revamp",
      "3 Mock Interviews",
      "Weekly Strategy Calls",
    ],
    accent: "#22c55e",
    popular: true,
  },
  {
    name: "Ultimate",
    price: 500,
    tagline: "Executive search experience.",
    features: [
      "Unlimited Applications",
      "Elite Strategy Lead",
      "Full Career Coaching",
      "Network Outreach",
      "Unlimited Mock Interviews",
      "1:1 Offer Negotiation",
    ],
    accent: "#a855f7",
  },
];

function PlanCard({ plan, index }) {
  const ref = useRef(null);
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const background = useMotionTemplate`radial-gradient(420px circle at ${mouseX}px ${mouseY}px, ${plan.accent}22, transparent 70%)`;
  const borderGradient = useMotionTemplate`radial-gradient(220px circle at ${mouseX}px ${mouseY}px, ${plan.accent}AA, transparent 80%)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        mouseX.set(-100);
        mouseY.set(-100);
      }}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className={`group relative rounded-3xl p-[1px] ${plan.popular ? "lg:-mt-4" : ""}`}
    >
      {/* Animated mouse-tracking border */}
      <motion.div
        aria-hidden
        style={{ background: borderGradient }}
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />
      {/* Static border */}
      <div
        className={`absolute inset-0 rounded-3xl ${
          plan.popular
            ? "bg-gradient-to-b from-emerald-400/40 via-white/10 to-transparent"
            : "bg-white/[0.06]"
        }`}
      />

      <div className="relative h-full rounded-3xl bg-[#070708] overflow-hidden">
        <motion.div
          aria-hidden
          style={{ background }}
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />

        {plan.popular && (
          <div className="absolute top-5 right-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
            <Sparkles size={11} /> Popular
          </div>
        )}

        <div className="relative p-8 md:p-10">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: plan.accent, boxShadow: `0 0 10px ${plan.accent}` }}
            />
            <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-neutral-300">
              {plan.name}
            </h3>
          </div>

          <p className="text-sm text-neutral-500 mb-7">{plan.tagline}</p>

          <div className="flex items-end gap-1 mb-7">
            <span className="text-5xl md:text-6xl font-semibold tracking-tight text-white">
              ${plan.price}
            </span>
            <span className="text-neutral-500 mb-2">/mo</span>
          </div>

          <a
            href="/account/signup"
            className={`group/btn relative w-full inline-flex items-center justify-center gap-2 py-3 rounded-full font-semibold transition-all ${
              plan.popular
                ? "bg-emerald-400 text-black hover:bg-emerald-300"
                : "bg-white/[0.04] text-white border border-white/10 hover:bg-white/[0.08] hover:border-white/30"
            }`}
          >
            Choose {plan.name}
            <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-0.5" />
          </a>

          <div className="my-7 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <ul className="space-y-3">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 text-sm text-neutral-300"
              >
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                  style={{ background: `${plan.accent}1A`, color: plan.accent }}
                >
                  <Check size={12} />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

export default function Pricing() {
  const [billing, setBilling] = useState("monthly");

  return (
    <section id="pricing" className="relative py-32">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-emerald-500/5 blur-[160px] rounded-full" />
      </div>

      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[11px] tracking-[0.4em] uppercase text-emerald-300 mb-5"
          >
            Pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-semibold tracking-[-0.03em] text-white"
          >
            Investment in your future.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-5 text-neutral-400 leading-relaxed"
          >
            Choose the plan that matches your career velocity. Cancel anytime.
          </motion.p>

          <div className="mt-8 inline-flex items-center gap-1 p-1 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            {["monthly", "yearly"].map((option) => (
              <button
                key={option}
                onClick={() => setBilling(option)}
                className={`relative px-5 py-2 text-xs font-semibold tracking-wide uppercase rounded-full transition-colors ${
                  billing === option ? "text-black" : "text-neutral-400 hover:text-white"
                }`}
              >
                {billing === option && (
                  <motion.span
                    layoutId="billing-pill"
                    className="absolute inset-0 bg-white rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">
                  {option}
                  {option === "yearly" && (
                    <span className="ml-2 text-[9px] text-emerald-500 font-bold">
                      −20%
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 max-w-7xl mx-auto">
          {plans.map((plan, i) => (
            <PlanCard
              key={plan.name}
              plan={{
                ...plan,
                price:
                  billing === "yearly"
                    ? Math.round(plan.price * 0.8)
                    : plan.price,
              }}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
