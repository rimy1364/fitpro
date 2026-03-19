import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Clock } from "lucide-react";

export default async function OnboardingPendingPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "TRAINEE") redirect("/unauthorized");
  if (session.user.onboarded) redirect("/trainee");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-yellow-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-3">Almost there!</h1>
        <p className="text-gray-600 mb-2">
          Your admin has sent you an onboarding link to complete your profile.
        </p>
        <p className="text-gray-400 text-sm">
          Check your email or contact your admin for the onboarding link. Once you complete the questionnaire, you&apos;ll have full access.
        </p>
      </div>
    </div>
  );
}
