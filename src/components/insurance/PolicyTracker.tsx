"use client";
/* eslint-disable @next/next/no-img-element */

import { motion } from "framer-motion";
import { ChevronRight, Clock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { GlassCard, SectionTitle } from "@/components/ui/Glass";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { PlanView } from "@/lib/queries";
import { cn, formatDate, formatMoney } from "@/lib/utils";
import { PolicyEditor } from "./PolicyEditor";

type Slot = { month: number; plan: PlanView | null };

export function PolicyTracker({
  cycle,
  plans,
  drawsDone,
  viewerId,
  isAdmin,
  cycleLength,
}: {
  cycle: number;
  plans: PlanView[];
  drawsDone: number;
  viewerId: string;
  isAdmin: boolean;
  cycleLength: number;
}) {
  const [open, setOpen] = useState<PlanView | null>(null);
  const active = plans.filter((p) => p.status === "Active").length;
  const totalPremium = plans.filter((p) => p.status === "Active").reduce((s, p) => s + p.annualPremium, 0);
  const slots: Slot[] = Array.from({ length: cycleLength }, (_, i) => ({
    month: i + 1,
    plan: plans.find((p) => p.month === i + 1) ?? null,
  }));
  const canEdit = (p: PlanView) => isAdmin || p.userId === viewerId;

  return (
    <div className="space-y-3">
      <div className="px-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Policy <span className="text-gradient-emerald">Tracker</span>
        </h1>
        <p className="text-sm text-white/45">Cycle {cycle} insurance purchases</p>
      </div>

      <GlassCard glow="emerald" className="space-y-4 p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-white/45">Progress</p>
            <p className="text-lg font-semibold">
              Month <span className="num text-emerald-300">{drawsDone}</span> of {cycleLength}
            </p>
          </div>
          <div className="text-right">
            <p className="num text-2xl font-semibold text-gold-300">{active}</p>
            <p className="text-[11px] text-white/45">Policies activated</p>
          </div>
        </div>
        <div className="space-y-2">
          <ProgressBar value={drawsDone} max={cycleLength} />
          <ProgressBar value={active} max={cycleLength} tone="gold" />
        </div>
        <p className="text-xs text-white/50">
          Month {drawsDone} of {cycleLength} – {active} {active === 1 ? "Policy" : "Policies"} Activated ·{" "}
          <span className="num text-white/70">{formatMoney(totalPremium)}</span> insured premium
        </p>
      </GlassCard>

      <SectionTitle>Monthly timeline</SectionTitle>
      <div className="relative space-y-2 pl-5">
        <span className="absolute bottom-3 left-[9px] top-3 w-px bg-gradient-to-b from-emerald-400/50 via-white/10 to-transparent" />
        {slots.map(({ month, plan }, i) => (
          <motion.div
            key={month}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="relative"
          >
            <span
              className={cn(
                "absolute -left-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full border-2 border-ink-900",
                plan?.status === "Active"
                  ? "bg-emerald-400 shadow-[0_0_10px_#34d399]"
                  : plan
                    ? "bg-gold-400 shadow-[0_0_10px_#f8c94a]"
                    : "bg-white/10",
              )}
            />
            {plan ? (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setOpen(plan)}
                className="glass flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-white/[0.06]"
              >
                <span className="num w-7 text-xs font-semibold text-white/40">M{month}</span>
                <Avatar name={plan.userName} src={plan.userImage} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{plan.userName}</p>
                  <p className="truncate text-[11px] text-white/45">
                    {plan.policyNumber ? `#${plan.policyNumber}` : plan.planName}
                  </p>
                </div>
                <Badge tone={plan.status === "Active" ? "emerald" : "gold"} dot>
                  {plan.status}
                </Badge>
                <ChevronRight className="h-4 w-4 text-white/25" />
              </motion.button>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-white/[0.08] p-3 text-white/30">
                <span className="num w-7 text-xs font-semibold">M{month}</span>
                <Clock className="h-4 w-4" />
                <span className="text-xs">Awaiting draw</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <BottomSheet open={!!open} onClose={() => setOpen(null)} title={open ? `Month ${open.month} policy` : ""} tall>
        {open &&
          (canEdit(open) ? (
            <PolicyEditor plan={open} isAdmin={isAdmin} onDone={() => setOpen(null)} />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar name={open.userName} src={open.userImage} size={52} />
                <div>
                  <p className="font-semibold">{open.userName}</p>
                  <Badge tone={open.status === "Active" ? "emerald" : "gold"} dot>
                    {open.status}
                  </Badge>
                </div>
              </div>
              <GlassCard className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-white/50">Plan</span> {open.planName}
                </p>
                <p className="flex justify-between">
                  <span className="text-white/50">Start</span> {formatDate(open.policyStartDate)}
                </p>
                <p className="flex justify-between">
                  <span className="text-white/50">Renews</span> {formatDate(open.nextRenewalDate)}
                </p>
                <p className="flex justify-between">
                  <span className="text-white/50">Premium</span> <span className="num">{formatMoney(open.annualPremium)}</span>
                </p>
              </GlassCard>
              {open.status === "Active" && (
                <p className="flex items-center gap-2 text-xs text-emerald-300">
                  <ShieldCheck className="h-4 w-4" /> Policy verified by the Super Admin
                </p>
              )}
            </div>
          ))}
      </BottomSheet>
    </div>
  );
}
