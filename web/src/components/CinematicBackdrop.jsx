"use client";
import React, { useEffect, useState } from "react";

/**
 * Full-viewport cinematic layers: aurora mesh, drifting grid, parallax orbs.
 * Fixed behind page content (z-0).
 */
export default function CinematicBackdrop() {
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
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[#020203]" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out"
          style={{ transform: `translate(${dx * 36}px, ${dy * 28}px)` }}
        >
          <div className="w-[min(200vw,2400px)] h-[min(200vh,2400px)] cinematic-aurora-spin opacity-[0.48] mix-blend-screen" />
        </div>
      </div>

      <div className="absolute inset-0 cinematic-mesh-drift opacity-80" />

      <div className="absolute inset-0 cinematic-grid-drift opacity-[0.22]" />

      <div
        className="absolute -top-32 -left-20 w-[38rem] h-[38rem] rounded-full bg-blue-600/25 blur-[120px] motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out"
        style={{ transform: `translate(${dx * 48}px, ${dy * 36}px)` }}
      />
      <div
        className="absolute top-[18%] right-[-12%] w-[32rem] h-[32rem] rounded-full bg-emerald-500/20 blur-[110px] motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out"
        style={{ transform: `translate(${dx * -36}px, ${dy * 28}px)` }}
      />
      <div
        className="absolute bottom-[-15%] left-[25%] w-[28rem] h-[28rem] rounded-full bg-violet-600/18 blur-[100px] motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out"
        style={{ transform: `translate(${dx * 22}px, ${dy * -40}px)` }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-10%,rgba(255,255,255,0.06),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.75)_72%,#000_100%)]" />
    </div>
  );
}
