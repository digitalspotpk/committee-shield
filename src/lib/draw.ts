import "server-only";
import { randomInt, randomUUID } from "node:crypto";
import { and, asc, eq, inArray, max } from "drizzle-orm";
import { db } from "@/db";
import { committees, insurancePlans, users } from "@/db/schema";
import { ADMINS_IN_DRAW, CYCLE_LENGTH, MONTHLY_CONTRIBUTION } from "./config";

export type Participant = {
  id: string;
  name: string;
  profileImageUrl: string | null;
  premiumBudget: number | null;
};

export type DrawRecord = {
  id: string;
  cycle: number;
  month: number;
  drawnAt: Date;
  totalPoolAmount: number;
  overridden: boolean;
  winner: Participant;
};

export type CycleState = {
  cycle: number;
  draws: DrawRecord[];
  isComplete: boolean;
  nextCycle: number;
  nextMonth: number;
  participants: Participant[];
  eligible: Participant[];
  poolAmount: number;
};

const participantCols = {
  id: users.id,
  name: users.name,
  profileImageUrl: users.profileImageUrl,
  premiumBudget: users.premiumBudget,
};

async function getParticipants(): Promise<Participant[]> {
  const where = ADMINS_IN_DRAW
    ? eq(users.verified, true)
    : and(eq(users.verified, true), eq(users.role, "member"));
  return db.select(participantCols).from(users).where(where).orderBy(asc(users.createdAt));
}

export async function getCurrentCycle(): Promise<number> {
  const [row] = await db.select({ value: max(committees.cycle) }).from(committees);
  return row?.value ?? 1;
}

export async function getDraws(cycle: number): Promise<DrawRecord[]> {
  const rows = await db
    .select({
      id: committees.id,
      cycle: committees.cycle,
      month: committees.month,
      drawnAt: committees.drawnAt,
      totalPoolAmount: committees.totalPoolAmount,
      overridden: committees.overridden,
      winner: participantCols,
    })
    .from(committees)
    .innerJoin(users, eq(users.id, committees.winnerUserId))
    .where(eq(committees.cycle, cycle))
    .orderBy(asc(committees.month));
  return rows;
}

/**
 * Snapshot of the 12-month cycle: who has won, who is still eligible,
 * and which cycle/month the next draw will be recorded against.
 */
export async function getCycleState(): Promise<CycleState> {
  const cycle = await getCurrentCycle();
  const [draws, participants] = await Promise.all([getDraws(cycle), getParticipants()]);
  const lastMonth = draws.at(-1)?.month ?? 0;
  const isComplete = draws.length >= CYCLE_LENGTH || lastMonth >= CYCLE_LENGTH;

  const winners = new Set(draws.map((d) => d.winner.id));
  const eligible = isComplete ? participants : participants.filter((p) => !winners.has(p.id));

  return {
    cycle,
    draws,
    isComplete,
    nextCycle: isComplete ? cycle + 1 : cycle,
    nextMonth: isComplete ? 1 : lastMonth + 1,
    participants,
    eligible,
    poolAmount: MONTHLY_CONTRIBUTION * Math.max(participants.length, 1),
  };
}

export type DrawOutcome = { winner: Participant; cycle: number; month: number; poolAmount: number };

/**
 * Server-side draw: filter out previous winners of the current cycle, pick a
 * winner with a CSPRNG, then atomically record the committee + its policy tracker.
 * Unique indexes on (cycle, month) and (cycle, winner) make double-draws impossible.
 */
export async function runDraw(): Promise<DrawOutcome> {
  const state = await getCycleState();
  if (state.eligible.length === 0) {
    throw new Error("No verified members are eligible. Verify members in the Admin panel first.");
  }

  const winner = state.eligible[randomInt(state.eligible.length)]!;
  const committeeId = randomUUID();

  try {
    await db.batch([
      db.insert(committees).values({
        id: committeeId,
        cycle: state.nextCycle,
        month: state.nextMonth,
        winnerUserId: winner.id,
        totalPoolAmount: state.poolAmount,
      }),
      db.insert(insurancePlans).values({
        userId: winner.id,
        committeeId,
        planName: `Cycle ${state.nextCycle} · Month ${state.nextMonth} Policy`,
        status: "Pending",
        annualPremium: winner.premiumBudget ?? state.poolAmount,
      }),
    ]);
  } catch (err) {
    if (String((err as Error).message).includes("unique")) {
      throw new Error("This month's draw was just recorded by someone else. Refresh to see the winner.");
    }
    throw err;
  }

  return { winner, cycle: state.nextCycle, month: state.nextMonth, poolAmount: state.poolAmount };
}

/** Removes every draw (and linked policy trackers) from the current cycle. */
export async function resetCurrentCycle() {
  const cycle = await getCurrentCycle();
  const ids = (await db.select({ id: committees.id }).from(committees).where(eq(committees.cycle, cycle))).map(
    (r) => r.id,
  );
  if (ids.length === 0) return 0;
  await db.batch([
    db.delete(insurancePlans).where(inArray(insurancePlans.committeeId, ids)),
    db.delete(committees).where(inArray(committees.id, ids)),
  ]);
  return ids.length;
}
