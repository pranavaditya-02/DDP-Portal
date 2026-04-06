"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, PlusCircle } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useRoles } from "@/hooks/useRoles";

interface InternshipTracker {
  id: number;
  student_name: string;
  student_roll_no?: string | null;
  industry_name: string;
  start_date: string;
  end_date: string;
  aim_objectives_link?: string | null;
  offer_letter_link?: string | null;
  iqac_verification: 'initiated' | 'inprogress' | 'completed';
}

const BACKEND_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

const formatShortDate = (value: string) => {
  if (!value) return '';
  return value.slice(0, 10);
};

const getPeriodLabel = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '';

  const dayDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const label = `${dayDiff} day${dayDiff === 1 ? '' : 's'}`;
  return label;
};

export default function Page() {
  const [trackers, setTrackers] = useState<InternshipTracker[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const roleUtils = useRoles();
  const isVerification = roleUtils.isVerification();

  useEffect(() => {
    const loadTrackers = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getInternshipTrackers();
        setTrackers(response?.trackers || []);
      } catch (loadError: any) {
        console.error('Failed to load trackers:', loadError);
        setError(loadError?.response?.data?.error || loadError?.message || 'Failed to load internship trackers.');
      } finally {
        setLoading(false);
      }
    };

    loadTrackers();
  }, []);

  const filteredTrackers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return trackers;

    return trackers.filter((item) =>
      item.student_name.toLowerCase().includes(normalized) ||
      item.student_roll_no?.toLowerCase().includes(normalized) ||
      item.industry_name.toLowerCase().includes(normalized) ||
      item.iqac_verification.toLowerCase().includes(normalized)
    );
  }, [query, trackers]);

  const getNextVerificationStatus = (status: InternshipTracker['iqac_verification']) => {
    if (status === 'initiated') return 'inprogress';
    if (status === 'inprogress') return 'completed';
    return null;
  };

  const handleUpdateStatus = async (tracker: InternshipTracker) => {
    const nextStatus = getNextVerificationStatus(tracker.iqac_verification);
    if (!nextStatus) return;

    try {
      setUpdatingId(tracker.id);
      const response = await apiClient.updateInternshipTrackerIqac(tracker.id, nextStatus);
      const updatedTracker = response?.tracker;
      if (updatedTracker) {
        setTrackers((prev) => prev.map((item) => item.id === tracker.id ? updatedTracker : item));
      }
    } catch (updateError: any) {
      console.error('Failed to update IQAC status:', updateError);
      setError(updateError?.response?.data?.error || updateError?.message || 'Failed to update IQAC status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Internship Tracker</h1>
          <p className="text-sm text-slate-500 mt-1">
            Keep track of your student internship records.
          </p>
        </div>

        <Link
          href="/student/internship/tracker/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
        >
          <PlusCircle className="w-4 h-4" />
          Create Internship Tracker
        </Link>
      </div>

      <div className="mt-5 bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3 p-4 border-b border-slate-200">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search internship trackers..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          <span className="text-xs text-slate-400">{filteredTrackers.length} items</span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading internship trackers...</div>
        ) : error ? (
          <div className="p-10 text-center text-red-600">{error}</div>
        ) : filteredTrackers.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <PlusCircle className="w-7 h-7 text-slate-400" />
            </div>
            <h2 className="text-lg font-medium text-slate-700">No Internship Trackers Yet</h2>
            <p className="mt-1 text-sm text-slate-500">
              Click on Create to add your first internship tracker record.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Industry</th>
                  <th className="px-4 py-3 text-left">Period</th>
                  <th className="px-4 py-3 text-left">IQAC</th>
                  <th className="px-4 py-3 text-left">Documents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredTrackers.map((tracker) => (
                  <tr key={tracker.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{tracker.student_name}</div>
                      <div className="text-xs text-slate-500">{tracker.student_roll_no}</div>
                    </td>
                    <td className="px-4 py-3">{tracker.industry_name}</td>
                    <td className="px-4 py-3">
                      <div>{formatShortDate(tracker.start_date)} → {formatShortDate(tracker.end_date)}</div>
                      <div className="text-xs text-slate-500">({getPeriodLabel(tracker.start_date, tracker.end_date)})</div>
                    </td>
                                  <td className="px-4 py-3">
                      <div className="capitalize">{tracker.iqac_verification.replace('inprogress', 'In Progress')}</div>
                      {isVerification && getNextVerificationStatus(tracker.iqac_verification) && (
                        <button
                          type="button"
                          className="mt-2 inline-flex items-center rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                          onClick={() => handleUpdateStatus(tracker)}
                          disabled={updatingId === tracker.id}
                        >
                          {updatingId === tracker.id
                            ? 'Updating...'
                            : `Mark ${getNextVerificationStatus(tracker.iqac_verification) === 'inprogress' ? 'In Progress' : 'Completed'}`}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 space-y-1">
                      {tracker.aim_objectives_link ? (
                        <a
                          href={`${BACKEND_BASE}${tracker.aim_objectives_link}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Aim/Objective&nbsp;&nbsp;&nbsp;
                        </a>
                      ) : (
                        <span className="text-slate-400">No file</span>
                      )}
                      {tracker.offer_letter_link ? (
                        <a
                          href={`${BACKEND_BASE}${tracker.offer_letter_link}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Offer-Letter
                        </a>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
