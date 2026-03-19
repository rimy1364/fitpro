import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { AddTrainerDialog } from "./add-trainer-dialog";

export default async function TrainersPage() {
  const session = await auth();
  const orgId = session!.user.organizationId!;

  const trainers = await prisma.user.findMany({
    where: { organizationId: orgId, role: "TRAINER" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { trainees: true } },
    },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainers</h1>
          <p className="text-gray-500 mt-1">Manage your organisation trainers</p>
        </div>
        <AddTrainerDialog orgId={orgId} />
      </div>

      {trainers.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-500">No trainers added yet. Add your first trainer!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainers.map((trainer) => (
            <Card key={trainer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold flex-shrink-0">
                    {trainer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{trainer.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{trainer.email}</p>
                    {trainer.employeeId && (
                      <p className="text-xs font-mono text-gray-400 mt-0.5">{trainer.employeeId}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Badge variant="info">{trainer._count.trainees} trainees</Badge>
                  <span className="text-xs text-gray-400">{formatDate(trainer.createdAt)}</span>
                </div>
                <Badge variant={trainer.isActive ? "success" : "destructive"} className="mt-2">
                  {trainer.isActive ? "Active" : "Inactive"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
