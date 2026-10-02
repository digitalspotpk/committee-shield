"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { insurancePlans } from "@/db/schema";
import { assertAdmin, assertUser } from "@/lib/session";
import { addOneYear, todayIso, type ActionResult } from "@/lib/utils";
import { firstError, policySchema } from "@/lib/validators";

export async function updatePolicyAction(input: Record<string, unknown>): Promise<ActionResult> {
  try {
    const me = await assertUser();
    const parsed = policySchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
    const { planId, status, ...fields } = parsed.data;

    const [plan] = await db.select().from(insurancePlans).where(eq(insurancePlans.id, planId)).limit(1);
    if (!plan) return { ok: false, error: "Policy not found" };

    const isAdmin = me.role === "admin";
    if (!isAdmin && plan.userId !== me.id) return { ok: false, error: "You can only edit your own policy." };

    // Only the Super Admin can change the status; members submit details for review.
    const nextStatus = isAdmin && status ? status : plan.status;
    let startDate = fields.policyStartDate;
    if (nextStatus === "Active" && !startDate) startDate = todayIso();

    await db
      .update(insurancePlans)
      .set({
        ...fields,
        policyStartDate: startDate,
        nextRenewalDate: startDate ? addOneYear(startDate) : null,
        status: nextStatus,
        updatedAt: new Date(),
      })
      .where(eq(insurancePlans.id, planId));

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function setPolicyStatusAction(planId: string, status: "Pending" | "Active"): Promise<ActionResult> {
  try {
    await assertAdmin();
    const [plan] = await db.select().from(insurancePlans).where(eq(insurancePlans.id, planId)).limit(1);
    if (!plan) return { ok: false, error: "Policy not found" };
    const start = status === "Active" ? (plan.policyStartDate ?? todayIso()) : plan.policyStartDate;
    await db
      .update(insurancePlans)
      .set({ status, policyStartDate: start, nextRenewalDate: start ? addOneYear(start) : null, updatedAt: new Date() })
      .where(eq(insurancePlans.id, planId));
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
