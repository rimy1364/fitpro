import { auth } from "@/lib/auth-edge";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/api/auth",
    "/api/register",
    "/unauthorized",
    "/api/onboarding",  // token-based onboarding is public
  ];
  const isPublic =
    publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    /^\/onboarding\/[^/]+$/.test(pathname); // /onboarding/[token] is public

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect already-authenticated users away from login/register
  if (session && (pathname === "/login" || pathname === "/register")) {
    const role = session.user.role;
    if (role === "SUPER_ADMIN") return NextResponse.redirect(new URL("/superadmin", req.url));
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
    if (role === "TRAINER") return NextResponse.redirect(new URL("/trainer", req.url));
    if (role === "TRAINEE") {
      if (!session.user.onboarded) return NextResponse.redirect(new URL("/trainee/onboarding-pending", req.url));
      return NextResponse.redirect(new URL("/trainee", req.url));
    }
  }

  // Force onboarding for trainees who haven't completed profile
  if (session?.user.role === "TRAINEE" && !session.user.onboarded) {
    if (!pathname.startsWith("/onboarding") && !pathname.startsWith("/api/") && !pathname.startsWith("/trainee/onboarding-pending")) {
      return NextResponse.redirect(new URL("/trainee/onboarding-pending", req.url));
    }
  }

  // Role-based route protection
  if (pathname.startsWith("/superadmin") && session?.user.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/admin") && session?.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/trainer") && session?.user.role !== "TRAINER") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/trainee") && session?.user.role !== "TRAINEE") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
