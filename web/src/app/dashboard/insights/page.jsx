"use client";
import { useEffect } from "react";
import { useNavigate } from "react-router";

/** AI Insights now live on the Resumes page. */
export default function InsightsRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/dashboard/resumes#insights", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center text-sm text-neutral-500">
      Opening resume insights…
    </div>
  );
}
