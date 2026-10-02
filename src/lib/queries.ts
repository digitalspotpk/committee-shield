import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { committees, insurancePlans, users, type User } from "@/db/schema";
import { getCycleState } from "./draw";

export type MemberView = Pick<
  User,
  "id" | "name" | "email" | "phone" | "age" | "premiumBudget" | "profileImageUrl" | "role" | "verified" | "createdAt"
> & { ipAddress?: string | null };

export async function listMembers(includePrivate: boolean): Promise<MemberView[]> {
  const rows = await db.select().from(users).orderBy(asc(users.createdAt));
  return rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    age: u.age,
    premiumBudget: u.premiumBudget,
    profileImageUrl: u.profileImageUrl,
    role: u.role,
    verified: u.verified,
    createdAt: u.createdAt,
    ipAddress: includePrivate ? u.ipAddress : undefined,
  }));
}

export type PlanView = {
  id: string;
  userId: string;
  committeeId: string | null;
  planName: string;
  policyNumber: string | null;
  status: "Pending" | "Active";
  policyStartDate: string | null;
  annualPremium: number;
  nextRenewalDate: string | null;
  receiptUrl: string | null;
  updatedAt: Date;
  cycle: number | null;
  month: number | null;
  userName: string;
  userImage: string | null;
};

export async function listPlans(cycle?: number): Promise<PlanView[]> {
  const rows = await db
    .select({
      plan: insurancePlans,
      cycle: committees.cycle,
      month: committees.month,
      userName: users.name,
      userImage: users.profileImageUrl,
    })
    .from(insurancePlans)
    .innerJoin(users, eq(users.id, insurancePlans.userId))
    .leftJoin(committees, eq(committees.id, insurancePlans.committeeId))
    .orderBy(asc(committees.cycle), asc(committees.month), desc(insurancePlans.createdAt));

  return rows
    .filter((r) => cycle === undefined || r.cycle === cycle)
    .map((r) => ({ ...r.plan, cycle: r.cycle, month: r.month, userName: r.userName, userImage: r.userImage }));
}

export type Notification = { id: string; title: string; body: string; tone: "gold" | "emerald" | "neutral"; at?: Date };

export async function getNotifications(user: User): Promise<Notification[]> {
  const notes: Notification[] = [];
  if (!user.verified && user.role !== "admin") {
    notes.push({
      id: "verify",
      title: "Awaiting verification",
      body: "The Super Admin will verify your profile before the next draw.",
      tone: "neutral",
    });
  }

  const pending = await db.select().from(insurancePlans).where(eq(insurancePlans.userId, user.id));
  for (const p of pending.filter((x) => x.status === "Pending")) {
    notes.push({
      id: `plan-${p.id}`,
      title: "Your policy needs details",
      body: `Upload the receipt & policy number for “${p.planName}”.`,
      tone: "emerald",
    });
  }

  const recent = await db
    .select({ id: committees.id, month: committees.month, cycle: committees.cycle, drawnAt: committees.drawnAt, name: users.name })
    .from(committees)
    .innerJoin(users, eq(users.id, committees.winnerUserId))
    .orderBy(desc(committees.drawnAt))
    .limit(5);
  for (const r of recent) {
    notes.push({
      id: r.id,
      title: `${r.name} won Month ${r.month}`,
      body: `Cycle ${r.cycle} committee draw`,
      tone: "gold",
      at: r.drawnAt,
    });
  }
  return notes;
}

export async function getDashboard(user: User) {
  const [state, plans] = await Promise.all([getCycleState(), listPlans()]);
  const cyclePlans = plans.filter((p) => p.cycle === state.cycle);
  const myPlan = plans.filter((p) => p.userId === user.id).at(-1) ?? null;
  const myWin = state.draws.find((d) => d.winner.id === user.id) ?? null;
  return {
    state,
    activeCount: cyclePlans.filter((p) => p.status === "Active").length,
    cyclePlans,
    myPlan,
    myWin,
  };
}
