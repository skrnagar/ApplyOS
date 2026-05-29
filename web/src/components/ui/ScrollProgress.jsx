"use client";
import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const update = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? window.scrollY / docHeight : 0;
      setScale(Math.min(1, Math.max(0, progress)));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[2px] z-[80] origin-left bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 pointer-events-none will-change-transform"
      style={{ transform: `scaleX(${scale})` }}
    />
  );
}
