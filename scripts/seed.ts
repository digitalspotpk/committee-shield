/**
 * Seeds the Super Admin (credentials login) and, with --demo, 12 verified demo members.
 *   npm run db:seed          → admin only
 *   npm run db:seed:demo     → admin + 12 demo members (password: Member123!)
 */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const db = drizzle(neon(url), { schema });

const DEMO = [
  ["Ayesha Khan", 29, 60000],
  ["Bilal Ahmed", 34, 75000],
  ["Fatima Malik", 41, 90000],
  ["Hamza Raza", 27, 50000],
  ["Iqra Siddiqui", 32, 65000],
  ["Junaid Qureshi", 38, 80000],
  ["Kiran Shah", 45, 100000],
  ["Mohsin Iqbal", 30, 55000],
  ["Nida Farooq", 36, 70000],
  ["Omar Sheikh", 43, 95000],
  ["Sana Javed", 28, 52000],
  ["Usman Tariq", 39, 85000],
] as const;

async function upsertUser(values: typeof schema.users.$inferInsert) {
  await db
    .insert(schema.users)
    .values(values)
    .onConflictDoNothing({ target: sql`lower(${schema.users.email})` as never });
}

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in .env");

  await upsertUser({
    name: process.env.SUPER_ADMIN_NAME ?? "Super Admin",
    email: email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, 12),
    role: "admin",
    verified: true,
  });
  console.log(`✔ Super Admin ready: ${email}`);

  if (process.argv.includes("--demo")) {
    const hash = await bcrypt.hash("Member123!", 12);
    for (const [i, [name, age, budget]] of DEMO.entries()) {
      await upsertUser({
        name,
        email: `${name.split(" ")[0]!.toLowerCase()}@demo.committee`,
        phone: `+92 300 55500${String(i).padStart(2, "0")}`,
        age,
        premiumBudget: budget,
        passwordHash: hash,
        role: "member",
        verified: true,
      });
    }
    console.log(`✔ ${DEMO.length} demo members seeded (password: Member123!)`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
