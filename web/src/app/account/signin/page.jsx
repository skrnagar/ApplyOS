"use client";
import { useEffect, useState } from "react";
import useAuth from "@/utils/useAuth";
import { Eye, EyeOff } from "lucide-react";
import AccountAuthShell from "@/components/auth/AccountAuthShell";
import { AccountInput } from "@/components/auth/AccountInput";

const URL_ERROR_MESSAGES = {
  Configuration:
    "Server auth configuration is missing or invalid. If you’re the admin, set AUTH_SECRET and AUTH_URL.",
  AccessDenied: "You don’t have permission to sign in.",
  Verification: "This sign-in link has expired or was already used.",
  CredentialsSignin: "Incorrect email or password.",
  OAuthSignin: "Could not complete sign-in with the provider.",
  OAuthCallback: "Something went wrong during the OAuth callback.",
  Default: "Sign-in could not be completed.",
};

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signInWithCredentials } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("error");
    if (!code) return;
    setError(URL_ERROR_MESSAGES[code] || URL_ERROR_MESSAGES.Default);
    const next = new URL(window.location.href);
    next.searchParams.delete("error");
    window.history.replaceState({}, "", next.pathname + next.search);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }
    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (err) {
      const msgs = {
        CredentialsSignin: "Incorrect email or password.",
        AccessDenied: "You don't have permission to sign in.",
      };
      setError(msgs[err.message] || err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AccountAuthShell
      title="Welcome back"
      subtitle="Sign in to your HireOrbit workspace."
      footer={
        <p>
          New here?{" "}
          <a href="/account/signup" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Create an account
          </a>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <AccountInput
          id="signin-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />

        <div className="space-y-1.5">
          <label htmlFor="signin-password" className="text-sm font-medium text-neutral-700">
            Password
          </label>
          <div className="relative">
            <input
              id="signin-password"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-neutral-200 bg-neutral-50/80 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60 transition-shadow"
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

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AccountAuthShell>
  );
}
