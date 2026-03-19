import { auth } from "@/lib/auth-edge";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const publicPaths = ["/", "/login", "/register", "/api/auth", "/unauthorized"];
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (session && (pathname === "/login" || pathname === "/register")) {
    const role = session.user.role;
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
    if (role === "TRAINER") return NextResponse.redirect(new URL("/trainer", req.url));
    if (role === "TRAINEE") return NextResponse.redirect(new URL("/trainee", req.url));
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
