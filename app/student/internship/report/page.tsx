"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, ChevronUp, FileText, ExternalLink, PlusCircle, CheckCircle, XCircle } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useRoles } from "@/hooks/useRoles";

const BACKEND_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api$/, '');
interface InternshipReportSummary {
  id: number;
  report_number?: number;
  tracker_id?: number;
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

type ReportSortKey =
  | "student_name"
  | "special_lab_name"
  | "year_of_study"
  | "sector"
  | "sdg_goal_name"
  | "iqac_verification"
  | "created_at";

type SortDirection = "asc" | "desc" | null;

export default function Page() {
  const [reports, setReports] = useState<InternshipReportSummary[]>([]);
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterSector, setFilterSector] = useState('');
  const [filterYearFrom, setFilterYearFrom] = useState<number | ''>('');
  const [filterYearTo, setFilterYearTo] = useState<number | ''>('');
  const [filterSdg, setFilterSdg] = useState('');
  const [filterIqacStatus, setFilterIqacStatus] = useState('');
  const [perPage, setPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [updatingReportId, setUpdatingReportId] = useState<number | null>(null);
  const [selectedReport, setSelectedReport] = useState<InternshipReportSummary | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isConfirmingReject, setIsConfirmingReject] = useState(false);
  const [sortKey, setSortKey] = useState<ReportSortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const roleUtils = useRoles();

  const computeSortIcon = (column: ReportSortKey) => {
    if (sortKey !== column) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 inline-block h-3 w-3 text-slate-400" />
    ) : (
      <ChevronDown className="ml-1 inline-block h-3 w-3 text-slate-400" />
    );
  };

  const handleSort = (column: ReportSortKey) => {
    if (sortKey !== column) {
      setSortKey(column);
      setSortDirection("asc");
      return;
    }

    if (sortDirection === "asc") {
      setSortDirection("desc");
      return;
    }

    setSortKey(null);
    setSortDirection(null);
  };
  const isVerification = roleUtils.isVerification();

  const statusCounts = useMemo(() => ({
    initiated: reports.filter(r => (r.iqac_verification || '').toLowerCase() === 'initiated').length,
    approved: reports.filter(r => (r.iqac_verification || '').toLowerCase() === 'approved').length,
    declined: reports.filter(r => (r.iqac_verification || '').toLowerCase() === 'declined').length,
  }), [reports]);

  const availableSectors = useMemo(() => [...new Set(reports.map(r => r.sector).filter(Boolean))].sort(), [reports]);

  const renderStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      initiated: { label: 'Initiated', className: 'bg-yellow-50 text-yellow-700 ring-yellow-100' },
      approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
      declined: { label: 'Declined', className: 'bg-rose-50 text-rose-700 ring-rose-100' },
    };
    const info = map[(status || '').toLowerCase()] || { label: status || 'N/A', className: 'bg-slate-50 text-slate-700' };
    return (
      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${info.className}`}>
        <span className="capitalize">{info.label}</span>
      </span>
    );
  };

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      setError(null);
      setStatusMessage(null);
      try {
        const response = await apiClient.getInternshipReports();
        setReports(response?.reports || []);
      } catch (loadError: any) {
        console.error('Failed to load internship reports:', loadError);
        setError('Failed to load internship reports.');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const filteredReports = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    let data = reports;

    if (normalized) {
      data = data.filter((report) =>
        report.report_number?.toString().includes(normalized) ||
        report.id.toString().includes(normalized) ||
        report.student_name?.toLowerCase().includes(normalized) ||
        report.special_lab_name?.toLowerCase().includes(normalized) ||
        report.sector.toLowerCase().includes(normalized) ||
        report.sdg_goal_name?.toLowerCase().includes(normalized) ||
        (report.iqac_verification || '').toLowerCase().includes(normalized)
      );
    }

    if (filterSector) {
      data = data.filter(r => r.sector === filterSector);
    }

    if (filterYearFrom !== '') {
      data = data.filter(r => Number(r.year_of_study) >= Number(filterYearFrom));
    }

    if (filterYearTo !== '') {
      data = data.filter(r => Number(r.year_of_study) <= Number(filterYearTo));
    }

    if (filterSdg.trim()) {
      const s = filterSdg.trim().toLowerCase();
      data = data.filter(r => (r.sdg_goal_name || '').toLowerCase().includes(s));
    }

    if (filterIqacStatus) {
      data = data.filter(r => (r.iqac_verification || '').toLowerCase() === filterIqacStatus);
    }

    return data;
  }, [query, reports, filterSector, filterYearFrom, filterYearTo, filterSdg, filterIqacStatus]);

  const sortedReports = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredReports;

    return [...filteredReports].sort((a, b) => {
      const getValue = (item: InternshipReportSummary) => {
        if (sortKey === "year_of_study") return item.year_of_study;
        return String(item[sortKey] ?? "").toLowerCase();
      };

      const valueA = getValue(a);
      const valueB = getValue(b);

      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredReports, sortKey, sortDirection]);

  const visibleReports = useMemo(() => sortedReports.slice(0, perPage), [sortedReports, perPage]);

  const [sectionOpen, setSectionOpen] = useState<{ initiated: boolean; approved: boolean; declined: boolean }>({ initiated: true, approved: true, declined: true });

  const groupedReports = useMemo(() => ({
    initiated: visibleReports.filter(r => (r.iqac_verification || '').toLowerCase() === 'initiated'),
    approved: visibleReports.filter(r => (r.iqac_verification || '').toLowerCase() === 'approved'),
    declined: visibleReports.filter(r => (r.iqac_verification || '').toLowerCase() === 'declined'),
  }), [visibleReports]);

  const toggleSection = (section: keyof typeof sectionOpen) => {
    setSectionOpen(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleUpdateReportStatus = async (reportId: number, iqac_verification: 'initiated' | 'approved' | 'declined', reject_reason?: string) => {
    setError(null);
    setStatusMessage(null);
    setUpdatingReportId(reportId);

    try {
      const response = await apiClient.updateInternshipReportIqac(reportId, iqac_verification, reject_reason);
      setReports((prev) => prev.map((report) => report.id === reportId ? { ...report, iqac_verification, reject_reason: reject_reason ?? report.reject_reason } : report));
      setSelectedReport((current) => current && current.id === reportId ? { ...current, iqac_verification, reject_reason: reject_reason ?? current.reject_reason } : current);
      setStatusMessage(response?.message || `Report ${iqac_verification.toLowerCase()} successfully.`);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Internship Report</h1>
          <p className="mt-2 text-slate-400">View submitted reports or create a new internship report.</p>
        </div>

        <Link
          href="/student/internship/report/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-700 transition"
        >
          <PlusCircle className="w-4 h-4" />
          Create Report
        </Link>
      </div>

      <div className="mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-80">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID, student, lab, sector, SDG or IQAC"
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setShowFilters(prev => !prev)} className="inline-flex items-center gap-2 rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:border-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 019 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
              Filters
            </button>

            <div className="flex items-center gap-2">
              <div className="text-xs text-slate-400">Initiated</div>
              <div className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">{statusCounts.initiated}</div>
              <div className="text-xs text-slate-400">Approved</div>
              <div className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">{statusCounts.approved}</div>
              <div className="text-xs text-slate-400">Declined</div>
              <div className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-800">{statusCounts.declined}</div>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="border-b border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-4 lg:grid-cols-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Sector</label>
                <select value={filterSector} onChange={(e) => setFilterSector(e.target.value)} className="input-base w-full">
                  <option value="">All sectors</option>
                  {availableSectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Year from</label>
                <input type="number" value={filterYearFrom as any} onChange={(e) => setFilterYearFrom(e.target.value ? Number(e.target.value) : '')} className="input-base w-full" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Year to</label>
                <input type="number" value={filterYearTo as any} onChange={(e) => setFilterYearTo(e.target.value ? Number(e.target.value) : '')} className="input-base w-full" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">SDG Goal</label>
                <input value={filterSdg} onChange={(e) => setFilterSdg(e.target.value)} placeholder="Search SDG" className="input-base w-full" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">IQAC status</label>
                <select value={filterIqacStatus} onChange={(e) => setFilterIqacStatus(e.target.value)} className="input-base w-full">
                  <option value="">All statuses</option>
                  <option value="initiated">Initiated</option>
                  <option value="approved">Approved</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Per page</label>
                <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="input-base w-full">
                  {[10,20,50,100].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => { setFilterSector(''); setFilterYearFrom(''); setFilterYearTo(''); setFilterSdg(''); setFilterIqacStatus(''); }} className="btn-outline px-3 py-2">Clear filters</button>
              <span className="text-xs text-slate-500">Showing {visibleReports.length} of {filteredReports.length} filtered results</span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        {statusMessage && (
          <div className="rounded border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {statusMessage}
          </div>
        )}

        <div className="space-y-4 mt-4">
          {(['initiated', 'approved', 'declined'] as const).map((status) => {
            const items = groupedReports[status];
            const title = status === 'initiated' ? 'Initiated' : status === 'approved' ? 'Approved' : 'Declined';

            return (
              <div key={status} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <button
                  type="button"
                  onClick={() => toggleSection(status)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold text-slate-900 hover:bg-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-slate-200 text-slate-600">
                      {sectionOpen[status] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </span>
                    <span>{title}</span>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">{items.length}</span>
                  </div>
                  <span className="text-xs text-slate-500">{sectionOpen[status] ? 'Hide' : 'Show'}</span>
                </button>

                {sectionOpen[status] && (
                  <div className="overflow-x-auto bg-white px-4 pb-4">
                    {items.length === 0 ? (
                      <div className="px-4 py-5 text-sm text-slate-500">No {title.toLowerCase()} reports.</div>
                    ) : (
                      <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50 text-slate-700">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium">Report #</th>
                            <th className="px-4 py-3 text-left font-medium">Student</th>
                            <th className="px-4 py-3 text-left font-medium">Lab</th>
                            <th className="px-4 py-3 text-left font-medium">Year</th>
                            <th className="px-4 py-3 text-left font-medium">Sector</th>
                            <th className="px-4 py-3 text-left font-medium">Documents</th>
                            <th className="px-4 py-3 text-left font-medium">Created</th>
                            <th className="px-4 py-3 text-left font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {items.map((report) => (
                            <tr key={report.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedReport(report)}>
                              <td className="px-4 py-3 text-slate-700">{report.report_number ?? report.id}</td>
                              <td className="px-4 py-3">
                                <div className="font-medium text-slate-900">{report.student_name || 'Unknown'}</div>
                              </td>
                              <td className="px-4 py-3">{report.special_lab_name || 'N/A'}</td>
                              <td className="px-4 py-3">{report.year_of_study}</td>
                              <td className="px-4 py-3">{report.sector}</td>
                              <td className="px-4 py-3">
                                <div className="space-x-3">
                                  {report.full_document_proof_url ? (
                                    <a href={`${report.full_document_proof_url?.startsWith('/') ? `${BACKEND_BASE}${report.full_document_proof_url}` : report.full_document_proof_url}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                                      Proof
                                    </a>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-700">{new Date(report.created_at).toLocaleDateString()}</td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <button onClick={(e) => { e.stopPropagation(); setSelectedReport(report); }} className="inline-flex items-center gap-2 rounded border border-slate-200 px-3 py-1 text-sm text-slate-700 bg-white">Details</button>
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

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4" onClick={() => { setSelectedReport(null); setIsConfirmingReject(false); setRejectReason(''); }}>
          <div className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Internship Report Details</h2>
                <p className="text-sm text-slate-500">Review the report details and approve or reject it.</p>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedReport(null); setIsConfirmingReject(false); setRejectReason(''); }}
                className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 px-6 py-6 overflow-y-auto max-h-[70vh]">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Report ID</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.id}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Student</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.student_name || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Special Lab</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.special_lab_name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Year</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.year_of_study}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Sector</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.sector}</div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">SDG Goal</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.sdg_goal_name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">IQAC Status</div>
                  <div className="mt-1">{renderStatusBadge(selectedReport.iqac_verification)}</div>
                </div>
              </div>

              {selectedReport.reject_reason ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-rose-600">Reject reason</div>
                  <div className="mt-1 text-sm text-rose-800">{selectedReport.reject_reason}</div>
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Industry Website</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.industry_website || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Industry Contact</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.industry_contact_details || 'N/A'}</div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Address</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {selectedReport.industry_address_line_1 || 'N/A'}
                    {selectedReport.industry_address_line_2 ? `, ${selectedReport.industry_address_line_2}` : ''}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Location</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {selectedReport.city || 'N/A'}, {selectedReport.state || 'N/A'} {selectedReport.postal_code || ''}
                    {selectedReport.country ? `, ${selectedReport.country}` : ''}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Referred By</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.referred_by || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Referee</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {selectedReport.referee_name || 'N/A'}{selectedReport.referee_mobile_number ? ` • ${selectedReport.referee_mobile_number}` : ''}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Stipend Received</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.stipend_received || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Stipend Amount</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {selectedReport.stipend_amount !== undefined && selectedReport.stipend_amount !== null
                      ? (() => {
                          const amount = Number(selectedReport.stipend_amount);
                          return Number.isFinite(amount) ? `₹${amount.toFixed(2)}` : 'N/A';
                        })()
                      : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Through AICTE</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.is_through_aicte || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Claim Type</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.claim_type || 'N/A'}</div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Created</div>
                  <div className="mt-1 font-medium text-slate-900">{new Date(selectedReport.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">SDG Goal</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedReport.sdg_goal_name || 'N/A'}</div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Full Document Proof</div>
                  {selectedReport.full_document_proof_url ? (
                    <a
                      href={selectedReport.full_document_proof_url?.startsWith('/') ? `${BACKEND_BASE}${selectedReport.full_document_proof_url}` : selectedReport.full_document_proof_url}
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
                  {selectedReport.original_certificate_url ? (
                    <a
                      href={selectedReport.original_certificate_url?.startsWith('/') ? `${BACKEND_BASE}${selectedReport.original_certificate_url}` : selectedReport.original_certificate_url}
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
                  {selectedReport.attested_certificate_url ? (
                    <a
                      href={selectedReport.attested_certificate_url?.startsWith('/') ? `${BACKEND_BASE}${selectedReport.attested_certificate_url}` : selectedReport.attested_certificate_url}
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
                <div className="space-y-4">
                  {isConfirmingReject ? (
                    <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-rose-700">Reject reason</label>
                      <textarea
                        rows={4}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full rounded-xl border border-rose-200 bg-white p-3 text-sm text-slate-700 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
                        placeholder="Please explain why this internship report is rejected."
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
                          onClick={() => handleUpdateReportStatus(selectedReport.id, 'declined', rejectReason.trim())}
                          disabled={updatingReportId === selectedReport.id || !rejectReason.trim()}
                          className="inline-flex justify-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {updatingReportId === selectedReport.id ? 'Processing...' : 'Confirm Reject'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => setIsConfirmingReject(true)}
                        disabled={updatingReportId === selectedReport.id}
                        className="inline-flex justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {updatingReportId === selectedReport.id ? 'Processing...' : 'Reject'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateReportStatus(selectedReport.id, 'approved')}
                        disabled={updatingReportId === selectedReport.id}
                        className="inline-flex justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {updatingReportId === selectedReport.id ? 'Processing...' : 'Approve'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
