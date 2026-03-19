import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: Role }).role;
        token.organizationId = (user as { organizationId: string | null }).organizationId ?? null;
        token.employeeId = (user as { employeeId: string | null }).employeeId;
        token.onboarded = (user as { onboarded: boolean }).onboarded;
      }
      if (trigger === "update" && session?.onboarded !== undefined) {
        token.onboarded = session.onboarded;
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
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { traineeProfile: { select: { fitnessGoal: true } } },
        });

        if (!user || !user.isActive) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        // SUPER_ADMIN and ADMIN/TRAINER are always "onboarded"
        // TRAINEE is onboarded when they have filled questionnaire (fitnessGoal set)
        const onboarded =
          user.role !== "TRAINEE" ||
          user.onboardingStatus === "COMPLETED" ||
          user.onboardingStatus === "ASSIGNED" ||
          !!user.traineeProfile?.fitnessGoal;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          employeeId: user.employeeId,
          onboarded,
        };
      },
    }),
  ],
});
