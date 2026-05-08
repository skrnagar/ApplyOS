"use client";
import React from "react";
import { motion } from "motion/react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Senior Product Designer",
    company: "Stripe",
    initials: "SJ",
    color: "from-emerald-400 to-cyan-400",
    content:
      "I landed my dream role at a top-tier fintech in 3 weeks. The quality of curation was unreal — every interview I got mattered.",
  },
  {
    name: "Marcus Chen",
    role: "Software Engineer",
    company: "Google",
    initials: "MC",
    color: "from-blue-500 to-purple-500",
    content:
      "Resume optimization alone was worth the price. I went from 0 callbacks to 5 interviews in the first week of working together.",
  },
  {
    name: "Elena Rodriguez",
    role: "Marketing Director",
    company: "Airbnb",
    initials: "ER",
    color: "from-pink-500 to-orange-400",
    content:
      "Best money I’ve ever spent on my career. The anxiety of job searching evaporated. I just had to show up to interviews.",
  },
  {
    name: "David Kim",
    role: "Data Scientist",
    company: "OpenAI",
    initials: "DK",
    color: "from-indigo-500 to-emerald-400",
    content:
      "Professional, efficient, surgical. They applied to roles I didn’t even know existed and matched my profile perfectly.",
  },
  {
    name: "Priya Patel",
    role: "Engineering Manager",
    company: "Notion",
    initials: "PP",
    color: "from-amber-400 to-rose-500",
    content:
      "Hands down the best return on investment for my time. Felt like I had a chief-of-staff for my career search.",
  },
  {
    name: "James O'Connor",
    role: "Growth Lead",
    company: "Linear",
    initials: "JO",
    color: "from-cyan-400 to-blue-500",
    content:
      "Their assistants are sharp, fast, and never miss a deadline. I'm sending this to every friend who's job hunting.",
  },
];

function Card({ t, depth = 0 }) {
  return (
    <div
      className="flex-shrink-0 w-[380px] md:w-[440px] mx-3 group"
      style={{
        filter: `blur(${depth * 0.6}px)`,
        opacity: 1 - depth * 0.18,
      }}
    >
      <div className="relative p-7 rounded-3xl bg-white/[0.025] border border-white/10 backdrop-blur-xl overflow-hidden hover:border-white/20 transition-colors">
        <div className="absolute -top-24 -right-20 w-64 h-64 bg-emerald-500/8 blur-3xl rounded-full" />

        <div className="relative">
          <div className="flex items-center gap-1 mb-5 text-emerald-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={13} fill="currentColor" />
            ))}
          </div>

          <p className="text-[15px] text-neutral-200 leading-relaxed mb-7">
            &ldquo;{t.content}&rdquo;
          </p>

          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-tr ${t.color} flex items-center justify-center text-white text-xs font-bold`}
              style={{
                boxShadow: "0 0 24px rgba(34,197,94,0.18)",
              }}
            >
              {t.initials}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{t.name}</div>
              <div className="text-xs text-neutral-500">
                {t.role} <span className="text-neutral-600">@ {t.company}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const row1 = [...testimonials, ...testimonials];
  const row2 = [...testimonials.slice(3), ...testimonials.slice(0, 3), ...testimonials];

  return (
    <section id="testimonials" className="py-32 overflow-hidden">
      <div className="container mx-auto px-6 mb-16 text-center max-w-3xl">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[11px] tracking-[0.4em] uppercase text-emerald-300 mb-5"
        >
          Testimonials
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-semibold tracking-[-0.03em] text-white"
        >
          Built for breakthroughs.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-5 text-neutral-400 leading-relaxed"
        >
          A community of professionals who reclaimed their time and landed offers worth chasing.
        </motion.p>
      </div>

      <div className="relative space-y-6">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

        <div className="flex" style={{ animation: "marquee 60s linear infinite" }}>
          {row1.map((t, i) => (
            <Card key={`a-${i}`} t={t} />
          ))}
        </div>

        <div
          className="flex"
          style={{ animation: "marquee 80s linear infinite reverse" }}
        >
          {row2.map((t, i) => (
            <Card key={`b-${i}`} t={t} depth={i % 3 === 0 ? 0.5 : 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
