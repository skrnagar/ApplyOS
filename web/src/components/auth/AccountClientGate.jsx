"use client";
import { useEffect, useState } from "react";

/**
 * Auth pages render after mount so SSR and the first client paint match.
 * Must receive `children` from the layout wrapper (not Outlet — account routes
 * are not nested layout routes in routes.ts).
 */
export default function AccountClientGate({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div
        className="min-h-screen bg-[#f4f6f8] flex flex-col items-center justify-center gap-4"
        aria-busy="true"
        aria-label="Loading"
      >
        <div
          className="h-9 w-9 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"
          aria-hidden
        />
        <p className="text-sm text-neutral-500">Loading…</p>
      </div>
    );
  }

  return children;
}
