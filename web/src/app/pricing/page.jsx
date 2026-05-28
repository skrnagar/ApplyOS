"use client";
import React from "react";
import MarketingShell from "@/components/marketing/MarketingShell";
import Pricing from "@/components/Pricing";
import { metaForPath } from "@/utils/seo";

export function meta() {
  return metaForPath("/pricing");
}

export default function PricingPage() {
  return (
    <MarketingShell>
      <div className="pt-28 pb-4">
        <Pricing />
      </div>
    </MarketingShell>
  );
}
