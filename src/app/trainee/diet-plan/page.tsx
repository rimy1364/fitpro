import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Apple, Clock, Flame, Droplets } from "lucide-react";

export default async function TraineeDietPlanPage() {
  const session = await auth();
  const userId = session!.user.id;

  const assignment = await prisma.dietPlanAssignment.findFirst({
    where: { traineeId: userId, status: "ACTIVE" },
    include: {
      dietPlan: {
        include: {
          meals: {
            include: { items: true },
            orderBy: { name: "asc" },
          },
          trainer: { select: { name: true } },
        },
      },
    },
  });

  if (!assignment) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Apple className="h-16 w-16 text-gray-200 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No Diet Plan Assigned</h2>
        <p className="text-gray-500 text-center">Your trainer will assign a diet plan once they review your profile.</p>
      </div>
    );
  }

  const plan = assignment.dietPlan;
  const totalCalories = plan.totalCalories || plan.meals.reduce((s, m) => s + (m.calories || 0), 0);
  const totalProtein = plan.meals.reduce((s, m) => s + (m.protein || 0), 0);
  const totalCarbs = plan.meals.reduce((s, m) => s + (m.carbs || 0), 0);
  const totalFats = plan.meals.reduce((s, m) => s + (m.fats || 0), 0);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
            <p className="text-gray-500 mt-1">By {plan.trainer.name} · {plan.durationWeeks} weeks</p>
          </div>
          <Badge variant="success">Active</Badge>
        </div>
        {plan.description && <p className="text-gray-600 mt-3 text-sm">{plan.description}</p>}
      </div>

      {/* Daily Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card className="bg-orange-50 border-orange-100">
          <CardContent className="p-4 text-center">
            <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900">{totalCalories}</p>
            <p className="text-xs text-gray-500">kcal/day</p>
          </CardContent>
        </Card>
        {totalProtein > 0 && (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xl font-bold text-blue-600">{Math.round(totalProtein)}g</p>
              <p className="text-xs text-gray-500">Protein</p>
            </CardContent>
          </Card>
        )}
        {totalCarbs > 0 && (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xl font-bold text-yellow-600">{Math.round(totalCarbs)}g</p>
              <p className="text-xs text-gray-500">Carbs</p>
            </CardContent>
          </Card>
        )}
        {totalFats > 0 && (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xl font-bold text-red-500">{Math.round(totalFats)}g</p>
              <p className="text-xs text-gray-500">Fats</p>
            </CardContent>
          </Card>
        )}
      </div>

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
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {meal.time && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {meal.time}
                    </span>
                  )}
                  {meal.calories && <Badge variant="secondary">{meal.calories} kcal</Badge>}
                </div>
              </div>
              {(meal.protein || meal.carbs || meal.fats) && (
                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                  {meal.protein && <span>P: {meal.protein}g</span>}
                  {meal.carbs && <span>C: {meal.carbs}g</span>}
                  {meal.fats && <span>F: {meal.fats}g</span>}
                </div>
              )}
            </CardHeader>
            {meal.items.length > 0 && (
              <CardContent className="pt-0">
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
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
                          <td className="px-3 py-2 text-gray-900">{item.food}</td>
                          <td className="px-3 py-2 text-gray-500">{item.quantity}</td>
                          <td className="px-3 py-2 text-right text-gray-500">{item.calories ? `${item.calories} kcal` : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {plan.meals.length === 0 && (
        <div className="text-center py-8 text-gray-500">No meals added to this plan yet.</div>
      )}
    </div>
  );
}
