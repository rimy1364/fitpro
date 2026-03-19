import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "TRAINER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, durationWeeks, daysPerWeek, workouts } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const plan = await prisma.exercisePlan.create({
      data: {
        title,
        description,
        durationWeeks: durationWeeks || 4,
        daysPerWeek: daysPerWeek || 3,
        trainerId: session.user.id,
        workouts: {
          create: workouts?.map((workout: {
            dayNumber: number;
            dayName: string;
            exercises?: {
              name: string;
              sets?: number;
              reps?: string;
              duration?: string;
              rest?: string;
              muscleGroup?: string;
              notes?: string;
              order?: number;
            }[];
          }) => ({
            dayNumber: workout.dayNumber,
            dayName: workout.dayName,
            exercises: {
              create: workout.exercises?.map((ex) => ({
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                duration: ex.duration,
                rest: ex.rest,
                muscleGroup: ex.muscleGroup,
                notes: ex.notes,
                order: ex.order || 0,
              })) || [],
            },
          })) || [],
        },
      },
    });

    return NextResponse.json({ success: true, planId: plan.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
