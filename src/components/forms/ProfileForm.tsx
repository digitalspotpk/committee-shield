"use client";

import { Cake, Phone, User as UserIcon, Wallet } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { ImageUpload } from "@/components/ui/ImageUpload";
import type { ActionResult } from "@/lib/utils";

export type ProfileValues = {
  name: string;
  phone: string | null;
  age: number | null;
  premiumBudget: number | null;
  profileImageUrl: string | null;
};

type Props = {
  initial: ProfileValues;
  submit: (values: Record<string, unknown>) => Promise<ActionResult>;
  submitLabel?: string;
  onDone?: () => void;
};

export function ProfileForm({ initial, submit, submitLabel = "Save profile", onDone }: Props) {
  const [photo, setPhoto] = useState(initial.profileImageUrl);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = { ...Object.fromEntries(new FormData(e.currentTarget)), profileImageUrl: photo ?? "" };
    start(async () => {
      const res = await submit(values);
      if (!res.ok) return void toast.error(res.error);
      toast.success("Profile saved");
      onDone?.();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ImageUpload kind="profile" value={photo} onChange={setPhoto} name={initial.name} />
      <Field label="Full name" name="name" defaultValue={initial.name} required icon={<UserIcon className="h-4 w-4" />} />
      <Field
        label="Phone"
        name="phone"
        type="tel"
        inputMode="tel"
        placeholder="+92 300 1234567"
        defaultValue={initial.phone ?? ""}
        required
        icon={<Phone className="h-4 w-4" />}
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Age" name="age" type="number" min={18} max={100} defaultValue={initial.age ?? ""} required icon={<Cake className="h-4 w-4" />} />
        <Field
          label="Premium budget / yr"
          name="premiumBudget"
          type="number"
          min={1000}
          step={500}
          defaultValue={initial.premiumBudget ?? ""}
          required
          icon={<Wallet className="h-4 w-4" />}
        />
      </div>
      <Button type="submit" loading={pending} className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
