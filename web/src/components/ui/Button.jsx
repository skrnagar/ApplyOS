"use client";
import React from "react";
import { motion } from "motion/react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  ...props
}) {
  const baseStyles =
    "font-semibold rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30",
    secondary:
      "bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700",
    outline: "border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50",
    ghost: "text-neutral-700 hover:bg-neutral-100",
    success:
      "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/30",
    danger:
      "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
