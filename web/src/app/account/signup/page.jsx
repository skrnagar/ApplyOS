"use client";
import { useState } from "react";
import useAuth from "@/utils/useAuth";
import { Eye, EyeOff } from "lucide-react";
import AccountAuthShell from "@/components/auth/AccountAuthShell";
import { AccountInput } from "@/components/auth/AccountInput";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!email || !password) {
      setError("Please fill in email and password");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }
    try {
      await signUpWithCredentials({
        email,
        password,
        name,
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (err) {
      const msgs = {
        CredentialsSignin: "This email is already registered. Try signing in.",
        AccessDenied: "Unable to create account. Please try again.",
      };
      setError(msgs[err.message] || err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AccountAuthShell
      title="Create your account"
      subtitle="Launch your job search pipeline with HireOrbit."
      footer={
        <p>
          Already have an account?{" "}
          <a href="/account/signin" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Sign in
          </a>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <AccountInput
          id="signup-name"
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Alex Morgan"
          autoComplete="name"
        />

        <AccountInput
          id="signup-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />

        <div className="space-y-1.5">
          <label htmlFor="signup-password" className="text-sm font-medium text-neutral-700">
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
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
          className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? "Creating account…" : "Create free account"}
        </button>

        <p className="text-center text-xs text-neutral-500 leading-relaxed">
          By signing up, you agree to our{" "}
          <a href="/contact#terms" className="text-emerald-700 font-medium hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="/contact#privacy" className="text-emerald-700 font-medium hover:underline">
            Privacy
          </a>
          .
        </p>
      </form>
    </AccountAuthShell>
  );
}
