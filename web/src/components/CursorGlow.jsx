"use client";
import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export default function CursorGlow() {
  const [enabled, setEnabled] = useState(false);
  const xRaw = useMotionValue(0);
  const yRaw = useMotionValue(0);
  const xDot = useSpring(xRaw, { stiffness: 600, damping: 50, mass: 0.4 });
  const yDot = useSpring(yRaw, { stiffness: 600, damping: 50, mass: 0.4 });
  const xGlow = useSpring(xRaw, { stiffness: 80, damping: 22, mass: 1 });
  const yGlow = useSpring(yRaw, { stiffness: 80, damping: 22, mass: 1 });

  useEffect(() => {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) return;
    setEnabled(true);

    const handle = (e) => {
      xRaw.set(e.clientX);
      yRaw.set(e.clientY);
    };
    window.addEventListener("mousemove", handle, { passive: true });
    return () => window.removeEventListener("mousemove", handle);
  }, [xRaw, yRaw]);

  if (!enabled) return null;

  return (
    <>
      {/* Soft ambient glow */}
      <motion.div
        aria-hidden
        style={{ x: xGlow, y: yGlow, translateX: "-50%", translateY: "-50%" }}
        className="pointer-events-none fixed top-0 left-0 z-[1] w-[520px] h-[520px] rounded-full mix-blend-screen"
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(74,222,128,0.18)_0%,transparent_60%)]" />
        <div className="absolute inset-0 rounded-full translate-x-[3px] bg-[radial-gradient(circle,rgba(59,130,246,0.16)_0%,transparent_55%)]" />
        <div className="absolute inset-0 rounded-full -translate-x-[3px] bg-[radial-gradient(circle,rgba(168,85,247,0.10)_0%,transparent_55%)]" />
      </motion.div>

      {/* Outer ring */}
      <motion.div
        aria-hidden
        style={{ x: xDot, y: yDot, translateX: "-50%", translateY: "-50%" }}
        className="pointer-events-none fixed top-0 left-0 z-[60] w-9 h-9 rounded-full border border-white/40 mix-blend-difference hidden md:block"
      />

      {/* Precision dot */}
      <motion.div
        aria-hidden
        style={{ x: xRaw, y: yRaw, translateX: "-50%", translateY: "-50%" }}
        className="pointer-events-none fixed top-0 left-0 z-[60] w-1.5 h-1.5 rounded-full bg-white mix-blend-difference hidden md:block"
      />
    </>
  );
}
