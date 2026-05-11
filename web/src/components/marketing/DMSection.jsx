"use client";
import React from "react";
import { motion } from "motion/react";

const threads = [
  {
    handle: "@maya · PM",
    msg: "I stopped doom-scrolling Indeed. Assistants shipped 40 tailored apps while I slept. Interview pipeline finally moved.",
    tone: "from",
    delay: 0,
  },
  {
    handle: "HireOrbit · Assist",
    msg: "Weekly digest is live — 12 new matches, 3 replies, 1 phone screen Thurs. Want us to prioritize Series B infra roles?",
    tone: "brand",
    delay: 0.05,
  },
  {
    handle: "@jordan · Eng",
    msg: "Cold email angles they wrote for me sounded like *me*. Not cheesy templates. Worth it for the outbound alone.",
    tone: "from",
    delay: 0.1,
  },
  {
    handle: "@alex · Designer",
    msg: "The transparency freaked me out at first… then it became my favorite part. I could explain every apply to recruiters.",
    tone: "from",
    delay: 0.15,
  },
];

export default function DMSection() {
  return (
    <section className="py-20 md:py-28 bg-white border-y border-neutral-200/90">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="max-w-2xl mx-auto text-center mb-12 md:mb-14">
          <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-neutral-500 mb-4">
            Straight from our DMs
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-neutral-900 text-balance">
            Real chatter from people dodging burnout.
          </h2>
        </div>

        <div className="max-w-lg mx-auto space-y-4 md:space-y-5">
          {threads.map((t) => (
            <motion.figure
              key={t.msg.slice(0, 32)}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: t.delay }}
              className={`flex flex-col gap-2 ${t.tone === "brand" ? "items-end" : "items-start"}`}
            >
              <figcaption
                className={`text-[11px] font-semibold uppercase tracking-wider px-3 ${
                  t.tone === "brand" ? "text-emerald-700" : "text-neutral-500"
                }`}
              >
                {t.handle}
              </figcaption>
              <blockquote
                className={`max-w-[95%] rounded-2xl px-4 py-3.5 text-[15px] leading-relaxed shadow-sm border ${
                  t.tone === "brand"
                    ? "bg-emerald-600 text-white border-emerald-700 rounded-br-md"
                    : "bg-neutral-100 text-neutral-800 border-neutral-200/90 rounded-bl-md"
                }`}
              >
                {t.msg}
              </blockquote>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
