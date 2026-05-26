"use client";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import useUser from "@/utils/useUser";
import { isSupabaseAuthEnabled } from "@/utils/authMode";
import { useLocalSession } from "@/utils/useClientSnapshot";

/**
 * Protects all `/dashboard/*` routes: unauthenticated users go to sign-in with return URL.
 */
export default function DashboardRouteLayout({ children }) {
  const { data: user, loading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const supabaseMode = isSupabaseAuthEnabled();
  const local = useLocalSession();

  useEffect(() => {
    if (loading) return;

    const authenticated = supabaseMode ? Boolean(user) : Boolean(user || local);

    if (!authenticated) {
      const returnTo = encodeURIComponent(`${location.pathname}${location.search || ""}`);
      navigate(`/account/signin?callbackUrl=${returnTo}`, { replace: true });
    }
  }, [user, loading, navigate, location.pathname, location.search, supabaseMode, local]);

  const ok = supabaseMode ? Boolean(user) : Boolean(user || local);

  if (loading || !ok) {
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
