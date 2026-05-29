"use client";
import React from "react";
import {
  ArrowRight,
  PhoneCall,
  Sparkles,
  ShieldCheck,
  Clock3,
  Briefcase,
  FileText,
  Linkedin,
  Mail,
} from "lucide-react";
import MarketingButton from "./ui/MarketingButton";
import HeroWorkspacePreview from "./marketing/HeroWorkspacePreview";

const FEATURES = [
  { icon: Briefcase, label: "Hundreds of tailored applications" },
  { icon: FileText, label: "ATS resume rewrites" },
  { icon: Linkedin, label: "LinkedIn optimization" },
  { icon: Mail, label: "Recruiter cold outreach" },
];

const TOP_COMPANIES = ["Google", "Amazon", "Microsoft", "Meta", "Apple"];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f4f6f8]">
      <div className="pointer-events-none absolute inset-0 hero-atmosphere" aria-hidden />
      <div className="pointer-events-none absolute inset-0 hero-atmosphere-grid opacity-[0.55]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#f4f6f8] via-[#f4f6f8]/80 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-[min(100%,92rem)] px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 md:pb-20">
        <div className="grid grid-cols-1 gap-10 lg:gap-12 xl:gap-16 items-start lg:grid-cols-[minmax(0,1fr)_minmax(0,1.48fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,1.62fr)] 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.72fr)] max-w-[min(100%,90rem)] mx-auto">
          <div className="order-1 space-y-6 sm:space-y-7 hero-fade-in">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200/90 bg-white/90 text-[11px] sm:text-xs font-medium text-emerald-800 shadow-sm">
              <Sparkles size={12} className="text-emerald-600 shrink-0" aria-hidden />
              <span className="tracking-wide uppercase">Dedicated job search assistant</span>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <h1 className="text-[clamp(2.125rem,5.5vw,4.5rem)] font-semibold tracking-[-0.04em] leading-[1.06] text-neutral-900 text-balance">
                <span className="block">We apply to hundreds of jobs.</span>
                <span className="block mt-1 sm:mt-1.5 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
                  You get callbacks at top companies.
                </span>
              </h1>

              <p className="max-w-xl text-neutral-600 text-[15px] sm:text-base lg:text-[17px] leading-[1.65] sm:leading-relaxed text-pretty">
                HireOrbital assigns you a{" "}
                <span className="font-semibold text-neutral-800">dedicated job search assistant</span>{" "}
                who applies to hundreds of jobs, rewrites your resume for ATS, optimizes your
                LinkedIn, and sends cold emails to recruiters — so you get more callbacks at
                companies like{" "}
                <span className="font-semibold text-neutral-900">Google, Amazon, and more</span>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {TOP_COMPANIES.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center rounded-lg border border-neutral-200/90 bg-white/80 px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-neutral-600 shadow-sm"
                >
                  {name}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl">
              {FEATURES.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 rounded-xl border border-neutral-200/80 bg-white/70 px-3 py-2.5 text-sm text-neutral-700"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <Icon size={15} aria-hidden />
                  </span>
                  <span className="font-medium leading-snug">{label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-1">
              <MarketingButton
                href="/account/signup"
                variant="cta"
                icon={ArrowRight}
                className="w-full sm:w-auto justify-center"
              >
                Start free
              </MarketingButton>
              <MarketingButton
                href="/contact"
                variant="outline"
                icon={PhoneCall}
                className="w-full sm:w-auto justify-center"
              >
                Talk to an expert
              </MarketingButton>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 text-[11px] sm:text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-neutral-700">
                <ShieldCheck size={13} className="text-emerald-600" />
                Human-reviewed applications
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-neutral-700">
                <Clock3 size={13} className="text-sky-600" />
                Live daily pipeline updates
              </span>
            </div>
          </div>

          <div className="order-2 w-full max-w-md md:max-w-2xl mx-auto lg:mx-0 lg:max-w-none lg:w-full min-w-0 hero-fade-in-delay">
            <HeroWorkspacePreview className="w-full" />
          </div>
        </div>

        <div className="max-w-[min(100%,90rem)] mx-auto mt-10 md:mt-12">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto lg:mx-0 lg:max-w-xl">
            <Stat label="Customers" display="700+" />
            <Stat label="Applications" display="250K+" />
            <Stat label="Avg. rating" display="4.9" showStar />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, display, showStar = false }) {
  return (
    <div className="text-center lg:text-left border-l border-neutral-200/90 pl-3 sm:pl-4 first:border-l-0 first:pl-0">
      <div className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 tabular-nums">
        {display}
        {showStar && <span className="text-amber-500 text-xl sm:text-2xl md:text-3xl ml-0.5">★</span>}
      </div>
      <div className="mt-1 text-[10px] sm:text-xs tracking-wide uppercase text-neutral-500 font-medium">
        {label}
      </div>
    </div>
  );
}
