import NextAuth from "next-auth";
import type { Role } from "@prisma/client";

export const { auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: Role }).role;
        token.organizationId = (user as { organizationId: string | null }).organizationId ?? null;
        token.employeeId = (user as { employeeId: string | null }).employeeId;
        token.onboarded = (user as { onboarded: boolean }).onboarded;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.organizationId = token.organizationId as string | null;
        session.user.employeeId = token.employeeId as string | null;
        session.user.onboarded = token.onboarded as boolean;
      }
      return session;
    },
  },
});
