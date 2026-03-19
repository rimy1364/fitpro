import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Plus, Dumbbell } from "lucide-react";
import { AssignPlanDialog } from "@/components/trainer/assign-plan-dialog";

export default async function ExercisePlansPage({ searchParams }: { searchParams: Promise<{ assignTo?: string }> }) {
  const session = await auth();
  const trainerId = session!.user.id;
  const params = await searchParams;

  const [exercisePlans, myTrainees] = await Promise.all([
    prisma.exercisePlan.findMany({
      where: { trainerId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { workouts: true, assignments: true } },
      },
    }),
    prisma.trainerTrainee.findMany({
      where: { trainerId },
      include: { trainee: { select: { id: true, name: true, employeeId: true } } },
    }),
  ]);

  const trainees = myTrainees.map((t) => t.trainee);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exercise Plans</h1>
          <p className="text-gray-500 mt-1">Create and manage workout plans for your trainees</p>
        </div>
        <Link href="/trainer/exercise-plans/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Exercise Plan
          </Button>
        </Link>
      </div>

      {params.assignTo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
          Select a plan below to assign it to your trainee.
        </div>
      )}

      {exercisePlans.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Dumbbell className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No exercise plans created yet.</p>
            <Link href="/trainer/exercise-plans/new">
              <Button className="bg-green-600 hover:bg-green-700">Create Your First Plan</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercisePlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{plan.durationWeeks}w</Badge>
                    <Badge variant="info">{plan.daysPerWeek}d/wk</Badge>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{plan.title}</h3>
                {plan.description && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{plan.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                  <span>{plan._count.workouts} workouts</span>
                  <span>·</span>
                  <span>{plan._count.assignments} assigned</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/trainer/exercise-plans/${plan.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">View</Button>
                  </Link>
                  <AssignPlanDialog
                    planId={plan.id}
                    planTitle={plan.title}
                    planType="exercise"
                    trainees={trainees}
                    preselectedTraineeId={params.assignTo}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-3">{formatDate(plan.createdAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
