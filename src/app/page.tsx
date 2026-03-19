import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Users, Dumbbell, Apple, BarChart3, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-green-600" />
            <span className="text-xl font-bold text-gray-900">FitPro</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-green-600 hover:bg-green-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <Activity className="h-4 w-4" />
          Built for Fitness Organisations
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          Manage Your Fitness<br />
          <span className="text-green-600">Organisation Smarter</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          One platform for admins, trainers, and trainees. Create personalised diet & workout plans, track progress, and grow your fitness business.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 h-12 px-8">
              Start Free Trial
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-12 px-8">
              Sign In to Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything you need to run your fitness org
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Role Cards */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Built for every role</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((r) => (
              <div key={r.role} className="bg-gray-800 rounded-xl p-6">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-4 ${r.color}`}>
                  <r.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{r.role}</h3>
                <ul className="space-y-2">
                  {r.perks.map((p) => (
                    <li key={p} className="text-gray-400 text-sm flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to transform your fitness organisation?
        </h2>
        <p className="text-gray-600 mb-8">Join hundreds of fitness professionals already using FitPro.</p>
        <Link href="/register">
          <Button size="lg" className="bg-green-600 hover:bg-green-700 h-12 px-10">
            Get Started Today
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Activity className="h-4 w-4 text-green-600" />
          <span className="font-semibold text-gray-700">FitPro</span>
        </div>
        <p>© {new Date().getFullYear()} FitPro. All rights reserved.</p>
      </footer>
    </div>
  );
}

const features = [
  { icon: Shield, title: "Multi-Tenant Admin", desc: "Each organisation has its own isolated space with a dedicated admin controlling all operations." },
  { icon: Users, title: "Trainer Management", desc: "Admins can add trainers, generate IDs, and assign trainees to specific trainers." },
  { icon: Apple, title: "Custom Diet Plans", desc: "Trainers build detailed meal-by-meal diet plans with macros, food items, and daily calorie targets." },
  { icon: Dumbbell, title: "Workout Plans", desc: "Create day-wise exercise plans with sets, reps, rest periods, and muscle group targeting." },
  { icon: BarChart3, title: "Progress Tracking", desc: "Trainees can view their assigned plans and track their fitness journey over time." },
  { icon: Activity, title: "Trainee Onboarding", desc: "Detailed intake forms capture lifestyle, eating habits, allergies, and fitness goals." },
];

const roles = [
  {
    role: "Admin",
    icon: Shield,
    color: "bg-purple-600",
    perks: ["Manage trainers & trainees", "Generate employee/client IDs", "Assign trainers to clients", "Organisation overview"],
  },
  {
    role: "Trainer",
    icon: Dumbbell,
    color: "bg-blue-600",
    perks: ["View assigned trainees", "Create diet plans", "Create exercise plans", "Assign plans to trainees"],
  },
  {
    role: "Trainee",
    icon: Users,
    color: "bg-green-600",
    perks: ["Complete intake profile", "View assigned diet plan", "View workout schedule", "Track fitness goals"],
  },
];
