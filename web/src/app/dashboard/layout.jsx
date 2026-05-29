"use client";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import useUser from "@/utils/useUser";
import { isSupabaseAuthEnabled } from "@/utils/authMode";
import { useLocalSession } from "@/utils/useClientSnapshot";
import { tryCreateBrowserClient } from "@/utils/supabase/client";

async function hasSupabaseSession() {
  const supabase = tryCreateBrowserClient();
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session?.user);
}

/**
 * Protects all `/dashboard/*` routes: unauthenticated users go to sign-in with return URL.
 */
export default function DashboardRouteLayout({ children }) {
  const { data: user, loading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const supabaseMode = isSupabaseAuthEnabled();
  const local = useLocalSession();
  const redirecting = useRef(false);

  const [access, setAccess] = useState("pending");

  useEffect(() => {
    if (loading) return;

    let cancelled = false;

    void (async () => {
      let authenticated = supabaseMode ? Boolean(user) : Boolean(user || local);

      if (!authenticated && supabaseMode) {
        authenticated = await hasSupabaseSession();
      }

      if (cancelled) return;

      if (authenticated) {
        setAccess("allowed");
        return;
      }

      setAccess("denied");

      if (redirecting.current) return;
      redirecting.current = true;
      const returnTo = encodeURIComponent(`${location.pathname}${location.search || ""}`);
      navigate(`/account/signin?callbackUrl=${returnTo}`, { replace: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [user, loading, navigate, location.pathname, location.search, supabaseMode, local]);

  if (loading || access === "pending") {
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

  if (access === "denied") {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-3">
        <div
          className="h-10 w-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"
          aria-hidden
        />
        <p className="text-sm text-neutral-500">Redirecting to sign in…</p>
      </div>
    );
  }

  return children;
}
