"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormState {
  dateOfBirth: string;
  gender: string;
  height: string;
  weight: string;
  phone: string;
  fitnessGoal: string;
  targetWeight: string;
  activityLevel: string;
  currentFitnessLevel: string;
  sleepHours: string;
  waterIntakeLiters: string;
  medicalConditions: string;
  injuryHistory: string;
  dietType: string;
  preferredWorkoutTime: string;
  gymAccess: boolean;
}

interface StepProps {
  form: FormState;
  set: (field: string, value: string | boolean) => void;
}

interface Trainee {
  id: string;
  name: string;
  email: string;
  employeeId: string | null;
}

interface Props {
  token: string;
  trainee: Trainee;
}

const STEPS = ["Personal Info", "Your Goals", "Current Habits", "Health & Preferences"];

const FITNESS_GOALS = [
  { value: "WEIGHT_LOSS", label: "Weight Loss" },
  { value: "MUSCLE_GAIN", label: "Muscle Gain" },
  { value: "MAINTAIN_WEIGHT", label: "Maintain Weight" },
  { value: "IMPROVE_ENDURANCE", label: "Improve Endurance" },
  { value: "IMPROVE_FLEXIBILITY", label: "Improve Flexibility" },
  { value: "GENERAL_FITNESS", label: "General Fitness" },
];

const FITNESS_LEVELS = ["Beginner", "Intermediate", "Advanced"];

const DIET_TYPES = [
  { value: "VEGETARIAN", label: "Vegetarian" },
  { value: "VEGAN", label: "Vegan" },
  { value: "NON_VEGETARIAN", label: "Non-Vegetarian" },
  { value: "EGGETARIAN", label: "Eggetarian" },
  { value: "PESCATARIAN", label: "Pescatarian" },
];

const WORKOUT_TIMES = ["Early Morning (5–7 AM)", "Morning (7–10 AM)", "Afternoon (12–3 PM)", "Evening (5–8 PM)", "Night (8–10 PM)"];

export function OnboardingForm({ token, trainee }: Props) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    // Step 1
    dateOfBirth: "",
    gender: "",
    height: "",
    weight: "",
    phone: "",
    // Step 2
    fitnessGoal: "",
    targetWeight: "",
    // Step 3
    activityLevel: "",
    currentFitnessLevel: "",
    sleepHours: "",
    waterIntakeLiters: "",
    // Step 4
    medicalConditions: "",
    injuryHistory: "",
    dietType: "",
    preferredWorkoutTime: "",
    gymAccess: false,
  });

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/onboarding/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Profile Complete!</h1>
          <p className="text-gray-500 text-lg">
            Thank you, <span className="font-semibold text-gray-700">{trainee.name}</span>!
          </p>
          <p className="text-gray-400 mt-2">Your trainer will be in touch soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border w-full max-w-lg">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-green-600">FitPro Onboarding</p>
            <p className="text-sm text-gray-400">Step {step + 1} of {STEPS.length}</p>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{STEPS[step]}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Hi {trainee.name} — let&apos;s set up your profile</p>
          {/* Progress bar */}
          <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((s, i) => (
              <span key={s} className={`text-xs ${i <= step ? "text-green-600 font-medium" : "text-gray-300"}`}>
                {s.split(" ")[0]}
              </span>
            ))}
          </div>
        </div>

        {/* Form body */}
        <div className="p-6 space-y-4">
          {step === 0 && <Step1 form={form} set={set} />}
          {step === 1 && <Step2 form={form} set={set} />}
          {step === 2 && <Step3 form={form} set={set} />}
          {step === 3 && <Step4 form={form} set={set} />}
        </div>

        {/* Error */}
        {error && (
          <div className="px-6 pb-2">
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
          </div>
        )}

        {/* Footer buttons */}
        <div className="p-6 border-t flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} className="bg-green-600 hover:bg-green-700 text-white">
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step Components ──────────────────────────────────────────────────────────

function Step1({ form, set }: StepProps) {
  return (
    <>
      <Field label="Date of Birth">
        <Input type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
      </Field>
      <Field label="Gender">
        <div className="flex gap-3">
          {["MALE", "FEMALE", "OTHER"].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => set("gender", g)}
              className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                form.gender === g ? "bg-green-600 text-white border-green-600" : "text-gray-600 hover:border-green-400"
              }`}
            >
              {g.charAt(0) + g.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Height (cm)">
          <Input type="number" placeholder="170" value={form.height} onChange={(e) => set("height", e.target.value)} />
        </Field>
        <Field label="Weight (kg)">
          <Input type="number" placeholder="70" value={form.weight} onChange={(e) => set("weight", e.target.value)} />
        </Field>
      </div>
      <Field label="Phone Number">
        <Input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
      </Field>
    </>
  );
}

function Step2({ form, set }: StepProps) {
  return (
    <>
      <Field label="Primary Fitness Goal">
        <div className="grid grid-cols-2 gap-2">
          {FITNESS_GOALS.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => set("fitnessGoal", g.value)}
              className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors text-left ${
                form.fitnessGoal === g.value
                  ? "bg-green-600 text-white border-green-600"
                  : "text-gray-600 hover:border-green-400"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Target Weight (kg)">
        <Input type="number" placeholder="65" value={form.targetWeight} onChange={(e) => set("targetWeight", e.target.value)} />
      </Field>
    </>
  );
}

function Step3({ form, set }: StepProps) {
  return (
    <>
      <Field label="Current Fitness Level">
        <div className="flex gap-3">
          {FITNESS_LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => set("currentFitnessLevel", l)}
              className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                form.currentFitnessLevel === l ? "bg-green-600 text-white border-green-600" : "text-gray-600 hover:border-green-400"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Activity Level">
        <select
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          value={form.activityLevel}
          onChange={(e) => set("activityLevel", e.target.value)}
        >
          <option value="">Select activity level</option>
          <option value="SEDENTARY">Sedentary (little or no exercise)</option>
          <option value="LIGHTLY_ACTIVE">Lightly Active (1–3 days/week)</option>
          <option value="MODERATELY_ACTIVE">Moderately Active (3–5 days/week)</option>
          <option value="VERY_ACTIVE">Very Active (6–7 days/week)</option>
          <option value="EXTRA_ACTIVE">Extra Active (physical job + training)</option>
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Sleep (hours/night)">
          <Input type="number" step="0.5" placeholder="7" value={form.sleepHours} onChange={(e) => set("sleepHours", e.target.value)} />
        </Field>
        <Field label="Water intake (litres/day)">
          <Input type="number" step="0.5" placeholder="2" value={form.waterIntakeLiters} onChange={(e) => set("waterIntakeLiters", e.target.value)} />
        </Field>
      </div>
    </>
  );
}

function Step4({ form, set }: StepProps) {
  return (
    <>
      <Field label="Any injuries or physical limitations?">
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          rows={2}
          placeholder="e.g. knee pain, lower back issues..."
          value={form.injuryHistory}
          onChange={(e) => set("injuryHistory", e.target.value)}
        />
      </Field>
      <Field label="Any medical conditions?">
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          rows={2}
          placeholder="e.g. diabetes, hypertension..."
          value={form.medicalConditions}
          onChange={(e) => set("medicalConditions", e.target.value)}
        />
      </Field>
      <Field label="Diet Type">
        <div className="grid grid-cols-2 gap-2">
          {DIET_TYPES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => set("dietType", d.value)}
              className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                form.dietType === d.value ? "bg-green-600 text-white border-green-600" : "text-gray-600 hover:border-green-400"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Preferred Workout Time">
        <select
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          value={form.preferredWorkoutTime}
          onChange={(e) => set("preferredWorkoutTime", e.target.value)}
        >
          <option value="">Select preferred time</option>
          {WORKOUT_TIMES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </Field>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="gymAccess"
          checked={form.gymAccess as boolean}
          onChange={(e) => set("gymAccess", e.target.checked)}
          className="w-4 h-4 accent-green-600"
        />
        <Label htmlFor="gymAccess" className="text-sm text-gray-700 cursor-pointer">I have access to a gym</Label>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      {children}
    </div>
  );
}
