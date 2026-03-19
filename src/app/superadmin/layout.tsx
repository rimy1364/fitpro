import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Settings,
  Shield,
  LogOut,
} from "lucide-react";

const nav = [
  { href: "/superadmin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/superadmin/organizations", label: "Organizations", icon: Building2 },
  { href: "/superadmin/billing", label: "Billing & Plans", icon: CreditCard },
  { href: "/superadmin/settings", label: "Platform Settings", icon: Settings },
];

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-5 w-5 text-purple-400" />
            <span className="text-white font-bold text-lg">FitPro</span>
          </div>
          <p className="text-gray-400 text-xs">Super Admin Console</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {session.user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{session.user.name}</p>
              <p className="text-gray-400 text-xs truncate">{session.user.email}</p>
            </div>
          </div>
          <Link
            href="/api/auth/signout"
            className="mt-2 flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-400 text-xs transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
