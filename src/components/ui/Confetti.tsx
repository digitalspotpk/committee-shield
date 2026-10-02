"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["#34d399", "#f8c94a", "#ffe08a", "#10b981", "#ffffff"];

export function Confetti({ count = 60 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 380,
        y: -(Math.random() * 380 + 120),
        r: Math.random() * 720 - 360,
        size: Math.random() * 6 + 4,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 0.15,
        round: Math.random() > 0.6,
      })),
    [count],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute left-1/2 top-1/2"
          style={{
            width: p.size,
            height: p.round ? p.size : p.size * 1.8,
            background: p.color,
            borderRadius: p.round ? 999 : 2,
            boxShadow: `0 0 8px ${p.color}`,
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 520], opacity: [1, 1, 0], rotate: p.r }}
          transition={{ duration: 2.4, delay: p.delay, ease: [0.15, 0.6, 0.4, 1], times: [0, 0.35, 1] }}
        />
      ))}
    </div>
  );
}
