import NextAuth from "next-auth";
import type { Role } from "@prisma/client";

// Lightweight auth for Edge Runtime (middleware) - no bcryptjs, no Prisma
export const { auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: Role }).role;
        token.organizationId = (user as { organizationId: string }).organizationId;
        token.employeeId = (user as { employeeId: string | null }).employeeId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.organizationId = token.organizationId as string;
        session.user.employeeId = token.employeeId as string | null;
      }
      return session;
    },
  },
});
