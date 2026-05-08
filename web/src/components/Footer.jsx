"use client";
import React from "react";
import { Twitter, Linkedin, Github, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-20 bg-black border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-tr from-green-400 to-blue-500 rounded-lg" />
              <span className="text-xl font-bold tracking-tight text-white">
                ApplyAI
              </span>
            </div>
            <p className="text-neutral-500 text-sm leading-relaxed mb-6">
              The world's first AI-powered job application service. We blend
              elite human oversight with proprietary AI to accelerate your
              career.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="#"
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <Github size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-neutral-500">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  How it Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Success Stories
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Pricing Plans
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Enterprise
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-neutral-500">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Career Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Resume Guide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Interview Prep
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  ATS Checker
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-neutral-500">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-600 text-xs">
            © 2026 ApplyAI. All rights reserved. Built for the future of work.
          </p>
          <div className="flex gap-8">
            <span className="text-xs text-neutral-600 font-medium cursor-pointer hover:text-white transition-colors">
              Status: Operational
            </span>
            <span className="text-xs text-neutral-600 font-medium cursor-pointer hover:text-white transition-colors">
              Region: Global
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
