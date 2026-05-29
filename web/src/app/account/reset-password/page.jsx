"use client";
import { useEffect, useState } from "react";
import useAuth from "@/utils/useAuth";
import { isSupabaseAuthEnabled } from "@/utils/authMode";
import { tryCreateBrowserClient } from "@/utils/supabase/client";
import AccountAuthShell from "@/components/auth/AccountAuthShell";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { updatePassword } = useAuth();
  const supabaseAuth = isSupabaseAuthEnabled();

  useEffect(() => {
    if (!supabaseAuth) return;
    const supabase = tryCreateBrowserClient();
    if (!supabase) return;

    let cancelled = false;

    const markReady = () => {
      if (!cancelled) setReady(true);
    };

    void (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error("reset-password exchangeCodeForSession:", exchangeError.message);
          if (!cancelled) {
            setError("This reset link expired or was already used. Request a new one.");
          }
          return;
        }
        if (data.session) {
          markReady();
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        markReady();
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) markReady();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabaseAuth]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await updatePassword({ password });
      setDone(true);
      window.setTimeout(() => {
        window.location.assign("/account/signin");
      }, 2000);
    } catch (err) {
      if (err?.message === "PasswordTooShort") {
        setError("Password must be at least 8 characters");
      } else {
        setError(err?.message || "Could not update password. Request a new reset link.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountAuthShell
      title="Choose a new password"
      subtitle={
        done
          ? "Password updated. Redirecting to sign in…"
          : ready
            ? "Enter a new password for your account."
            : "Open the link from your email to continue."
      }
      backHref="/account/signin"
      backLabel="Sign in"
    >
      {done ? (
        <p className="text-center text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          Your password was saved. You can sign in with your new password.
        </p>
      ) : !ready ? (
        <div className="space-y-4 text-center text-sm text-neutral-600">
          <p>
            This page works after you click the reset link in your email. Links expire after a
            while — request another from{" "}
            <a href="/account/forgot-password" className="font-semibold text-emerald-700 hover:underline">
              forgot password
            </a>
            .
          </p>
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm">
              {error}
            </div>
          ) : null}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="new-password" className="text-sm font-medium text-neutral-700">
              New password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-neutral-200 bg-neutral-50/80 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-neutral-500 hover:text-neutral-800 rounded-lg"
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm-password" className="text-sm font-medium text-neutral-700">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type={showPass ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/80 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving…" : "Update password"}
          </button>
        </form>
      )}
    </AccountAuthShell>
  );
}
