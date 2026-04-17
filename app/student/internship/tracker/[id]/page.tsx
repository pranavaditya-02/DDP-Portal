"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useRoles } from "@/hooks/useRoles";

interface InternshipTracker {
  id: number;
  tracker_number?: number;
  student_name: string;
  student_roll_no?: string | null;
  industry_name: string;
  start_date: string;
  end_date: string;
  aim_objectives_link?: string | null;
  offer_letter_link?: string | null;
  iqac_verification: "initiated" | "approved" | "declined";
  reject_reason?: string | null;
}

const BACKEND_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

const resolveFileUrl = (p?: string | null) => {
  if (!p) return '';
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  if (p.startsWith('/')) return `${BACKEND_BASE}${p}`;
  return `${BACKEND_BASE}/${p}`;
};

const formatShortDate = (value: string) => {
  if (!value) return '';
  return value.slice(0, 10);
};

const getPeriodLabel = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '';

  const dayDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return `${dayDiff} day${dayDiff === 1 ? '' : 's'}`;
};

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const [tracker, setTracker] = useState<InternshipTracker | null>(null);
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
        const response = await apiClient.getInternshipTrackerById(trackerId);
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

  const handleUpdateStatus = async (iqac_verification: InternshipTracker['iqac_verification'], reject_reason?: string) => {
    if (!tracker) return;

    setError(null);
    setUpdatingId(tracker.id);

    try {
      const response = await apiClient.updateInternshipTrackerIqac(tracker.id, iqac_verification, reject_reason);
      const updated = response?.tracker;
      if (updated) {
        setTracker(updated);
      }
      setRejectReason('');
      setIsConfirmingReject(false);
    } catch (updateError: any) {
      console.error('Failed to update tracker status:', updateError);
      setError(updateError?.response?.data?.error || 'Failed to update tracker status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Tracker Detail</h1>
          <p className="mt-1 text-slate-500">View internship tracker details for request {tracker?.tracker_number ?? trackerId}.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <Link href="/student/internship/tracker" className="btn-outline px-4 py-2">
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
                <div className="text-xs uppercase tracking-wide text-slate-500">Request ID</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">{tracker.tracker_number ?? tracker.id}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Student</div>
                <div className="mt-1 font-semibold text-slate-900">{tracker.student_name}</div>
                <div className="text-sm text-slate-500">{tracker.student_roll_no}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Industry</div>
                <div className="mt-1 font-semibold text-slate-900">{tracker.industry_name}</div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 mt-6">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Period</div>
                <div className="mt-1 font-semibold text-slate-900">{formatShortDate(tracker.start_date)} → {formatShortDate(tracker.end_date)}</div>
                <div className="text-sm text-slate-500">{getPeriodLabel(tracker.start_date, tracker.end_date)}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">IQAC Status</div>
                <div className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium capitalize text-slate-700">
                  {tracker.iqac_verification}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Reject reason</div>
                <div className="mt-1 text-sm text-slate-700">{tracker.reject_reason || 'N/A'}</div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mt-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Aim / Objective</div>
                {tracker.aim_objectives_link ? (
                  <a
                    href={resolveFileUrl(tracker.aim_objectives_link)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block text-sm font-medium text-blue-600 hover:underline"
                  >
                    View Aim / Objective
                  </a>
                ) : (
                  <div className="mt-2 text-sm text-slate-500">No document uploaded.</div>
                )}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Offer Letter</div>
                {tracker.offer_letter_link ? (
                  <a
                    href={resolveFileUrl(tracker.offer_letter_link)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block text-sm font-medium text-blue-600 hover:underline"
                  >
                    View Offer Letter
                  </a>
                ) : (
                  <div className="mt-2 text-sm text-slate-500">No document uploaded.</div>
                )}
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
