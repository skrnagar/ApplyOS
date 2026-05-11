"use client";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import useUser from "@/utils/useUser";
import { getLocalSession } from "@/utils/localAuth";

/**
 * Protects all `/dashboard/*` routes: unauthenticated users go to sign-in with return URL.
 * Also respects `hireorbit_local_session` immediately so local-auth signup → dashboard never flashes away.
 */
export default function DashboardRouteLayout({ children }) {
  const { data: user, loading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const local = typeof window !== "undefined" ? getLocalSession() : null;
    if (loading && !local) return;
    if (user || local) return;
    const returnTo = encodeURIComponent(`${location.pathname}${location.search || ""}`);
    navigate(`/account/signin?callbackUrl=${returnTo}`, { replace: true });
  }, [user, loading, navigate, location.pathname, location.search]);

  const local = typeof window !== "undefined" ? getLocalSession() : null;
  const ok = user || local;

  if ((loading && !local) || !ok) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-3">
        <div
          className="h-10 w-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"
          aria-hidden
        />
        <p className="text-sm text-neutral-500">Checking your session…</p>
      </div>
    );
  }

  return children;
}
