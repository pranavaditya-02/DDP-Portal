import React from "react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Internship Report</h1>
          <p className="mt-2 text-slate-400">View submitted reports or create a new internship report.</p>
        </div>

        <Link
          href="/student/internship/report/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
        >
          Create Report
        </Link>
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-6 text-slate-600">
        <p className="text-sm">No reports are available yet. Use the button above to create your first internship report.</p>
      </div>
    </div>
  );
}
