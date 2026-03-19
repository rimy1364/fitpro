import { prisma } from "@/lib/prisma";
import { Building2, Users, UserCheck, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function SuperAdminDashboard() {
  const [
    orgCount,
    totalUsers,
    recentOrgs,
    planBreakdown,
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count({ where: { role: { not: "SUPER_ADMIN" } } }),
    prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { _count: { select: { users: true } } },
    }),
    prisma.organization.groupBy({
      by: ["plan"],
      _count: { _all: true },
    }),
  ]);

  const activeOrgs = await prisma.organization.count({ where: { isActive: true } });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-gray-500 mt-1">Monitor all organisations across FitPro</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Building2} label="Total Orgs" value={orgCount} color="purple" />
        <StatCard icon={TrendingUp} label="Active Orgs" value={activeOrgs} color="green" />
        <StatCard icon={Users} label="Total Users" value={totalUsers} color="blue" />
        <StatCard icon={UserCheck} label="Plans" value={planBreakdown.length} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orgs */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Recent Organisations</CardTitle>
              <Link href="/superadmin/organizations" className="text-sm text-purple-600 hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-gray-500 font-medium text-xs">Organisation</th>
                    <th className="text-left py-2 text-gray-500 font-medium text-xs">Plan</th>
                    <th className="text-left py-2 text-gray-500 font-medium text-xs">Users</th>
                    <th className="text-left py-2 text-gray-500 font-medium text-xs">Status</th>
                    <th className="text-left py-2 text-gray-500 font-medium text-xs">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentOrgs.map((org) => (
                    <tr key={org.id} className="hover:bg-gray-50">
                      <td className="py-2.5">
                        <p className="font-medium text-gray-900">{org.name}</p>
                        <p className="text-xs text-gray-400">{org.slug}</p>
                      </td>
                      <td className="py-2.5">
                        <PlanBadge plan={org.plan} />
                      </td>
                      <td className="py-2.5 text-gray-600">{org._count.users}</td>
                      <td className="py-2.5">
                        <Badge variant={org.isActive ? "success" : "destructive"}>
                          {org.isActive ? "Active" : "Suspended"}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-gray-400 text-xs">{formatDate(org.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Plan breakdown */}
        <div>
          <Card>
            <CardHeader><CardTitle className="text-base">Plan Distribution</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {planBreakdown.map((p) => (
                <div key={p.plan} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlanBadge plan={p.plan} />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{p._count._all} orgs</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string, "default" | "info" | "warning" | "success"> = {
    FREE: "default",
    BASIC: "info",
    PROFESSIONAL: "warning",
    ENTERPRISE: "success",
  };
  return <Badge variant={map[plan] || "default"}>{plan}</Badge>;
}

function StatCard({ icon: Icon, label, value, color }: {
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
