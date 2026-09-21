"use client";
import React, { useState } from "react";
import MarketingShell from "@/components/marketing/MarketingShell";
import { Mail, MessageCircle, Send, MapPin, MessageSquare } from "lucide-react";
import { captureLead } from "@/utils/captureLead";
import { validateOptionalPhone } from "@/utils/phone";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/config/site";
import { metaForPath } from "@/utils/seo";

export function meta() {
  return metaForPath("/contact");
}

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
    const pv = validateOptionalPhone(phone);
    if (!pv.ok) {
      setError(pv.error);
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
          phone: pv.phone,
          message: message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          [data.error, data.hint].filter(Boolean).join(" — ") ||
            "Could not send message. Try again.",
        );
        return;
      }
      if (!data.stored) {
        setError("Message could not be saved. Check server env and Supabase tables.");
        return;
      }
      await captureLead({
        email: trimmedEmail,
        name: name.trim() || undefined,
        phone: pv.phone || undefined,
        source: "contact",
      });
      setSent(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MarketingShell>
      <div className="relative bg-[#f4f6f8] text-neutral-900 min-h-screen pt-24 pb-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[25%] -right-[10%] w-[70%] h-[70%] rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute -bottom-[25%] -left-[10%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 blur-[120px]" />
        </div>

        <div className="container relative mx-auto px-5 sm:px-6 z-10 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-start mt-12 mb-16">
            
            {/* Left Side: Talk to Us Info */}
            <div className="flex flex-col justify-center max-w-lg sticky top-24">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium mb-6 w-fit">
                <MessageSquare size={16} />
                <span>Get in Touch</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-neutral-900">
                Book a call or <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600">write the team.</span>
              </h1>
              
              <p className="text-neutral-600 text-lg leading-relaxed mb-10">
                Tell us about your role targets, timeline, and how aggressive you want applications.
                We&apos;ll map a HireOrbital plan — same transparency standards we ship in-product.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">Email Us</h4>
                    <a href={CONTACT_MAILTO} className="text-neutral-600 hover:text-emerald-700 transition-colors">
                      {CONTACT_EMAIL}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center flex-shrink-0 text-cyan-600">
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">Schedule a Call</h4>
                    <p className="text-neutral-600">
                      Add your Calendly or booking link here when ready.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="relative mt-8 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 rounded-3xl blur-2xl transform -rotate-3 scale-105" />
              
              <div className="relative bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 shadow-xl">
                <h3 className="text-2xl font-bold mb-6 text-neutral-900">Send a Message</h3>
                
                <form onSubmit={onSubmit} className="space-y-5">
                  {sent ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-6 text-center">
                      <p className="text-emerald-700 font-medium text-lg mb-2">Message Sent! ✓</p>
                      <p className="text-sm text-neutral-600">
                        Thanks — your message is saved and our team at {CONTACT_EMAIL} will follow up soon.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-neutral-700">Your name</label>
                        <input
                          type="text"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          autoComplete="name"
                          suppressHydrationWarning
                          className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          placeholder="Jane Doe"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-neutral-700">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                          suppressHydrationWarning
                          className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          placeholder="jane@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium text-neutral-700">Mobile number (optional)</label>
                        <input
                          type="tel"
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          autoComplete="tel"
                          inputMode="tel"
                          suppressHydrationWarning
                          className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium text-neutral-700">Message</label>
                        <textarea
                          id="message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                          rows={4}
                          suppressHydrationWarning
                          className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                          placeholder="How can we help?"
                        />
                      </div>

                      {error && (
                        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                          {error}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Send message <Send size={18} />
                          </>
                        )}
                      </button>
                    </>
                  )}
                </form>
              </div>
            </div>
            
          </div>

          {/* Privacy and Terms */}
          <div className="mt-16 grid md:grid-cols-2 gap-8 border-t border-neutral-200 pt-16">
            <section id="privacy">
              <h2 className="text-sm font-semibold text-neutral-900 mb-2">Privacy</h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                HireOrbital is designed for minimal data retention and clear consent. A full policy
                URL can replace this placeholder when legal copy is ready.
              </p>
            </section>
            <section id="terms">
              <h2 className="text-sm font-semibold text-neutral-900 mb-2">Terms</h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Service terms, SLA expectations, and refund rules belong here — wire to your counsel
                before launch.
              </p>
            </section>
          </div>
          
        </div>
      </div>
    </MarketingShell>
  );
}