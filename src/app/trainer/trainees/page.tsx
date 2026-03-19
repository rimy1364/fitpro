import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, calculateBMI, getBMICategory } from "@/lib/utils";
import Link from "next/link";

export default async function TrainerTraineesPage() {
  const session = await auth();
  const trainerId = session!.user.id;

  const assignments = await prisma.trainerTrainee.findMany({
    where: { trainerId },
    include: {
      trainee: {
        include: {
          traineeProfile: true,
          dietAssignments: {
            where: { status: "ACTIVE" },
            include: { dietPlan: { select: { title: true } } },
            take: 1,
          },
          exerciseAssignments: {
            where: { status: "ACTIVE" },
            include: { exercisePlan: { select: { title: true } } },
            take: 1,
          },
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Trainees</h1>
        <p className="text-gray-500 mt-1">{assignments.length} trainee{assignments.length !== 1 ? "s" : ""} assigned to you</p>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-500">No trainees assigned yet. Contact your admin.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {assignments.map(({ trainee }) => {
            const profile = trainee.traineeProfile;
            const bmi = profile?.weight && profile?.height
              ? calculateBMI(profile.weight, profile.height)
              : null;
            const activeDiet = trainee.dietAssignments[0];
            const activeExercise = trainee.exerciseAssignments[0];

            return (
              <Card key={trainee.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg flex-shrink-0">
                        {trainee.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{trainee.name}</h3>
                        <p className="text-xs text-gray-500">{trainee.email}</p>
                        <p className="text-xs font-mono text-gray-400">{trainee.employeeId}</p>
                      </div>
                    </div>
                    <Badge variant={trainee.isActive ? "success" : "destructive"}>
                      {trainee.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {profile && (
                    <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-50 rounded-lg p-3">
                      {profile.weight && (
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-900">{profile.weight}kg</p>
                          <p className="text-xs text-gray-500">Weight</p>
                        </div>
                      )}
                      {profile.height && (
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-900">{profile.height}cm</p>
                          <p className="text-xs text-gray-500">Height</p>
                        </div>
                      )}
                      {bmi && (
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-900">{bmi}</p>
                          <p className="text-xs text-gray-500">{getBMICategory(bmi)}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {profile?.fitnessGoal && (
                    <div className="mb-3">
                      <Badge variant="secondary">
                        Goal: {profile.fitnessGoal.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  )}

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Diet Plan</span>
                      <span className={activeDiet ? "text-green-600 font-medium" : "text-orange-500"}>
                        {activeDiet ? activeDiet.dietPlan.title : "Not assigned"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Exercise Plan</span>
                      <span className={activeExercise ? "text-green-600 font-medium" : "text-orange-500"}>
                        {activeExercise ? activeExercise.exercisePlan.title : "Not assigned"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/trainer/diet-plans?assignTo=${trainee.id}`} className="flex-1">
                      <button className="w-full text-xs border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors">
                        Assign Diet Plan
                      </button>
                    </Link>
                    <Link href={`/trainer/exercise-plans?assignTo=${trainee.id}`} className="flex-1">
                      <button className="w-full text-xs border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors">
                        Assign Workout
                      </button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
