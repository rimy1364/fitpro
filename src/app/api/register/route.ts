import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const { orgName, adminName, email, password } = await req.json();

    if (!orgName || !adminName || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered." }, { status: 409 });
    }

    let slug = slugify(orgName);
    const slugExists = await prisma.organization.findUnique({ where: { slug } });
    if (slugExists) {
      slug = `${slug}-${Date.now()}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const org = await prisma.organization.create({
      data: {
        name: orgName,
        slug,
        users: {
          create: {
            name: adminName,
            email,
            password: hashedPassword,
            role: "ADMIN",
          },
        },
      },
    });

    return NextResponse.json({ success: true, orgId: org.id }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
