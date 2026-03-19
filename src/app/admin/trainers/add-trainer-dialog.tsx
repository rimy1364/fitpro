"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as Dialog from "@radix-ui/react-dialog";

export function AddTrainerDialog({ orgId }: { orgId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/trainers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, orgId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to add trainer.");
      setLoading(false);
      return;
    }

    setForm({ name: "", email: "", password: "" });
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Trainer
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 w-full max-w-md z-50">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-1">
            Add New Trainer
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500 mb-6">
            A unique Trainer ID will be auto-generated.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input name="name" value={form.name} onChange={handleChange} placeholder="e.g., John Smith" required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="trainer@gym.com" required />
            </div>
            <div className="space-y-2">
              <Label>Temporary Password</Label>
              <Input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters" required minLength={8} />
            </div>

            <div className="flex gap-3 pt-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" className="flex-1">Cancel</Button>
              </Dialog.Close>
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Trainer"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
