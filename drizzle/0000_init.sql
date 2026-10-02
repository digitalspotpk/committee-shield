CREATE TYPE "public"."policy_status" AS ENUM('Pending', 'Active');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('member', 'admin');--> statement-breakpoint
CREATE TABLE "committees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cycle" integer DEFAULT 1 NOT NULL,
	"month" integer NOT NULL,
	"winner_user_id" uuid NOT NULL,
	"drawn_at" timestamp with time zone DEFAULT now() NOT NULL,
	"total_pool_amount" integer NOT NULL,
	"overridden" boolean DEFAULT false NOT NULL,
	CONSTRAINT "committees_month_check" CHECK ("committees"."month" BETWEEN 1 AND 12)
);
--> statement-breakpoint
CREATE TABLE "insurance_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"committee_id" uuid,
	"plan_name" text NOT NULL,
	"policy_number" text,
	"status" "policy_status" DEFAULT 'Pending' NOT NULL,
	"policy_start_date" date,
	"annual_premium" integer DEFAULT 0 NOT NULL,
	"next_renewal_date" date,
	"receipt_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"age" integer,
	"premium_budget" integer,
	"profile_image_url" text,
	"ip_address" text,
	"role" "user_role" DEFAULT 'member' NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"password_hash" text,
	"github_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_age_check" CHECK ("users"."age" IS NULL OR ("users"."age" BETWEEN 18 AND 100))
);
--> statement-breakpoint
ALTER TABLE "committees" ADD CONSTRAINT "committees_winner_user_id_users_id_fk" FOREIGN KEY ("winner_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_plans" ADD CONSTRAINT "insurance_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_plans" ADD CONSTRAINT "insurance_plans_committee_id_committees_id_fk" FOREIGN KEY ("committee_id") REFERENCES "public"."committees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "committees_cycle_month_unique" ON "committees" USING btree ("cycle","month");--> statement-breakpoint
CREATE UNIQUE INDEX "committees_cycle_winner_unique" ON "committees" USING btree ("cycle","winner_user_id");--> statement-breakpoint
CREATE INDEX "insurance_plans_user_idx" ON "insurance_plans" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "insurance_plans_committee_unique" ON "insurance_plans" USING btree ("committee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree (lower("email"));--> statement-breakpoint
CREATE UNIQUE INDEX "users_github_id_unique" ON "users" USING btree ("github_id");