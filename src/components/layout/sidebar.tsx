"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Activity,
  LayoutDashboard,
  Users,
  Dumbbell,
  Apple,
  LogOut,
  UserCheck,
  ClipboardList,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/trainers", label: "Trainers", icon: UserCheck },
  { href: "/admin/trainees", label: "Trainees", icon: Users },
];

const trainerNav: NavItem[] = [
  { href: "/trainer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trainer/trainees", label: "My Trainees", icon: Users },
  { href: "/trainer/diet-plans", label: "Diet Plans", icon: Apple },
  { href: "/trainer/exercise-plans", label: "Exercise Plans", icon: Dumbbell },
];

const traineeNav: NavItem[] = [
  { href: "/trainee", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trainee/diet-plan", label: "Diet Plan", icon: Apple },
  { href: "/trainee/exercise-plan", label: "Exercise Plan", icon: Dumbbell },
  { href: "/trainee/profile", label: "My Profile", icon: ClipboardList },
];

interface SidebarProps {
  role: "ADMIN" | "TRAINER" | "TRAINEE";
  userName: string;
  orgName?: string;
}

export function Sidebar({ role, userName, orgName }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === "ADMIN" ? adminNav : role === "TRAINER" ? trainerNav : traineeNav;

  const roleLabel = role === "ADMIN" ? "Admin" : role === "TRAINER" ? "Trainer" : "Trainee";
  const roleColor =
    role === "ADMIN"
      ? "bg-purple-100 text-purple-700"
      : role === "TRAINER"
      ? "bg-blue-100 text-blue-700"
      : "bg-green-100 text-green-700";

  return (
    <aside className="w-64 bg-white border-r flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-6 w-6 text-green-600" />
          <span className="font-bold text-lg text-gray-900">FitPro</span>
        </div>
        {orgName && <p className="text-xs text-gray-500 truncate">{orgName}</p>}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin" || item.href === "/trainer" || item.href === "/trainee"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm flex-shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
            <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", roleColor)}>
              {roleLabel}
            </span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
