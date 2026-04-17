"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, PlusCircle, Filter, ChevronDown, ChevronRight, ChevronUp, FileText, ExternalLink, User, CheckCircle, XCircle, Clipboard } from "lucide-react";
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
  iqac_verification: 'initiated' | 'approved' | 'declined';
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

const getInitials = (name = '') => {
  return name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
};

const renderStatusBadge = (status: InternshipTracker['iqac_verification']) => {
  const map: Record<string, { label: string; className: string }> = {
    initiated: { label: 'Initiated', className: 'bg-yellow-50 text-yellow-700 ring-yellow-100' },
    approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
    declined: { label: 'Declined', className: 'bg-rose-50 text-rose-700 ring-rose-100' },
  };
  const info = map[status] || { label: status, className: 'bg-slate-50 text-slate-700' };
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${info.className}`}>
      {status === 'approved' ? <CheckCircle className="w-3 h-3" /> : status === 'declined' ? <XCircle className="w-3 h-3" /> : <ChevronRight className="w-3 h-3 rotate-90" />}
      <span className="capitalize">{info.label}</span>
    </span>
  );
};

const getPeriodLabel = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '';

  const dayDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const label = `${dayDiff} day${dayDiff === 1 ? '' : 's'}`;
  return label;
};

type TrackerSortKey = "student_name" | "industry_name" | "start_date";
type SortDirection = "asc" | "desc" | null;

export default function Page() {
  const [trackers, setTrackers] = useState<InternshipTracker[]>([]);
  const [query, setQuery] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("");
  const [filterStartDateFrom, setFilterStartDateFrom] = useState("");
  const [filterStartDateTo, setFilterStartDateTo] = useState("");
  const [filterEndDateFrom, setFilterEndDateFrom] = useState("");
  const [filterEndDateTo, setFilterEndDateTo] = useState("");
  const [filterOfferLetter, setFilterOfferLetter] = useState("");
  const [filterIqacStatus, setFilterIqacStatus] = useState("");
  const [sortKey, setSortKey] = useState<TrackerSortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [perPage, setPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const computeSortIcon = (column: TrackerSortKey) => {
    if (sortKey !== column) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 inline-block h-3 w-3 text-slate-400" />
    ) : (
      <ChevronDown className="ml-1 inline-block h-3 w-3 text-slate-400" />
    );
  };

  const handleSort = (column: TrackerSortKey) => {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedTracker, setSelectedTracker] = useState<InternshipTracker | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isConfirmingReject, setIsConfirmingReject] = useState(false);
  const [sectionOpen, setSectionOpen] = useState<{
    initiated: boolean;
    approved: boolean;
    declined: boolean;
  }>({ initiated: true, approved: true, declined: true });
  const roleUtils = useRoles();
  const isVerification = roleUtils.isVerification();

  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage('Copied to clipboard');
      setTimeout(() => setCopyMessage(null), 2000);
    } catch (err) {
      setCopyMessage('Failed to copy');
      setTimeout(() => setCopyMessage(null), 2000);
    }
  };

  const normalizeErrorMessage = (error: unknown): string => {
    if (!error) return 'An unknown error occurred.';

    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'object' && error !== null) {
      const anyError = error as any;

      if (typeof anyError === 'object' && 'response' in anyError && anyError.response) {
        const responseError = anyError.response.data?.error;
        if (typeof responseError === 'string') {
          return responseError;
        }
        if (Array.isArray(responseError)) {
          return responseError.map((item) => {
            if (typeof item === 'string') return item;
            if (typeof item === 'object' && item?.message) return String(item.message);
            return JSON.stringify(item);
          }).join('; ');
        }
        if (typeof responseError === 'object' && responseError !== null) {
          return JSON.stringify(responseError);
        }
      }

      if (Array.isArray(anyError)) {
        return anyError.map((item) => (typeof item === 'string' ? item : JSON.stringify(item))).join('; ');
      }

      if (typeof anyError.message === 'string') {
        return anyError.message;
      }

      return JSON.stringify(anyError);
    }

    return String(error);
  };

  useEffect(() => {
    const loadTrackers = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getInternshipTrackers();
        setTrackers(response?.trackers || []);
      } catch (loadError: any) {
        console.error('Failed to load trackers:', loadError);
        setError(normalizeErrorMessage(loadError) || 'Failed to load internship trackers.');
      } finally {
        setLoading(false);
      }
    };

    loadTrackers();
  }, []);

  const availableIndustries = useMemo(
    () => [...new Set(trackers.map((item) => item.industry_name).filter(Boolean))].sort(),
    [trackers],
  );

  const statusCounts = useMemo(() => ({
    initiated: trackers.filter(t => t.iqac_verification === 'initiated').length,
    approved: trackers.filter(t => t.iqac_verification === 'approved').length,
    declined: trackers.filter(t => t.iqac_verification === 'declined').length,
  }), [trackers]);

  const filteredTrackers = useMemo(() => {
    let data = trackers;
    const normalized = query.trim().toLowerCase();

    if (normalized) {
      data = data.filter((item) =>
        item.tracker_number?.toString().includes(normalized) ||
        item.id.toString().includes(normalized) ||
        item.student_name.toLowerCase().includes(normalized) ||
        item.student_roll_no?.toLowerCase().includes(normalized) ||
        item.industry_name.toLowerCase().includes(normalized) ||
        item.iqac_verification.toLowerCase().includes(normalized) ||
        item.offer_letter_link?.toLowerCase().includes(normalized),
      );
    }

    if (filterIndustry) {
      data = data.filter((item) => item.industry_name === filterIndustry);
    }

    if (filterStartDateFrom) {
      data = data.filter((item) => item.start_date >= filterStartDateFrom);
    }

    if (filterStartDateTo) {
      data = data.filter((item) => item.start_date <= filterStartDateTo);
    }

    if (filterEndDateFrom) {
      data = data.filter((item) => item.end_date >= filterEndDateFrom);
    }

    if (filterEndDateTo) {
      data = data.filter((item) => item.end_date <= filterEndDateTo);
    }

    if (filterOfferLetter.trim()) {
      const normalizedOfferLetter = filterOfferLetter.trim().toLowerCase();
      data = data.filter((item) =>
        item.offer_letter_link?.toLowerCase().includes(normalizedOfferLetter),
      );
    }

    if (filterIqacStatus) {
      data = data.filter((item) => item.iqac_verification === filterIqacStatus);
    }

    if (!sortKey || !sortDirection) {
      return data;
    }

    return [...data].sort((a, b) => {
      const getValue = (item: InternshipTracker) => {
        if (sortKey === "start_date") return item.start_date;
        return String(item[sortKey] ?? "").toLowerCase();
      };

      const valueA = getValue(a);
      const valueB = getValue(b);

      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [query, trackers, filterIndustry, filterStartDateFrom, filterStartDateTo, filterEndDateFrom, filterEndDateTo, filterOfferLetter, filterIqacStatus, sortKey, sortDirection]);

  const visibleTrackers = useMemo(
    () => filteredTrackers.slice(0, perPage),
    [filteredTrackers, perPage],
  );

  const groupedTrackers = useMemo(() => ({
    initiated: visibleTrackers.filter((item) => item.iqac_verification === 'initiated'),
    approved: visibleTrackers.filter((item) => item.iqac_verification === 'approved'),
    declined: visibleTrackers.filter((item) => item.iqac_verification === 'declined'),
  }), [visibleTrackers]);

  const toggleSection = (section: keyof typeof sectionOpen) => {
    setSectionOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleUpdateStatus = async (
    tracker: InternshipTracker,
    iqac_verification: InternshipTracker['iqac_verification'],
    reject_reason?: string,
  ) => {
    try {
      setError(null);
      setUpdatingId(tracker.id);
      const response = await apiClient.updateInternshipTrackerIqac(tracker.id, iqac_verification, reject_reason);
      const updatedTracker = response?.tracker;
      if (updatedTracker) {
        setTrackers((prev) => prev.map((item) => item.id === tracker.id ? updatedTracker : item));
        setSelectedTracker(updatedTracker);
      }
      setRejectReason('');
      setIsConfirmingReject(false);
    } catch (updateError: any) {
      console.error('Failed to update IQAC status:', updateError);
      setError(normalizeErrorMessage(updateError) || 'Failed to update IQAC status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Internship Tracker</h1>
          <p className="text-sm text-slate-500 mt-1">Keep track of your student internship records.</p>

          <div className="mt-3 flex items-center gap-3 text-sm">
            <div className="inline-flex items-center gap-2">
              <span className="text-xs text-slate-400">Initiated</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">{statusCounts.initiated}</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="text-xs text-slate-400">Approved</span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">{statusCounts.approved}</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="text-xs text-slate-400">Declined</span>
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-800">{statusCounts.declined}</span>
            </div>
          </div>
        </div>

        <Link
          href="/student/internship/tracker/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-700 transition"
        >
          <PlusCircle className="w-4 h-4" />
          Create Internship
        </Link>
      </div>

      <div className="mt-5 bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3 p-4 border-b border-slate-200">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search student, roll, industry or IQAC..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:border-slate-400"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <div className="flex items-center gap-2">
              {(['', 'initiated', 'approved', 'declined'] as const).map((s) => {
                if (s === '') return (
                  <button key="all" onClick={() => setFilterIqacStatus('')} className="text-xs text-slate-500 px-2 py-1">All</button>
                );
                return (
                  <button
                    key={s}
                    onClick={() => setFilterIqacStatus(s)}
                    className={`text-xs px-2 py-1 rounded-full font-medium ${filterIqacStatus === s ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'}`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-slate-400">{filteredTrackers.length} items</span>
          </div>
        </div>

        {showFilters && (
          <div className="border-b border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-4 lg:grid-cols-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Industry
                </label>
                <select
                  value={filterIndustry}
                  onChange={(e) => setFilterIndustry(e.target.value)}
                  className="input-base w-full"
                >
                  <option value="">All industries</option>
                  {availableIndustries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Start date from
                </label>
                <input
                  type="date"
                  value={filterStartDateFrom}
                  onChange={(e) => setFilterStartDateFrom(e.target.value)}
                  className="input-base w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Start date to
                </label>
                <input
                  type="date"
                  value={filterStartDateTo}
                  onChange={(e) => setFilterStartDateTo(e.target.value)}
                  className="input-base w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  End date from
                </label>
                <input
                  type="date"
                  value={filterEndDateFrom}
                  onChange={(e) => setFilterEndDateFrom(e.target.value)}
                  className="input-base w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  End date to
                </label>
                <input
                  type="date"
                  value={filterEndDateTo}
                  onChange={(e) => setFilterEndDateTo(e.target.value)}
                  className="input-base w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Offer letter name
                </label>
                <input
                  value={filterOfferLetter}
                  onChange={(e) => setFilterOfferLetter(e.target.value)}
                  placeholder="Search file name"
                  className="input-base w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  IQAC verification
                </label>
                <select
                  value={filterIqacStatus}
                  onChange={(e) => setFilterIqacStatus(e.target.value)}
                  className="input-base w-full"
                >
                  <option value="">All statuses</option>
                  <option value="initiated">Initiated</option>
                  <option value="approved">Approved</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Per page
                </label>
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  className="input-base w-full"
                >
                  {[10, 20, 50, 100].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFilterIndustry("");
                  setFilterStartDateFrom("");
                  setFilterStartDateTo("");
                  setFilterEndDateFrom("");
                  setFilterEndDateTo("");
                  setFilterOfferLetter("");
                  setFilterIqacStatus("");
                }}
                className="btn-outline px-3 py-2"
              >
                Clear filters
              </button>
              <span className="text-xs text-slate-500">
                Showing {visibleTrackers.length} of {filteredTrackers.length} filtered results
              </span>
            </div>
          </div>
        )}

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
          <div className="space-y-4">
            {(['initiated', 'approved', 'declined'] as const).map((status) => {
              const items = groupedTrackers[status];
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
                        <div className="px-4 py-5 text-sm text-slate-500">No {title.toLowerCase()} trackers.</div>
                      ) : (
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                          <thead className="bg-slate-50 text-slate-700">
                            <tr>
                              <th className="px-4 py-3 text-left">Student</th>
                              <th className="px-4 py-3 text-left">
                                <button type="button" className="inline-flex items-center gap-1 font-medium" onClick={() => handleSort("industry_name")}>Industry{computeSortIcon("industry_name")}</button>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <button type="button" className="inline-flex items-center gap-1 font-medium" onClick={() => handleSort("start_date")}>Period{computeSortIcon("start_date")}</button>
                              </th>
                              <th className="px-4 py-3 text-left">Documents</th>
                              <th className="px-4 py-3 text-left">Status</th>
                              <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {items.map((tracker) => (
                              <tr
                                key={tracker.id}
                                className="hover:bg-slate-50 cursor-pointer"
                                onClick={() => setSelectedTracker(tracker)}
                              >
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-800 font-semibold">{getInitials(tracker.student_name)}</div>
                                    <div>
                                      <div className="font-medium text-slate-900">{tracker.student_name}</div>
                                      <div className="text-xs text-slate-500">{tracker.student_roll_no} • #{tracker.tracker_number ?? tracker.id}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3"><div className="text-sm font-medium">{tracker.industry_name}</div></td>
                                <td className="px-4 py-3">
                                  <div>{formatShortDate(tracker.start_date)} → {formatShortDate(tracker.end_date)}</div>
                                  <div className="text-xs text-slate-500">({getPeriodLabel(tracker.start_date, tracker.end_date)})</div>
                                </td>
                                <td className="px-4 py-3 space-x-3">
                                  {tracker.aim_objectives_link ? (
                                    <span className="inline-flex items-center gap-2">
                                      <a title={resolveFileUrl(tracker.aim_objectives_link)} href={resolveFileUrl(tracker.aim_objectives_link)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                                        <FileText className="w-4 h-4" />
                                        <span className="text-xs">Aim</span>
                                      </a>
                                      <button title="Copy link" type="button" onClick={(e) => { e.stopPropagation(); copyToClipboard(resolveFileUrl(tracker.aim_objectives_link)); }} className="text-slate-500 hover:text-slate-700">
                                        <Clipboard className="w-3 h-3" />
                                      </button>
                                    </span>
                                  ) : (
                                    <span className="text-xs text-slate-400">-</span>
                                  )}
                                  {tracker.offer_letter_link ? (
                                    <span className="inline-flex items-center gap-2">
                                      <a title={resolveFileUrl(tracker.offer_letter_link)} href={resolveFileUrl(tracker.offer_letter_link)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                                        <ExternalLink className="w-4 h-4" />
                                        <span className="text-xs">Offer</span>
                                      </a>
                                      <button title="Copy link" type="button" onClick={(e) => { e.stopPropagation(); copyToClipboard(resolveFileUrl(tracker.offer_letter_link)); }} className="text-slate-500 hover:text-slate-700">
                                        <Clipboard className="w-3 h-3" />
                                      </button>
                                    </span>
                                  ) : null}
                                </td>
                                <td className="px-4 py-3">{renderStatusBadge(tracker.iqac_verification)}</td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-2">
                                    <button onClick={(e)=>{e.stopPropagation(); setSelectedTracker(tracker);}} className="inline-flex items-center gap-2 rounded border border-slate-200 px-3 py-1 text-sm text-slate-700 bg-white">Details</button>
                                    {tracker.offer_letter_link ? (
                                      <a onClick={(e)=>e.stopPropagation()} href={resolveFileUrl(tracker.offer_letter_link)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded bg-slate-50 px-2 py-1 text-sm text-slate-700"><ExternalLink className="w-3 h-3"/></a>
                                    ) : null}
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
        )}
      </div>

      {selectedTracker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4" onClick={() => { setSelectedTracker(null); setIsConfirmingReject(false); setRejectReason(''); }}>
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Internship Request Details</h2>
                <p className="text-sm text-slate-500">Review the request and approve or reject it.</p>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedTracker(null); setIsConfirmingReject(false); setRejectReason(''); }}
                className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
            <div className="space-y-4 px-6 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Request ID</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedTracker.tracker_number ?? selectedTracker.id}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Student</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedTracker.student_name}</div>
                  <div className="text-sm text-slate-500">{selectedTracker.student_roll_no}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Industry</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedTracker.industry_name}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Period</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {formatShortDate(selectedTracker.start_date)} → {formatShortDate(selectedTracker.end_date)}
                  </div>
                  <div className="text-sm text-slate-500">{getPeriodLabel(selectedTracker.start_date, selectedTracker.end_date)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">IQAC status</div>
                  <div className="mt-1">
                    {renderStatusBadge(selectedTracker.iqac_verification)}
                  </div>
                  {selectedTracker.reject_reason ? (
                    <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3">
                      <div className="text-xs uppercase tracking-wide text-rose-600">Reject reason</div>
                      <div className="mt-1 text-sm text-rose-800">{selectedTracker.reject_reason}</div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Aim / Objective</div>
                  {selectedTracker.aim_objectives_link ? (
                                    <a
                      href={resolveFileUrl(selectedTracker.aim_objectives_link)}
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
                  {selectedTracker.offer_letter_link ? (
                    <a
                      href={resolveFileUrl(selectedTracker.offer_letter_link)}
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
                <div className="space-y-4">
                  {isConfirmingReject ? (
                    <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-rose-700">Reject reason</label>
                      <textarea
                        rows={4}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full rounded-xl border border-rose-200 bg-white p-3 text-sm text-slate-700 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
                        placeholder="Please explain why this internship tracker is rejected."
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
                          onClick={() => handleUpdateStatus(selectedTracker, 'declined', rejectReason.trim())}
                          disabled={updatingId === selectedTracker.id || !rejectReason.trim()}
                          className="inline-flex justify-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {updatingId === selectedTracker.id ? 'Processing...' : 'Confirm Reject'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => setIsConfirmingReject(true)}
                        disabled={updatingId === selectedTracker.id}
                        className="inline-flex justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {updatingId === selectedTracker.id ? 'Processing...' : 'Reject'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedTracker, 'approved')}
                        disabled={updatingId === selectedTracker.id}
                        className="inline-flex justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {updatingId === selectedTracker.id ? 'Processing...' : 'Approve'}
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
