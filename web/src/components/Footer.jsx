"use client";
import React from "react";
import { Twitter, Linkedin, Github, Instagram } from "lucide-react";
import HireOrbitLogo from "@/components/ui/HireOrbitLogo";

export default function Footer() {
  return (
    <footer className="py-16 md:py-20 bg-white border-t border-neutral-200/90">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="grid md:grid-cols-4 gap-10 md:gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="mb-5">
              <HireOrbitLogo size="md" variant="light" />
            </div>
            <p className="text-neutral-600 text-sm leading-relaxed mb-6">
              HireOrbit is your AI career operating system: transparent applications,
              resume &amp; LinkedIn optimization, assistant support, and analytics —
              built for trust, not spam.
            </p>
            <div className="flex gap-4">
              <a
                href="https://twitter.com"
                className="text-neutral-400 hover:text-neutral-800 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://linkedin.com"
                className="text-neutral-400 hover:text-neutral-800 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://instagram.com"
                className="text-neutral-400 hover:text-neutral-800 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://github.com"
                className="text-neutral-400 hover:text-neutral-800 transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-neutral-900 font-bold mb-5 text-sm uppercase tracking-wide">Platform</h4>
            <ul className="space-y-3 text-sm text-neutral-600">
              <li>
                <a href="/#how-it-works" className="hover:text-neutral-900 transition-colors">
                  How it Works
                </a>
              </li>
              <li>
                <a href="/#testimonials" className="hover:text-neutral-900 transition-colors">
                  Success Stories
                </a>
              </li>
              <li>
                <a href="/pricing" className="hover:text-neutral-900 transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-neutral-900 transition-colors">
                  Talk to Us
                </a>
              </li>
              <li>
                <a href="/#signup" className="hover:text-neutral-900 transition-colors">
                  Create account
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-neutral-900 font-bold mb-5 text-sm uppercase tracking-wide">Resources</h4>
            <ul className="space-y-3 text-sm text-neutral-600">
              <li>
                <a href="/#resources" className="hover:text-neutral-900 transition-colors">
                  Insightful resources
                </a>
              </li>
              <li>
                <a href="/tools" className="hover:text-neutral-900 transition-colors">
                  Free Tools
                </a>
              </li>
              <li>
                <a href="/tools#resume" className="hover:text-neutral-900 transition-colors">
                  Resume guide
                </a>
              </li>
              <li>
                <a href="/tools#interview" className="hover:text-neutral-900 transition-colors">
                  Interview prep
                </a>
              </li>
              <li>
                <a href="/#faq" className="hover:text-neutral-900 transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-neutral-900 font-bold mb-5 text-sm uppercase tracking-wide">Company</h4>
            <ul className="space-y-3 text-sm text-neutral-600">
              <li>
                <a href="/" className="hover:text-neutral-900 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-neutral-900 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="/contact#privacy" className="hover:text-neutral-900 transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="/contact#terms" className="hover:text-neutral-900 transition-colors">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-200/90 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-xs">
            © {new Date().getFullYear()} HireOrbit. All rights reserved.
          </p>
          <div className="flex gap-8">
            <span className="text-xs text-neutral-500 font-medium">Status: Operational</span>
            <span className="text-xs text-neutral-500 font-medium">Region: Global</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
