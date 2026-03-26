import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";

const rdOptionMap: Record<string, string> = {
  "journal-publications-applied": "Journal Publications - Applied",
  "journal-publications-published": "Journal Publications - Published",
  "book-publications-proposal-applied-proposal-sanctionaed":
    "Book Publications Proposal Applied Proposal Sanctionaed",
};

export default async function RandDOptionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title = rdOptionMap[slug];

  if (!title) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <FileText className="h-6 w-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">R&amp;D</h1>
            <p className="text-sm text-slate-500">{title}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            This section is available and ready for records.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {slug === "journal-publications-applied" ? (
              <Link
                href="/faculty/r-and-d/journal-publications-applied/submit"
                className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-[#2572ed] hover:bg-blue-700 transition-colors"
              >
                Add Record
              </Link>
            ) : null}
            <Link
              href="/activities"
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-[#2572ed] hover:bg-blue-700 transition-colors"
            >
              Back to Activities
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
