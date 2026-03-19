import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Apple, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";

export default async function DietPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const plan = await prisma.dietPlan.findFirst({
    where: { id, trainerId: session!.user.id },
    include: {
      meals: { include: { items: true }, orderBy: { name: "asc" } },
      assignments: {
        include: { trainee: { select: { name: true, employeeId: true } } },
        orderBy: { assignedAt: "desc" },
      },
    },
  });

  if (!plan) notFound();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href="/trainer/diet-plans" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Diet Plans
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
          <div className="flex gap-3 mt-2 text-sm text-gray-500">
            <span>{plan.durationWeeks} weeks</span>
            {plan.totalCalories && <span>· {plan.totalCalories} kcal/day</span>}
            <span>· {plan.meals.length} meals</span>
          </div>
          {plan.description && <p className="text-gray-600 mt-3 text-sm">{plan.description}</p>}
        </div>
      </div>

      {/* Assigned Trainees */}
      {plan.assignments.length > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-sm">Assigned To</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {plan.assignments.map((a) => (
                <Badge key={a.id} variant={a.status === "ACTIVE" ? "success" : "secondary"}>
                  {a.trainee.name} ({a.trainee.employeeId}) · {a.status}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meals */}
      <div className="space-y-4">
        {plan.meals.map((meal) => (
          <Card key={meal.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Apple className="h-4 w-4 text-green-600" />
                  {meal.name}
                </CardTitle>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {meal.time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{meal.time}</span>}
                  {meal.calories && <Badge variant="secondary">{meal.calories} kcal</Badge>}
                </div>
              </div>
              {(meal.protein || meal.carbs || meal.fats) && (
                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                  {meal.protein && <span>Protein: {meal.protein}g</span>}
                  {meal.carbs && <span>Carbs: {meal.carbs}g</span>}
                  {meal.fats && <span>Fats: {meal.fats}g</span>}
                </div>
              )}
            </CardHeader>
            {meal.items.length > 0 && (
              <CardContent className="pt-0">
                <table className="w-full text-sm bg-gray-50 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Food</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Quantity</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Calories</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meal.items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-3 py-2">{item.food}</td>
                        <td className="px-3 py-2 text-gray-500">{item.quantity}</td>
                        <td className="px-3 py-2 text-right text-gray-500">{item.calories ? `${item.calories} kcal` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
