import { count, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/auth/BrandMark";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { MAX_MEMBERS } from "@/lib/config";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Join" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/");
  const [{ value }] = await db.select({ value: count() }).from(users).where(eq(users.role, "member"));
  const seats = Math.max(0, MAX_MEMBERS - value);
  return (
    <>
      <BrandMark title="Join the committee" subtitle={`${seats} of ${MAX_MEMBERS} seats available`} />
      <RegisterForm />
    </>
  );
}
