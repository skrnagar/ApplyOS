"use client";
import { useEffect, useState } from "react";
import { tryCreateBrowserClient } from "@/utils/supabase/client";
import { isSupabaseAuthEnabled } from "@/utils/authMode";
import { syncAuthProfile } from "@/utils/apiAuthHeaders";
import AccountAuthShell from "@/components/auth/AccountAuthShell";

function safeNextPath(raw) {
  if (!raw) return "/dashboard";
  try {
    const decoded = decodeURIComponent(raw);
    if (decoded.startsWith("/") && !decoded.startsWith("//")) return decoded;
  } catch {
    /* ignore */
  }
  return "/dashboard";
}

/** Handles Supabase email confirmation, OAuth return, and magic-link hashes. */
export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Completing sign-in…");
  const supabaseAuth = isSupabaseAuthEnabled();

  useEffect(() => {
    if (!supabaseAuth) {
      setMessage("Supabase auth is not configured.");
      return;
    }

    const supabase = tryCreateBrowserClient();
    if (!supabase) {
      setMessage("Could not connect to Supabase.");
      return;
    }

    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const next = safeNextPath(params.get("next"));

    const finish = async (session) => {
      if (cancelled) return;
      if (session) {
        await syncAuthProfile().catch(() => {});
        window.location.replace(next);
        return;
      }
      setMessage("Sign-in link expired or invalid. Try signing in again.");
    };

    void supabase.auth.getSession().then(({ data }) => finish(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) finish(session);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabaseAuth]);

  return (
    <AccountAuthShell title="Just a moment" subtitle={message} backHref="/account/signin" backLabel="Sign in">
      <div className="flex justify-center py-6" aria-busy="true">
        <div className="h-8 w-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
      </div>
    </AccountAuthShell>
  );
}
