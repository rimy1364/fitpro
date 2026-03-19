import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateEmployeeId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already exists." }, { status: 409 });
    }

    const trainerCount = await prisma.user.count({
      where: { organizationId: session.user.organizationId!, role: "TRAINER" },
    });

    const employeeId = generateEmployeeId("TRAINER", trainerCount + 1);
    const hashedPassword = await bcrypt.hash(password, 10);

    const trainer = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "TRAINER",
        organizationId: session.user.organizationId!,
        employeeId,
      },
    });

    return NextResponse.json({ success: true, trainerId: trainer.id, employeeId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trainers = await prisma.user.findMany({
    where: { organizationId: session.user.organizationId!, role: "TRAINER" },
    select: { id: true, name: true, email: true, employeeId: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(trainers);
}
