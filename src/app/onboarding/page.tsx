import { redirect } from "next/navigation";
import { BrandMark } from "@/components/auth/BrandMark";
import { OnboardingForm } from "@/components/forms/OnboardingForm";
import { isProfileComplete, requireUser } from "@/lib/session";
import { firstName } from "@/lib/utils";

export const metadata = { title: "Welcome" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await requireUser();
  const { welcome } = await searchParams;
  if (isProfileComplete(user) && !welcome) redirect("/");

  return (
    <div className="no-scrollbar relative z-10 flex-1 overflow-y-auto px-6 pb-10 pt-10">
      <BrandMark
        title={`Welcome, ${firstName(user.name)}`}
        subtitle="Complete your profile — the Super Admin verifies members before the first draw."
      />
      <OnboardingForm
        canSkip={isProfileComplete(user)}
        initial={{
          name: user.name,
          phone: user.phone,
          age: user.age,
          premiumBudget: user.premiumBudget,
          profileImageUrl: user.profileImageUrl,
        }}
      />
    </div>
  );
}
