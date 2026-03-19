"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as Dialog from "@radix-ui/react-dialog";

export function CreateOrgDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ orgName: "", adminName: "", adminEmail: "", adminPassword: "", plan: "FREE" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/superadmin/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to create organisation.");
      return;
    }

    setOpen(false);
    setForm({ orgName: "", adminName: "", adminEmail: "", adminPassword: "", plan: "FREE" });
    router.refresh();
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" /> New Organisation
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 w-full max-w-md z-50">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-1">Create Organisation</Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500 mb-6">
            This will create a new org and its admin account.
          </Dialog.Description>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-600 bg-red-50 rounded p-3">{error}</p>}
            <div className="space-y-2">
              <Label>Organisation Name</Label>
              <Input name="orgName" value={form.orgName} onChange={handleChange} placeholder="e.g., FitZone Gym" required />
            </div>
            <div className="space-y-2">
              <Label>Admin Name</Label>
              <Input name="adminName" value={form.adminName} onChange={handleChange} placeholder="Admin full name" required />
            </div>
            <div className="space-y-2">
              <Label>Admin Email</Label>
              <Input name="adminEmail" type="email" value={form.adminEmail} onChange={handleChange} placeholder="admin@fitzone.com" required />
            </div>
            <div className="space-y-2">
              <Label>Admin Password</Label>
              <Input name="adminPassword" type="password" value={form.adminPassword} onChange={handleChange} placeholder="Min 6 characters" required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label>Subscription Plan</Label>
              <select
                name="plan"
                value={form.plan}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="FREE">Free</option>
                <option value="BASIC">Basic</option>
                <option value="PROFESSIONAL">Professional</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" className="flex-1">Cancel</Button>
              </Dialog.Close>
              <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
