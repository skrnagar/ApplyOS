"use client";
import { useEffect, useState } from "react";
import { tryCreateBrowserClient } from "@/utils/supabase/client";
import { isSupabaseAuthEnabled } from "@/utils/authMode";
import AccountAuthShell from "@/components/auth/AccountAuthShell";

const OTP_TYPES = new Set(["recovery", "signup", "magiclink", "email", "invite", "email_change"]);

function safeNextPath(raw) {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/dashboard";
}

/**
 * Email links of the form /account/auth/confirm?token_hash=…&type=recovery&next=/…
 * point straight at this site, so they work regardless of Supabase's Site URL /
 * Redirect URL allowlist. The token is verified in the browser (not on page load
 * server-side), so mail scanners that prefetch the link cannot burn the one-time token.
 */
export default function AuthConfirmPage() {
  const [message, setMessage] = useState("Verifying your link…");
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

    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get("token_hash");
    const type = params.get("type");
    const next = safeNextPath(params.get("next"));

    if (!tokenHash || !type || !OTP_TYPES.has(type)) {
      setMessage("This link is invalid. Request a new one.");
      return;
    }

    let cancelled = false;
    void (async () => {
      const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      if (cancelled) return;
      if (error || !data?.session) {
        console.error("auth confirm verifyOtp:", error?.message);
        setMessage("This link expired or was already used. Request a new one.");
        return;
      }
      window.location.replace(type === "recovery" ? "/account/reset-password" : next);
    })();

    return () => {
      cancelled = true;
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
