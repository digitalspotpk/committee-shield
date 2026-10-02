"use client";

import { motion } from "framer-motion";

export function ProgressBar({ value, max, tone = "emerald" }: { value: number; max: number; tone?: "emerald" | "gold" }) {
  const pct = max === 0 ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className={
          tone === "emerald"
            ? "relative h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 shadow-[0_0_14px_rgba(52,211,153,.7)]"
            : "relative h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300 shadow-[0_0_14px_rgba(248,201,74,.7)]"
        }
      >
        <span className="absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,.45)_50%,transparent_75%)] bg-[length:200%_100%]" />
      </motion.div>
    </div>
  );
}

export function ProgressRing({ value, max, size = 92 }: { value: number; max: number; size?: number }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max === 0 ? 0 : Math.min(1, value / max);
  return (
    <svg width={size} height={size} className="-rotate-90">
      <defs>
        <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#f8c94a" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.08)" strokeWidth={stroke} fill="none" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="url(#ring-grad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - pct) }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ filter: "drop-shadow(0 0 6px rgba(52,211,153,.6))" }}
      />
    </svg>
  );
}
