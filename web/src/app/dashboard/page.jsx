"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "motion/react";
import {
  Briefcase,
  Calendar,
  TrendingUp,
  CheckCircle2,
  ArrowUpRight,
  Clock,
  MessageSquare,
  FileText,
  Settings,
  Sparkles,
} from "lucide-react";
import useUser from "@/utils/useUser";

const statusColors = {
  applied: "bg-blue-100 text-blue-700",
  under_review: "bg-yellow-100 text-yellow-700",
  interview: "bg-green-100 text-green-700",
  offer: "bg-purple-100 text-purple-700",
  rejected: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: authUser } = useUser();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const firstName =
    stats?.user?.full_name?.split(" ")[0] ||
    authUser?.name?.split(" ")[0] ||
    "there";

  const statCards = [
    {
      title: "Total Applied",
      value: stats?.stats?.totalApplications ?? 0,
      icon: Briefcase,
      color: "blue",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Interviews",
      value: stats?.stats?.interviews ?? 0,
      icon: Calendar,
      color: "green",
      bg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Response Rate",
      value: `${stats?.stats?.responseRate ?? 0}%`,
      icon: TrendingUp,
      color: "purple",
      bg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Offers",
      value: stats?.stats?.offers ?? 0,
      icon: CheckCircle2,
      color: "orange",
      bg: "bg-orange-50",
      iconColor: "text-orange-500",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="h-8 bg-neutral-200 rounded-lg w-64 animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 bg-neutral-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 17
                ? "afternoon"
                : "evening"}
            , {firstName}! 👋
          </h1>
          <p className="text-neutral-500 mt-1 text-sm">
            Here's your job search overview for today
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl border border-neutral-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}
                  >
                    <Icon size={20} className={stat.iconColor} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-neutral-900">
                  {stat.value}
                </p>
                <p className="text-xs text-neutral-500 mt-1 font-medium">
                  {stat.title}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="font-bold text-neutral-900">
                Recent Applications
              </h2>
              <a
                href="/dashboard/applications"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                View all <ArrowUpRight size={14} />
              </a>
            </div>
            <div className="divide-y divide-neutral-100">
              {stats?.recentApplications?.length > 0 ? (
                stats.recentApplications.map((app) => {
                  const colorClass =
                    statusColors[app.status] ||
                    "bg-neutral-100 text-neutral-700";
                  return (
                    <div
                      key={app.id}
                      className="p-5 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-neutral-900 truncate">
                            {app.job_title}
                          </p>
                          <p className="text-sm text-neutral-500 mt-0.5">
                            {app.company_name}
                          </p>
                        </div>
                        <div className="flex-shrink-0 flex flex-col items-end gap-1">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize ${colorClass}`}
                          >
                            {app.status.replace("_", " ")}
                          </span>
                          <p className="text-xs text-neutral-400">
                            {new Date(app.applied_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-10 text-center">
                  <Briefcase
                    className="mx-auto text-neutral-300 mb-3"
                    size={36}
                  />
                  <p className="text-neutral-500 font-medium">
                    No applications yet
                  </p>
                  <p className="text-sm text-neutral-400 mt-1">
                    Start tracking your job applications
                  </p>
                  <a
                    href="/dashboard/applications"
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Add Application
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Interviews + Quick Actions */}
          <div className="space-y-5">
            {/* Upcoming Interviews */}
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              <div className="p-5 border-b border-neutral-100">
                <h2 className="font-bold text-neutral-900">
                  Upcoming Interviews
                </h2>
              </div>
              <div className="divide-y divide-neutral-100">
                {stats?.upcomingInterviews?.length > 0 ? (
                  stats.upcomingInterviews.map((iv) => (
                    <div key={iv.id} className="p-4">
                      <p className="font-semibold text-neutral-900 text-sm truncate">
                        {iv.job_title}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {iv.company_name}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                        <Clock size={12} />
                        <span>
                          {new Date(iv.interview_date).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-5 text-center">
                    <Calendar
                      className="mx-auto text-neutral-300 mb-2"
                      size={28}
                    />
                    <p className="text-sm text-neutral-400">
                      No upcoming interviews
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <h2 className="font-bold text-neutral-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  {
                    icon: FileText,
                    label: "Upload Resume",
                    href: "/dashboard/resumes",
                    color: "text-blue-600 bg-blue-50",
                  },
                  {
                    icon: MessageSquare,
                    label: "Message Assistant",
                    href: "/dashboard/messages",
                    color: "text-green-600 bg-green-50",
                  },
                  {
                    icon: Settings,
                    label: "Set Preferences",
                    href: "/dashboard/preferences",
                    color: "text-purple-600 bg-purple-50",
                  },
                  {
                    icon: Sparkles,
                    label: "View Insights",
                    href: "/dashboard/insights",
                    color: "text-orange-500 bg-orange-50",
                  },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <a
                      key={action.href}
                      href={action.href}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors group"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon size={16} />
                      </div>
                      <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900">
                        {action.label}
                      </span>
                      <ArrowUpRight
                        size={14}
                        className="ml-auto text-neutral-300 group-hover:text-neutral-600 transition-colors"
                      />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
