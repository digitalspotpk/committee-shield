"use client";

import { motion } from "framer-motion";
import { Dices, Home, LayoutDashboard, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/draw", label: "Draw", icon: Dices },
  { href: "/members", label: "Members", icon: Users },
  { href: "/insurance", label: "Policies", icon: ShieldCheck },
  { href: "/admin", label: "Admin", icon: LayoutDashboard, admin: true },
];

export function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const items = ITEMS.filter((i) => !i.admin || isAdmin);

  return (
    <nav className="absolute inset-x-0 bottom-0 z-30 px-3 pb-[max(env(safe-area-inset-bottom),12px)]">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink-900 via-ink-900/80 to-transparent" />
      <div className="glass-strong relative mx-auto flex h-[68px] items-center justify-around rounded-[26px] px-1.5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="relative flex h-full flex-1 flex-col items-center justify-center"
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-x-1 inset-y-2 rounded-[18px] bg-gradient-to-b from-emerald-400/20 to-emerald-400/5 ring-1 ring-emerald-300/25"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                >
                  <span className="absolute -top-2 left-1/2 h-1 w-7 -translate-x-1/2 rounded-full bg-emerald-300 shadow-[0_0_12px_3px_rgba(52,211,153,.7)]" />
                </motion.span>
              )}
              <motion.span
                whileTap={{ scale: 0.8 }}
                animate={active ? { y: -2, scale: 1.08 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
                className="relative z-10"
              >
                <Icon
                  className={cn(
                    "h-[22px] w-[22px] transition-colors",
                    active ? "text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,.8)]" : "text-white/45",
                  )}
                  strokeWidth={active ? 2.3 : 1.8}
                />
              </motion.span>
              <motion.span
                animate={{ opacity: active ? 1 : 0.5, height: active ? 14 : 12 }}
                className={cn("relative z-10 mt-0.5 text-[10px] font-medium", active ? "text-emerald-200" : "text-white/40")}
              >
                {label}
              </motion.span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
