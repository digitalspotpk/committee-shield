# Committee Shield — Committee Draw & Insurance Tracker (PWA)

An Android-style Progressive Web App for a 12-member committee: a monthly lucky-draw wheel picks a winner who hasn't won yet this cycle, and each winner's insurance policy is tracked to activation.

**Stack:** Next.js 15 (App Router) · Tailwind CSS · Framer Motion · Neon PostgreSQL · Drizzle ORM · Auth.js v5 (GitHub + credentials) · ImgBB · Vercel

## Quick start

```bash
npm install
cp .env.example .env          # fill in DATABASE_URL, AUTH_SECRET, IMGBB_API_KEY, SUPER_ADMIN_* ...
npm run db:migrate            # applies drizzle/0000_init.sql to Neon
npm run db:seed               # Super Admin login (or db:seed:demo to also add 12 sample members)
npm run dev
```

Sign in at http://localhost:3000/login with `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`.

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection string |
| `AUTH_SECRET` | `npx auth secret` |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | GitHub OAuth app. Callback: `https://<domain>/api/auth/callback/github` |
| `SUPER_ADMIN_EMAIL` | This account is always Super Admin (credentials or GitHub) |
| `SUPER_ADMIN_PASSWORD`, `SUPER_ADMIN_NAME` | Used by the seed script only |
| `IMGBB_API_KEY` | Server-side only; the browser never sees it |
| `MAX_MEMBERS` (12), `MONTHLY_CONTRIBUTION`, `ADMINS_IN_DRAW` | Committee rules |
| `NEXT_PUBLIC_CURRENCY` (PKR), `NEXT_PUBLIC_APP_NAME` | Display |

## Deploying to Vercel

1. Push to GitHub and import the repo in Vercel.
2. Add the env vars above (Vercel's Neon integration can inject `DATABASE_URL`).
3. Run `npm run db:migrate` and `npm run db:seed` once from your machine against the production `DATABASE_URL`.
4. Set the GitHub OAuth callback URL to your Vercel domain.

## How it works

- **Draw engine** (`src/lib/draw.ts`): fetches verified members, removes everyone who already won in the current cycle, picks a winner with `crypto.randomInt`, then writes the committee row **and** a `Pending` insurance plan in one atomic `db.batch`. Unique indexes on `(cycle, month)` and `(cycle, winner_user_id)` make double draws impossible. After month 12 the next draw automatically starts cycle N+1.
- **Wheel** (`src/components/draw/LuckyWheel.tsx`): the server picks the winner first; the client then spins 7 turns and decelerates to land precisely on that segment, followed by a confetti reveal.
- **ImgBB** (`src/app/api/upload/route.ts`): authenticated multipart upload → ImgBB → only the returned `https://i.ibb.co/...` URL is stored. Server actions reject any image URL not from ImgBB/GitHub.
- **Auth**: JWT sessions; middleware uses an edge-safe config (`auth.config.ts`), while role checks always read the user fresh from Neon (`src/lib/session.ts`). The sign-up/sign-in IP is stored in `users.ip_address`.
- **Roles**: members edit their profile and submit policy details (receipt, number, start date). Only the Super Admin can start draws, verify/edit/delete members, change roles, override winners, reset a cycle, and set policy status. Activating a policy sets the start date (today if empty) and the renewal date to +1 year.
- **Onboarding**: credentials sign-up is a 2-step form, then a photo/profile step. GitHub users land on the same profile step if phone, age or budget are missing. New members start unverified and join the draw once the admin verifies them.

## Schema

`users`, `committees` and `insurance_plans` match the spec, plus: `verified`, `password_hash`, `github_id` on users; `cycle`, `overridden` on committees; `committee_id`, `policy_number`, `receipt_url` on plans. See `src/db/schema.ts` and `drizzle/0000_init.sql`. After schema changes: `npm run db:generate` then `npm run db:migrate`.

## Project layout

```
src/
  app/(auth)/        login, register
  app/(app)/         home, draw, members, insurance, admin (shell + bottom nav)
  app/onboarding/    profile completion + photo
  app/actions/       server actions (auth, profile, draw, policy, admin)
  app/api/           auth handlers, ImgBB upload
  components/        ui primitives, shell, draw, members, insurance, admin
  db/                Drizzle schema + Neon client
  lib/               draw engine, queries, session, validators, imgbb
drizzle/             SQL migrations
scripts/seed.ts      Super Admin + demo members
public/              sw.js, PWA icons
```
