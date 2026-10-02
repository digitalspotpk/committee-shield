"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { committees, insurancePlans, users } from "@/db/schema";
import { isSuperAdminEmail } from "@/lib/config";
import { getCurrentCycle, resetCurrentCycle } from "@/lib/draw";
import { assertAdmin } from "@/lib/session";
import type { ActionResult } from "@/lib/utils";
import { firstError, profileSchema } from "@/lib/validators";

function done(): ActionResult {
  revalidatePath("/", "layout");
  return { ok: true };
}

function fail(err: unknown): ActionResult {
  return { ok: false, error: (err as Error).message };
}

export async function adminUpdateMemberAction(userId: string, input: Record<string, unknown>): Promise<ActionResult> {
  try {
    await assertAdmin();
    const parsed = profileSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
    await db.update(users).set(parsed.data).where(eq(users.id, userId));
    return done();
  } catch (err) {
    return fail(err);
  }
}

export async function setVerifiedAction(userId: string, verified: boolean): Promise<ActionResult> {
  try {
    await assertAdmin();
    await db.update(users).set({ verified }).where(eq(users.id, userId));
    return done();
  } catch (err) {
    return fail(err);
  }
}

export async function setRoleAction(userId: string, role: "member" | "admin"): Promise<ActionResult> {
  try {
    const me = await assertAdmin();
    if (me.id === userId) return { ok: false, error: "You can't change your own role." };
    const [target] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (target && isSuperAdminEmail(target.email)) return { ok: false, error: "The Super Admin role is fixed." };
    await db.update(users).set({ role }).where(eq(users.id, userId));
    return done();
  } catch (err) {
    return fail(err);
  }
}

export async function deleteMemberAction(userId: string): Promise<ActionResult> {
  try {
    const me = await assertAdmin();
    if (me.id === userId) return { ok: false, error: "You can't delete your own account." };
    const [win] = await db.select({ id: committees.id }).from(committees).where(eq(committees.winnerUserId, userId)).limit(1);
    if (win) {
      return { ok: false, error: "This member has a draw record. Override that month's winner or reset the cycle first." };
    }
    await db.delete(users).where(eq(users.id, userId));
    return done();
  } catch (err) {
    return fail(err);
  }
}

export async function resetCycleAction(): Promise<ActionResult<{ removed: number }>> {
  try {
    await assertAdmin();
    const removed = await resetCurrentCycle();
    revalidatePath("/", "layout");
    return { ok: true, data: { removed } };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/** Replace the winner of an already-drawn month in the current cycle. */
export async function overrideWinnerAction(committeeId: string, newWinnerId: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    const cycle = await getCurrentCycle();
    const [record] = await db
      .select()
      .from(committees)
      .where(and(eq(committees.id, committeeId), eq(committees.cycle, cycle)))
      .limit(1);
    if (!record) return { ok: false, error: "That draw isn't part of the current cycle." };
    if (record.winnerUserId === newWinnerId) return { ok: false, error: "That member already holds this month." };

    const [clash] = await db
      .select({ month: committees.month })
      .from(committees)
      .where(and(eq(committees.cycle, cycle), eq(committees.winnerUserId, newWinnerId), ne(committees.id, committeeId)))
      .limit(1);
    if (clash) return { ok: false, error: `That member already won Month ${clash.month} this cycle.` };

    const [member] = await db.select().from(users).where(eq(users.id, newWinnerId)).limit(1);
    if (!member) return { ok: false, error: "Member not found" };

    await db.batch([
      db.update(committees).set({ winnerUserId: newWinnerId, overridden: true }).where(eq(committees.id, committeeId)),
      db
        .update(insurancePlans)
        .set({
          userId: newWinnerId,
          status: "Pending",
          policyNumber: null,
          receiptUrl: null,
          policyStartDate: null,
          nextRenewalDate: null,
          annualPremium: member.premiumBudget ?? record.totalPoolAmount,
          updatedAt: new Date(),
        })
        .where(eq(insurancePlans.committeeId, committeeId)),
    ]);
    return done();
  } catch (err) {
    return fail(err);
  }
}
