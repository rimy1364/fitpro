import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./profile-form";

export default async function TraineeProfilePage() {
  const session = await auth();
  const userId = session!.user.id;

  const profile = await prisma.traineeProfile.findUnique({
    where: { userId },
  });

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">
          Complete your profile so your trainer can create the best plan for you.
        </p>
      </div>
      <ProfileForm profile={profile} userId={userId} />
    </div>
  );
}
