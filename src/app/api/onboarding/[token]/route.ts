import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — validate token
export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const record = await prisma.onboardingToken.findUnique({
    where: { token: params.token },
    include: { trainee: { select: { id: true, name: true, email: true, employeeId: true } } },
  });

  if (!record) {
    return NextResponse.json({ error: "Invalid link." }, { status: 404 });
  }
  if (record.status !== "PENDING") {
    return NextResponse.json({ error: "This link has already been used." }, { status: 410 });
  }
  if (record.expiresAt < new Date()) {
    return NextResponse.json({ error: "This link has expired." }, { status: 410 });
  }

  return NextResponse.json({ trainee: record.trainee });
}

// POST — submit questionnaire
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const record = await prisma.onboardingToken.findUnique({
    where: { token: params.token },
  });

  if (!record || record.status !== "PENDING" || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invalid or expired link." }, { status: 410 });
  }

  const body = await req.json();

  const {
    // Step 1 — Personal
    dateOfBirth,
    gender,
    height,
    weight,
    phone,
    // Step 2 — Goals
    fitnessGoal,
    targetWeight,
    // Step 3 — Habits
    activityLevel,
    currentFitnessLevel,
    sleepHours,
    waterIntakeLiters,
    // Step 4 — Health & Preferences
    medicalConditions,
    injuryHistory,
    dietType,
    preferredWorkoutTime,
    gymAccess,
  } = body;

  // Save profile + mark token used + update status in one transaction
  await prisma.$transaction([
    prisma.traineeProfile.upsert({
      where: { userId: record.traineeId },
      create: {
        userId: record.traineeId,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender: gender || undefined,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        phone: phone || undefined,
        fitnessGoal: fitnessGoal || undefined,
        targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
        activityLevel: activityLevel || undefined,
        currentFitnessLevel: currentFitnessLevel || undefined,
        sleepHours: sleepHours ? parseFloat(sleepHours) : undefined,
        waterIntakeLiters: waterIntakeLiters ? parseFloat(waterIntakeLiters) : undefined,
        medicalConditions: medicalConditions || undefined,
        injuryHistory: injuryHistory || undefined,
        dietType: dietType || undefined,
        preferredWorkoutTime: preferredWorkoutTime || undefined,
        gymAccess: gymAccess === true || gymAccess === "true",
      },
      update: {
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender: gender || undefined,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        phone: phone || undefined,
        fitnessGoal: fitnessGoal || undefined,
        targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
        activityLevel: activityLevel || undefined,
        currentFitnessLevel: currentFitnessLevel || undefined,
        sleepHours: sleepHours ? parseFloat(sleepHours) : undefined,
        waterIntakeLiters: waterIntakeLiters ? parseFloat(waterIntakeLiters) : undefined,
        medicalConditions: medicalConditions || undefined,
        injuryHistory: injuryHistory || undefined,
        dietType: dietType || undefined,
        preferredWorkoutTime: preferredWorkoutTime || undefined,
        gymAccess: gymAccess === true || gymAccess === "true",
      },
    }),
    prisma.onboardingToken.update({
      where: { token: params.token },
      data: { status: "USED" },
    }),
    prisma.user.update({
      where: { id: record.traineeId },
      data: { onboardingStatus: "COMPLETED" },
    }),
  ]);

  return NextResponse.json({ success: true });
}
