"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function OnboardingForm({ userId, userName }: { userId: string; userName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    // Step 1 - Personal
    gender: "", dateOfBirth: "", height: "", weight: "", phone: "", occupation: "",
    // Step 2 - Lifestyle
    activityLevel: "", sleepHours: "", stressLevel: "", workHoursPerDay: "",
    // Step 3 - Diet
    dietType: "", mealFrequency: "", waterIntakeLiters: "", foodAllergies: "",
    foodPreferences: "", supplementsUsed: "",
    // Step 4 - Fitness
    fitnessGoal: "", targetWeight: "", currentFitnessLevel: "",
    preferredWorkoutTime: "", gymAccess: "false",
    medicalConditions: "", injuryHistory: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    if (!form.fitnessGoal) {
      setError("Please select your fitness goal.");
      return;
    }
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
      setError("Failed to save profile. Please try again.");
      setLoading(false);
      return;
    }

    // Refresh session to update onboarded status
    await fetch("/api/auth/session");
    router.push("/trainee");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
      )}

      {/* Step 1 - Personal Details */}
      {step === 1 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">Hi {userName}! Tell us about yourself</h2>
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
                <Input type="number" name="weight" value={form.weight} onChange={handleChange} placeholder="e.g., 70" step="0.1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
              </div>
              <div className="space-y-2">
                <Label>Occupation</Label>
                <Input name="occupation" value={form.occupation} onChange={handleChange} placeholder="e.g., Software Engineer" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2 - Lifestyle */}
      {step === 2 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">Your daily lifestyle</h2>
            <div className="space-y-2">
              <Label>How active are you currently?</Label>
              <select name="activityLevel" value={form.activityLevel} onChange={handleChange} className={selectClass}>
                <option value="">Select...</option>
                <option value="SEDENTARY">Sedentary — desk job, little movement</option>
                <option value="LIGHTLY_ACTIVE">Lightly Active — light exercise 1-3 days/week</option>
                <option value="MODERATELY_ACTIVE">Moderately Active — moderate exercise 3-5 days/week</option>
                <option value="VERY_ACTIVE">Very Active — hard exercise 6-7 days/week</option>
                <option value="EXTRA_ACTIVE">Extra Active — physical job or intense daily training</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Sleep (hours/night)</Label>
                <Input type="number" name="sleepHours" value={form.sleepHours} onChange={handleChange} placeholder="e.g., 7" step="0.5" min="3" max="12" />
              </div>
              <div className="space-y-2">
                <Label>Stress Level (1-10)</Label>
                <Input type="number" name="stressLevel" value={form.stressLevel} onChange={handleChange} min="1" max="10" placeholder="5" />
              </div>
              <div className="space-y-2">
                <Label>Work Hours/Day</Label>
                <Input type="number" name="workHoursPerDay" value={form.workHoursPerDay} onChange={handleChange} placeholder="8" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 - Diet & Eating */}
      {step === 3 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">Your eating habits</h2>
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
                  <option value="TWO_MEALS">2 meals</option>
                  <option value="THREE_MEALS">3 meals</option>
                  <option value="FOUR_MEALS">4 meals</option>
                  <option value="FIVE_MEALS">5 meals</option>
                  <option value="SIX_MEALS">6 meals</option>
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
              <Textarea name="foodPreferences" value={form.foodPreferences} onChange={handleChange} placeholder="e.g., I love South Indian food, I avoid fried foods..." rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Supplements Currently Using</Label>
              <Input name="supplementsUsed" value={form.supplementsUsed} onChange={handleChange} placeholder="e.g., Whey Protein, Creatine, Multivitamin" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4 - Fitness Goals */}
      {step === 4 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">Your fitness goals</h2>
            <div className="space-y-2">
              <Label>Primary Goal *</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "WEIGHT_LOSS", label: "Weight Loss" },
                  { value: "MUSCLE_GAIN", label: "Muscle Gain" },
                  { value: "MAINTAIN_WEIGHT", label: "Maintain Weight" },
                  { value: "IMPROVE_ENDURANCE", label: "Improve Endurance" },
                  { value: "IMPROVE_FLEXIBILITY", label: "Improve Flexibility" },
                  { value: "GENERAL_FITNESS", label: "General Fitness" },
                ].map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setForm({ ...form, fitnessGoal: g.value })}
                    className={`px-4 py-3 rounded-lg border text-sm font-medium text-left transition-colors ${form.fitnessGoal === g.value ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
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
                <Label>Do you have gym access?</Label>
                <select name="gymAccess" value={form.gymAccess} onChange={handleChange} className={selectClass}>
                  <option value="true">Yes, I have gym access</option>
                  <option value="false">No, home/outdoor workouts</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Medical Conditions (if any)</Label>
              <Textarea name="medicalConditions" value={form.medicalConditions} onChange={handleChange} placeholder="e.g., Diabetes, Hypertension, Asthma..." rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Past Injuries</Label>
              <Textarea name="injuryHistory" value={form.injuryHistory} onChange={handleChange} placeholder="e.g., Knee injury in 2022, Lower back pain..." rows={2} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        {step < 4 ? (
          <Button
            type="button"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setStep(step + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            type="button"
            className="bg-green-600 hover:bg-green-700 px-8"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</>
            ) : (
              <><CheckCircle className="h-4 w-4 mr-2" />Complete Setup</>
            )}
          </Button>
        )}
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`h-2 w-2 rounded-full transition-colors ${s === step ? "bg-green-600" : s < step ? "bg-green-300" : "bg-gray-200"}`} />
        ))}
      </div>
    </div>
  );
}
