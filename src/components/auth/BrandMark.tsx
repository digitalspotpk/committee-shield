"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export function BrandMark({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0.5, rotate: -30, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="relative mb-5"
      >
        <span className="absolute inset-0 animate-pulse-ring rounded-[28px] bg-emerald-400/30" />
        <div className="relative grid h-20 w-20 place-items-center rounded-[28px] bg-gradient-to-br from-emerald-400 to-emerald-700 shadow-glow-emerald">
          <ShieldCheck className="h-10 w-10 text-ink-950" strokeWidth={2.2} />
          <span className="absolute -right-1.5 -top-1.5 h-6 w-6 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 shadow-glow-gold" />
        </div>
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-3xl font-semibold tracking-tight"
      >
        {title}
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-2 text-sm text-white/50">
        {subtitle}
      </motion.p>
    </div>
  );
}
