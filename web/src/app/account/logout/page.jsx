"use client";
import { useEffect, useState, useRef } from "react";
import useAuth from "@/utils/useAuth";
import { LogOut } from "lucide-react";
import AccountAuthShell from "@/components/auth/AccountAuthShell";

export default function LogoutPage() {
  const { signOut } = useAuth();
  const signOutRef = useRef(signOut);
  signOutRef.current = signOut;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await signOutRef.current({ callbackUrl: "/", redirect: true });
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AccountAuthShell
      title="Signing you out"
      subtitle="Clearing your session and sending you home."
    >
      <div className="text-center py-4">
        <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LogOut className="text-emerald-700" size={26} />
        </div>
        <p className="text-neutral-600 text-sm mb-6">
          {loading ? "Hang tight…" : "You can close this tab or return home."}
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors"
        >
          Back to home
        </a>
      </div>
    </AccountAuthShell>
  );
}
