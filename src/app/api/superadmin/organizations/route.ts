import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgs = await prisma.organization.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(orgs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orgName, adminName, adminEmail, adminPassword, plan } = await req.json();

    if (!orgName || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existing) {
      return NextResponse.json({ error: "Email already exists." }, { status: 409 });
    }

    const baseSlug = slugify(orgName);
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.organization.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const org = await prisma.organization.create({
      data: {
        name: orgName,
        slug,
        plan: plan || "FREE",
        users: {
          create: {
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: "ADMIN",
          },
        },
      },
    });

    return NextResponse.json({ success: true, orgId: org.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
