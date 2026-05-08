"use client";
import React from "react";

export default function Card({
  children,
  className = "",
  hover = false,
  ...props
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-neutral-200 shadow-sm ${
        hover ? "hover:shadow-lg transition-shadow duration-200" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`p-6 border-b border-neutral-200 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return (
    <div className={`p-6 border-t border-neutral-200 ${className}`}>
      {children}
    </div>
  );
}
