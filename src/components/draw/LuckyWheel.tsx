"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { forwardRef, useImperativeHandle, useRef } from "react";

export type WheelEntry = { id: string; name: string };
export type WheelHandle = { spinTo: (winnerId: string) => Promise<void>; idle: () => void };

const SIZE = 320;
const R = SIZE / 2;
const SEGMENT_FILLS = [
  ["#0f3d2e", "#0a2a20"],
  ["#3b2f0b", "#271f07"],
];

function polar(angleDeg: number, radius: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: R + radius * Math.cos(a), y: R + radius * Math.sin(a) };
}

function segmentPath(start: number, end: number, radius: number) {
  if (end - start >= 359.999) {
    return `M ${R} ${R - radius} A ${radius} ${radius} 0 1 1 ${R - 0.01} ${R - radius} Z`;
  }
  const s = polar(start, radius);
  const e = polar(end, radius);
  const large = end - start > 180 ? 1 : 0;
  return `M ${R} ${R} L ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

/**
 * SVG prize wheel. `spinTo(id)` rotates several full turns and decelerates so the
 * winner's segment stops exactly under the top pointer.
 */
export const LuckyWheel = forwardRef<WheelHandle, { entries: WheelEntry[]; spinning: boolean }>(function LuckyWheel(
  { entries, spinning },
  ref,
) {
  const rotation = useMotionValue(0);
  const glow = useTransform(rotation, (r) => `drop-shadow(0 0 ${12 + (Math.abs(r) % 30) / 3}px rgba(52,211,153,.55))`);
  const idleAnim = useRef<ReturnType<typeof animate> | null>(null);
  const n = Math.max(entries.length, 1);
  const seg = 360 / n;

  useImperativeHandle(ref, () => ({
    idle() {
      idleAnim.current?.stop();
      idleAnim.current = animate(rotation, rotation.get() + 360, { duration: 40, ease: "linear", repeat: Infinity });
    },
    async spinTo(winnerId) {
      idleAnim.current?.stop();
      const index = entries.findIndex((e) => e.id === winnerId);
      const current = rotation.get();
      const jitter = (Math.random() - 0.5) * seg * 0.6;
      const centre = index >= 0 ? (index + 0.5) * seg : Math.random() * 360;
      const base = current - (current % 360) + 360 * 7;
      const target = base + (360 - centre) + jitter;
      await animate(rotation, target, { duration: 6.2, ease: [0.12, 0.65, 0.08, 1] });
    },
  }));

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[320px]">
      {/* Halo */}
      <div className="absolute inset-[-14px] rounded-full bg-[conic-gradient(from_0deg,rgba(52,211,153,.5),rgba(248,201,74,.5),rgba(52,211,153,.5))] opacity-60 blur-xl" />
      <div className="absolute inset-[-6px] rounded-full bg-gradient-to-b from-gold-300 via-gold-600 to-gold-300 p-[3px] shadow-glow-gold">
        <div className="h-full w-full rounded-full bg-ink-950" />
      </div>

      {/* Bulbs */}
      <div className="absolute inset-[-6px]">
        {Array.from({ length: 24 }).map((_, i) => {
          const p = polar(i * 15, R + 3);
          return (
            <motion.span
              key={i}
              className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-300"
              style={{ left: `${((p.x + 6) / (SIZE + 12)) * 100}%`, top: `${((p.y + 6) / (SIZE + 12)) * 100}%` }}
              animate={{ opacity: spinning ? [0.25, 1, 0.25] : [0.5, 0.9, 0.5] }}
              transition={{ duration: spinning ? 0.4 : 1.6, repeat: Infinity, delay: (i % 2) * (spinning ? 0.2 : 0.8) }}
            />
          );
        })}
      </div>

      <motion.svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="relative h-full w-full" style={{ rotate: rotation, filter: glow }}>
        <defs>
          {SEGMENT_FILLS.map(([a, b], i) => (
            <radialGradient key={i} id={`seg-${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="20%" stopColor={b} />
              <stop offset="100%" stopColor={a} />
            </radialGradient>
          ))}
        </defs>
        {entries.length === 0 ? (
          <circle cx={R} cy={R} r={R - 4} fill="#0c1411" stroke="rgba(255,255,255,.08)" />
        ) : (
          entries.map((e, i) => {
            const start = i * seg;
            const mid = start + seg / 2;
            const label = polar(mid, R * 0.62);
            const name = e.name.split(" ")[0]!.slice(0, 10);
            return (
              <g key={e.id}>
                <path
                  d={segmentPath(start, start + seg, R - 4)}
                  fill={`url(#seg-${i % 2})`}
                  stroke={i % 2 ? "rgba(248,201,74,.45)" : "rgba(52,211,153,.45)"}
                  strokeWidth={1.2}
                />
                <text
                  x={label.x}
                  y={label.y}
                  fill={i % 2 ? "#ffe08a" : "#a7f3d0"}
                  fontSize={n > 8 ? 11 : 13}
                  fontWeight={600}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${mid - 90} ${label.x} ${label.y})`}
                  style={{ letterSpacing: ".02em" }}
                >
                  {name}
                </text>
              </g>
            );
          })
        )}
        <circle cx={R} cy={R} r={R - 4} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth={2} />
      </motion.svg>

      {/* Hub */}
      <div className="absolute left-1/2 top-1/2 grid h-[74px] w-[74px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 p-[3px] shadow-glow-gold">
        <div className="grid h-full w-full place-items-center rounded-full bg-ink-900 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-300">
          {spinning ? "…" : "Spin"}
        </div>
      </div>

      {/* Pointer */}
      <motion.div
        className="absolute left-1/2 top-[-18px] -translate-x-1/2"
        animate={spinning ? { rotate: [0, -14, 0] } : { rotate: 0 }}
        transition={spinning ? { duration: 0.18, repeat: Infinity } : undefined}
        style={{ originY: 0.2 }}
      >
        <svg width="34" height="42" viewBox="0 0 34 42">
          <defs>
            <linearGradient id="ptr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffe08a" />
              <stop offset="1" stopColor="#e9ad1c" />
            </linearGradient>
          </defs>
          <path d="M17 41 L3 10 A14 14 0 1 1 31 10 Z" fill="url(#ptr)" stroke="#070c0a" strokeWidth="2" />
          <circle cx="17" cy="13" r="5" fill="#070c0a" />
        </svg>
      </motion.div>
    </div>
  );
});
