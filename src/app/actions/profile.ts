"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getClientIp } from "@/lib/ip";
import { assertUser } from "@/lib/session";
import type { ActionResult } from "@/lib/utils";
import { firstError, profileSchema } from "@/lib/validators";

export async function updateMyProfileAction(input: Record<string, unknown>): Promise<ActionResult> {
  try {
    const me = await assertUser();
    const parsed = profileSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
    await db
      .update(users)
      .set({ ...parsed.data, ipAddress: (await getClientIp()) ?? me.ipAddress })
      .where(eq(users.id, me.id));
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
