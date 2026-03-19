"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TraineeProfile } from "@prisma/client";

interface ProfileFormProps {
  profile: TraineeProfile | null;
  userId: string;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    gender: profile?.gender || "",
    dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split("T")[0] : "",
    height: profile?.height?.toString() || "",
    weight: profile?.weight?.toString() || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
    activityLevel: profile?.activityLevel || "",
    sleepHours: profile?.sleepHours?.toString() || "",
    stressLevel: profile?.stressLevel?.toString() || "",
    occupation: profile?.occupation || "",
    workHoursPerDay: profile?.workHoursPerDay?.toString() || "",
    dietType: profile?.dietType || "",
    mealFrequency: profile?.mealFrequency || "",
    waterIntakeLiters: profile?.waterIntakeLiters?.toString() || "",
    foodAllergies: profile?.foodAllergies?.join(", ") || "",
    foodPreferences: profile?.foodPreferences || "",
    supplementsUsed: profile?.supplementsUsed || "",
    fitnessGoal: profile?.fitnessGoal || "",
    targetWeight: profile?.targetWeight?.toString() || "",
    medicalConditions: profile?.medicalConditions || "",
    injuryHistory: profile?.injuryHistory || "",
    currentFitnessLevel: profile?.currentFitnessLevel || "",
    preferredWorkoutTime: profile?.preferredWorkoutTime || "",
    gymAccess: profile?.gymAccess ? "true" : "false",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...form,
      height: form.height ? parseFloat(form.height) : null,
      weight: form.weight ? parseFloat(form.weight) : null,
      sleepHours: form.sleepHours ? parseFloat(form.sleepHours) : null,
      stressLevel: form.stressLevel ? parseInt(form.stressLevel) : null,
      workHoursPerDay: form.workHoursPerDay ? parseInt(form.workHoursPerDay) : null,
      waterIntakeLiters: form.waterIntakeLiters ? parseFloat(form.waterIntakeLiters) : null,
      targetWeight: form.targetWeight ? parseFloat(form.targetWeight) : null,
      foodAllergies: form.foodAllergies ? form.foodAllergies.split(",").map((s) => s.trim()).filter(Boolean) : [],
      gymAccess: form.gymAccess === "true",
      dateOfBirth: form.dateOfBirth || null,
    };

    const res = await fetch("/api/trainee/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save profile.");
      setLoading(false);
      return;
    }

    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 3000);
    router.refresh();
  }

  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Profile saved successfully!
        </div>
      )}

      {/* Personal */}
      <Card>
        <CardHeader><CardTitle className="text-base">Personal Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gender</Label>
              <select name="gender" value={form.gender} onChange={handleChange} className={selectClass}>
                <option value="">Select...</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input type="number" name="height" value={form.height} onChange={handleChange} placeholder="e.g., 175" />
            </div>
            <div className="space-y-2">
              <Label>Current Weight (kg)</Label>
              <Input type="number" name="weight" value={form.weight} onChange={handleChange} placeholder="e.g., 75" step="0.1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-2">
              <Label>Occupation</Label>
              <Input name="occupation" value={form.occupation} onChange={handleChange} placeholder="e.g., Software Engineer" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input name="address" value={form.address} onChange={handleChange} placeholder="Your city/area" />
          </div>
        </CardContent>
      </Card>

      {/* Lifestyle */}
      <Card>
        <CardHeader><CardTitle className="text-base">Lifestyle</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Activity Level</Label>
            <select name="activityLevel" value={form.activityLevel} onChange={handleChange} className={selectClass}>
              <option value="">Select...</option>
              <option value="SEDENTARY">Sedentary (little/no exercise)</option>
              <option value="LIGHTLY_ACTIVE">Lightly Active (1-3 days/week)</option>
              <option value="MODERATELY_ACTIVE">Moderately Active (3-5 days/week)</option>
              <option value="VERY_ACTIVE">Very Active (6-7 days/week)</option>
              <option value="EXTRA_ACTIVE">Extra Active (physical job)</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Sleep Hours/Night</Label>
              <Input type="number" name="sleepHours" value={form.sleepHours} onChange={handleChange} placeholder="e.g., 7" step="0.5" />
            </div>
            <div className="space-y-2">
              <Label>Stress Level (1-10)</Label>
              <Input type="number" name="stressLevel" value={form.stressLevel} onChange={handleChange} min="1" max="10" placeholder="e.g., 5" />
            </div>
            <div className="space-y-2">
              <Label>Work Hours/Day</Label>
              <Input type="number" name="workHoursPerDay" value={form.workHoursPerDay} onChange={handleChange} placeholder="e.g., 8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Eating Habits */}
      <Card>
        <CardHeader><CardTitle className="text-base">Eating Habits</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Diet Type</Label>
              <select name="dietType" value={form.dietType} onChange={handleChange} className={selectClass}>
                <option value="">Select...</option>
                <option value="VEGETARIAN">Vegetarian</option>
                <option value="VEGAN">Vegan</option>
                <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                <option value="EGGETARIAN">Eggetarian</option>
                <option value="PESCATARIAN">Pescatarian</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Meals per Day</Label>
              <select name="mealFrequency" value={form.mealFrequency} onChange={handleChange} className={selectClass}>
                <option value="">Select...</option>
                <option value="TWO_MEALS">2 Meals</option>
                <option value="THREE_MEALS">3 Meals</option>
                <option value="FOUR_MEALS">4 Meals</option>
                <option value="FIVE_MEALS">5 Meals</option>
                <option value="SIX_MEALS">6 Meals</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Daily Water Intake (litres)</Label>
            <Input type="number" name="waterIntakeLiters" value={form.waterIntakeLiters} onChange={handleChange} placeholder="e.g., 2.5" step="0.5" />
          </div>
          <div className="space-y-2">
            <Label>Food Allergies (comma separated)</Label>
            <Input name="foodAllergies" value={form.foodAllergies} onChange={handleChange} placeholder="e.g., Nuts, Dairy, Gluten" />
          </div>
          <div className="space-y-2">
            <Label>Food Preferences / Dislikes</Label>
            <Textarea name="foodPreferences" value={form.foodPreferences} onChange={handleChange} placeholder="e.g., I love spicy food, I dislike seafood..." />
          </div>
          <div className="space-y-2">
            <Label>Supplements Currently Used</Label>
            <Input name="supplementsUsed" value={form.supplementsUsed} onChange={handleChange} placeholder="e.g., Whey protein, Creatine, Multivitamin" />
          </div>
        </CardContent>
      </Card>

      {/* Fitness Goals */}
      <Card>
        <CardHeader><CardTitle className="text-base">Fitness Goals</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Primary Fitness Goal</Label>
            <select name="fitnessGoal" value={form.fitnessGoal} onChange={handleChange} className={selectClass}>
              <option value="">Select...</option>
              <option value="WEIGHT_LOSS">Weight Loss</option>
              <option value="MUSCLE_GAIN">Muscle Gain</option>
              <option value="MAINTAIN_WEIGHT">Maintain Weight</option>
              <option value="IMPROVE_ENDURANCE">Improve Endurance</option>
              <option value="IMPROVE_FLEXIBILITY">Improve Flexibility</option>
              <option value="GENERAL_FITNESS">General Fitness</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target Weight (kg)</Label>
              <Input type="number" name="targetWeight" value={form.targetWeight} onChange={handleChange} placeholder="e.g., 65" step="0.1" />
            </div>
            <div className="space-y-2">
              <Label>Current Fitness Level</Label>
              <select name="currentFitnessLevel" value={form.currentFitnessLevel} onChange={handleChange} className={selectClass}>
                <option value="">Select...</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preferred Workout Time</Label>
              <select name="preferredWorkoutTime" value={form.preferredWorkoutTime} onChange={handleChange} className={selectClass}>
                <option value="">Select...</option>
                <option value="Early Morning (5-7 AM)">Early Morning (5-7 AM)</option>
                <option value="Morning (7-10 AM)">Morning (7-10 AM)</option>
                <option value="Afternoon (12-3 PM)">Afternoon (12-3 PM)</option>
                <option value="Evening (5-8 PM)">Evening (5-8 PM)</option>
                <option value="Night (8-11 PM)">Night (8-11 PM)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Gym Access</Label>
              <select name="gymAccess" value={form.gymAccess} onChange={handleChange} className={selectClass}>
                <option value="true">Yes, I have gym access</option>
                <option value="false">No, home/outdoor workouts</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Medical Conditions (if any)</Label>
            <Textarea name="medicalConditions" value={form.medicalConditions} onChange={handleChange} placeholder="e.g., Diabetes, Hypertension, Asthma..." />
          </div>
          <div className="space-y-2">
            <Label>Injury History</Label>
            <Textarea name="injuryHistory" value={form.injuryHistory} onChange={handleChange} placeholder="e.g., Previous knee injury in 2022..." />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 h-11" disabled={loading}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : "Save Profile"}
      </Button>
    </form>
  );
}
