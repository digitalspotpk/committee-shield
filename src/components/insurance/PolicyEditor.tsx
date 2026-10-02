"use client";

import { CalendarDays, FileText, Hash, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updatePolicyAction } from "@/app/actions/policy";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, SelectField } from "@/components/ui/Field";
import { ImageUpload } from "@/components/ui/ImageUpload";
import type { PlanView } from "@/lib/queries";
import { formatDate, formatMoney } from "@/lib/utils";

export function PolicyEditor({ plan, isAdmin, onDone }: { plan: PlanView; isAdmin: boolean; onDone: () => void }) {
  const router = useRouter();
  const [receipt, setReceipt] = useState(plan.receiptUrl);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = { ...Object.fromEntries(new FormData(e.currentTarget)), planId: plan.id, receiptUrl: receipt ?? "" };
    start(async () => {
      const res = await updatePolicyAction(values);
      if (!res.ok) return void toast.error(res.error);
      toast.success(isAdmin ? "Policy updated" : "Details submitted for review");
      router.refresh();
      onDone();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="glass flex items-center justify-between rounded-2xl px-4 py-3">
        <div>
          <p className="text-xs text-white/45">Renewal</p>
          <p className="text-sm font-medium">{formatDate(plan.nextRenewalDate)}</p>
        </div>
        <Badge tone={plan.status === "Active" ? "emerald" : "gold"} dot>
          {plan.status}
        </Badge>
      </div>
      <Field label="Plan name" name="planName" defaultValue={plan.planName} required icon={<FileText className="h-4 w-4" />} />
      <Field
        label="Policy number"
        name="policyNumber"
        defaultValue={plan.policyNumber ?? ""}
        placeholder="e.g. SLIC-2026-00412"
        icon={<Hash className="h-4 w-4" />}
      />
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Start date"
          name="policyStartDate"
          type="date"
          defaultValue={plan.policyStartDate ?? ""}
          icon={<CalendarDays className="h-4 w-4" />}
        />
        <Field
          label="Annual premium"
          name="annualPremium"
          type="number"
          min={0}
          defaultValue={plan.annualPremium}
          icon={<Wallet className="h-4 w-4" />}
        />
      </div>
      {isAdmin && (
        <SelectField label="Status" name="status" defaultValue={plan.status}>
          <option value="Pending">Pending</option>
          <option value="Active">Active</option>
        </SelectField>
      )}
      <ImageUpload kind="receipt" value={receipt} onChange={setReceipt} />
      {!isAdmin && (
        <p className="text-[11px] text-white/40">
          The Super Admin activates your policy after checking the receipt. Premium: {formatMoney(plan.annualPremium)}.
        </p>
      )}
      <Button type="submit" className="w-full" loading={pending}>
        Save policy
      </Button>
    </form>
  );
}
