import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session || session.user.role !== "TRAINEE") redirect("/login");
  if (session.user.onboarded) redirect("/trainee");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            Welcome to FitPro
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Let&apos;s set up your profile
          </h1>
          <p className="text-gray-500">
            Help your trainer understand your lifestyle, eating habits, and fitness goals.
            This takes about 3 minutes.
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["Personal", "Lifestyle", "Diet", "Fitness Goals"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </div>
                <span className="text-xs text-gray-500 hidden sm:block">{step}</span>
              </div>
              {i < 3 && <div className="w-6 h-px bg-gray-300" />}
            </div>
          ))}
        </div>

        <OnboardingForm userId={session.user.id} userName={session.user.name} />
      </div>
    </div>
  );
}
