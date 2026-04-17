"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useRoles } from "@/hooks/useRoles";

const BACKEND_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api$/, '');
const resolveFileUrl = (p?: string | null) => {
  if (!p) return '';
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  if (p.startsWith('/')) return `${BACKEND_BASE}${p}`;
  return `${BACKEND_BASE}/${p}`;
};

interface PatentTracker {
  id: number;
  student_name: string;
  student_roll_no?: string | null;
  patent_contribution?: string | null;
  patent_title?: string | null;
  applicants_involved?: string | null;
  faculty_id?: string | null;
  patent_type?: string | null;
  has_image_layout_support?: string | null;
  experimentation_file_path?: string | null;
  has_formatted_drawings?: string | null;
  drawings_file_path?: string | null;
  forms_1_and_2_prepared?: string | null;
  forms_file_path?: string | null;
  iqac_verification?: string | null;
  reject_reason?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

const formatShortDate = (value?: string | null) => {
  if (!value) return '';
  return value.slice(0, 10);
};

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const [tracker, setTracker] = useState<PatentTracker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isConfirmingReject, setIsConfirmingReject] = useState(false);
  const roleUtils = useRoles();
  const isVerification = roleUtils.isVerification();

  const trackerId = Number(params?.id);

  useEffect(() => {
    const loadTracker = async () => {
      if (!Number.isInteger(trackerId) || trackerId <= 0) {
        setError('Invalid tracker ID');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.getPatentTrackerById(trackerId);
        setTracker(response?.tracker ?? null);
      } catch (loadError: any) {
        console.error('Failed to load tracker:', loadError);
        setError(loadError?.response?.data?.error || 'Failed to load tracker details.');
      } finally {
        setLoading(false);
      }
    };

    loadTracker();
  }, [trackerId]);

  const handleUpdateStatus = async (iqac_verification: 'initiated' | 'approved' | 'declined', reason?: string) => {
    if (!tracker) return;
    setError(null);
    setUpdatingId(tracker.id);

    try {
      const resp = await apiClient.updatePatentTrackerIqac(tracker.id, iqac_verification, reason);
      const updated = resp?.tracker;
      if (updated) setTracker(updated);
      setRejectReason('');
      setIsConfirmingReject(false);
    } catch (err: any) {
      console.error('Failed to update tracker status:', err);
      setError(err?.response?.data?.error || 'Failed to update tracker status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Patent Tracker Detail</h1>
          <p className="mt-1 text-slate-500">View patent tracker details for ID {trackerId}.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <Link href="/student/patent/tracker" className="btn-outline px-4 py-2">
            Tracker list
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading tracker details...</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
      ) : !tracker ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">Tracker not found.</div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Tracker ID</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">{tracker.id}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Student</div>
                <div className="mt-1 font-semibold text-slate-900">{tracker.student_name}</div>
                <div className="text-sm text-slate-500">{tracker.student_roll_no}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Contribution</div>
                <div className="mt-1 font-semibold text-slate-900">{tracker.patent_contribution || 'N/A'}</div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 mt-6">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Applicants Involved</div>
                <div className="mt-1 font-semibold text-slate-900">{tracker.applicants_involved || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Patent Type</div>
                <div className="mt-1 font-semibold text-slate-900">{tracker.patent_type || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Faculty</div>
                <div className="mt-1 font-semibold text-slate-900">{tracker.faculty_id || 'N/A'}</div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 mt-6">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Experimentation File</div>
                {tracker.experimentation_file_path ? (
                  <a href={resolveFileUrl(tracker.experimentation_file_path)} target="_blank" rel="noreferrer" className="mt-2 block text-sm font-medium text-blue-600 hover:underline">View</a>
                ) : (
                  <div className="mt-2 text-sm text-slate-500">No document uploaded.</div>
                )}
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Drawings</div>
                {tracker.drawings_file_path ? (
                  <a href={resolveFileUrl(tracker.drawings_file_path)} target="_blank" rel="noreferrer" className="mt-2 block text-sm font-medium text-blue-600 hover:underline">View</a>
                ) : (
                  <div className="mt-2 text-sm text-slate-500">No document uploaded.</div>
                )}
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Forms</div>
                {tracker.forms_file_path ? (
                  <a href={resolveFileUrl(tracker.forms_file_path)} target="_blank" rel="noreferrer" className="mt-2 block text-sm font-medium text-blue-600 hover:underline">View</a>
                ) : (
                  <div className="mt-2 text-sm text-slate-500">No document uploaded.</div>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 mt-6">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">IQAC Status</div>
                <div className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium capitalize text-slate-700">{tracker.iqac_verification || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Reject reason</div>
                <div className="mt-1 text-sm text-slate-700">{tracker.reject_reason || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Timestamps</div>
                <div className="mt-1 text-sm text-slate-700">Created: {formatShortDate(tracker.created_at)} • Updated: {formatShortDate(tracker.updated_at)}</div>
              </div>
            </div>

            {isVerification && (
              <div className="mt-6 space-y-4">
                {isConfirmingReject ? (
                  <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-rose-700">Reject reason</label>
                    <textarea
                      rows={4}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full rounded-xl border border-rose-200 bg-white p-3 text-sm text-slate-700 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
                      placeholder="Please explain why this tracker is rejected."
                    />
                    <div className="flex flex-wrap gap-3 sm:justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setIsConfirmingReject(false);
                          setRejectReason('');
                        }}
                        className="inline-flex justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus('declined', rejectReason.trim())}
                        disabled={updatingId === tracker.id || !rejectReason.trim()}
                        className="inline-flex justify-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {updatingId === tracker.id ? 'Processing...' : 'Confirm Reject'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setIsConfirmingReject(true)}
                      disabled={updatingId === tracker.id}
                      className="inline-flex justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {updatingId === tracker.id ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus('approved')}
                      disabled={updatingId === tracker.id}
                      className="inline-flex justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {updatingId === tracker.id ? 'Processing...' : 'Approve'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
