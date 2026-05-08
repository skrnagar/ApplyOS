"use client";
import { useEffect, useState } from "react";
import useAuth from "@/utils/useAuth";
import { Zap, LogOut } from "lucide-react";

export default function LogoutPage() {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const handleSignOut = async () => {
    setLoading(true);
    await signOut({ callbackUrl: "/", redirect: true });
  };

  useEffect(() => {
    handleSignOut();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="text-center">
        <a href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-green-400 rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-white">ApplyAI</span>
        </a>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 w-80">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogOut className="text-red-400" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Sign Out</h1>
          <p className="text-neutral-400 text-sm mb-6">
            You'll be redirected to the home page
          </p>
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all"
          >
            {loading ? "Signing out..." : "Sign Out"}
          </button>
          <a
            href="/dashboard"
            className="block mt-3 text-sm text-neutral-400 hover:text-white text-center"
          >
            Cancel
          </a>
        </div>
      </div>
    </div>
  );
}
