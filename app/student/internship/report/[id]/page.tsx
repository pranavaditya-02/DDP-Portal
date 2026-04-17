"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useRoles } from "@/hooks/useRoles";

interface InternshipReportDetail {
  id: number;
  report_number?: number;
  tracker_id: number;
  student_name?: string | null;
  special_lab_name?: string | null;
  year_of_study: number;
  sector: string;
  industry_address_line_1?: string | null;
  industry_address_line_2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  industry_website?: string | null;
  industry_contact_details?: string | null;
  referred_by?: string | null;
  referee_name?: string | null;
  referee_mobile_number?: string | null;
  stipend_received?: string | null;
  stipend_amount?: number | string;
  is_through_aicte?: string | null;
  claim_type?: string | null;
  sdg_goal_name?: string | null;
  full_document_proof_url?: string | null;
  original_certificate_url?: string | null;
  attested_certificate_url?: string | null;
  iqac_verification: string;
  reject_reason?: string | null;
  created_at: string;
}

const BACKEND_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<InternshipReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isConfirmingReject, setIsConfirmingReject] = useState(false);
  const [updatingReportId, setUpdatingReportId] = useState<number | null>(null);
  const roleUtils = useRoles();
  const isVerification = roleUtils.isVerification();

  const reportId = Number(params?.id);

  useEffect(() => {
    const loadReport = async () => {
      if (!Number.isInteger(reportId) || reportId <= 0) {
        setError('Invalid report ID');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.getInternshipReportById(reportId);
        setReport(response?.report || null);
      } catch (loadError: any) {
        console.error('Failed to load report:', loadError);
        setError(loadError?.response?.data?.error || 'Failed to load report details.');
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [reportId]);

  const handleUpdateReportStatus = async (iqac_verification: 'initiated' | 'approved' | 'declined', reject_reason?: string) => {
    if (!report) return;

    setError(null);
    setUpdatingReportId(report.id);

    try {
      const response = await apiClient.updateInternshipReportIqac(report.id, iqac_verification, reject_reason);
      const updatedReport = response?.report;
      if (updatedReport) {
        setReport(updatedReport);
      }
      setRejectReason('');
      setIsConfirmingReject(false);
    } catch (updateError: any) {
      console.error('Failed to update report status:', updateError);
      setError(updateError?.response?.data?.error || 'Failed to update report status.');
    } finally {
      setUpdatingReportId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Report Detail</h1>
          <p className="mt-1 text-slate-500">View internship report details for request {report?.report_number ?? reportId}.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <Link href="/student/internship/report" className="btn-outline px-4 py-2">
            Report list
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading report details...</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
      ) : !report ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">Report not found.</div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Report ID</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">{report.report_number ?? report.id}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Student</div>
                <div className="mt-1 font-semibold text-slate-900">{report.student_name || 'Unknown'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Special Lab</div>
                <div className="mt-1 font-semibold text-slate-900">{report.special_lab_name || 'N/A'}</div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 mt-6">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Year</div>
                <div className="mt-1 font-semibold text-slate-900">{report.year_of_study}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Sector</div>
                <div className="mt-1 font-semibold text-slate-900">{report.sector}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">IQAC Status</div>
                <div className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium capitalize text-slate-700">
                  {report.iqac_verification}
                </div>
              </div>
            </div>

            {report.reject_reason ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <div className="text-xs uppercase tracking-wide text-rose-600">Reject reason</div>
                <div className="mt-1 text-sm text-rose-800">{report.reject_reason}</div>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 mt-6">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Referred By</div>
                <div className="mt-1 font-medium text-slate-900">{report.referred_by || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Referee</div>
                <div className="mt-1 font-medium text-slate-900">
                  {report.referee_name || 'N/A'}{report.referee_mobile_number ? ` • ${report.referee_mobile_number}` : ''}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mt-6">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Industry Website</div>
                <div className="mt-1 font-medium text-slate-900">{report.industry_website || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Industry Contact</div>
                <div className="mt-1 font-medium text-slate-900">{report.industry_contact_details || 'N/A'}</div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mt-6">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Address</div>
                <div className="mt-1 font-medium text-slate-900">
                  {report.industry_address_line_1 || 'N/A'}{report.industry_address_line_2 ? `, ${report.industry_address_line_2}` : ''}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Location</div>
                <div className="mt-1 font-medium text-slate-900">
                  {report.city || 'N/A'}, {report.state || 'N/A'} {report.postal_code || ''}{report.country ? `, ${report.country}` : ''}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mt-6">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Stipend Received</div>
                <div className="mt-1 font-medium text-slate-900">{report.stipend_received || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Stipend Amount</div>
                <div className="mt-1 font-medium text-slate-900">
                  {report.stipend_amount !== undefined && report.stipend_amount !== null
                    ? (() => {
                        const amount = Number(report.stipend_amount);
                        return Number.isFinite(amount) ? `₹${amount.toFixed(2)}` : 'N/A';
                      })()
                    : 'N/A'}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mt-6">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Through AICTE</div>
                <div className="mt-1 font-medium text-slate-900">{report.is_through_aicte || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Claim Type</div>
                <div className="mt-1 font-medium text-slate-900">{report.claim_type || 'N/A'}</div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mt-6">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">SDG Goal</div>
                <div className="mt-1 font-medium text-slate-900">{report.sdg_goal_name || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Created</div>
                <div className="mt-1 font-medium text-slate-900">{new Date(report.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 mt-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Full Document Proof</div>
                {report.full_document_proof_url ? (
                  <a
                    href={report.full_document_proof_url?.startsWith('/') ? `${BACKEND_BASE}${report.full_document_proof_url}` : report.full_document_proof_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block text-sm font-medium text-blue-600 hover:underline"
                  >
                    View document
                  </a>
                ) : (
                  <div className="mt-2 text-sm text-slate-500">Not available</div>
                )}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Original Certificate</div>
                {report.original_certificate_url ? (
                  <a
                    href={report.original_certificate_url?.startsWith('/') ? `${BACKEND_BASE}${report.original_certificate_url}` : report.original_certificate_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block text-sm font-medium text-blue-600 hover:underline"
                  >
                    View document
                  </a>
                ) : (
                  <div className="mt-2 text-sm text-slate-500">Not available</div>
                )}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Attested Certificate</div>
                {report.attested_certificate_url ? (
                  <a
                    href={report.attested_certificate_url?.startsWith('/') ? `${BACKEND_BASE}${report.attested_certificate_url}` : report.attested_certificate_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block text-sm font-medium text-blue-600 hover:underline"
                  >
                    View document
                  </a>
                ) : (
                  <div className="mt-2 text-sm text-slate-500">Not available</div>
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
                      placeholder="Please explain why this report is rejected."
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
                        onClick={() => handleUpdateReportStatus('declined', rejectReason.trim())}
                        disabled={updatingReportId === report.id || !rejectReason.trim()}
                        className="inline-flex justify-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {updatingReportId === report.id ? 'Processing...' : 'Confirm Reject'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setIsConfirmingReject(true)}
                      disabled={updatingReportId === report.id}
                      className="inline-flex justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {updatingReportId === report.id ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateReportStatus('approved')}
                      disabled={updatingReportId === report.id}
                      className="inline-flex justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {updatingReportId === report.id ? 'Processing...' : 'Approve'}
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
