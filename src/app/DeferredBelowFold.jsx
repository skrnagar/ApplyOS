"use client";
import { lazy, Suspense, useEffect } from "react";

// Code-split, but rendered on the server (Suspense streams it) so crawlers and link
// previews receive the full page — pricing, FAQ, how-it-works — not an empty spacer.
// The client hydrates the chunk without blocking the hero (selective hydration).
const LandingBelowFold = lazy(() => import("./LandingBelowFold"));

function getHashId() {
  if (typeof window === "undefined") return null;
  const id = window.location.hash.replace(/^#/, "").trim();
  return id || null;
}

/** Deep links like /#pricing: wait for the lazy sections to mount, then scroll. */
function useScrollToHash() {
  useEffect(() => {
    const hashId = getHashId();
    if (!hashId) return;

    let tries = 0;
    const timer = window.setInterval(() => {
      const el = document.getElementById(hashId);
      tries += 1;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.clearInterval(timer);
      } else if (tries >= 40) {
        window.clearInterval(timer);
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, []);
}

export default function DeferredBelowFold() {
  useScrollToHash();

  return (
    <Suspense fallback={<div className="min-h-[50vh]" aria-hidden />}>
      <LandingBelowFold />
    </Suspense>
  );
}
