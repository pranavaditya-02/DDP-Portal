import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { getStudentItemBySlug } from "@/lib/student-navigation";

export default async function StudentModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getStudentItemBySlug(slug);

  if (!item) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1100px] mx-auto">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{item.label}</h1>
            <p className="text-sm text-slate-500">Student Module</p>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          This page is ready for {item.label.toLowerCase()} records and reporting workflows.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/student/overview"
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Open Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
