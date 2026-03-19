"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Upload, Download, CheckCircle, XCircle, ArrowLeft, Users, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type ImportResult = {
  name: string;
  email: string;
  employeeId?: string;
  clientId?: string;
  tempPassword: string;
};

type ImportError = { email: string; error: string };

export default function ImportPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"trainers" | "trainees">("trainers");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [done, setDone] = useState(false);

  function downloadTemplate(type: "trainers" | "trainees") {
    const headers = type === "trainers"
      ? ["name", "email", "password"]
      : ["name", "email"];
    const sample = type === "trainers"
      ? [["John Smith", "john@gym.com", "Pass@1234"], ["Jane Doe", "jane@gym.com", "Pass@5678"]]
      : [["Ravi Kumar", "ravi@example.com"], ["Priya Sharma", "priya@example.com"]];

    const csv = [headers, ...sample].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        const rows = result.data as Record<string, string>[];
        if (rows.length === 0) return;

        setLoading(true);
        setDone(false);
        setResults([]);
        setErrors([]);

        const endpoint = activeTab === "trainers"
          ? "/api/admin/import/trainers"
          : "/api/admin/import/trainees";

        const payload = activeTab === "trainers"
          ? { trainers: rows }
          : { trainees: rows };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        setResults(data.results || []);
        setErrors(data.errors || []);
        setLoading(false);
        setDone(true);
        router.refresh();
      },
    });

    // Reset input
    e.target.value = "";
  }

  function exportResults() {
    const rows = results.map((r) => [
      r.name,
      r.email,
      r.employeeId || r.clientId || "",
      r.tempPassword,
    ]);
    const headers = ["Name", "Email", "ID", "Temp Password"];
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}-credentials.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Bulk Import</h1>
        <p className="text-gray-500 mt-1">Import multiple trainers or trainees via CSV file</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setActiveTab("trainers"); setDone(false); setResults([]); setErrors([]); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "trainers" ? "bg-blue-600 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}
        >
          <UserCheck className="h-4 w-4" />
          Import Trainers
        </button>
        <button
          onClick={() => { setActiveTab("trainees"); setDone(false); setResults([]); setErrors([]); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "trainees" ? "bg-green-600 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}
        >
          <Users className="h-4 w-4" />
          Import Trainees
        </button>
      </div>

      {/* Instructions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">
            Import {activeTab === "trainers" ? "Trainers" : "Trainees"}
          </CardTitle>
          <CardDescription>
            {activeTab === "trainers"
              ? "CSV must have columns: name, email, password (optional — auto-generated if missing)"
              : "CSV must have columns: name, email — passwords and Client IDs are auto-generated"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => downloadTemplate(activeTab)}>
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
          </div>

          {/* Upload area */}
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 font-medium">Click to upload CSV file</p>
            <p className="text-xs text-gray-400 mt-1">Supports .csv files only</p>
            <input type="file" accept=".csv" className="hidden" onChange={handleFile} disabled={loading} />
          </label>

          {loading && (
            <div className="flex items-center gap-3 text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              Importing... please wait
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {done && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {results.length > 0 && (
                <Badge variant="success">{results.length} imported successfully</Badge>
              )}
              {errors.length > 0 && (
                <Badge variant="destructive">{errors.length} failed</Badge>
              )}
            </div>
            {results.length > 0 && (
              <Button size="sm" variant="outline" onClick={exportResults}>
                <Download className="h-4 w-4 mr-2" />
                Export Credentials CSV
              </Button>
            )}
          </div>

          {/* Success rows */}
          {results.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Successfully Imported
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">Name</th>
                        <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">Email</th>
                        <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">ID</th>
                        <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">Temp Password</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {results.map((r, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 font-medium text-gray-900">{r.name}</td>
                          <td className="px-3 py-2 text-gray-500">{r.email}</td>
                          <td className="px-3 py-2 font-mono text-xs text-gray-700">{r.employeeId || r.clientId}</td>
                          <td className="px-3 py-2 font-mono text-xs font-bold text-green-700">{r.tempPassword}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-orange-600 mt-3 bg-orange-50 border border-orange-100 rounded p-2">
                  Share these credentials with your {activeTab}. They must change the password after first login.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Error rows */}
          {errors.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-red-700 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Failed to Import
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {errors.map((e, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-red-50 border border-red-100 rounded px-3 py-2">
                      <span className="text-gray-700">{e.email}</span>
                      <span className="text-red-600 text-xs">{e.error}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
