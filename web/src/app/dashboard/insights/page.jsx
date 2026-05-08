"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Card, { CardHeader, CardContent } from "@/components/ui/Card";
import { motion } from "motion/react";
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Target,
  Award,
} from "lucide-react";

const iconMap = {
  resume: Award,
  market: TrendingUp,
  skill: Target,
  application: CheckCircle2,
  default: Lightbulb,
};

const priorityColors = {
  high: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: "text-red-600",
  },
  medium: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    icon: "text-yellow-600",
  },
  low: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    icon: "text-blue-600",
  },
};

export default function InsightsPage() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await fetch("/api/insights");
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      } else if (response.status === 401 && typeof window !== "undefined") {
        window.location.href = "/account/signin";
      }
    } catch (error) {
      console.error("Error fetching insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (insightId) => {
    try {
      const response = await fetch("/api/insights", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ insightId }),
      });
      if (response.ok) {
        setInsights(insights.filter((i) => i.id !== insightId));
      }
    } catch (error) {
      console.error("Error dismissing insight:", error);
    }
  };

  // Mock insights if none exist
  const mockInsights =
    insights.length === 0 && !loading
      ? [
          {
            id: "mock-1",
            insight_type: "resume",
            title: "Optimize Your Resume for ATS",
            content:
              "Your resume has a 72% ATS compatibility score. Adding relevant keywords from job descriptions could improve this to 85%+. Focus on technical skills and quantifiable achievements.",
            priority: "high",
            created_at: new Date().toISOString(),
          },
          {
            id: "mock-2",
            insight_type: "market",
            title: "Hot Market Trend: AI Engineering",
            content:
              "Demand for AI/ML engineers in your target locations has increased by 40% in the last quarter. Consider highlighting your AI-related experience and skills.",
            priority: "medium",
            created_at: new Date().toISOString(),
          },
          {
            id: "mock-3",
            insight_type: "skill",
            title: "Skill Gap Identified",
            content:
              "Based on your target roles, employers are increasingly looking for cloud platform experience (AWS, Azure, GCP). Consider adding certifications or projects in this area.",
            priority: "medium",
            created_at: new Date().toISOString(),
          },
          {
            id: "mock-4",
            insight_type: "application",
            title: "Response Rate Analysis",
            content:
              "Your application response rate is 15%, which is above the industry average of 12%. Applications sent on Tuesday-Thursday have a 23% higher response rate.",
            priority: "low",
            created_at: new Date().toISOString(),
          },
        ]
      : insights;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
            <Sparkles className="text-purple-600" />
            AI Insights
          </h1>
          <p className="text-neutral-600 mt-1">
            Personalized recommendations to accelerate your job search
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Active Insights</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {mockInsights.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Implemented</p>
                  <p className="text-2xl font-bold text-neutral-900">7</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Performance</p>
                  <p className="text-2xl font-bold text-neutral-900">+24%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">High Priority</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {mockInsights.filter((i) => i.priority === "high").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights List */}
        <div className="space-y-4">
          {mockInsights.map((insight, index) => {
            const Icon = iconMap[insight.insight_type] || iconMap.default;
            const colors =
              priorityColors[insight.priority] || priorityColors.medium;

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className={`border-l-4 ${colors.border}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className={colors.icon} size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-neutral-900">
                              {insight.title}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-lg text-xs font-medium ${colors.bg} ${colors.text}`}
                            >
                              {insight.priority.charAt(0).toUpperCase() +
                                insight.priority.slice(1)}{" "}
                              Priority
                            </span>
                          </div>
                          <p className="text-neutral-700 leading-relaxed mb-4">
                            {insight.content}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-neutral-500">
                            <span>
                              {new Date(
                                insight.created_at,
                              ).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span className="capitalize">
                              {insight.insight_type} insight
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                          Take Action
                        </button>
                        <button
                          onClick={() => handleDismiss(insight.id)}
                          className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {mockInsights.length === 0 && !loading && (
            <Card>
              <CardContent className="p-12 text-center">
                <Sparkles className="mx-auto text-neutral-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  No insights yet
                </h3>
                <p className="text-neutral-600">
                  Our AI is analyzing your profile. Check back soon for
                  personalized recommendations!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
