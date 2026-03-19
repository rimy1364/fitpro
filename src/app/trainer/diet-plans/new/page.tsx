"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface MealItem {
  food: string;
  quantity: string;
  calories: string;
}

interface Meal {
  name: string;
  time: string;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  items: MealItem[];
}

const defaultMeal = (): Meal => ({
  name: "",
  time: "",
  calories: "",
  protein: "",
  carbs: "",
  fats: "",
  items: [{ food: "", quantity: "", calories: "" }],
});

export default function NewDietPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationWeeks, setDurationWeeks] = useState("4");
  const [totalCalories, setTotalCalories] = useState("");
  const [meals, setMeals] = useState<Meal[]>([defaultMeal()]);

  function addMeal() {
    setMeals([...meals, defaultMeal()]);
  }

  function removeMeal(i: number) {
    setMeals(meals.filter((_, idx) => idx !== i));
  }

  function updateMeal(i: number, field: keyof Omit<Meal, "items">, value: string) {
    const updated = [...meals];
    updated[i] = { ...updated[i], [field]: value };
    setMeals(updated);
  }

  function addItem(mealIdx: number) {
    const updated = [...meals];
    updated[mealIdx].items.push({ food: "", quantity: "", calories: "" });
    setMeals(updated);
  }

  function removeItem(mealIdx: number, itemIdx: number) {
    const updated = [...meals];
    updated[mealIdx].items = updated[mealIdx].items.filter((_, i) => i !== itemIdx);
    setMeals(updated);
  }

  function updateItem(mealIdx: number, itemIdx: number, field: keyof MealItem, value: string) {
    const updated = [...meals];
    updated[mealIdx].items[itemIdx][field] = value;
    setMeals(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/trainer/diet-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        durationWeeks: parseInt(durationWeeks),
        totalCalories: totalCalories ? parseInt(totalCalories) : null,
        meals: meals.map((m) => ({
          ...m,
          calories: m.calories ? parseInt(m.calories) : null,
          protein: m.protein ? parseFloat(m.protein) : null,
          carbs: m.carbs ? parseFloat(m.carbs) : null,
          fats: m.fats ? parseFloat(m.fats) : null,
          items: m.items.filter((item) => item.food).map((item) => ({
            ...item,
            calories: item.calories ? parseInt(item.calories) : null,
          })),
        })),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create plan.");
      setLoading(false);
      return;
    }

    router.push("/trainer/diet-plans");
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/trainer/diet-plans" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Diet Plans
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Diet Plan</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Plan Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Plan Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Weight Loss Plan - Month 1" required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of this diet plan..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (weeks)</Label>
                <Input type="number" min="1" max="52" value={durationWeeks} onChange={(e) => setDurationWeeks(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Daily Calorie Target</Label>
                <Input type="number" value={totalCalories} onChange={(e) => setTotalCalories(e.target.value)} placeholder="e.g., 2000" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Meals</h2>
            <Button type="button" variant="outline" size="sm" onClick={addMeal}>
              <Plus className="h-4 w-4 mr-1" />
              Add Meal
            </Button>
          </div>

          {meals.map((meal, mealIdx) => (
            <Card key={mealIdx}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Meal {mealIdx + 1}</span>
                  {meals.length > 1 && (
                    <button type="button" onClick={() => removeMeal(mealIdx)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Meal Name *</Label>
                    <Input value={meal.name} onChange={(e) => updateMeal(mealIdx, "name", e.target.value)} placeholder="e.g., Breakfast" required />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Time</Label>
                    <Input value={meal.time} onChange={(e) => updateMeal(mealIdx, "time", e.target.value)} placeholder="e.g., 8:00 AM" />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Calories</Label>
                    <Input type="number" value={meal.calories} onChange={(e) => updateMeal(mealIdx, "calories", e.target.value)} placeholder="kcal" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Protein (g)</Label>
                    <Input type="number" value={meal.protein} onChange={(e) => updateMeal(mealIdx, "protein", e.target.value)} placeholder="g" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Carbs (g)</Label>
                    <Input type="number" value={meal.carbs} onChange={(e) => updateMeal(mealIdx, "carbs", e.target.value)} placeholder="g" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Fats (g)</Label>
                    <Input type="number" value={meal.fats} onChange={(e) => updateMeal(mealIdx, "fats", e.target.value)} placeholder="g" />
                  </div>
                </div>

                {/* Food Items */}
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">Food Items</p>
                  <div className="space-y-2">
                    {meal.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex gap-2 items-center">
                        <Input className="flex-1" value={item.food} onChange={(e) => updateItem(mealIdx, itemIdx, "food", e.target.value)} placeholder="Food name" />
                        <Input className="w-24" value={item.quantity} onChange={(e) => updateItem(mealIdx, itemIdx, "quantity", e.target.value)} placeholder="Qty" />
                        <Input className="w-20" type="number" value={item.calories} onChange={(e) => updateItem(mealIdx, itemIdx, "calories", e.target.value)} placeholder="kcal" />
                        {meal.items.length > 1 && (
                          <button type="button" onClick={() => removeItem(mealIdx, itemIdx)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addItem(mealIdx)} className="mt-2 text-xs text-green-600 hover:text-green-700 flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Add Food Item
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-3">
          <Link href="/trainer/diet-plans" className="flex-1">
            <Button type="button" variant="outline" className="w-full">Cancel</Button>
          </Link>
          <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : "Create Diet Plan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
