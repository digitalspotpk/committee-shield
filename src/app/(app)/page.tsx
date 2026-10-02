import { ArrowUpRight, CalendarClock, Coins, Crown, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/home/Stagger";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { GlassCard, SectionTitle } from "@/components/ui/Glass";
import { ProgressRing } from "@/components/ui/ProgressBar";
import { CYCLE_LENGTH } from "@/lib/config";
import { getDashboard } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { formatDate, formatMoney } from "@/lib/utils";

export default async function HomePage() {
  const user = await requireUser();
  const { state, activeCount, myPlan, myWin } = await getDashboard(user);
  const latest = state.draws.at(-1);
  const done = state.draws.length;

  return (
    <Stagger className="space-y-3">
      {/* Hero */}
      <StaggerItem>
        <GlassCard glow="emerald" className="p-5">
          <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex-1">
              <Badge tone="emerald" dot>
                Cycle {state.cycle} · Live
              </Badge>
              <p className="mt-3 text-xs text-white/50">Monthly committee pool</p>
              <p className="num text-3xl font-semibold text-gradient-gold">{formatMoney(state.poolAmount)}</p>
              <p className="mt-1 text-xs text-white/45">
                {state.participants.length} verified participants
              </p>
            </div>
            <div className="relative grid place-items-center">
              <ProgressRing value={done} max={CYCLE_LENGTH} />
              <div className="absolute text-center">
                <p className="num text-xl font-semibold leading-none">{done}</p>
                <p className="text-[10px] text-white/45">of {CYCLE_LENGTH}</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </StaggerItem>

      {/* Stats */}
      <StaggerItem className="grid grid-cols-3 gap-3">
        {[
          { icon: Users, label: "Members", value: state.participants.length, tone: "text-emerald-300" },
          { icon: ShieldCheck, label: "Active", value: activeCount, tone: "text-gold-300" },
          {
            icon: CalendarClock,
            label: "Next draw",
            value: state.isComplete ? "New" : `M${state.nextMonth}`,
            tone: "text-emerald-200",
          },
        ].map(({ icon: Icon, label, value, tone }) => (
          <GlassCard key={label} className="p-3.5">
            <Icon className={`h-4 w-4 ${tone}`} />
            <p className="num mt-3 text-xl font-semibold">{value}</p>
            <p className="text-[11px] text-white/45">{label}</p>
          </GlassCard>
        ))}
      </StaggerItem>

      {/* Latest winner */}
      <StaggerItem>
        <SectionTitle
          action={
            <Link href="/draw" className="flex items-center gap-1 text-xs text-emerald-300">
              Open draw <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          Latest winner
        </SectionTitle>
        {latest ? (
          <GlassCard glow="gold" className="flex items-center gap-4 p-4">
            <div className="absolute -left-8 -top-10 h-32 w-32 rounded-full bg-gold-400/15 blur-3xl" />
            <div className="relative">
              <Avatar name={latest.winner.name} src={latest.winner.profileImageUrl} size={56} ring="gold" />
              <Crown className="absolute -top-3 left-1/2 h-5 w-5 -translate-x-1/2 text-gold-300 drop-shadow-[0_0_6px_#f8c94a]" />
            </div>
            <div className="relative min-w-0 flex-1">
              <p className="truncate font-semibold">{latest.winner.name}</p>
              <p className="text-xs text-white/50">
                Month {latest.month} · {formatDate(latest.drawnAt)}
              </p>
            </div>
            <div className="relative text-right">
              <p className="num text-sm font-semibold text-gold-300">{formatMoney(latest.totalPoolAmount)}</p>
              {latest.overridden && <Badge tone="neutral">Override</Badge>}
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="py-8 text-center text-sm text-white/45">No draws yet — the first spin is coming soon.</GlassCard>
        )}
      </StaggerItem>

      {/* Personal status */}
      <StaggerItem>
        <SectionTitle>Your status</SectionTitle>
        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Verification</span>
            <Badge tone={user.verified ? "emerald" : "neutral"} dot>
              {user.verified ? "Verified" : "Pending"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Committee</span>
            {myWin ? <Badge tone="gold">Won month {myWin.month}</Badge> : <Badge>In the pool</Badge>}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Premium budget</span>
            <span className="num text-sm font-medium">{formatMoney(user.premiumBudget)}</span>
          </div>
          {myPlan && (
            <Link href="/insurance" className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm">
                <Coins className="h-4 w-4 text-gold-300" /> {myPlan.planName}
              </span>
              <Badge tone={myPlan.status === "Active" ? "emerald" : "gold"} dot>
                {myPlan.status}
              </Badge>
            </Link>
          )}
        </GlassCard>
      </StaggerItem>

      {/* Activity */}
      {state.draws.length > 0 && (
        <StaggerItem>
          <SectionTitle>Cycle timeline</SectionTitle>
          <GlassCard className="p-2">
            {state.draws
              .slice()
              .reverse()
              .slice(0, 5)
              .map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-2xl px-2 py-2.5">
                  <span className="num grid h-9 w-9 place-items-center rounded-xl bg-emerald-400/10 text-xs font-semibold text-emerald-300">
                    M{d.month}
                  </span>
                  <Avatar name={d.winner.name} src={d.winner.profileImageUrl} size={32} />
                  <span className="flex-1 truncate text-sm">{d.winner.name}</span>
                  <span className="text-[11px] text-white/35">{formatDate(d.drawnAt)}</span>
                </div>
              ))}
          </GlassCard>
        </StaggerItem>
      )}
    </Stagger>
  );
}
