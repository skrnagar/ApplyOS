"use client";
import MarketingShell from "../components/marketing/MarketingShell";
import Hero from "../components/Hero";
import LogoCloud from "../components/LogoCloud";
import DeferredBelowFold from "./DeferredBelowFold";
import { metaForPath } from "@/utils/seo";

export function meta() {
  return metaForPath("/");
}

export default function LandingPage() {
  return (
    <MarketingShell>
      <Hero />
      <LogoCloud />
      <DeferredBelowFold />
    </MarketingShell>
  );
}
