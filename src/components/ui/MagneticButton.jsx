"use client";
import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

export default function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  icon: Icon,
  strength = 0.35,
}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.6 });
  const rotateX = useTransform(springY, [-30, 30], [8, -8]);
  const rotateY = useTransform(springX, [-30, 30], [-8, 8]);

  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left - rect.width / 2;
    const py = e.clientY - rect.top - rect.height / 2;
    x.set(px * strength);
    y.set(py * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const variants = {
    primary:
      "bg-white text-black hover:bg-neutral-100 shadow-[0_8px_30px_rgba(15,23,42,0.08)] border border-neutral-200/80",
    secondary:
      "bg-white/[0.04] text-white border border-white/10 hover:bg-white/[0.08] hover:border-white/30 backdrop-blur-xl",
    glow:
      "bg-gradient-to-r from-green-500 to-emerald-400 text-black shadow-[0_8px_40px_rgba(34,197,94,0.45)] hover:shadow-[0_8px_50px_rgba(34,197,94,0.65)]",
    cta:
      "bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-700/20 shadow-sm",
    outline:
      "bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300",
  };

  const inner = (
    <motion.span
      style={{ x: springX, y: springY, rotateX, rotateY }}
      className="relative inline-flex items-center gap-2"
    >
      <span className="relative z-10 flex items-center gap-2 font-semibold tracking-tight">
        {children}
        {Icon ? <Icon size={18} className="transition-transform group-hover:translate-x-0.5" /> : null}
      </span>
    </motion.span>
  );

  const Component = href ? "a" : "button";

  return (
    <Component
      ref={ref}
      href={href}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative inline-flex items-center justify-center px-7 py-3.5 rounded-full transition-all duration-300 will-change-transform ${variants[variant]} ${className}`}
      style={{ transformStyle: "preserve-3d", perspective: 800 }}
    >
      {inner}
      {(variant === "primary" || variant === "secondary" || variant === "glow") && (
        <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="absolute inset-[-1px] rounded-full bg-gradient-to-r from-blue-500 via-emerald-400 to-purple-500 opacity-30 blur-md" />
        </span>
      )}
    </Component>
  );
}
