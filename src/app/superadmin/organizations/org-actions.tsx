"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function OrgActions({ orgId, isActive, plan }: { orgId: string; isActive: boolean; plan: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleStatus() {
    setLoading(true);
    await fetch(`/api/superadmin/organizations/${orgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setLoading(false);
    router.refresh();
  }

  async function upgradePlan(newPlan: string) {
    setLoading(true);
    await fetch(`/api/superadmin/organizations/${orgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: newPlan }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      ) : (
        <>
          <Button
            size="sm"
            variant="outline"
            className={`text-xs ${isActive ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}`}
            onClick={toggleStatus}
          >
            {isActive ? "Suspend" : "Activate"}
          </Button>
          <select
            value={plan}
            onChange={(e) => upgradePlan(e.target.value)}
            className="text-xs border rounded px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="FREE">Free</option>
            <option value="BASIC">Basic</option>
            <option value="PROFESSIONAL">Professional</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
        </>
      )}
    </div>
  );
}
