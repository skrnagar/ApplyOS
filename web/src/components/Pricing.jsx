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
      "250 applications / month",
      "1 dedicated assistant",
      "Resume & ATS alignment",
      "LinkedIn optimization",
    ],
    accent: "#64748b",
  },
  {
    name: "Standard",
    price: 250,
    tagline: "Scale volume without losing quality.",
    features: [
      "350 applications / month",
      "1 dedicated assistant",
      "50 cold outreach emails / month",
      "Full resume review",
      "LinkedIn makeover",
    ],
    accent: "#3b82f6",
  },
  {
    name: "Best Value",
    price: 350,
    tagline: "Most teams land here.",
    features: [
      "800 applications / month",
      "2 dedicated assistants",
      "200 cold outreach emails / month",
      "Resume + cover letters + custom variants",
      "LinkedIn premium revamp",
      "2 mock interviews",
    ],
    accent: "#059669",
    popular: true,
  },
  {
    name: "Ultimate",
    price: 500,
    tagline: "Executive search experience.",
    features: [
      "1,200+ applications / month",
      "3 dedicated assistants",
      "500 cold outreach emails / month",
      "Everything in Best Value",
      "Priority strategy & outreach",
      "5 mock interviews",
    ],
    accent: "#7c3aed",
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

  const background = useMotionTemplate`radial-gradient(380px circle at ${mouseX}px ${mouseY}px, ${plan.accent}18, transparent 65%)`;
  const borderGradient = useMotionTemplate`radial-gradient(200px circle at ${mouseX}px ${mouseY}px, ${plan.accent}55, transparent 75%)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        mouseX.set(-100);
        mouseY.set(-100);
      }}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className={`group relative rounded-2xl p-[1px] ${plan.popular ? "lg:-mt-2 shadow-md shadow-emerald-900/10" : ""}`}
    >
      <motion.div
        aria-hidden
        style={{ background: borderGradient }}
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      />
      <div
        className={`absolute inset-0 rounded-2xl ${
          plan.popular
            ? "bg-gradient-to-b from-emerald-200/80 via-emerald-100/40 to-neutral-100/80"
            : "bg-neutral-200/70"
        }`}
      />

      <div className="relative h-full rounded-2xl bg-white overflow-hidden border border-neutral-100">
        <motion.div
          aria-hidden
          style={{ background }}
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        />

        {plan.popular && (
          <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            <Sparkles size={11} aria-hidden /> Best value
          </div>
        )}

        <div className="relative p-6 md:p-8">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: plan.accent }}
            />
            <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500">
              {plan.name}
            </h3>
          </div>

          <p className="text-sm text-neutral-600 mb-5">{plan.tagline}</p>

          <div className="flex items-end gap-1 mb-6">
            <span className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900">
              ${plan.price}
            </span>
            <span className="text-neutral-500 text-sm pb-1.5">/mo</span>
          </div>

          <a
            href="/account/signup"
            className={`group/btn relative w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors ${
              plan.popular
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-neutral-900 text-white hover:bg-neutral-800"
            }`}
          >
            Choose {plan.name}
            <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-0.5" aria-hidden />
          </a>

          <div className="my-6 h-px bg-neutral-100" />

          <ul className="space-y-2.5">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-neutral-700">
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100"
                >
                  <Check size={12} aria-hidden />
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
    <section id="pricing" className="relative py-20 md:py-28">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-14">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[11px] tracking-[0.35em] uppercase text-emerald-700 font-semibold mb-4"
          >
            Pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-5xl font-semibold tracking-tight text-neutral-900 text-balance"
          >
            Investment in your future.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-neutral-600 leading-relaxed max-w-xl mx-auto"
          >
            Pick the throughput that fits your goals. Transparent scope, cancel anytime.
          </motion.p>

          <div className="mt-6 inline-flex items-center gap-1 p-1 rounded-full border border-neutral-200 bg-white shadow-sm">
            {["monthly", "yearly"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setBilling(option)}
                className={`relative px-5 py-2 text-xs font-semibold tracking-wide uppercase rounded-full transition-colors ${
                  billing === option ? "text-white" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {billing === option && (
                  <motion.span
                    layoutId="billing-pill"
                    className="absolute inset-0 bg-neutral-900 rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">
                  {option}
                  {option === "yearly" && (
                    <span className="ml-2 text-[9px] text-emerald-400 font-bold">−20%</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 max-w-7xl mx-auto">
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
