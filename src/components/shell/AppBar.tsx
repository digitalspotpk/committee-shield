"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { BottomSheet } from "@/components/ui/BottomSheet";
import type { Notification } from "@/lib/queries";
import { cn, firstName, formatDate } from "@/lib/utils";
import type { ShellUser } from "./ShellContext";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const toneIcon = {
  gold: <Trophy className="h-4 w-4 text-gold-300" />,
  emerald: <Sparkles className="h-4 w-4 text-emerald-300" />,
  neutral: <ShieldCheck className="h-4 w-4 text-white/60" />,
};

export function AppBar({
  user,
  notifications,
  onAvatar,
}: {
  user: ShellUser;
  notifications: Notification[];
  onAvatar: () => void;
}) {
  const [hello, setHello] = useState("Welcome");
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  useEffect(() => setHello(greeting()), []);
  const unread = seen ? 0 : notifications.length;

  return (
    <header className="relative z-20 flex items-center gap-3 px-4 pb-3 pt-[max(env(safe-area-inset-top),14px)] md:pt-5">
      <motion.button whileTap={{ scale: 0.9 }} onClick={onAvatar} aria-label="Open profile" className="relative">
        <Avatar name={user.name} src={user.profileImageUrl} size={44} ring={user.role === "admin" ? "gold" : "emerald"} />
        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-ink-900 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
      </motion.button>
      <div className="min-w-0 flex-1">
        <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-white/45">
          {hello},
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="truncate text-lg font-semibold tracking-tight"
        >
          {firstName(user.name)} <span className="inline-block animate-float">👋</span>
        </motion.h1>
      </div>
      <motion.button
        whileTap={{ scale: 0.88, rotate: -12 }}
        onClick={() => {
          setOpen(true);
          setSeen(true);
        }}
        className="glass relative grid h-11 w-11 place-items-center rounded-2xl"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-white/80" />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold-400 px-1 text-[10px] font-bold text-ink-950 shadow-glow-gold"
            >
              {unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Notifications">
        {notifications.length === 0 ? (
          <p className="py-10 text-center text-sm text-white/40">You&apos;re all caught up.</p>
        ) : (
          <ul className="space-y-2.5">
            {notifications.map((n, i) => (
              <motion.li
                key={n.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  "glass flex items-start gap-3 rounded-2xl p-3.5",
                  n.tone === "gold" && "border-gold-400/20",
                )}
              >
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/[0.05]">{toneIcon[n.tone]}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-white/50">{n.body}</p>
                </div>
                {n.at && <span className="shrink-0 text-[10px] text-white/30">{formatDate(n.at)}</span>}
              </motion.li>
            ))}
          </ul>
        )}
      </BottomSheet>
    </header>
  );
}
