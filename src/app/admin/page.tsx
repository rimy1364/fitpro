import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Activity, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboard() {
  const session = await auth();
  const orgId = session!.user.organizationId;

  const [trainerCount, traineeCount, recentTrainees, recentTrainers] = await Promise.all([
    prisma.user.count({ where: { organizationId: orgId, role: "TRAINER" } }),
    prisma.user.count({ where: { organizationId: orgId, role: "TRAINEE" } }),
    prisma.user.findMany({
      where: { organizationId: orgId, role: "TRAINEE" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { trainer: { include: { trainer: { select: { name: true } } } } },
    }),
    prisma.user.findMany({
      where: { organizationId: orgId, role: "TRAINER" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { trainees: true } } },
    }),
  ]);

  const unassignedCount = await prisma.user.count({
    where: { organizationId: orgId, role: "TRAINEE", trainer: null },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your organisation at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={UserCheck} label="Total Trainers" value={trainerCount} color="blue" />
        <StatCard icon={Users} label="Total Trainees" value={traineeCount} color="green" />
        <StatCard icon={Activity} label="Unassigned Trainees" value={unassignedCount} color="orange" />
        <StatCard icon={TrendingUp} label="Active Plans" value={trainerCount + traineeCount} color="purple" />
      </div>

      {unassignedCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-yellow-800">
              {unassignedCount} trainee{unassignedCount > 1 ? "s" : ""} not yet assigned to a trainer
            </p>
            <p className="text-yellow-700 text-sm">Assign them to trainers to get started</p>
          </div>
          <Link href="/admin/trainees">
            <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
              Assign Now
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trainees */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Trainees</CardTitle>
            <Link href="/admin/trainees">
              <Button variant="ghost" size="sm" className="text-green-600">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTrainees.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No trainees yet</p>
            ) : (
              <div className="space-y-3">
                {recentTrainees.map((t) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500">
                        {t.employeeId} · {formatDate(t.createdAt)}
                      </p>
                    </div>
                    <Badge variant={t.trainer ? "success" : "warning"}>
                      {t.trainer ? t.trainer.trainer.name : "Unassigned"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Trainers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Trainers</CardTitle>
            <Link href="/admin/trainers">
              <Button variant="ghost" size="sm" className="text-green-600">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTrainers.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No trainers yet</p>
            ) : (
              <div className="space-y-3">
                {recentTrainers.map((t) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.employeeId} · {t.email}</p>
                    </div>
                    <Badge variant="info">{t._count.trainees} trainees</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: "blue" | "green" | "orange" | "purple";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <Card>
      <CardContent className="p-6">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}
