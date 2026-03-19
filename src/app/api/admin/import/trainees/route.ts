import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateEmployeeId } from "@/lib/utils";

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { trainees } = await req.json();

    if (!Array.isArray(trainees) || trainees.length === 0) {
      return NextResponse.json({ error: "No trainee data provided." }, { status: 400 });
    }

    const orgId = session.user.organizationId!;
    let currentCount = await prisma.user.count({
      where: { organizationId: orgId, role: "TRAINEE" },
    });

    const results = [];
    const errors = [];

    for (const t of trainees) {
      if (!t.name || !t.email) {
        errors.push({ email: t.email || "unknown", error: "Name and email are required." });
        continue;
      }

      const existing = await prisma.user.findUnique({ where: { email: t.email } });
      if (existing) {
        errors.push({ email: t.email, error: "Email already exists." });
        continue;
      }

      currentCount += 1;
      const employeeId = generateEmployeeId("TRAINEE", currentCount);
      const tempPassword = generateTempPassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const trainee = await prisma.user.create({
        data: {
          name: t.name.trim(),
          email: t.email.trim().toLowerCase(),
          password: hashedPassword,
          role: "TRAINEE",
          organizationId: orgId,
          employeeId,
          traineeProfile: { create: {} },
        },
      });

      results.push({
        name: trainee.name,
        email: trainee.email,
        clientId: employeeId,
        tempPassword,
      });
    }

    return NextResponse.json({ success: true, results, errors }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
