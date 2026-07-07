"use client";
import { useEffect, useRef, useState } from "react";

const BELOW_FOLD_HASH_IDS = new Set([
  "difference",
  "how-it-works",
  "faq",
  "signup",
  "contact",
  "testimonials",
  "pricing",
  "resources",
]);

function getHashId() {
  if (typeof window === "undefined") return null;
  const id = window.location.hash.replace(/^#/, "").trim();
  return id || null;
}

function scrollToHashId(id, behavior = "smooth") {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior, block: "start" });
}

/** Loads below-fold homepage sections after scroll proximity — keeps initial JS small. */
export default function DeferredBelowFold() {
  const sentinelRef = useRef(null);
  const [BelowFold, setBelowFold] = useState(null);

  useEffect(() => {
    const hashId = getHashId();
    const load = () => {
      void import("./LandingBelowFold").then((m) => setBelowFold(() => m.default));
    };

    if (hashId && BELOW_FOLD_HASH_IDS.has(hashId)) {
      load();
      return;
    }

    const el = sentinelRef.current;
    if (!el) return;

    if ("IntersectionObserver" in window) {
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            load();
            obs.disconnect();
          }
        },
        { rootMargin: "500px 0px" },
      );
      obs.observe(el);
      return () => obs.disconnect();
    }

    load();
  }, []);

  useEffect(() => {
    if (!BelowFold) return;
    const hashId = getHashId();
    if (!hashId || !BELOW_FOLD_HASH_IDS.has(hashId)) return;

    const timer = window.setTimeout(() => scrollToHashId(hashId), 50);
    return () => window.clearTimeout(timer);
  }, [BelowFold]);

  return (
    <>
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />
      {BelowFold ? <BelowFold /> : <div className="min-h-[50vh]" aria-hidden />}
    </>
  );
}
