import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Timer, RotateCcw } from "lucide-react";

export default async function TraineeExercisePlanPage() {
  const session = await auth();
  const userId = session!.user.id;

  const assignment = await prisma.exercisePlanAssignment.findFirst({
    where: { traineeId: userId, status: "ACTIVE" },
    include: {
      exercisePlan: {
        include: {
          workouts: {
            include: { exercises: { orderBy: { order: "asc" } } },
            orderBy: { dayNumber: "asc" },
          },
          trainer: { select: { name: true } },
        },
      },
    },
  });

  if (!assignment) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Dumbbell className="h-16 w-16 text-gray-200 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No Exercise Plan Assigned</h2>
        <p className="text-gray-500 text-center">Your trainer will assign an exercise plan once they review your profile.</p>
      </div>
    );
  }

  const plan = assignment.exercisePlan;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
            <p className="text-gray-500 mt-1">By {plan.trainer.name} · {plan.durationWeeks} weeks · {plan.daysPerWeek} days/week</p>
          </div>
          <Badge variant="success">Active</Badge>
        </div>
        {plan.description && <p className="text-gray-600 mt-3 text-sm">{plan.description}</p>}
      </div>

      <div className="space-y-6">
        {plan.workouts.map((workout) => (
          <Card key={workout.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-7 w-7 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
                  {workout.dayNumber}
                </div>
                {workout.dayName}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {workout.exercises.length === 0 ? (
                <p className="text-sm text-gray-400">No exercises added.</p>
              ) : (
                <div className="space-y-3">
                  {workout.exercises.map((ex) => (
                    <div key={ex.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{ex.name}</p>
                          {ex.muscleGroup && (
                            <Badge variant="secondary" className="text-xs mt-1">{ex.muscleGroup}</Badge>
                          )}
                        </div>
                        <div className="flex gap-2 text-xs text-gray-500">
                          {ex.sets && ex.reps && (
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                              {ex.sets} × {ex.reps}
                            </span>
                          )}
                          {ex.duration && (
                            <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded">
                              <Timer className="h-3 w-3" />
                              {ex.duration}
                            </span>
                          )}
                          {ex.rest && (
                            <span className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-0.5 rounded">
                              <RotateCcw className="h-3 w-3" />
                              {ex.rest} rest
                            </span>
                          )}
                        </div>
                      </div>
                      {ex.notes && <p className="text-xs text-gray-500 mt-1 italic">{ex.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {plan.workouts.length === 0 && (
        <div className="text-center py-8 text-gray-500">No workouts added to this plan yet.</div>
      )}
    </div>
  );
}
