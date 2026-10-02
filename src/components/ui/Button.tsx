"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "gold" | "ghost" | "danger" | "subtle";

const styles: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-emerald-400 to-emerald-600 text-ink-950 shadow-glow-emerald hover:from-emerald-300 hover:to-emerald-500",
  gold: "bg-gradient-to-br from-gold-300 to-gold-500 text-ink-950 shadow-glow-gold hover:from-gold-300 hover:to-gold-400",
  ghost: "bg-white/[0.06] text-white ring-1 ring-white/10 hover:bg-white/[0.1]",
  subtle: "bg-transparent text-white/70 hover:text-white hover:bg-white/[0.06]",
  danger: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30 hover:bg-rose-500/25",
};

type Props = Omit<HTMLMotionProps<"button">, "children"> & {
  variant?: Variant;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
};

export function Button({ variant = "primary", loading, size = "md", className, children, disabled, ...rest }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "h-9 px-3 text-xs",
        size === "md" && "h-12 px-5 text-sm",
        size === "lg" && "h-14 px-6 text-base",
        styles[variant],
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  );
}
