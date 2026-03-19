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
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already exists." }, { status: 409 });
    }

    const traineeCount = await prisma.user.count({
      where: { organizationId: session.user.organizationId!, role: "TRAINEE" },
    });

    const employeeId = generateEmployeeId("TRAINEE", traineeCount + 1);
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create trainee + onboarding token in one transaction
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const trainee = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "TRAINEE",
        organizationId: session.user.organizationId!,
        employeeId,
        onboardingStatus: "PENDING",
        traineeProfile: { create: {} },
        onboardingToken: {
          create: { expiresAt },
        },
      },
      include: { onboardingToken: true },
    });

    return NextResponse.json(
      {
        success: true,
        traineeId: trainee.id,
        employeeId,
        tempPassword,
        onboardingToken: trainee.onboardingToken?.token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
