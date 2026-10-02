/* eslint-disable @next/next/no-img-element */
import { cn, initials } from "@/lib/utils";

type Props = {
  name?: string | null;
  src?: string | null;
  size?: number;
  ring?: "emerald" | "gold" | "none";
  className?: string;
};

export function Avatar({ name, src, size = 40, ring = "none", className }: Props) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500/30 to-gold-500/20 font-semibold text-white/90",
        ring === "emerald" && "ring-2 ring-emerald-400/70 ring-offset-2 ring-offset-ink-900",
        ring === "gold" && "ring-2 ring-gold-400/80 ring-offset-2 ring-offset-ink-900",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {src ? (
        <img src={src} alt={name ?? "avatar"} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
