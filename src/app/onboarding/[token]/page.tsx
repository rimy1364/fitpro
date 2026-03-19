import { OnboardingForm } from "./onboarding-form";

interface Props {
  params: { token: string };
}

export default async function OnboardingTokenPage({ params }: Props) {
  // Validate the token server-side
  const base = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/onboarding/${params.token}`, { cache: "no-store" });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: "Invalid link." }));
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Link Unavailable</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  const { trainee } = await res.json();

  return <OnboardingForm token={params.token} trainee={trainee} />;
}
