"use client";

import Link from "next/link";
import { LayoutDashboard, TrendingUp, CalendarCheck, Trophy } from "lucide-react";
import { studentNavItems } from "@/lib/student-navigation";

const QUICK_STATS = [
  {
    label: "Activities Logged",
    value: "18",
    icon: CalendarCheck,
    accent: "bg-blue-50 text-blue-700",
  },
  {
    label: "Reports Generated",
    value: "9",
    icon: TrendingUp,
    accent: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "Awards / Recognition",
    value: "4",
    icon: Trophy,
    accent: "bg-amber-50 text-amber-700",
  },
];

export default function StudentDashboardPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 mb-3">
          <LayoutDashboard className="w-3.5 h-3.5" />
          Student Portal
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Student Dashboard</h1>
        <p className="text-sm text-slate-600 mt-2">
          Track achievements, internships, publications, competitions, and idea submissions from one place.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 sm:mb-8">
        {QUICK_STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Quick Access</h2>
        <p className="text-sm text-slate-500 mt-1">Open any student module directly.</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {studentNavItems.map((item) => (
            <Link
              key={item.slug}
              href={`/student/${item.slug}`}
              className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
