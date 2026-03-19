import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Apple, Dumbbell, UserCheck, ClipboardList } from "lucide-react";
import Link from "next/link";
import { calculateBMI, getBMICategory } from "@/lib/utils";

export default async function TraineeDashboard() {
  const session = await auth();
  const userId = session!.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      traineeProfile: true,
      trainer: { include: { trainer: { select: { name: true, email: true } } } },
      dietAssignments: {
        where: { status: "ACTIVE" },
        include: { dietPlan: { select: { title: true, durationWeeks: true, totalCalories: true } } },
        take: 1,
      },
      exerciseAssignments: {
        where: { status: "ACTIVE" },
        include: { exercisePlan: { select: { title: true, durationWeeks: true, daysPerWeek: true } } },
        take: 1,
      },
    },
  });

  const profile = user?.traineeProfile;
  const bmi = profile?.weight && profile?.height ? calculateBMI(profile.weight, profile.height) : null;
  const activeDiet = user?.dietAssignments[0];
  const activeExercise = user?.exerciseAssignments[0];
  const trainer = user?.trainer?.trainer;

  const profileComplete = profile && (profile.fitnessGoal || profile.weight || profile.dietType);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome, {session!.user.name}
          {session!.user.employeeId && (
            <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{session!.user.employeeId}</span>
          )}
        </p>
      </div>

      {!profileComplete && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-blue-800">Complete your profile</p>
            <p className="text-blue-700 text-sm">Help your trainer understand your goals and lifestyle.</p>
          </div>
          <Link href="/trainee/profile">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              Complete Profile
            </Button>
          </Link>
        </div>
      )}

      {/* Trainer Info */}
      {trainer && (
        <Card className="mb-6">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
                {trainer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-gray-500">Your Trainer</p>
                <p className="font-semibold text-gray-900">{trainer.name}</p>
                <p className="text-xs text-gray-400">{trainer.email}</p>
              </div>
              <UserCheck className="ml-auto h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats row */}
      {profile && (bmi || profile.fitnessGoal) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {profile.weight && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xl font-bold text-gray-900">{profile.weight}kg</p>
                <p className="text-xs text-gray-500">Current Weight</p>
              </CardContent>
            </Card>
          )}
          {profile.targetWeight && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xl font-bold text-green-600">{profile.targetWeight}kg</p>
                <p className="text-xs text-gray-500">Target Weight</p>
              </CardContent>
            </Card>
          )}
          {bmi && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xl font-bold text-gray-900">{bmi}</p>
                <p className="text-xs text-gray-500">BMI ({getBMICategory(bmi)})</p>
              </CardContent>
            </Card>
          )}
          {profile.fitnessGoal && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm font-semibold text-gray-900">{profile.fitnessGoal.replace(/_/g, " ")}</p>
                <p className="text-xs text-gray-500">Fitness Goal</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Apple className="h-4 w-4 text-green-600" />
              Diet Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeDiet ? (
              <div>
                <p className="font-semibold text-gray-900 mb-2">{activeDiet.dietPlan.title}</p>
                <div className="flex gap-3 text-xs text-gray-500 mb-4">
                  <span>{activeDiet.dietPlan.durationWeeks} weeks</span>
                  {activeDiet.dietPlan.totalCalories && <span>· {activeDiet.dietPlan.totalCalories} kcal/day</span>}
                </div>
                <Badge variant="success">Active</Badge>
                <Link href="/trainee/diet-plan" className="block mt-3">
                  <Button variant="outline" size="sm" className="w-full">View Full Plan</Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <Apple className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No diet plan assigned yet</p>
                <p className="text-xs text-gray-400">Your trainer will assign one soon</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-purple-600" />
              Exercise Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeExercise ? (
              <div>
                <p className="font-semibold text-gray-900 mb-2">{activeExercise.exercisePlan.title}</p>
                <div className="flex gap-3 text-xs text-gray-500 mb-4">
                  <span>{activeExercise.exercisePlan.durationWeeks} weeks</span>
                  <span>· {activeExercise.exercisePlan.daysPerWeek} days/week</span>
                </div>
                <Badge variant="success">Active</Badge>
                <Link href="/trainee/exercise-plan" className="block mt-3">
                  <Button variant="outline" size="sm" className="w-full">View Full Plan</Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <Dumbbell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No exercise plan assigned yet</p>
                <p className="text-xs text-gray-400">Your trainer will assign one soon</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
