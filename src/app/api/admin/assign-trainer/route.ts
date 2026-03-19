import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { traineeId, trainerId } = await req.json();

    await prisma.$transaction([
      prisma.trainerTrainee.upsert({
        where: { traineeId },
        create: { traineeId, trainerId },
        update: { trainerId },
      }),
      prisma.user.update({
        where: { id: traineeId },
        data: { onboardingStatus: "ASSIGNED" },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
