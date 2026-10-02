"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Cake, KeyRound, Mail, Phone, User, Wallet } from "lucide-react";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { registerAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

const STEPS = ["Account", "Profile"];

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, undefined);
  const [step, setStep] = useState(0);
  const form = useRef<HTMLFormElement>(null);

  function next() {
    const fields = form.current?.querySelectorAll<HTMLInputElement>(`[data-step="${step}"] input[required]`) ?? [];
    for (const f of Array.from(fields)) if (!f.reportValidity()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  return (
    <form ref={form} action={action} className="space-y-5">
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 to-gold-400"
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <p className={cn("mt-1.5 text-[11px]", i <= step ? "text-emerald-200" : "text-white/30")}>{s}</p>
          </div>
        ))}
      </div>

      {/* Both steps stay mounted so every field is submitted; only the active one is visible. */}
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          data-step={i}
          initial={false}
          animate={step === i ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={cn("space-y-4", step !== i && "hidden")}
        >
          {i === 0 ? (
            <>
              <Field label="Full name" name="name" required minLength={2} icon={<User className="h-4 w-4" />} />
              <Field label="Email" name="email" type="email" required autoComplete="email" icon={<Mail className="h-4 w-4" />} />
              <Field
                label="Password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                hint="At least 8 characters"
                icon={<KeyRound className="h-4 w-4" />}
              />
            </>
          ) : (
            <>
              <Field label="Phone" name="phone" type="tel" required placeholder="+92 300 1234567" icon={<Phone className="h-4 w-4" />} />
              <Field label="Age" name="age" type="number" required min={18} max={100} icon={<Cake className="h-4 w-4" />} />
              <Field
                label="Target annual insurance premium"
                name="premiumBudget"
                type="number"
                required
                min={1000}
                step={500}
                icon={<Wallet className="h-4 w-4" />}
              />
            </>
          )}
        </motion.div>
      ))}

      {state?.error && <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{state.error}</p>}

      <div className="flex gap-3">
        {step > 0 && (
          <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button type="button" className="flex-1" onClick={next}>
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" variant="gold" className="flex-1" loading={pending}>
            Create account & add photo
          </Button>
        )}
      </div>

      <p className="text-center text-sm text-white/45">
        Already a member?{" "}
        <Link href="/login" className="font-medium text-emerald-300">
          Sign in
        </Link>
      </p>
    </form>
  );
}
