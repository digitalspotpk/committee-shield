"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Crown, Pencil, RefreshCcw, ShieldCheck, ShieldOff, Shuffle, Trash2, UserCog } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  adminUpdateMemberAction,
  deleteMemberAction,
  overrideWinnerAction,
  resetCycleAction,
  setRoleAction,
  setVerifiedAction,
} from "@/app/actions/admin";
import { setPolicyStatusAction } from "@/app/actions/policy";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { SelectField } from "@/components/ui/Field";
import { GlassCard, SectionTitle } from "@/components/ui/Glass";
import type { MemberView, PlanView } from "@/lib/queries";
import { cn, formatDate, formatMoney } from "@/lib/utils";

type AnyResult = { ok: true } | { ok: false; error: string };

type Draw = { id: string; month: number; winner: { id: string; name: string } };

type Props = {
  me: string;
  members: MemberView[];
  plans: PlanView[];
  draws: Draw[];
  cycle: number;
  nextMonth: number;
  isComplete: boolean;
  eligibleCount: number;
  maxMembers: number;
};

const TABS = ["Members", "Draw", "Policies"] as const;
type Tab = (typeof TABS)[number];

export function AdminPanel(props: Props) {
  const [tab, setTab] = useState<Tab>("Members");
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, start] = useTransition();

  function run(id: string, fn: () => Promise<AnyResult>, success: string) {
    setBusyId(id);
    start(async () => {
      const res = await fn();
      setBusyId(null);
      if (!res.ok) return void toast.error(res.error);
      toast.success(success);
      router.refresh();
    });
  }

  const verified = props.members.filter((m) => m.verified).length;
  const activePolicies = props.plans.filter((p) => p.status === "Active").length;

  return (
    <div className="space-y-3">
      <div className="px-1">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Crown className="h-6 w-6 text-gold-300" /> Control Panel
        </h1>
        <p className="text-sm text-white/45">Super Admin · Cycle {props.cycle}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Members", value: `${props.members.filter((m) => m.role === "member").length}/${props.maxMembers}` },
          { label: "Verified", value: verified },
          { label: "Active", value: activePolicies },
        ].map((s) => (
          <GlassCard key={s.label} className="p-3 text-center">
            <p className="num text-lg font-semibold">{s.value}</p>
            <p className="text-[11px] text-white/45">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Segmented control */}
      <div className="glass relative grid grid-cols-3 rounded-2xl p-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className="relative h-10 text-sm font-medium">
            {tab === t && (
              <motion.span
                layoutId="admin-tab"
                className="absolute inset-0 rounded-xl bg-gradient-to-b from-emerald-400/25 to-emerald-400/10 ring-1 ring-emerald-300/30"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className={cn("relative", tab === t ? "text-emerald-100" : "text-white/50")}>{t}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "Members" && <MembersTab {...props} busyId={busyId} run={run} />}
          {tab === "Draw" && <DrawTab {...props} busyId={busyId} run={run} />}
          {tab === "Policies" && <PoliciesTab plans={props.plans} busyId={busyId} run={run} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

type Runner = { busyId: string | null; run: (id: string, fn: () => Promise<AnyResult>, ok: string) => void };

function MembersTab({ members, me, busyId, run }: Props & Runner) {
  const router = useRouter();
  const [editing, setEditing] = useState<MemberView | null>(null);
  return (
    <div className="space-y-2">
      {members.map((m) => (
        <GlassCard key={m.id} className="p-3">
          <div className="flex items-center gap-3">
            <Avatar name={m.name} src={m.profileImageUrl} size={42} ring={m.role === "admin" ? "gold" : "none"} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{m.name}</p>
              <p className="truncate text-[11px] text-white/40">{m.email}</p>
              <p className="truncate text-[10px] text-white/30">
                IP {m.ipAddress ?? "—"} · {formatDate(m.createdAt)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {m.role === "admin" && <Badge tone="gold">Admin</Badge>}
              <Badge tone={m.verified ? "emerald" : "neutral"} dot>
                {m.verified ? "Verified" : "Pending"}
              </Badge>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            <Button
              size="sm"
              variant={m.verified ? "ghost" : "primary"}
              loading={busyId === `v-${m.id}`}
              onClick={() =>
                run(`v-${m.id}`, () => setVerifiedAction(m.id, !m.verified), m.verified ? "Verification removed" : "Member verified")
              }
            >
              {m.verified ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
              {m.verified ? "Unverify" : "Verify"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(m)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={m.id === me}
              loading={busyId === `r-${m.id}`}
              onClick={() =>
                run(`r-${m.id}`, () => setRoleAction(m.id, m.role === "admin" ? "member" : "admin"), "Role updated")
              }
            >
              <UserCog className="h-3.5 w-3.5" /> {m.role === "admin" ? "Demote" : "Admin"}
            </Button>
            <ConfirmButton
              title="Delete member?"
              message={
                <>
                  This permanently removes <b className="text-white">{m.name}</b> and their policy records.
                </>
              }
              confirmLabel="Delete"
              onConfirm={() => run(`d-${m.id}`, () => deleteMemberAction(m.id), "Member deleted")}
              className={m.id === me ? "pointer-events-none opacity-40" : ""}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </ConfirmButton>
          </div>
        </GlassCard>
      ))}

      <BottomSheet open={!!editing} onClose={() => setEditing(null)} title="Edit member" tall>
        {editing && (
          <ProfileForm
            initial={editing}
            submit={(values) => adminUpdateMemberAction(editing.id, values)}
            submitLabel="Save member"
            onDone={() => {
              setEditing(null);
              router.refresh();
            }}
          />
        )}
      </BottomSheet>
    </div>
  );
}

function DrawTab({ draws, members, cycle, nextMonth, isComplete, eligibleCount, busyId, run }: Props & Runner) {
  const [month, setMonth] = useState(draws.at(-1)?.id ?? "");
  const [member, setMember] = useState("");
  const winners = new Set(draws.map((d) => d.winner.id));
  const candidates = members.filter((m) => m.verified && !winners.has(m.id));

  return (
    <div className="space-y-3">
      <GlassCard glow="gold" className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/45">Next draw</p>
            <p className="font-semibold">{isComplete ? `Cycle ${cycle + 1} · Month 1` : `Cycle ${cycle} · Month ${nextMonth}`}</p>
          </div>
          <Badge tone="emerald" dot>
            {eligibleCount} eligible
          </Badge>
        </div>
        <Link href="/draw" className="block">
          <Button variant="gold" className="w-full">
            <Shuffle className="h-4 w-4" /> Open lucky wheel
          </Button>
        </Link>
      </GlassCard>

      <SectionTitle>Override winner</SectionTitle>
      <GlassCard className="space-y-3">
        {draws.length === 0 ? (
          <p className="text-sm text-white/40">No draws in this cycle yet.</p>
        ) : (
          <>
            <SelectField label="Month" value={month} onChange={(e) => setMonth(e.target.value)}>
              {draws.map((d) => (
                <option key={d.id} value={d.id}>
                  Month {d.month} — {d.winner.name}
                </option>
              ))}
            </SelectField>
            <SelectField label="New winner" value={member} onChange={(e) => setMember(e.target.value)}>
              <option value="">Select a member…</option>
              {candidates.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </SelectField>
            <ConfirmButton
              title="Override winner?"
              message="The month's winner will be replaced and its policy tracker reset to Pending for the new member."
              confirmLabel="Override"
              variant="gold"
              triggerVariant="ghost"
              size="md"
              className="w-full"
              onConfirm={() => {
                if (!member) return void toast.error("Choose the new winner first");
                run("override", () => overrideWinnerAction(month, member), "Winner overridden");
              }}
            >
              <Crown className="h-4 w-4" /> Apply override
            </ConfirmButton>
          </>
        )}
      </GlassCard>

      <SectionTitle>Danger zone</SectionTitle>
      <GlassCard className="space-y-3 border-rose-400/20">
        <p className="text-sm text-white/55">
          Resetting removes all {draws.length} draw{draws.length === 1 ? "" : "s"} of Cycle {cycle} and their policy trackers.
        </p>
        <ConfirmButton
          title="Reset this cycle?"
          message="All winners and policy trackers for the current cycle will be deleted. This cannot be undone."
          confirmLabel="Reset cycle"
          size="md"
          className="w-full"
          onConfirm={() => run("reset", () => resetCycleAction(), "Cycle reset")}
        >
          <RefreshCcw className={cn("h-4 w-4", busyId === "reset" && "animate-spin")} /> Reset committee cycle
        </ConfirmButton>
      </GlassCard>
    </div>
  );
}

function PoliciesTab({ plans, busyId, run }: { plans: PlanView[] } & Runner) {
  if (plans.length === 0) return <GlassCard className="py-8 text-center text-sm text-white/40">No policies yet.</GlassCard>;
  return (
    <div className="space-y-2">
      {plans.map((p) => (
        <GlassCard key={p.id} className="flex items-center gap-3 p-3">
          <Avatar name={p.userName} src={p.userImage} size={38} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              M{p.month} · {p.userName}
            </p>
            <p className="truncate text-[11px] text-white/40">
              {p.policyNumber ? `#${p.policyNumber}` : "No policy number"} · {formatMoney(p.annualPremium)}
              {p.receiptUrl && (
                <>
                  {" · "}
                  <a href={p.receiptUrl} target="_blank" rel="noreferrer" className="text-emerald-300 underline">
                    receipt
                  </a>
                </>
              )}
            </p>
          </div>
          <div className="flex rounded-xl bg-white/[0.05] p-0.5">
            {(["Pending", "Active"] as const).map((s) => (
              <button
                key={s}
                disabled={busyId === p.id}
                onClick={() => p.status !== s && run(p.id, () => setPolicyStatusAction(p.id, s), `Marked ${s}`)}
                className={cn(
                  "rounded-lg px-2 py-1 text-[11px] font-semibold transition",
                  p.status === s
                    ? s === "Active"
                      ? "bg-emerald-400 text-ink-950 shadow-glow-emerald"
                      : "bg-gold-400 text-ink-950"
                    : "text-white/45",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
