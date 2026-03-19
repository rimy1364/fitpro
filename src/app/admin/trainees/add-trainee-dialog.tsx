"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as Dialog from "@radix-ui/react-dialog";

interface Result {
  clientId: string;
  tempPassword: string;
  onboardingLink: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button onClick={copy} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export function AddTraineeDialog({ orgId }: { orgId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [form, setForm] = useState({ name: "", email: "" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/trainees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, orgId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to add trainee.");
      setLoading(false);
      return;
    }

    const onboardingLink = data.onboardingToken
      ? `${window.location.origin}/onboarding/${data.onboardingToken}`
      : "";

    setResult({ clientId: data.employeeId, tempPassword: data.tempPassword, onboardingLink });
    setLoading(false);
    router.refresh();
  }

  function handleClose() {
    setOpen(false);
    setResult(null);
    setForm({ name: "", email: "" });
    setError("");
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <Dialog.Trigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Trainee
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 w-full max-w-md z-50">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-1">
            Add New Trainee
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500 mb-6">
            An onboarding link will be generated for the trainee to fill their questionnaire.
          </Dialog.Description>

          {result ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-semibold text-green-800 mb-3">Trainee Created!</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Client ID:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-bold text-gray-900">{result.clientId}</span>
                      <CopyButton text={result.clientId} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Temp Password:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-bold text-gray-900">{result.tempPassword}</span>
                      <CopyButton text={result.tempPassword} />
                    </div>
                  </div>
                </div>
              </div>

              {result.onboardingLink && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-800 mb-2">Onboarding Link</p>
                  <p className="text-xs text-blue-600 mb-2">Share this link with the trainee to complete their questionnaire:</p>
                  <div className="flex items-center gap-2 bg-white rounded border px-2 py-1.5">
                    <span className="text-xs text-gray-600 font-mono truncate flex-1">{result.onboardingLink}</span>
                    <CopyButton text={result.onboardingLink} />
                  </div>
                  <p className="text-xs text-blue-500 mt-2">Link expires in 7 days</p>
                </div>
              )}

              <Button onClick={handleClose} className="w-full">Done</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input name="name" value={form.name} onChange={handleChange} placeholder="e.g., Jane Doe" required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="trainee@example.com" required />
              </div>

              <div className="flex gap-3 pt-2">
                <Dialog.Close asChild>
                  <Button type="button" variant="outline" className="flex-1">Cancel</Button>
                </Dialog.Close>
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Trainee"}
                </Button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
