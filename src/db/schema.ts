import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("user_role", ["member", "admin"]);
export const policyStatusEnum = pgEnum("policy_status", ["Pending", "Active"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    age: integer("age"),
    /** Target annual insurance premium budget (whole currency units). */
    premiumBudget: integer("premium_budget"),
    /** Secure ImgBB URL (or GitHub avatar for OAuth users). */
    profileImageUrl: text("profile_image_url"),
    ipAddress: text("ip_address"),
    role: roleEnum("role").notNull().default("member"),
    /** Only verified members take part in the monthly draw. */
    verified: boolean("verified").notNull().default(false),
    passwordHash: text("password_hash"),
    githubId: text("github_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("users_email_unique").on(sql`lower(${t.email})`),
    uniqueIndex("users_github_id_unique").on(t.githubId),
    check("users_age_check", sql`${t.age} IS NULL OR (${t.age} BETWEEN 18 AND 100)`),
  ],
);

export const committees = pgTable(
  "committees",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** 12-month cycle number. Starts at 1, increments after month 12. */
    cycle: integer("cycle").notNull().default(1),
    /** Month within the cycle (1–12). */
    month: integer("month").notNull(),
    winnerUserId: uuid("winner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    drawnAt: timestamp("drawn_at", { withTimezone: true }).notNull().defaultNow(),
    totalPoolAmount: integer("total_pool_amount").notNull(),
    /** True when the Super Admin manually overrode the winner. */
    overridden: boolean("overridden").notNull().default(false),
  },
  (t) => [
    uniqueIndex("committees_cycle_month_unique").on(t.cycle, t.month),
    uniqueIndex("committees_cycle_winner_unique").on(t.cycle, t.winnerUserId),
    check("committees_month_check", sql`${t.month} BETWEEN 1 AND 12`),
  ],
);

export const insurancePlans = pgTable(
  "insurance_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    committeeId: uuid("committee_id").references(() => committees.id, { onDelete: "cascade" }),
    planName: text("plan_name").notNull(),
    policyNumber: text("policy_number"),
    status: policyStatusEnum("status").notNull().default("Pending"),
    policyStartDate: date("policy_start_date"),
    annualPremium: integer("annual_premium").notNull().default(0),
    nextRenewalDate: date("next_renewal_date"),
    /** Secure ImgBB URL of the uploaded policy receipt. */
    receiptUrl: text("receipt_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("insurance_plans_user_idx").on(t.userId),
    uniqueIndex("insurance_plans_committee_unique").on(t.committeeId),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  wins: many(committees),
  plans: many(insurancePlans),
}));

export const committeesRelations = relations(committees, ({ one }) => ({
  winner: one(users, { fields: [committees.winnerUserId], references: [users.id] }),
  plan: one(insurancePlans, { fields: [committees.id], references: [insurancePlans.committeeId] }),
}));

export const insurancePlansRelations = relations(insurancePlans, ({ one }) => ({
  user: one(users, { fields: [insurancePlans.userId], references: [users.id] }),
  committee: one(committees, { fields: [insurancePlans.committeeId], references: [committees.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Committee = typeof committees.$inferSelect;
export type InsurancePlan = typeof insurancePlans.$inferSelect;
export type Role = (typeof roleEnum.enumValues)[number];
export type PolicyStatus = (typeof policyStatusEnum.enumValues)[number];
