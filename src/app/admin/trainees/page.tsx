import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { AddTraineeDialog } from "./add-trainee-dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function statusBadge(status: string) {
  if (status === "ASSIGNED") return <Badge variant="success">Assigned</Badge>;
  if (status === "COMPLETED") return <Badge variant="info">Completed</Badge>;
  return <Badge variant="warning">Pending</Badge>;
}

export default async function TraineesPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await auth();
  const orgId = session!.user.organizationId!;
  const statusFilter = searchParams.status as "PENDING" | "COMPLETED" | "ASSIGNED" | undefined;

  const [trainees, trainers] = await Promise.all([
    prisma.user.findMany({
      where: {
        organizationId: orgId,
        role: "TRAINEE",
        ...(statusFilter ? { onboardingStatus: statusFilter } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        trainer: { include: { trainer: { select: { id: true, name: true } } } },
        traineeProfile: { select: { fitnessGoal: true } },
      },
    }),
    prisma.user.findMany({
      where: { organizationId: orgId, role: "TRAINER" },
      select: { id: true, name: true, employeeId: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const counts = {
    all: await prisma.user.count({ where: { organizationId: orgId, role: "TRAINEE" } }),
    PENDING: await prisma.user.count({ where: { organizationId: orgId, role: "TRAINEE", onboardingStatus: "PENDING" } }),
    COMPLETED: await prisma.user.count({ where: { organizationId: orgId, role: "TRAINEE", onboardingStatus: "COMPLETED" } }),
    ASSIGNED: await prisma.user.count({ where: { organizationId: orgId, role: "TRAINEE", onboardingStatus: "ASSIGNED" } }),
  };

  const filterItems = [
    { label: "All", value: undefined, count: counts.all },
    { label: "Pending", value: "PENDING", count: counts.PENDING },
    { label: "Completed", value: "COMPLETED", count: counts.COMPLETED },
    { label: "Assigned", value: "ASSIGNED", count: counts.ASSIGNED },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainees</h1>
          <p className="text-gray-500 mt-1">Manage trainees and track onboarding progress</p>
        </div>
        <AddTraineeDialog orgId={orgId} />
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6">
        {filterItems.map((f) => (
          <Link
            key={f.label}
            href={f.value ? `/admin/trainees?status=${f.value}` : "/admin/trainees"}
          >
            <button
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                statusFilter === f.value || (!statusFilter && !f.value)
                  ? "bg-gray-900 text-white border-gray-900"
                  : "text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {f.label}
              <span className="ml-1.5 text-xs opacity-70">({f.count})</span>
            </button>
          </Link>
        ))}
      </div>

      {trainees.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-500">No trainees{statusFilter ? ` with status "${statusFilter}"` : ""} yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Trainee</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Client ID</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Assigned Trainer</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Joined</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Actions</th>
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
                  <td className="px-4 py-3">{statusBadge(trainee.onboardingStatus)}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {trainee.trainer?.trainer.name || <span className="text-gray-400">Unassigned</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(trainee.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/trainees/${trainee.id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          View Profile
                        </Button>
                      </Link>
                    </div>
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
