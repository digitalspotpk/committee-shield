"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Cake, Mail, Phone, Search, ShieldCheck, Trophy, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { formatDate, formatMoney } from "@/lib/utils";

export type MemberRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  age: number | null;
  premiumBudget: number | null;
  profileImageUrl: string | null;
  role: "member" | "admin";
  verified: boolean;
  createdAt: Date;
  wonMonth: number | null;
};

export function MembersList({
  members,
  viewerId,
  viewerIsAdmin,
  maxMembers,
}: {
  members: MemberRow[];
  viewerId: string;
  viewerIsAdmin: boolean;
  maxMembers: number;
}) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<MemberRow | null>(null);
  const filtered = useMemo(
    () => members.filter((m) => m.name.toLowerCase().includes(q.toLowerCase())),
    [members, q],
  );
  const memberCount = members.filter((m) => m.role === "member").length;

  return (
    <>
      <div className="mb-4 flex items-end justify-between px-1">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
          <p className="text-sm text-white/45">
            <span className="num text-emerald-300">{memberCount}</span> / {maxMembers} seats filled
          </p>
        </div>
        <div className="flex -space-x-2">
          {members.slice(0, 4).map((m) => (
            <Avatar key={m.id} name={m.name} src={m.profileImageUrl} size={30} className="border-2 border-ink-900" />
          ))}
        </div>
      </div>

      <label className="glass mb-4 flex h-12 items-center gap-2 rounded-2xl px-4 focus-within:border-emerald-400/50">
        <Search className="h-4 w-4 text-white/35" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search members"
          className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-white/30"
        />
      </label>

      <motion.ul layout className="space-y-2">
        <AnimatePresence initial={false}>
          {filtered.map((m, i) => (
            <motion.li
              layout
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(m)}
                className="glass flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-white/[0.06]"
              >
                <Avatar name={m.name} src={m.profileImageUrl} size={46} ring={m.wonMonth ? "gold" : "none"} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate font-medium">
                    {m.name}
                    {m.id === viewerId && <span className="text-[10px] text-white/40">(you)</span>}
                  </p>
                  <p className="text-xs text-white/45">
                    {m.age ? `${m.age} yrs · ` : ""}
                    {formatMoney(m.premiumBudget)}/yr
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {m.role === "admin" && <Badge tone="gold">Admin</Badge>}
                  {m.wonMonth ? (
                    <Badge tone="gold">
                      <Trophy className="h-3 w-3" /> M{m.wonMonth}
                    </Badge>
                  ) : (
                    <Badge tone={m.verified ? "emerald" : "neutral"} dot>
                      {m.verified ? "Verified" : "Pending"}
                    </Badge>
                  )}
                </div>
              </motion.button>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {Array.from({ length: Math.max(0, maxMembers - memberCount) }).length > 0 && (
        <div className="mt-3 grid grid-cols-6 gap-2">
          {Array.from({ length: Math.max(0, maxMembers - memberCount) }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl border border-dashed border-white/10" title="Open seat" />
          ))}
        </div>
      )}

      <BottomSheet open={!!selected} onClose={() => setSelected(null)} title="Member details">
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2 py-2">
              <Avatar name={selected.name} src={selected.profileImageUrl} size={88} ring={selected.wonMonth ? "gold" : "emerald"} />
              <h3 className="text-xl font-semibold">{selected.name}</h3>
              <div className="flex gap-1.5">
                <Badge tone={selected.verified ? "emerald" : "neutral"}>
                  <ShieldCheck className="h-3 w-3" /> {selected.verified ? "Verified" : "Pending"}
                </Badge>
                {selected.wonMonth && <Badge tone="gold">Won month {selected.wonMonth}</Badge>}
              </div>
            </div>
            <div className="glass divide-y divide-white/5 rounded-2xl">
              <Row icon={<Phone className="h-4 w-4" />} label="Phone">
                {selected.phone ? (
                  <a href={`tel:${selected.phone}`} className="text-emerald-300">
                    {selected.phone}
                  </a>
                ) : (
                  "—"
                )}
              </Row>
              {(viewerIsAdmin || selected.id === viewerId) && (
                <Row icon={<Mail className="h-4 w-4" />} label="Email">
                  {selected.email}
                </Row>
              )}
              <Row icon={<Cake className="h-4 w-4" />} label="Age">
                {selected.age ?? "—"}
              </Row>
              <Row icon={<Wallet className="h-4 w-4" />} label="Premium budget">
                <span className="num">{formatMoney(selected.premiumBudget)}</span>
              </Row>
            </div>
            <p className="text-center text-[11px] text-white/30">Joined {formatDate(selected.createdAt)}</p>
          </div>
        )}
      </BottomSheet>
    </>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 text-sm">
      <span className="text-white/35">{icon}</span>
      <span className="flex-1 text-white/55">{label}</span>
      <span className="truncate text-right">{children}</span>
    </div>
  );
}
