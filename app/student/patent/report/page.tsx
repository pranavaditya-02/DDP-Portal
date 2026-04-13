"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useRoles } from "@/hooks/useRoles";

interface PatentReport {
  id: number;
  report_number?: string | null;
  student_name?: string | null;
  patent_title?: string | null;
  patent_status?: string | null;
  iqac_verification: string;
  created_at?: string | null;
}

export default function Page() {
  const [reports, setReports] = useState<PatentReport[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const roleUtils = useRoles();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const resp = await apiClient.getPatentReports();
        setReports(resp?.reports || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load patent reports.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter(r =>
      String(r.id).includes(q) ||
      (r.report_number || '').toLowerCase().includes(q) ||
      (r.student_name || '').toLowerCase().includes(q) ||
      (r.patent_title || '').toLowerCase().includes(q)
    );
  }, [reports, query]);

  const grouped = useMemo(() => ({
    initiated: filtered.filter(f => (f.iqac_verification || '').toLowerCase() === 'initiated'),
    approved: filtered.filter(f => (f.iqac_verification || '').toLowerCase() === 'approved'),
    declined: filtered.filter(f => (f.iqac_verification || '').toLowerCase() === 'declined'),
  }), [filtered]);

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Patent Report</h1>
          <p className="text-sm text-slate-400 mt-1">View and submit patent reports.</p>
        </div>

        <Link href="/student/patent/report/create" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg">
          <PlusCircle className="w-4 h-4" />
          Create Report
        </Link>
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by id, student, title" className="input-base w-full max-w-md" />
        </div>

        <div className="space-y-4 mt-6">
          {(['initiated','approved','declined'] as const).map((status) => {
            const items = grouped[status];
            const title = status === 'initiated' ? 'Initiated' : status === 'approved' ? 'Approved' : 'Declined';
            return (
              <div key={status} className="rounded-lg border border-slate-200 bg-white">
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{title}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{items.length}</span>
                  </div>
                  <div className="text-sm text-slate-500">&nbsp;</div>
                </div>

                <div className="p-4">
                  {items.length === 0 ? <div className="text-sm text-slate-500">No items.</div> : (
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left px-3 py-2">Report #</th>
                          <th className="text-left px-3 py-2">Student</th>
                          <th className="text-left px-3 py-2">Title</th>
                          <th className="text-left px-3 py-2">Patent Status</th>
                          <th className="text-left px-3 py-2">Created</th>
                          <th className="text-left px-3 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(r => (
                          <tr key={r.id} className="border-t">
                            <td className="px-3 py-2">{r.report_number ?? r.id}</td>
                            <td className="px-3 py-2">{r.student_name}</td>
                            <td className="px-3 py-2">{r.patent_title ?? '-'}</td>
                            <td className="px-3 py-2">{r.patent_status ?? '-'}</td>
                            <td className="px-3 py-2">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</td>
                            <td className="px-3 py-2"><Link href={`/student/patent/report/${r.id}`} className="text-blue-600">Details</Link></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
