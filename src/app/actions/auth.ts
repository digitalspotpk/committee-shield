"use server";

import bcrypt from "bcryptjs";
import { count, eq, sql } from "drizzle-orm";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { isSuperAdminEmail, MAX_MEMBERS } from "@/lib/config";
import { getClientIp } from "@/lib/ip";
import { firstError, registerSchema } from "@/lib/validators";

export type FormState = { error?: string } | undefined;

export async function githubSignInAction() {
  await signIn("github", { redirectTo: "/" });
}

export async function credentialsSignInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/",
    });
  } catch (err) {
    if (err instanceof AuthError) return { error: "Incorrect email or password." };
    throw err; // NEXT_REDIRECT on success
  }
}

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const data = parsed.data;

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`lower(${users.email}) = ${data.email}`)
    .limit(1);
  if (existing) return { error: "An account with this email already exists. Sign in instead." };

  const isAdmin = isSuperAdminEmail(data.email);
  if (!isAdmin) {
    const [{ value }] = await db.select({ value: count() }).from(users).where(eq(users.role, "member"));
    if (value >= MAX_MEMBERS) return { error: `The committee is full (${MAX_MEMBERS} members).` };
  }

  await db.insert(users).values({
    name: data.name,
    email: data.email,
    phone: data.phone,
    age: data.age,
    premiumBudget: data.premiumBudget,
    profileImageUrl: data.profileImageUrl,
    passwordHash: await bcrypt.hash(data.password, 12),
    ipAddress: await getClientIp(),
    role: isAdmin ? "admin" : "member",
    verified: isAdmin,
  });

  try {
    await signIn("credentials", { email: data.email, password: data.password, redirectTo: "/onboarding?welcome=1" });
  } catch (err) {
    if (err instanceof AuthError) return { error: "Account created — please sign in." };
    throw err;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
