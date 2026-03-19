import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "TRAINER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, durationWeeks, totalCalories, meals } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const plan = await prisma.dietPlan.create({
      data: {
        title,
        description,
        durationWeeks: durationWeeks || 4,
        totalCalories,
        trainerId: session.user.id,
        meals: {
          create: meals?.map((meal: {
            name: string;
            time?: string;
            calories?: number;
            protein?: number;
            carbs?: number;
            fats?: number;
            items?: { food: string; quantity: string; calories?: number }[];
          }) => ({
            name: meal.name,
            time: meal.time,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fats: meal.fats,
            items: {
              create: meal.items?.map((item) => ({
                food: item.food,
                quantity: item.quantity,
                calories: item.calories,
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

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "TRAINER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plans = await prisma.dietPlan.findMany({
    where: { trainerId: session.user.id },
    include: { meals: { include: { items: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(plans);
}
