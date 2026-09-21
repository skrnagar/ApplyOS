"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/config/site";

export default function ContactFormSection() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    state: "",
    city: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormState({
        name: "",
        email: "",
        phone: "",
        address: "",
        country: "",
        state: "",
        city: "",
        message: "",
      });
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <section className="relative py-24 bg-[#f4f6f8] text-neutral-900 overflow-hidden" id="contact">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -right-[10%] w-[70%] h-[70%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -bottom-[25%] -left-[10%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <div className="container relative mx-auto px-5 sm:px-6 z-10 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Talk to Us Info */}
          <div className="flex flex-col justify-center max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium mb-6 w-fit">
              <MessageSquare size={16} />
              <span>Get in Touch</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-neutral-900">
              Let's build your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600">AI career operating system.</span>
            </h2>
            
            <p className="text-neutral-600 text-lg leading-relaxed mb-10">
              Ready to optimize your job search pipeline? Talk to us about custom applications, professional resume building, and improving your ATS scores. Our team is here to help you land your dream role.
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
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-1">Global HQ</h4>
                  <p className="text-neutral-600">
                    Operating remotely worldwide<br />
                    Supporting US Job Seekers
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 rounded-3xl blur-2xl transform -rotate-3 scale-105" />
            
            <div className="relative bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 shadow-xl">
              <h3 className="text-2xl font-bold mb-6 text-neutral-900">Send a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-neutral-700">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formState.name}
                      onChange={handleChange}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-neutral-700">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formState.email}
                      onChange={handleChange}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-neutral-700">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formState.phone}
                      onChange={handleChange}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="country" className="text-sm font-medium text-neutral-700">Country</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formState.country}
                      onChange={handleChange}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      placeholder="United States"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="address" className="text-sm font-medium text-neutral-700">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formState.address}
                      onChange={handleChange}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      placeholder="123 Market St"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="city" className="text-sm font-medium text-neutral-700">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formState.city}
                      onChange={handleChange}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      placeholder="San Francisco"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-neutral-700">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows="4"
                    value={formState.message}
                    onChange={handleChange}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-white font-semibold transition-all ${
                    isSubmitted 
                      ? "bg-green-500 hover:bg-green-600" 
                      : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20"
                  } disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  ) : isSubmitted ? (
                    <>Message Sent! ✓</>
                  ) : (
                    <>
                      Send Message <Send size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
