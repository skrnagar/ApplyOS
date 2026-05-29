"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

function isStaticAppRoute(pathname) {
  return (
    pathname.startsWith("/account") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin")
  );
}

export default function Providers({ children }) {
  const { pathname } = useLocation();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    if (isStaticAppRoute(pathname)) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cancelled = false;
    let teardown = () => {};

    const start = () => {
      void (async () => {
        const [{ default: gsap }, { default: ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);

        if (cancelled) return;

        gsap.registerPlugin(ScrollTrigger);

        const skipLenis =
          window.matchMedia("(max-width: 768px)").matches ||
          window.matchMedia("(pointer: coarse)").matches;

        if (skipLenis) return;

        const { default: Lenis } = await import("lenis");
        if (cancelled) return;

        const lenis = new Lenis({
          duration: 1.1,
          smoothWheel: true,
          smoothTouch: false,
        });

        let rafId;
        const raf = (time) => {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);
        lenis.on("scroll", ScrollTrigger.update);

        teardown = () => {
          cancelAnimationFrame(rafId);
          lenis.destroy();
          ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
      })();
    };

    let idleHandle;
    if ("requestIdleCallback" in window) {
      idleHandle = requestIdleCallback(start, { timeout: 4500 });
    } else {
      idleHandle = setTimeout(start, 2000);
    }

    return () => {
      cancelled = true;
      teardown();
      if ("requestIdleCallback" in window) cancelIdleCallback(idleHandle);
      else clearTimeout(idleHandle);
    };
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
