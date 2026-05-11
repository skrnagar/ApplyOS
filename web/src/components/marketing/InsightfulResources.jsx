"use client";
import React from "react";
import { motion } from "motion/react";
import { ArrowUpRight, FileText, Mic, Linkedin, Sparkles } from "lucide-react";

const resources = [
  {
    href: "/tools#resume",
    icon: FileText,
    title: "Resume readiness checklist",
    desc: "Structure, metrics, and ATS alignment before you upload.",
  },
  {
    href: "/tools#linkedin",
    icon: Linkedin,
    title: "LinkedIn headline formulas",
    desc: "Three proven patterns for IC, manager, and pivot stories.",
  },
  {
    href: "/tools#interview",
    icon: Mic,
    title: "Interview story bank",
    desc: "STAR prompts that pair with mock interviews in HireOrbit.",
  },
  {
    href: "/tools#ats",
    icon: Sparkles,
    title: "ATS hygiene playbook",
    desc: "Parsing pitfalls our Resume Lab scores against first.",
  },
];

export default function InsightfulResources() {
  return (
    <section id="resources" className="py-20 md:py-28 bg-[#fafbfc] border-t border-neutral-200/80 scroll-mt-28">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-12 max-w-5xl mx-auto md:max-w-none">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-emerald-700 mb-4">
              Insightful resources
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 text-balance">
              Sharpen your materials before you scale applications.
            </h2>
            <p className="mt-3 text-neutral-600 leading-relaxed">
              Free tools — same frameworks we use in onboarding. No login required.
            </p>
          </div>
          <a
            href="/tools"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-900 bg-neutral-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-neutral-800 transition-colors shrink-0 self-start md:self-auto"
          >
            Browse all tools
            <ArrowUpRight size={16} aria-hidden />
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {resources.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.a
                key={r.href}
                href={r.href}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm hover:border-emerald-300/70 hover:shadow-md transition-all flex flex-col h-full"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 mb-4 group-hover:bg-emerald-100 transition-colors">
                  <Icon size={20} aria-hidden />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2 text-[15px] leading-snug group-hover:text-emerald-800 transition-colors">
                  {r.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed flex-1">{r.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  Open guide
                  <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden />
                </span>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
