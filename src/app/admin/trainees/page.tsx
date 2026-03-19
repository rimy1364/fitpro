import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { AddTraineeDialog } from "./add-trainee-dialog";
import { AssignTrainerSelect } from "./assign-trainer-select";

export default async function TraineesPage() {
  const session = await auth();
  const orgId = session!.user.organizationId;

  const [trainees, trainers] = await Promise.all([
    prisma.user.findMany({
      where: { organizationId: orgId, role: "TRAINEE" },
      orderBy: { createdAt: "desc" },
      include: {
        trainer: { include: { trainer: { select: { id: true, name: true } } } },
        traineeProfile: { select: { fitnessGoal: true, weight: true, height: true } },
      },
    }),
    prisma.user.findMany({
      where: { organizationId: orgId, role: "TRAINER" },
      select: { id: true, name: true, employeeId: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainees</h1>
          <p className="text-gray-500 mt-1">Manage trainees and assign trainers</p>
        </div>
        <AddTraineeDialog orgId={orgId} />
      </div>

      {trainees.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-500">No trainees yet. Add your first trainee!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Trainee</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Client ID</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Goal</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Joined</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Assigned Trainer</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {trainees.map((trainee) => (
                <tr key={trainee.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{trainee.name}</p>
                      <p className="text-gray-400 text-xs">{trainee.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-500 text-xs">{trainee.employeeId || "—"}</td>
                  <td className="px-4 py-3">
                    {trainee.traineeProfile?.fitnessGoal ? (
                      <Badge variant="secondary" className="text-xs">
                        {trainee.traineeProfile.fitnessGoal.replace(/_/g, " ")}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-xs">Not set</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(trainee.createdAt)}</td>
                  <td className="px-4 py-3">
                    <AssignTrainerSelect
                      traineeId={trainee.id}
                      currentTrainerId={trainee.trainer?.trainer.id}
                      trainers={trainers}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
