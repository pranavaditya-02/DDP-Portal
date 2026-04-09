"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PlusCircle, ChevronDown, ChevronRight, ChevronUp, CheckCircle, XCircle } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useRoles } from "@/hooks/useRoles";

const BACKEND_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

interface PatentTracker {
  id: number;
  patent_number?: string | null;
  student_name: string;
  student_roll_no?: string | null;
  patent_title?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  iqac_verification: 'initiated' | 'approved' | 'declined';
}

export default function Page() {
  const [trackers, setTrackers] = useState<PatentTracker[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionOpen, setSectionOpen] = useState({ initiated: true, approved: true, declined: true });
  const roleUtils = useRoles();
  const isVerification = roleUtils.isVerification();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const resp = await apiClient.getPatentTrackers();
        setTrackers(resp?.trackers || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load patent trackers.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return trackers;
    return trackers.filter(t =>
      String(t.id).includes(q) ||
      (t.patent_number || '').toLowerCase().includes(q) ||
      (t.student_name || '').toLowerCase().includes(q) ||
      (t.student_roll_no || '').toLowerCase().includes(q) ||
      (t.patent_title || '').toLowerCase().includes(q)
    );
  }, [trackers, query]);

  const grouped = useMemo(() => ({
    initiated: filtered.filter(f => f.iqac_verification === 'initiated'),
    approved: filtered.filter(f => f.iqac_verification === 'approved'),
    declined: filtered.filter(f => f.iqac_verification === 'declined'),
  }), [filtered]);

  const toggle = (k: keyof typeof sectionOpen) => setSectionOpen(s => ({ ...s, [k]: !s[k] }));

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Patent Tracker</h1>
          <p className="text-sm text-slate-400 mt-1">View and manage patent tracker submissions.</p>
        </div>

        <Link href="/student/patent/tracker/create" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg">
          <PlusCircle className="w-4 h-4" />
          Create Tracker
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
                <button type="button" onClick={() => toggle(status)} className="w-full flex items-center justify-between px-4 py-3 text-left">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{title}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{items.length}</span>
                  </div>
                  <div className="text-sm text-slate-500">{sectionOpen[status] ? 'Hide' : 'Show'}</div>
                </button>

                {sectionOpen[status] && (
                  <div className="p-4">
                    {items.length === 0 ? <div className="text-sm text-slate-500">No items.</div> : (
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr>
                            <th className="text-left px-3 py-2">#</th>
                            <th className="text-left px-3 py-2">Student</th>
                            <th className="text-left px-3 py-2">Title</th>
                            <th className="text-left px-3 py-2">Period</th>
                            <th className="text-left px-3 py-2">Status</th>
                            <th className="text-left px-3 py-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map(item => (
                            <tr key={item.id} className="border-t">
                              <td className="px-3 py-2">{item.patent_number ?? item.id}</td>
                              <td className="px-3 py-2">{item.student_name}</td>
                              <td className="px-3 py-2">{item.patent_title ?? '-'}</td>
                              <td className="px-3 py-2">{item.start_date ? `${item.start_date?.slice(0,10)} → ${item.end_date?.slice(0,10)}` : '-'}</td>
                              <td className="px-3 py-2">
                                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs bg-slate-100">{item.iqac_verification}</span>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex gap-2">
                                  <Link href={`/student/patent/tracker/${item.id}`} className="text-sm text-blue-600">Details</Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
