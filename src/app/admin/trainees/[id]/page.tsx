import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AssignTrainerSelect } from "../assign-trainer-select";

function statusBadge(status: string) {
  if (status === "ASSIGNED") return <Badge variant="success">Assigned</Badge>;
  if (status === "COMPLETED") return <Badge variant="info">Questionnaire Completed</Badge>;
  return <Badge variant="warning">Pending Questionnaire</Badge>;
}

function Row({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === "") return null;
  const display = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  return (
    <div className="flex py-2 border-b last:border-0">
      <span className="text-sm text-gray-500 w-48 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-900 font-medium">{display}</span>
    </div>
  );
}

export default async function TraineeDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const orgId = session!.user.organizationId!;

  const [trainee, trainers] = await Promise.all([
    prisma.user.findFirst({
      where: { id: params.id, organizationId: orgId, role: "TRAINEE" },
      include: {
        traineeProfile: true,
        trainer: { include: { trainer: { select: { id: true, name: true } } } },
        onboardingToken: { select: { token: true, status: true, expiresAt: true } },
      },
    }),
    prisma.user.findMany({
      where: { organizationId: orgId, role: "TRAINER" },
      select: { id: true, name: true, employeeId: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!trainee) notFound();

  const p = trainee.traineeProfile;
  const appUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "https://fitpro-saas.vercel.app";
  const onboardingLink = trainee.onboardingToken
    ? `${appUrl}/onboarding/${trainee.onboardingToken.token}`
    : null;

  return (
    <div className="p-8 max-w-4xl">
      {/* Back */}
      <Link href="/admin/trainees">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-gray-500">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Trainees
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{trainee.name}</h1>
            {statusBadge(trainee.onboardingStatus)}
          </div>
          <p className="text-gray-500 text-sm">{trainee.email}</p>
          <p className="text-gray-400 text-xs mt-0.5">
            {trainee.employeeId} · Added {formatDate(trainee.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Onboarding link */}
          {trainee.onboardingStatus === "PENDING" && onboardingLink && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-yellow-800 mb-2">Onboarding link (share with trainee)</p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={onboardingLink}
                    className="flex-1 text-xs bg-white border rounded px-2 py-1.5 text-gray-600 font-mono"
                  />
                </div>
                {trainee.onboardingToken?.expiresAt && (
                  <p className="text-xs text-yellow-700 mt-1.5">
                    Expires: {formatDate(trainee.onboardingToken.expiresAt)}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {!p || !p.fitnessGoal ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-400 text-sm">
                Trainee has not completed their questionnaire yet.
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
                <CardContent>
                  <Row label="Date of Birth" value={p.dateOfBirth ? formatDate(p.dateOfBirth) : null} />
                  <Row label="Gender" value={p.gender} />
                  <Row label="Height" value={p.height ? `${p.height} cm` : null} />
                  <Row label="Weight" value={p.weight ? `${p.weight} kg` : null} />
                  <Row label="Phone" value={p.phone} />
                  <Row label="Address" value={p.address} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Fitness Goals</CardTitle></CardHeader>
                <CardContent>
                  <Row label="Primary Goal" value={p.fitnessGoal?.replace(/_/g, " ")} />
                  <Row label="Target Weight" value={p.targetWeight ? `${p.targetWeight} kg` : null} />
                  <Row label="Current Fitness Level" value={p.currentFitnessLevel} />
                  <Row label="Preferred Workout Time" value={p.preferredWorkoutTime} />
                  <Row label="Gym Access" value={p.gymAccess} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Lifestyle & Habits</CardTitle></CardHeader>
                <CardContent>
                  <Row label="Activity Level" value={p.activityLevel?.replace(/_/g, " ")} />
                  <Row label="Sleep" value={p.sleepHours ? `${p.sleepHours} hrs/night` : null} />
                  <Row label="Water Intake" value={p.waterIntakeLiters ? `${p.waterIntakeLiters} L/day` : null} />
                  <Row label="Occupation" value={p.occupation} />
                  <Row label="Work Hours/Day" value={p.workHoursPerDay} />
                  <Row label="Stress Level" value={p.stressLevel ? `${p.stressLevel}/10` : null} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Diet & Health</CardTitle></CardHeader>
                <CardContent>
                  <Row label="Diet Type" value={p.dietType?.replace(/_/g, " ")} />
                  <Row label="Meal Frequency" value={p.mealFrequency?.replace(/_/g, " ")} />
                  <Row label="Food Allergies" value={p.foodAllergies?.join(", ")} />
                  <Row label="Food Preferences" value={p.foodPreferences} />
                  <Row label="Supplements" value={p.supplementsUsed} />
                  <Row label="Medical Conditions" value={p.medicalConditions} />
                  <Row label="Injury History" value={p.injuryHistory} />
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Right — assign trainer */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Trainer Assignment</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {trainee.trainer ? (
                <div className="text-sm">
                  <p className="text-gray-500 mb-1">Currently assigned to</p>
                  <p className="font-semibold text-gray-900">{trainee.trainer.trainer.name}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No trainer assigned yet.</p>
              )}
              <AssignTrainerSelect
                traineeId={trainee.id}
                currentTrainerId={trainee.trainer?.trainer.id}
                trainers={trainers}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
