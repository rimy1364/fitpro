import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { CreateOrgDialog } from "./create-org-dialog";
import { OrgActions } from "./org-actions";

function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string, "default" | "info" | "warning" | "success"> = {
    FREE: "default", BASIC: "info", PROFESSIONAL: "warning", ENTERPRISE: "success",
  };
  return <Badge variant={map[plan] || "default"}>{plan}</Badge>;
}

export default async function OrganizationsPage() {
  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { users: true } },
    },
  });

  // Count by role for each org
  const userCounts = await Promise.all(
    orgs.map(async (org) => {
      const [trainers, trainees] = await Promise.all([
        prisma.user.count({ where: { organizationId: org.id, role: "TRAINER" } }),
        prisma.user.count({ where: { organizationId: org.id, role: "TRAINEE" } }),
      ]);
      return { orgId: org.id, trainers, trainees };
    })
  );
  const countMap = Object.fromEntries(userCounts.map((c) => [c.orgId, c]));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organisations</h1>
          <p className="text-gray-500 mt-1">{orgs.length} organisations on the platform</p>
        </div>
        <CreateOrgDialog />
      </div>

      {orgs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-gray-400">No organisations yet.</CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Organisation</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Plan</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Trainers</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Trainees</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Created</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orgs.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{org.name}</p>
                    <p className="text-xs text-gray-400">{org.slug}</p>
                  </td>
                  <td className="px-4 py-3"><PlanBadge plan={org.plan} /></td>
                  <td className="px-4 py-3 text-gray-600">{countMap[org.id]?.trainers ?? 0}</td>
                  <td className="px-4 py-3 text-gray-600">{countMap[org.id]?.trainees ?? 0}</td>
                  <td className="px-4 py-3">
                    <Badge variant={org.isActive ? "success" : "destructive"}>
                      {org.isActive ? "Active" : "Suspended"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(org.createdAt)}</td>
                  <td className="px-4 py-3">
                    <OrgActions orgId={org.id} isActive={org.isActive} plan={org.plan} />
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
