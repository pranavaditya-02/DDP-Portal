"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { apiClient } from "@/lib/api";

interface JournalPublicationPublishedRecord {
  publication_id: number;
  faculty_name: string;
  task_id: number;
  nature_of_publication: string;
  conference_name?: string | null;
  article_title: string;
  journal_name: string;
  publisher_name?: string | null;
  publication_type?: string | null;
  impact_factor?: number | null;
  journal_h_index?: number | null;
  scientific_journal_rankings?: string | null;
  indexing?: string | null;
  indexing_others_specify?: string | null;
  sdg_goal_names?: string[];
  author_position?: string | null;
  rd_verification?: string | null;
  document_proof_path?: string | null;
  created_at: string;
}

const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
};

const statusClass = (status?: string | null) => {
  switch (status) {
    case "Approved":
      return "bg-emerald-100 text-emerald-800";
    case "Rejected":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-amber-100 text-amber-800";
  }
};

export default function JournalPublicationReportPage() {
  const [records, setRecords] = useState<JournalPublicationPublishedRecord[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getJournalPublicationsPublished();
        setRecords(response?.publications ?? []);
      } catch (err) {
        console.error(err);
        setError("Unable to load published journal publications.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filteredRecords = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return records;
    return records.filter((record) => {
      return [
        record.faculty_name,
        record.article_title,
        record.journal_name,
        record.publisher_name,
        record.publication_type,
        record.indexing,
        record.sdg_goal_names?.join(", ") ?? "",
        record.rd_verification,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term));
    });
  }, [query, records]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Journal Publication Reports</h1>
          <p className="mt-2 text-sm text-slate-500">
            View published journal publication records with SDG mappings, indexing details, and proof documents.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/student/journal-publication"
            className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition"
          >
            Back to Journal Publication
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-lg">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search faculty, journal, article, SDG or indexing..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="text-sm text-slate-500">
            {filteredRecords.length} record{filteredRecords.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="overflow-x-auto p-4">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading published journal publications...</div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-rose-600">{error}</div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">No published journal publications found.</div>
          ) : (
            <table className="min-w-full text-sm text-slate-700">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-3">Faculty</th>
                  <th className="px-3 py-3">Task ID</th>
                  <th className="px-3 py-3">Article Title</th>
                  <th className="px-3 py-3">Journal</th>
                  <th className="px-3 py-3">Publication Type</th>
                  <th className="px-3 py-3">Indexing</th>
                  <th className="px-3 py-3">SDGs</th>
                  <th className="px-3 py-3">Verification</th>
                  <th className="px-3 py-3">Created</th>
                  <th className="px-3 py-3">Proof</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => (
                  <tr key={record.publication_id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-3 py-3 whitespace-nowrap">{record.faculty_name}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{record.task_id}</td>
                    <td className="px-3 py-3 min-w-[220px]">{record.article_title}</td>
                    <td className="px-3 py-3 min-w-[180px]">{record.journal_name}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{record.publication_type ?? '-'}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {record.indexing === 'OTHERS' ? record.indexing_others_specify ?? 'OTHERS' : record.indexing ?? '-'}
                    </td>
                    <td className="px-3 py-3 min-w-[180px]">{(record.sdg_goal_names ?? []).join(', ') || '-'}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClass(record.rd_verification)}`}>
                        {record.rd_verification ?? 'Initiated'}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">{formatDate(record.created_at)}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {record.document_proof_path ? (
                        <a href={record.document_proof_path} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800">
                          View
                        </a>
                      ) : (
                        <span className="text-slate-400">No file</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
