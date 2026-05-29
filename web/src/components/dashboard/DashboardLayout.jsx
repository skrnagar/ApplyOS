"use client";
import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Settings,
  MessageSquare,
  Sparkles,
  Bell,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";
import useUser from "@/utils/useUser";
import HireOrbitalLogo from "@/components/ui/HireOrbitalLogo";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Applications", href: "/dashboard/applications", icon: Briefcase },
  { name: "Resumes", href: "/dashboard/resumes", icon: FileText },
  { name: "Preferences", href: "/dashboard/preferences", icon: Settings },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "AI Insights", href: "/dashboard/insights", icon: Sparkles },
];

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  /** Avoid SSR/client timezone mismatches for the header date (#418). */
  const [headerDate, setHeaderDate] = useState("");
  const { data: user } = useUser();

  useEffect(() => {
    setHeaderDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-neutral-200 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 border-b border-neutral-100">
          <a href="/" className="flex items-center gap-2">
            <HireOrbitalLogo size="sm" variant="light" />
          </a>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-100 space-y-1">
          <Link
            to="/dashboard/profile"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
              pathname === "/dashboard/profile"
                ? "bg-blue-50 text-blue-600"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <User size={19} />
            <span>Profile</span>
          </Link>
          <a
            href="/account/logout"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all text-sm font-medium"
          >
            <LogOut size={19} />
            <span>Sign Out</span>
          </a>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="hidden lg:block">
              <p className="text-sm text-neutral-400 min-h-[1.25rem]">
                {headerDate || "\u00a0"}
              </p>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <button className="relative p-2 hover:bg-neutral-100 rounded-lg">
                <Bell size={19} className="text-neutral-500" />
              </button>
              <div
                className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-green-400 rounded-full flex items-center justify-center text-white text-sm font-bold"
                suppressHydrationWarning
              >
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
