import { cn } from "@/lib/utils";

const tones = {
  emerald: "bg-emerald-400/12 text-emerald-300 ring-emerald-400/25",
  gold: "bg-gold-400/12 text-gold-300 ring-gold-400/30",
  neutral: "bg-white/[0.06] text-white/60 ring-white/10",
  rose: "bg-rose-400/12 text-rose-300 ring-rose-400/25",
} as const;

export function Badge({
  tone = "neutral",
  children,
  className,
  dot,
}: {
  tone?: keyof typeof tones;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1",
        tones[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_6px_currentColor]" />}
      {children}
    </span>
  );
}
