"use client";

import { motion } from "framer-motion";
import { Github, KeyRound, Mail } from "lucide-react";
import Link from "next/link";
import { useActionState, useTransition } from "react";
import { credentialsSignInAction, githubSignInAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

const ERRORS: Record<string, string> = {
  CommitteeFull: "The committee already has all its members.",
  NoEmail: "Your GitHub account has no public or verified email.",
  AccessDenied: "Access denied.",
  CredentialsSignin: "Incorrect email or password.",
};

export function LoginForm({ urlError }: { urlError?: string }) {
  const [state, action, pending] = useActionState(credentialsSignInAction, undefined);
  const [ghPending, startGh] = useTransition();
  const error = state?.error ?? (urlError ? (ERRORS[urlError] ?? "Sign-in failed. Please try again.") : undefined);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-5">
      <Button
        variant="ghost"
        size="lg"
        className="w-full bg-white text-ink-950 ring-0 hover:bg-white/90"
        loading={ghPending}
        onClick={() => startGh(() => githubSignInAction())}
      >
        <Github className="h-5 w-5" /> Continue with GitHub
      </Button>

      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-white/30">
        <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
      </div>

      <form action={action} className="space-y-4">
        <Field label="Email" name="email" type="email" autoComplete="email" required icon={<Mail className="h-4 w-4" />} />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          icon={<KeyRound className="h-4 w-4" />}
        />
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </motion.p>
        )}
        <Button type="submit" size="lg" className="w-full" loading={pending}>
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-white/45">
        New member?{" "}
        <Link href="/register" className="font-medium text-emerald-300">
          Join the committee
        </Link>
      </p>
    </motion.div>
  );
}
