import { redirect } from "next/navigation";
import { BrandMark } from "@/components/auth/BrandMark";
import { LoginForm } from "@/components/auth/LoginForm";
import { APP_NAME } from "@/lib/config";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getCurrentUser()) redirect("/");
  const { error } = await searchParams;
  return (
    <>
      <BrandMark title={APP_NAME} subtitle="Monthly committee draws & insurance, together." />
      <LoginForm urlError={error} />
    </>
  );
}
