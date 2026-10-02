import type { NextAuthConfig } from "next-auth";

const PUBLIC_PATHS = ["/login", "/register"];

/**
 * Edge-safe config shared with middleware. No database access here —
 * DB-backed callbacks live in `auth.ts`.
 */
export const authConfig = {
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isPublic = PUBLIC_PATHS.some((p) => request.nextUrl.pathname.startsWith(p));
      if (isPublic) return true;
      return !!auth?.user;
    },
    session({ session, token }) {
      if (typeof token.uid === "string") session.user.id = token.uid;
      session.user.role = token.role === "admin" ? "admin" : "member";
      return session;
    },
  },
} satisfies NextAuthConfig;
