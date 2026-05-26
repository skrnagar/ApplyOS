"use client";
import React, { useState } from "react";
import MarketingShell from "@/components/marketing/MarketingShell";
import { Mail, MessageCircle, Send } from "lucide-react";
import { captureLead } from "@/utils/captureLead";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/config/site";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Enter a valid email.");
      return;
    }
    if (message.trim().length < 10) {
      setError("Message must be at least 10 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: trimmedEmail,
          message: message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not send message. Try again.");
        return;
      }
      if (!data.stored) {
        setError("Message could not be saved. Check server env and Supabase tables.");
        return;
      }
      await captureLead({
        email: trimmedEmail,
        name: name.trim() || undefined,
        source: "contact",
      });
      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MarketingShell>
      <div className="pt-28 pb-20 md:pb-28 container mx-auto px-5 sm:px-6 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.28em] text-emerald-700 font-semibold mb-4">
          Talk to us
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold text-neutral-900 mb-4 text-balance tracking-tight">
          Book a call or write the team
        </h1>
        <p className="text-lg text-neutral-600 mb-4 leading-relaxed">
          Tell us about your role targets, timeline, and how aggressive you want applications.
          We&apos;ll map a HireOrbit plan — same transparency standards we ship in-product.
        </p>
        <p className="text-sm text-neutral-600 mb-10">
          Reach us anytime at{" "}
          <a href={CONTACT_MAILTO} className="font-semibold text-emerald-700 hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm mb-12 space-y-4"
        >
          <h2 className="text-sm font-semibold text-neutral-900">Send a message</h2>
          {sent ? (
            <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              Thanks — your message is saved and our team at {CONTACT_EMAIL} will follow up soon.
            </p>
          ) : (
            <>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help?"
                rows={4}
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm resize-none"
              />
              {error && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 disabled:opacity-60"
              >
                <Send size={16} />
                {submitting ? "Sending…" : "Send message"}
              </button>
            </>
          )}
        </form>

        <div className="space-y-4 mb-12">
          <a
            href="/contact#schedule"
            className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 to-white shadow-sm p-6 hover:border-emerald-300 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
              <MessageCircle className="text-white" size={22} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-emerald-800 mb-1 font-semibold">
                Schedule a call
              </p>
              <p className="text-neutral-900 font-semibold">Talk with our team</p>
              <p className="text-xs text-neutral-600 mt-1" id="schedule">
                Add your Calendly or booking link here when ready.
              </p>
            </div>
          </a>

          <a
            href={CONTACT_MAILTO}
            className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 hover:border-emerald-300/70 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
              <Mail className="text-sky-700" size={22} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-neutral-500 mb-1">Email</p>
              <p className="text-neutral-900 font-semibold truncate">{CONTACT_EMAIL}</p>
            </div>
          </a>

          <a
            href="/account/signup"
            className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 hover:border-emerald-300/70 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <MessageCircle className="text-emerald-700" size={22} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-neutral-500 mb-1">Self-serve</p>
              <p className="text-neutral-900 font-semibold">Create an account</p>
              <p className="text-xs text-neutral-500 mt-1">
                Start with the dashboard, then loop in our team from in-app chat.
              </p>
            </div>
          </a>
        </div>

        <section id="privacy" className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-neutral-900 mb-2">Privacy</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            HireOrbit is designed for minimal data retention and clear consent. A full policy
            URL can replace this placeholder when legal copy is ready.
          </p>
        </section>

        <section id="terms" className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-neutral-900 mb-2">Terms</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Service terms, SLA expectations, and refund rules belong here — wire to your counsel
            before launch.
          </p>
        </section>
      </div>
    </MarketingShell>
  );
}