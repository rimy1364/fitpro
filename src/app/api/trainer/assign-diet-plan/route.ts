import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "TRAINER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { planId, traineeId } = await req.json();

    // Deactivate existing active diet plan for this trainee
    await prisma.dietPlanAssignment.updateMany({
      where: { traineeId, status: "ACTIVE" },
      data: { status: "COMPLETED" },
    });

    const assignment = await prisma.dietPlanAssignment.create({
      data: {
        dietPlanId: planId,
        traineeId,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, assignmentId: assignment.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
