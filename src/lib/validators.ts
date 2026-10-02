import { z } from "zod";
import { isTrustedImageUrl } from "./imgbb";

const optionalImage = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || isTrustedImageUrl(v), "Image must be a secure ImgBB URL");

const intFromForm = (min: number, max: number, label: string) =>
  z.coerce
    .number({ invalid_type_error: `${label} must be a number` })
    .int(`${label} must be a whole number`)
    .min(min, `${label} must be at least ${min}`)
    .max(max, `${label} is too large`);

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number"),
  age: intFromForm(18, 100, "Age"),
  premiumBudget: intFromForm(1000, 100_000_000, "Premium budget"),
  profileImageUrl: optionalImage,
});

export const registerSchema = profileSchema.extend({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const policySchema = z.object({
  planId: z.string().uuid(),
  planName: z.string().trim().min(2, "Plan name is required").max(120),
  policyNumber: z
    .string()
    .trim()
    .max(60)
    .optional()
    .transform((v) => v || null),
  policyStartDate: z
    .string()
    .optional()
    .transform((v) => v || null)
    .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "Invalid date"),
  annualPremium: intFromForm(0, 100_000_000, "Annual premium"),
  receiptUrl: optionalImage,
  status: z.enum(["Pending", "Active"]).optional(),
});

export function firstError(err: z.ZodError) {
  return err.issues[0]?.message ?? "Invalid input";
}
