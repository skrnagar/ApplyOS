"use client";
import React from "react";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Bell,
} from "lucide-react";

const modules = [
  { title: "AI Dashboard", icon: LayoutDashboard, desc: "Live hiring funnel analytics with assistant velocity tracking." },
  { title: "Application Tracker", icon: Briefcase, desc: "Kanban workflow from Saved to Offer with status history." },
  { title: "Resume Lab", icon: FileText, desc: "ATS scoring, version control, and optimization suggestions." },
  { title: "Assistant Chat", icon: MessageSquare, desc: "Real-time updates, notes, and interview coordination." },
  { title: "AI Insights", icon: Sparkles, desc: "Role matching, market trend analysis, and skill-gap recommendations." },
  { title: "Secure Auth", icon: ShieldCheck, desc: "Protected sessions and onboarding flow built for trust." },
  { title: "Stripe Billing", icon: CreditCard, desc: "Plan upgrades, invoices, payment history, and subscription control." },
  { title: "Smart Alerts", icon: Bell, desc: "Email + in-app notifications for every key application event." },
];

export default function PlatformPreview() {
  return (
    <section className="py-20 md:py-28 bg-white border-y border-neutral-200/80">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-700 font-semibold mb-3">
            Platform modules
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-neutral-900 tracking-tight">
            Your career operating system
          </h2>
          <p className="mt-4 text-neutral-600 text-sm md:text-base leading-relaxed">
            Everything you need to run a serious search — not a patchwork of spreadsheets and tabs.
          </p>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="rounded-2xl border border-neutral-200/90 bg-[#fafbfc] p-5 hover:border-emerald-200/80 hover:bg-white hover:shadow-sm transition-all"
              >
                <Icon className="text-emerald-700 mb-3" size={20} aria-hidden />
                <h3 className="text-neutral-900 font-semibold mb-2 text-[15px]">{item.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
