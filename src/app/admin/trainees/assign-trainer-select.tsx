"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Trainer {
  id: string;
  name: string;
  employeeId: string | null;
}

export function AssignTrainerSelect({
  traineeId,
  currentTrainerId,
  trainers,
}: {
  traineeId: string;
  currentTrainerId?: string;
  trainers: Trainer[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(trainerId: string) {
    setLoading(true);
    await fetch("/api/admin/assign-trainer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ traineeId, trainerId }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {loading && <Loader2 className="h-3 w-3 animate-spin text-gray-400" />}
      <select
        defaultValue={currentTrainerId || ""}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading}
        className="text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
      >
        <option value="" disabled>Assign trainer</option>
        {trainers.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name} {t.employeeId ? `(${t.employeeId})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
