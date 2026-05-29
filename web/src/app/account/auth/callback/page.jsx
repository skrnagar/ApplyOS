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

/** Handles Supabase email confirmation, OAuth, magic links, and password recovery (PKCE). */
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
    const code = params.get("code");
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hashParams.get("access_token");
    const recoveryType = hashParams.get("type") === "recovery" || params.get("type") === "recovery";

    const finish = async (session, event) => {
      if (cancelled) return;
      if (session) {
        if (event === "PASSWORD_RECOVERY" || recoveryType || next === "/account/reset-password") {
          window.location.replace("/account/reset-password");
          return;
        }
        await syncAuthProfile().catch(() => {});
        window.location.replace(next);
        return;
      }
      setMessage("Sign-in link expired or invalid. Try signing in again.");
    };

    void (async () => {
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("auth callback exchangeCodeForSession:", error.message);
          if (!cancelled) setMessage("This link expired or was already used. Request a new reset link.");
          return;
        }
        await finish(data.session, recoveryType ? "PASSWORD_RECOVERY" : null);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await finish(data.session, recoveryType ? "PASSWORD_RECOVERY" : null);
        return;
      }

      if (accessToken) {
        const { data: sessionData, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get("refresh_token") || "",
        });
        if (error) {
          if (!cancelled) setMessage("Could not complete sign-in. Try again.");
          return;
        }
        await finish(sessionData.session, recoveryType ? "PASSWORD_RECOVERY" : null);
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        void finish(session, event);
      }
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
