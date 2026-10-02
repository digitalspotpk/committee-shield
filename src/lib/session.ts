import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, type User } from "@/db/schema";

/** The signed-in user, read fresh from Neon (the DB is the source of truth for role). */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export function isProfileComplete(u: User) {
  return !!u.phone && u.age != null && u.premiumBudget != null;
}

export class AuthzError extends Error {}

/** For server actions: throws instead of redirecting. */
export async function assertUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new AuthzError("Please sign in again.");
  return user;
}

export async function assertAdmin(): Promise<User> {
  const user = await assertUser();
  if (user.role !== "admin") throw new AuthzError("Only the Super Admin can do that.");
  return user;
}
