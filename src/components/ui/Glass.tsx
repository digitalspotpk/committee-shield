import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement> & { glow?: "emerald" | "gold" | "none" };

export function GlassCard({ className, glow = "none", children, ...rest }: Props) {
  return (
    <div
      className={cn(
        "glass relative overflow-hidden rounded-3xl p-4",
        glow === "emerald" && "shadow-glow-emerald",
        glow === "gold" && "shadow-glow-gold",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 mt-6 flex items-center justify-between px-1">
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white/45">{children}</h2>
      {action}
    </div>
  );
}
