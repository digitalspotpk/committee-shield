"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateMyProfileAction } from "@/app/actions/profile";
import { ProfileForm, type ProfileValues } from "./ProfileForm";

export function OnboardingForm({ initial, canSkip }: { initial: ProfileValues; canSkip: boolean }) {
  const router = useRouter();
  return (
    <div className="space-y-4">
      <ProfileForm
        initial={initial}
        submit={updateMyProfileAction}
        submitLabel="Enter the app"
        onDone={() => router.replace("/")}
      />
      {canSkip && (
        <Link href="/" className="block text-center text-sm text-white/40 underline">
          Skip photo for now
        </Link>
      )}
    </div>
  );
}
