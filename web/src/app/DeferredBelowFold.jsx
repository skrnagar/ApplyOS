"use client";
import { useEffect, useRef, useState } from "react";

/** Loads below-fold homepage sections after scroll proximity — keeps initial JS small. */
export default function DeferredBelowFold() {
  const sentinelRef = useRef(null);
  const [BelowFold, setBelowFold] = useState(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const load = () => {
      void import("./LandingBelowFold").then((m) => setBelowFold(() => m.default));
    };

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

  return (
    <>
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />
      {BelowFold ? <BelowFold /> : <div className="min-h-[50vh]" aria-hidden />}
    </>
  );
}
