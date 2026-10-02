"use server";

import { revalidatePath } from "next/cache";
import { runDraw, type DrawOutcome } from "@/lib/draw";
import { assertAdmin } from "@/lib/session";
import type { ActionResult } from "@/lib/utils";

export async function startDrawAction(): Promise<ActionResult<DrawOutcome>> {
  try {
    await assertAdmin();
    const outcome = await runDraw();
    revalidatePath("/", "layout");
    return { ok: true, data: outcome };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
