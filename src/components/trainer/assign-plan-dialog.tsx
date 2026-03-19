"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import { Label } from "../ui/label";

interface Trainee {
  id: string;
  name: string;
  employeeId: string | null;
}

export function AssignPlanDialog({
  planId,
  planTitle,
  planType,
  trainees,
  preselectedTraineeId,
}: {
  planId: string;
  planTitle: string;
  planType: "diet" | "exercise";
  trainees: Trainee[];
  preselectedTraineeId?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(!!preselectedTraineeId);
  const [loading, setLoading] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState(preselectedTraineeId || "");
  const [success, setSuccess] = useState(false);

  async function handleAssign() {
    if (!selectedTrainee) return;
    setLoading(true);

    const endpoint = planType === "diet"
      ? "/api/trainer/assign-diet-plan"
      : "/api/trainer/assign-exercise-plan";

    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, traineeId: selectedTrainee }),
    });

    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      setOpen(false);
      setSuccess(false);
      router.refresh();
    }, 1500);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button size="sm" className="text-xs bg-green-600 hover:bg-green-700">
          <UserPlus className="h-3 w-3 mr-1" />
          Assign
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 w-full max-w-sm z-50">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-1">
            Assign {planType === "diet" ? "Diet" : "Exercise"} Plan
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500 mb-5">
            Assign &ldquo;{planTitle}&rdquo; to a trainee
          </Dialog.Description>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center text-green-800">
              Plan assigned successfully!
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Trainee</Label>
                <select
                  value={selectedTrainee}
                  onChange={(e) => setSelectedTrainee(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="" disabled>Choose a trainee...</option>
                  {trainees.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.employeeId ? `(${t.employeeId})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <Dialog.Close asChild>
                  <Button type="button" variant="outline" className="flex-1">Cancel</Button>
                </Dialog.Close>
                <Button
                  onClick={handleAssign}
                  disabled={!selectedTrainee || loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign"}
                </Button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
