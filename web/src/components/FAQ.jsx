"use client";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const items = [
  {
    q: "How many jobs do assistants apply to each week?",
    a: "Most users average 35–90 targeted applications per week depending on plan and role availability.",
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
    <section id="faq" className="py-20 md:py-28 bg-[#fafbfc] border-t border-neutral-200/80">
      <div className="container mx-auto px-5 sm:px-6 max-w-3xl">
        <p className="text-[11px] tracking-[0.35em] uppercase text-emerald-700 font-semibold mb-4 text-center">
          FAQ
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 mb-10 text-center text-balance">
          Questions, answered.
        </h2>
        <div className="space-y-2">
          {items.map((item, i) => (
            <button
              type="button"
              key={item.q}
              onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full text-left rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-sm hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-neutral-900 font-semibold text-[15px] md:text-base text-left">{item.q}</h3>
                <ChevronDown
                  className={`text-neutral-400 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}
                  size={18}
                  aria-hidden
                />
              </div>
              {open === i && <p className="text-neutral-600 text-sm mt-3 leading-relaxed">{item.a}</p>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
