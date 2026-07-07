"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

export default function AmbientBackground({ className = "" }) {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const onMove = (e) => {
      setMouse({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const dx = (mouse.x - 0.5) * 2;
  const dy = (mouse.y - 0.5) * 2;

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 opacity-40 cinematic-mesh-drift scale-110" />
      <div className="absolute inset-0 opacity-[0.16] cinematic-grid-drift" />

      <div
        className="absolute -top-24 -left-24 w-[28rem] h-[28rem] motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out"
        style={{ transform: `translate(${dx * 24}px, ${dy * 18}px)` }}
      >
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.55, 0.4] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full rounded-full bg-blue-500/25 blur-[120px]"
        />
      </div>

      <div
        className="absolute top-[28%] right-[-6rem] w-[24rem] h-[24rem] motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out"
        style={{ transform: `translate(${dx * -20}px, ${dy * 22}px)` }}
      >
        <motion.div
          animate={{ scale: [1, 0.94, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full rounded-full bg-emerald-400/20 blur-[110px]"
        />
      </div>

      <motion.div
        animate={{ x: [0, 14, 0], y: [0, -12, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-6rem] left-[18%] w-[20rem] h-[20rem] rounded-full bg-violet-500/15 blur-[100px]"
      />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-y-0 left-[-20%] w-[55%] bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent ambient-shimmer blur-3xl" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,transparent_0%,rgba(0,0,0,0.72)_78%)]" />
    </div>
  );
}
