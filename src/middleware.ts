import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|icons|manifest.webmanifest|sw.js|favicon.ico|robots.txt).*)"],
};
