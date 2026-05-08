"use client";
import React from "react";
import { motion } from "motion/react";

export default function AmbientBackground({ className = "" }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <motion.div
        animate={{ x: [0, 80, 0], y: [0, -50, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-24 -left-24 w-[30rem] h-[30rem] rounded-full bg-blue-500/20 blur-[140px]"
      />
      <motion.div
        animate={{ x: [0, -60, 0], y: [0, 40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[30%] right-[-8rem] w-[26rem] h-[26rem] rounded-full bg-green-400/15 blur-[130px]"
      />
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-8rem] left-[20%] w-[22rem] h-[22rem] rounded-full bg-purple-500/10 blur-[120px]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,transparent_0%,rgba(0,0,0,0.65)_80%)]" />
    </div>
  );
}
