"use client";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const items = [
  {
    q: "How many jobs do assistants apply to each week?",
    a: "Most users average 35-90 targeted applications per week depending on plan and role availability.",
  },
  {
    q: "Can I control which companies are included?",
    a: "Yes. You can set preferred industries, company size, blacklist rules, and must-have filters in your dashboard.",
  },
  {
    q: "Is this fully automated or human-assisted?",
    a: "It is AI-powered with dedicated human assistants, so strategy quality remains high and applications stay personalized.",
  },
  {
    q: "Can I track interviews and offers?",
    a: "Yes. Your tracker shows each stage, assistant notes, and interview reminders in one workspace.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="py-28">
      <div className="container mx-auto px-6 max-w-4xl">
        <p className="text-[11px] tracking-[0.4em] uppercase text-emerald-300 mb-5">
          FAQ
        </p>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-white mb-10">
          Questions, answered.
        </h2>
        <div className="space-y-3">
          {items.map((item, i) => (
            <button
              type="button"
              key={item.q}
              onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full text-left glass-card rounded-2xl p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-white font-semibold">{item.q}</h3>
                <ChevronDown
                  className={`text-neutral-400 transition-transform ${open === i ? "rotate-180" : ""}`}
                  size={18}
                />
              </div>
              {open === i && <p className="text-neutral-400 text-sm mt-3">{item.a}</p>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
