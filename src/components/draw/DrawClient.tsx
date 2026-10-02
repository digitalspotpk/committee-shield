"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Crown, Lock, Sparkles, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { startDrawAction } from "@/app/actions/draw";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Confetti } from "@/components/ui/Confetti";
import { FramePortal } from "@/components/ui/FramePortal";
import { GlassCard, SectionTitle } from "@/components/ui/Glass";
import type { DrawOutcome, Participant } from "@/lib/draw";
import { formatDate, formatMoney } from "@/lib/utils";
import { LuckyWheel, type WheelHandle } from "./LuckyWheel";

type History = { id: string; month: number; drawnAt: Date; overridden: boolean; totalPoolAmount: number; winner: Participant };

type Props = {
  isAdmin: boolean;
  cycle: number;
  nextCycle: number;
  nextMonth: number;
  isComplete: boolean;
  eligible: Participant[];
  poolAmount: number;
  history: History[];
};

export function DrawClient(props: Props) {
  const router = useRouter();
  const wheel = useRef<WheelHandle>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<DrawOutcome | null>(null);
  const [entries] = useState(() => props.eligible.map((p) => ({ id: p.id, name: p.name })));

  useEffect(() => {
    wheel.current?.idle();
  }, []);

  async function start() {
    if (spinning) return;
    setSpinning(true);
    const res = await startDrawAction();
    if (!res.ok) {
      toast.error(res.error);
      setSpinning(false);
      wheel.current?.idle();
      return;
    }
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(30);
    await wheel.current?.spinTo(res.data.winner.id);
    navigator.vibrate?.([60, 40, 120]);
    setSpinning(false);
    setResult(res.data);
  }

  const label = props.isComplete ? `Start Cycle ${props.nextCycle}` : `Start Month ${props.nextMonth} Draw`;

  return (
    <div className="space-y-3">
      <GlassCard className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs text-white/45">
            {props.isComplete ? `Cycle ${props.cycle} complete` : `Cycle ${props.cycle}`}
          </p>
          <p className="text-lg font-semibold">
            {props.isComplete ? "Ready for a new cycle" : `Month ${props.nextMonth} of 12`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/45">Prize pool</p>
          <p className="num font-semibold text-gold-300">{formatMoney(props.poolAmount)}</p>
        </div>
      </GlassCard>

      <div className="relative py-8">
        <LuckyWheel ref={wheel} entries={entries} spinning={spinning} />
      </div>

      <div className="flex flex-wrap justify-center gap-1.5 px-2">
        <Badge tone="emerald" dot>
          {entries.length} eligible
        </Badge>
        <Badge>{props.history.length} already won</Badge>
      </div>

      {props.isAdmin ? (
        <Button
          variant="gold"
          size="lg"
          className="w-full"
          loading={spinning}
          disabled={entries.length === 0 || !!result}
          onClick={start}
        >
          <Sparkles className="h-5 w-5" /> {spinning ? "Spinning…" : label}
        </Button>
      ) : (
        <GlassCard className="flex items-center gap-3 text-sm text-white/55">
          <Lock className="h-4 w-4 text-gold-300" /> Only the Super Admin can start the monthly draw.
        </GlassCard>
      )}

      {entries.length === 0 && (
        <p className="text-center text-xs text-white/40">No verified members yet. Verify members from the Admin panel.</p>
      )}

      <SectionTitle>Cycle {props.cycle} winners</SectionTitle>
      {props.history.length === 0 ? (
        <GlassCard className="py-6 text-center text-sm text-white/40">No winners yet this cycle.</GlassCard>
      ) : (
        <div className="space-y-2">
          {props.history.map((h) => (
            <GlassCard key={h.id} className="flex items-center gap-3 p-3">
              <span className="num grid h-10 w-10 place-items-center rounded-xl bg-gold-400/10 text-sm font-semibold text-gold-300">
                {h.month}
              </span>
              <Avatar name={h.winner.name} src={h.winner.profileImageUrl} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{h.winner.name}</p>
                <p className="text-[11px] text-white/40">{formatDate(h.drawnAt)}</p>
              </div>
              {h.overridden ? <Badge>Override</Badge> : <Trophy className="h-4 w-4 text-gold-300" />}
            </GlassCard>
          ))}
        </div>
      )}

      {/* Winner reveal */}
      <FramePortal>
      <AnimatePresence>
        {result && (
          <motion.div
            className="pointer-events-auto absolute inset-0 z-[60] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Confetti />
            <motion.div
              initial={{ scale: 0.6, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="glass-strong relative w-full max-w-[320px] rounded-[32px] p-6 text-center shadow-glow-gold"
            >
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gold-400/15"
              >
                <Crown className="h-7 w-7 text-gold-300 drop-shadow-[0_0_8px_#f8c94a]" />
              </motion.div>
              <p className="text-xs uppercase tracking-[0.2em] text-gold-300/80">
                Cycle {result.cycle} · Month {result.month}
              </p>
              <div className="relative mx-auto my-4 w-fit">
                <span className="absolute inset-0 animate-pulse-ring rounded-full bg-gold-400/40" />
                <Avatar name={result.winner.name} src={result.winner.profileImageUrl} size={96} ring="gold" />
              </div>
              <h3 className="text-2xl font-semibold text-gradient-gold">{result.winner.name}</h3>
              <p className="mt-1 text-sm text-white/55">wins {formatMoney(result.poolAmount)}</p>
              <p className="mt-3 text-xs text-white/40">A policy tracker has been created with status “Pending”.</p>
              <Button
                className="mt-5 w-full"
                onClick={() => {
                  setResult(null);
                  router.refresh();
                }}
              >
                Awesome
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </FramePortal>
    </div>
  );
}
