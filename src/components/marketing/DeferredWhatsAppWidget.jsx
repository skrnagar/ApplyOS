"use client";
import { useEffect, useState } from "react";

/** Defers the widget bundle until the browser is idle — keeps it off the LCP path. */
export default function DeferredWhatsAppWidget(props) {
  const [Widget, setWidget] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      void import("./WhatsAppWidget").then((m) => {
        if (!cancelled) setWidget(() => m.default);
      });
    };

    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(load, { timeout: 4000 });
      return () => {
        cancelled = true;
        cancelIdleCallback(id);
      };
    }

    const timer = setTimeout(load, 2000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (!Widget) return null;
  return <Widget {...props} />;
}
