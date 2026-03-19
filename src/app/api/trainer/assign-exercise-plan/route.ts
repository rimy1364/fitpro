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

    // Verify the plan belongs to this trainer
    const plan = await prisma.exercisePlan.findFirst({
      where: { id: planId, trainerId: session.user.id },
    });
    if (!plan) return NextResponse.json({ error: "Plan not found." }, { status: 404 });

    // Verify this trainee is assigned to this trainer
    const relationship = await prisma.trainerTrainee.findFirst({
      where: { trainerId: session.user.id, traineeId },
    });
    if (!relationship) return NextResponse.json({ error: "Trainee not assigned to you." }, { status: 403 });

    await prisma.exercisePlanAssignment.updateMany({
      where: { traineeId, status: "ACTIVE" },
      data: { status: "COMPLETED" },
    });

    const assignment = await prisma.exercisePlanAssignment.create({
      data: {
        exercisePlanId: planId,
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
