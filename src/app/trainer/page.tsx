import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Apple, Dumbbell, UserCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default async function TrainerDashboard() {
  const session = await auth();
  const trainerId = session!.user.id;

  const [myTrainees, dietPlansCount, exercisePlansCount] = await Promise.all([
    prisma.trainerTrainee.findMany({
      where: { trainerId },
      include: {
        trainee: {
          include: {
            traineeProfile: { select: { fitnessGoal: true, weight: true } },
            dietAssignments: { where: { status: "ACTIVE" }, take: 1 },
            exerciseAssignments: { where: { status: "ACTIVE" }, take: 1 },
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    }),
    prisma.dietPlan.count({ where: { trainerId } }),
    prisma.exercisePlan.count({ where: { trainerId } }),
  ]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Trainer Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {session!.user.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{myTrainees.length}</p>
            <p className="text-sm text-gray-500">My Trainees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
              <Apple className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold">{dietPlansCount}</p>
            <p className="text-sm text-gray-500">Diet Plans Created</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
              <Dumbbell className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold">{exercisePlansCount}</p>
            <p className="text-sm text-gray-500">Exercise Plans Created</p>
          </CardContent>
        </Card>
      </div>

      {/* My Trainees */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">My Trainees</CardTitle>
          <Link href="/trainer/trainees">
            <Button variant="ghost" size="sm" className="text-green-600">View all</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {myTrainees.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No trainees assigned yet.</p>
              <p className="text-gray-400 text-sm">Your admin will assign trainees to you.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myTrainees.slice(0, 8).map(({ trainee }) => {
                const hasDiet = trainee.dietAssignments.length > 0;
                const hasExercise = trainee.exerciseAssignments.length > 0;
                return (
                  <div key={trainee.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                        {trainee.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{trainee.name}</p>
                        <p className="text-xs text-gray-500">{trainee.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={hasDiet ? "success" : "warning"} className="text-xs">
                        {hasDiet ? "Diet ✓" : "No Diet"}
                      </Badge>
                      <Badge variant={hasExercise ? "success" : "warning"} className="text-xs">
                        {hasExercise ? "Workout ✓" : "No Workout"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
