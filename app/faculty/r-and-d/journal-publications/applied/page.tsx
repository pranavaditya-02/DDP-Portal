'use client';

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, PlusCircle, ChevronRight } from "lucide-react";

type JournalRecord = {
  id: number;
  student_name: string;
  paper_title: string;
  journal_name: string;
  date_of_publication: string;
  iqac_status: string;
  doi_number: string;
  paper_indexed: string;
};

const statusMap: Record<string, { label: string; className: string }> = {
  Initiated: { label: "Initiated", className: "bg-yellow-50 text-yellow-700" },
  Verified: { label: "Verified", className: "bg-emerald-50 text-emerald-700" },
  Rejected: { label: "Rejected", className: "bg-rose-50 text-rose-700" },
};

const formatDateShort = (value: string) => value?.slice(0, 10) || "";

export default function AppliedPage() {
  const [records, setRecords] = useState<JournalRecord[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/journal-publications");
        const data = await response.json();
        setRecords(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Unable to load applied publications.");
      } finally {
        setLoading(false);
      }
    };
    void loadRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return records.filter((record) =>
      !normalized ||
      record.student_name.toLowerCase().includes(normalized) ||
      record.paper_title.toLowerCase().includes(normalized) ||
      record.journal_name.toLowerCase().includes(normalized) ||
      record.doi_number.toLowerCase().includes(normalized) ||
      record.iqac_status.toLowerCase().includes(normalized)
    );
  }, [query, records]);

  const statusCounts = useMemo(
    () => ({
      Initiated: records.filter((item) => item.iqac_status === "Initiated").length,
      Verified: records.filter((item) => item.iqac_status === "Verified").length,
      Rejected: records.filter((item) => item.iqac_status === "Rejected").length,
    }),
    [records],
  );

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Applied Publications</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all applied journal publication records here.</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              <span className="text-xs text-slate-500">Initiated</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-800">{statusCounts.Initiated}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              <span className="text-xs text-slate-500">Verified</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-800">{statusCounts.Verified}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              <span className="text-xs text-slate-500">Rejected</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-800">{statusCounts.Rejected}</span>
            </div>
          </div>
        </div>

        <Link href="/student/journal-publication/applied/create" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-700 transition">
          <PlusCircle className="w-4 h-4" />
          Create Publication
        </Link>
      </div>

      <div className="mt-5 bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3 p-4 border-b border-slate-200">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search student, paper, journal or DOI..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>{filteredRecords.length} items</span>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading applied publications...</div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600">{error}</div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <PlusCircle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-medium text-slate-700">No applied publications found</h2>
            <p className="mt-1 text-sm text-slate-500">Click Create Publication to add a new record.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left">Student / Paper</th>
                  <th className="px-4 py-3 text-left">Journal</th>
                  <th className="px-4 py-3 text-left">Published</th>
                  <th className="px-4 py-3 text-left">Indexed</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredRecords.map((record) => {
                  const status = statusMap[record.iqac_status] || { label: record.iqac_status, className: "bg-slate-100 text-slate-700" };
                  return (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 max-w-[300px]">
                        <div className="font-medium text-slate-900 truncate">{record.paper_title}</div>
                        <div className="text-xs text-slate-500 truncate">{record.student_name}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 truncate">{record.journal_name}</td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{formatDateShort(record.date_of_publication)}</td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{record.paper_indexed}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${status.className}`}>{status.label}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/student/journal-publication/applied/${record.id}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800">
                          View <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
