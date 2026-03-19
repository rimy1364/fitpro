import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, ArrowLeft, Timer, RotateCcw } from "lucide-react";
import Link from "next/link";

export default async function ExercisePlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const plan = await prisma.exercisePlan.findFirst({
    where: { id, trainerId: session!.user.id },
    include: {
      workouts: {
        include: { exercises: { orderBy: { order: "asc" } } },
        orderBy: { dayNumber: "asc" },
      },
      assignments: {
        include: { trainee: { select: { name: true, employeeId: true } } },
        orderBy: { assignedAt: "desc" },
      },
    },
  });

  if (!plan) notFound();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href="/trainer/exercise-plans" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Exercise Plans
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
        <div className="flex gap-3 mt-2 text-sm text-gray-500">
          <span>{plan.durationWeeks} weeks</span>
          <span>· {plan.daysPerWeek} days/week</span>
          <span>· {plan.workouts.length} workouts</span>
        </div>
        {plan.description && <p className="text-gray-600 mt-3 text-sm">{plan.description}</p>}
      </div>

      {plan.assignments.length > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-sm">Assigned To</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {plan.assignments.map((a) => (
                <Badge key={a.id} variant={a.status === "ACTIVE" ? "success" : "secondary"}>
                  {a.trainee.name} ({a.trainee.employeeId}) · {a.status}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {plan.workouts.map((workout) => (
          <Card key={workout.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-7 w-7 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">
                  {workout.dayNumber}
                </div>
                {workout.dayName}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {workout.exercises.map((ex) => (
                <div key={ex.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{ex.name}</p>
                      {ex.muscleGroup && <Badge variant="secondary" className="text-xs mt-1">{ex.muscleGroup}</Badge>}
                    </div>
                    <div className="flex gap-2 text-xs flex-wrap justify-end">
                      {ex.sets && ex.reps && (
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">{ex.sets} × {ex.reps}</span>
                      )}
                      {ex.duration && (
                        <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded">
                          <Timer className="h-3 w-3" />{ex.duration}
                        </span>
                      )}
                      {ex.rest && (
                        <span className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-0.5 rounded">
                          <RotateCcw className="h-3 w-3" />{ex.rest}
                        </span>
                      )}
                    </div>
                  </div>
                  {ex.notes && <p className="text-xs text-gray-500 italic">{ex.notes}</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
