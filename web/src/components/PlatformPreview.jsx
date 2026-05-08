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
    <section className="py-28">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.28em] text-blue-300 mb-4">Platform Modules</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white text-glow">Complete AI Job Search Operating System</h2>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="glass-card rounded-2xl p-5 hover:border-blue-400/30 transition-colors"
              >
                <Icon className="text-blue-300 mb-4" size={20} />
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
