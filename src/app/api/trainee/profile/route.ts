import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "TRAINEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const userId = session.user.id;

    const profile = await prisma.traineeProfile.upsert({
      where: { userId },
      create: {
        userId,
        gender: data.gender || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        height: data.height,
        weight: data.weight,
        phone: data.phone || null,
        address: data.address || null,
        activityLevel: data.activityLevel || null,
        sleepHours: data.sleepHours,
        stressLevel: data.stressLevel,
        occupation: data.occupation || null,
        workHoursPerDay: data.workHoursPerDay,
        dietType: data.dietType || null,
        mealFrequency: data.mealFrequency || null,
        waterIntakeLiters: data.waterIntakeLiters,
        foodAllergies: data.foodAllergies || [],
        foodPreferences: data.foodPreferences || null,
        supplementsUsed: data.supplementsUsed || null,
        fitnessGoal: data.fitnessGoal || null,
        targetWeight: data.targetWeight,
        medicalConditions: data.medicalConditions || null,
        injuryHistory: data.injuryHistory || null,
        currentFitnessLevel: data.currentFitnessLevel || null,
        preferredWorkoutTime: data.preferredWorkoutTime || null,
        gymAccess: data.gymAccess || false,
      },
      update: {
        gender: data.gender || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        height: data.height,
        weight: data.weight,
        phone: data.phone || null,
        address: data.address || null,
        activityLevel: data.activityLevel || null,
        sleepHours: data.sleepHours,
        stressLevel: data.stressLevel,
        occupation: data.occupation || null,
        workHoursPerDay: data.workHoursPerDay,
        dietType: data.dietType || null,
        mealFrequency: data.mealFrequency || null,
        waterIntakeLiters: data.waterIntakeLiters,
        foodAllergies: data.foodAllergies || [],
        foodPreferences: data.foodPreferences || null,
        supplementsUsed: data.supplementsUsed || null,
        fitnessGoal: data.fitnessGoal || null,
        targetWeight: data.targetWeight,
        medicalConditions: data.medicalConditions || null,
        injuryHistory: data.injuryHistory || null,
        currentFitnessLevel: data.currentFitnessLevel || null,
        preferredWorkoutTime: data.preferredWorkoutTime || null,
        gymAccess: data.gymAccess || false,
      },
    });

    return NextResponse.json({ success: true, profileId: profile.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
