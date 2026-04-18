"use client";

import Link from "next/link";
import { studentNavItems } from "@/lib/student-navigation";

export default function StudentOverviewPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Student Overview</h1>
        <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
          This overview centralizes student-focused academic and co-curricular tracking modules including achievements,
          competitions, internship progress, publications, and career planning.
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {studentNavItems.map((item) => (
            <Link
              key={item.slug}
              href={`/student/${item.slug}`}
              prefetch={false}
              className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
