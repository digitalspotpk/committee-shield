export const CYCLE_LENGTH = 12;
export const MAX_MEMBERS = Number(process.env.MAX_MEMBERS ?? 12);
export const MONTHLY_CONTRIBUTION = Number(process.env.MONTHLY_CONTRIBUTION ?? 10000);
export const ADMINS_IN_DRAW = process.env.ADMINS_IN_DRAW === "true";
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Committee Shield";
export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY ?? "PKR";

export function isSuperAdminEmail(email?: string | null) {
  const admin = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  return !!admin && !!email && email.trim().toLowerCase() === admin;
}
