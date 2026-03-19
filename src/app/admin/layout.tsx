import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");
  if (!session.user.organizationId) redirect("/unauthorized");

  const org = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="ADMIN" userName={session.user.name} orgName={org?.name} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
