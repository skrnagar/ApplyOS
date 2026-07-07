"use client";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/config/site";
import { Link } from "react-router";
import { FAQ_ITEMS } from "@/config/faq";

const items = FAQ_ITEMS;

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="py-20 md:py-28 bg-[#fafbfc] border-t border-neutral-200/80 scroll-mt-28">
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
        <p className="mt-10 text-center text-sm text-neutral-600">
          Still have questions?{" "}
          <Link to="/contact" className="font-semibold text-emerald-700 hover:underline">
            Contact us
          </Link>{" "}
          or email{" "}
          <a href={CONTACT_MAILTO} className="font-semibold text-emerald-700 hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>
    </section>
  );
}
