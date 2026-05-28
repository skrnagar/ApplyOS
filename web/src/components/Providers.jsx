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

    let cancelled = false;
    let teardown = () => {};

    void (async () => {
      const [{ default: gsap }, { default: ScrollTrigger }, { default: Lenis }] =
        await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("lenis"),
        ]);

      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
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

    return () => {
      cancelled = true;
      teardown();
    };
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
