"use client";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import HireOrbitLogo from "@/components/ui/HireOrbitLogo";
import AmbientBackground from "@/components/AmbientBackground";

const ERROR_MESSAGES = {
  Configuration:
    "Authentication isn’t configured correctly on the server (check AUTH_SECRET and related env).",
  AccessDenied: "You don’t have permission to sign in with this account.",
  Verification:
    "The sign-in link has expired or was already used. Request a new one.",
  CredentialsSignin: "Invalid email or password.",
  OAuthSignin: "Could not complete sign-in with the provider.",
  OAuthCallback: "Something went wrong during the OAuth callback.",
  OAuthCreateAccount: "Could not create an account from this sign-in.",
  EmailCreateAccount: "Could not create an account with this email.",
  Callback: "Something went wrong during sign-in.",
  OAuthAccountNotLinked:
    "This email is already linked to another sign-in method.",
  SessionRequired: "You need to be signed in to view this page.",
  Default: "Sign-in could not be completed. Please try again.",
};

export default function AuthErrorPage() {
  const [code, setCode] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCode(params.get("error"));
  }, []);

  const message = useMemo(() => {
    if (!code) return ERROR_MESSAGES.Default;
    return ERROR_MESSAGES[code] || ERROR_MESSAGES.Default;
  }, [code]);

  const signInHref = code
    ? `/account/signin?error=${encodeURIComponent(code)}`
    : "/account/signin";

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      <AmbientBackground />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex justify-center mb-6">
            <HireOrbitLogo size="lg" variant="dark" />
          </a>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/25 mb-4">
            <AlertCircle className="text-red-400" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Sign-in issue</h1>
          <p className="text-neutral-400 text-sm mb-1">
            {code && (
              <span className="font-mono text-neutral-500">[{code}] </span>
            )}
            {message}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-4">
          <a
            href={signInHref}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 py-3 text-sm font-semibold text-white hover:opacity-95 transition-opacity"
          >
            Back to sign in
          </a>
          <a
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-medium text-neutral-300 hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={16} />
            Home
          </a>
        </div>
      </div>
    </div>
  );
}
