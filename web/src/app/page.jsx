"use client";
import { lazy, Suspense } from "react";
import MarketingShell from "../components/marketing/MarketingShell";
import Hero from "../components/Hero";
import LogoCloud from "../components/LogoCloud";
import { metaForPath } from "@/utils/seo";

export function meta() {
  return metaForPath("/");
}

const LandingBelowFold = lazy(() => import("./LandingBelowFold"));

export default function LandingPage() {
  return (
    <MarketingShell>
      <Hero />
      <LogoCloud />
      <Suspense fallback={<div className="min-h-[50vh]" aria-hidden="true" />}>
        <LandingBelowFold />
      </Suspense>
    </MarketingShell>
  );
}
