import bcrypt from "bcryptjs";
import { count, eq, sql } from "drizzle-orm";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { db } from "./db";
import { users } from "./db/schema";
import { isSuperAdminEmail, MAX_MEMBERS } from "./lib/config";
import { getClientIp } from "./lib/ip";

class InvalidLogin extends CredentialsSignin {
  code = "invalid_credentials";
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

async function findUserByEmail(email: string) {
  const [u] = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${email.toLowerCase()}`)
    .limit(1);
  return u ?? null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    GitHub({ allowDangerousEmailAccountLinking: true }),
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) throw new InvalidLogin();
        const user = await findUserByEmail(parsed.data.email);
        if (!user?.passwordHash) throw new InvalidLogin();
        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) throw new InvalidLogin();
        return { id: user.id, name: user.name, email: user.email, image: user.profileImageUrl };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider !== "github") return true;
      const email = user.email?.toLowerCase();
      if (!email) return "/login?error=NoEmail";

      const existing = await findUserByEmail(email);
      const ip = await getClientIp();
      const githubId = String(profile?.id ?? account.providerAccountId);

      if (existing) {
        await db
          .update(users)
          .set({
            githubId,
            ipAddress: ip ?? existing.ipAddress,
            profileImageUrl: existing.profileImageUrl ?? user.image ?? null,
            role: isSuperAdminEmail(email) ? "admin" : existing.role,
          })
          .where(eq(users.id, existing.id));
        return true;
      }

      const isAdmin = isSuperAdminEmail(email);
      if (!isAdmin) {
        const [{ value: memberCount }] = await db.select({ value: count() }).from(users).where(eq(users.role, "member"));
        if (memberCount >= MAX_MEMBERS) return "/login?error=CommitteeFull";
      }

      await db.insert(users).values({
        name: user.name ?? (profile?.login as string | undefined) ?? email.split("@")[0]!,
        email,
        githubId,
        profileImageUrl: user.image ?? null,
        ipAddress: ip,
        role: isAdmin ? "admin" : "member",
        verified: isAdmin,
      });
      return true;
    },
    async jwt({ token, user, account }) {
      // Resolve our own UUID + role once, at sign-in time.
      if (account && user?.email) {
        const dbUser = await findUserByEmail(user.email);
        if (dbUser) {
          token.uid = dbUser.id;
          token.role = dbUser.role;
          token.picture = dbUser.profileImageUrl;
          token.name = dbUser.name;
        }
      }
      return token;
    },
  },
});
