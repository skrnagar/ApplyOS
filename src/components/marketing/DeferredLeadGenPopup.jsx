"use client";
import { useEffect, useState } from "react";

/** Defers popup bundle until the browser is idle — avoids competing with LCP. */
export default function DeferredLeadGenPopup() {
  const [Popup, setPopup] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      void import("./LeadGenPopup").then((m) => {
        if (!cancelled) setPopup(() => m.default);
      });
    };

    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(load, { timeout: 6000 });
      return () => {
        cancelled = true;
        cancelIdleCallback(id);
      };
    }

    const timer = setTimeout(load, 3000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (!Popup) return null;
  return <Popup />;
}
