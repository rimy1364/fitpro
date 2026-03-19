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

interface ExerciseItem {
  name: string;
  sets: string;
  reps: string;
  duration: string;
  rest: string;
  muscleGroup: string;
  notes: string;
}

interface WorkoutDay {
  dayNumber: string;
  dayName: string;
  exercises: ExerciseItem[];
}

const defaultExercise = (): ExerciseItem => ({
  name: "",
  sets: "",
  reps: "",
  duration: "",
  rest: "",
  muscleGroup: "",
  notes: "",
});

const defaultWorkout = (num: number): WorkoutDay => ({
  dayNumber: String(num),
  dayName: `Day ${num}`,
  exercises: [defaultExercise()],
});

export default function NewExercisePlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationWeeks, setDurationWeeks] = useState("4");
  const [daysPerWeek, setDaysPerWeek] = useState("3");
  const [workouts, setWorkouts] = useState<WorkoutDay[]>([defaultWorkout(1)]);

  function addWorkout() {
    setWorkouts([...workouts, defaultWorkout(workouts.length + 1)]);
  }

  function removeWorkout(i: number) {
    setWorkouts(workouts.filter((_, idx) => idx !== i));
  }

  function updateWorkout(i: number, field: keyof Omit<WorkoutDay, "exercises">, value: string) {
    const updated = [...workouts];
    updated[i] = { ...updated[i], [field]: value };
    setWorkouts(updated);
  }

  function addExercise(wIdx: number) {
    const updated = [...workouts];
    updated[wIdx].exercises.push(defaultExercise());
    setWorkouts(updated);
  }

  function removeExercise(wIdx: number, eIdx: number) {
    const updated = [...workouts];
    updated[wIdx].exercises = updated[wIdx].exercises.filter((_, i) => i !== eIdx);
    setWorkouts(updated);
  }

  function updateExercise(wIdx: number, eIdx: number, field: keyof ExerciseItem, value: string) {
    const updated = [...workouts];
    updated[wIdx].exercises[eIdx][field] = value;
    setWorkouts(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/trainer/exercise-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        durationWeeks: parseInt(durationWeeks),
        daysPerWeek: parseInt(daysPerWeek),
        workouts: workouts.map((w, idx) => ({
          dayNumber: parseInt(w.dayNumber) || idx + 1,
          dayName: w.dayName,
          exercises: w.exercises.filter((e) => e.name).map((e, i) => ({
            ...e,
            order: i,
            sets: e.sets ? parseInt(e.sets) : null,
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

    router.push("/trainer/exercise-plans");
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/trainer/exercise-plans" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Exercise Plans
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Exercise Plan</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
        )}

        <Card>
          <CardHeader><CardTitle className="text-base">Plan Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Plan Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Beginner Strength Training" required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Overview of this exercise plan..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (weeks)</Label>
                <Input type="number" min="1" max="52" value={durationWeeks} onChange={(e) => setDurationWeeks(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Days per Week</Label>
                <Input type="number" min="1" max="7" value={daysPerWeek} onChange={(e) => setDaysPerWeek(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Workout Days</h2>
            <Button type="button" variant="outline" size="sm" onClick={addWorkout}>
              <Plus className="h-4 w-4 mr-1" />
              Add Day
            </Button>
          </div>

          {workouts.map((workout, wIdx) => (
            <Card key={wIdx}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 flex-1">
                    <Input
                      className="w-20"
                      type="number"
                      value={workout.dayNumber}
                      onChange={(e) => updateWorkout(wIdx, "dayNumber", e.target.value)}
                      placeholder="Day #"
                    />
                    <Input
                      className="flex-1"
                      value={workout.dayName}
                      onChange={(e) => updateWorkout(wIdx, "dayName", e.target.value)}
                      placeholder="e.g., Day 1 - Chest & Triceps"
                    />
                  </div>
                  {workouts.length > 1 && (
                    <button type="button" onClick={() => removeWorkout(wIdx)} className="ml-3 text-red-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-medium text-gray-600">Exercises</p>
                  {workout.exercises.map((ex, eIdx) => (
                    <div key={eIdx} className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex gap-2 items-center">
                        <Input className="flex-1" value={ex.name} onChange={(e) => updateExercise(wIdx, eIdx, "name", e.target.value)} placeholder="Exercise name *" />
                        <Input className="w-32" value={ex.muscleGroup} onChange={(e) => updateExercise(wIdx, eIdx, "muscleGroup", e.target.value)} placeholder="Muscle group" />
                        {workout.exercises.length > 1 && (
                          <button type="button" onClick={() => removeExercise(wIdx, eIdx)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <Input value={ex.sets} onChange={(e) => updateExercise(wIdx, eIdx, "sets", e.target.value)} placeholder="Sets" type="number" />
                        <Input value={ex.reps} onChange={(e) => updateExercise(wIdx, eIdx, "reps", e.target.value)} placeholder="Reps" />
                        <Input value={ex.duration} onChange={(e) => updateExercise(wIdx, eIdx, "duration", e.target.value)} placeholder="Duration" />
                        <Input value={ex.rest} onChange={(e) => updateExercise(wIdx, eIdx, "rest", e.target.value)} placeholder="Rest" />
                      </div>
                      <Input value={ex.notes} onChange={(e) => updateExercise(wIdx, eIdx, "notes", e.target.value)} placeholder="Notes (optional)" />
                    </div>
                  ))}
                  <button type="button" onClick={() => addExercise(wIdx)} className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Add Exercise
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-3">
          <Link href="/trainer/exercise-plans" className="flex-1">
            <Button type="button" variant="outline" className="w-full">Cancel</Button>
          </Link>
          <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : "Create Exercise Plan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
