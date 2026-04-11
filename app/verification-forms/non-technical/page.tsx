'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useRoles } from '@/hooks/useRoles';
import toast from 'react-hot-toast';
import {
  Search,
  ChevronUp,
  ChevronDown,
  Eye,
  X,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface NonTechnicalEvent {
  id: number;
  student_id: number;
  student_name: string;
  event_name: string;
  event_type: string;
  event_level: string;
  organizer_name: string;
  participation_mode: string;
  iqac_verification: 'Initiated' | 'Approved' | 'Rejected';
  iqac_rejection_remarks?: string;
  created_at: string;
}

type SortKey = 'student_name' | 'event_name' | 'event_type' | 'event_level' | 'iqac_verification' | 'created_at';
type SortDirection = 'asc' | 'desc' | null;

export default function NonTechnicalVerificationPage() {
  const { isVerification } = useRoles();
  const [records, setRecords] = useState<NonTechnicalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedRecord, setSelectedRecord] = useState<NonTechnicalEvent | null>(null);
  const [isConfirmingReject, setIsConfirmingReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [updatingRecordId, setUpdatingRecordId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Check authorization
  useEffect(() => {
    if (!isVerification()) {
      window.location.href = '/dashboard';
    }
  }, [isVerification]);

  // Fetch records
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/student-non-technical?page=1&limit=1000');
        setRecords(response.records || []);
      } catch (error) {
        console.error('Failed to fetch records:', error);
        toast.error('Failed to load non-technical event records');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  // Filter records
  const filteredRecords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return records.filter((record) => {
      if (!normalized) return true;
      return (
        record.id?.toString().includes(normalized) ||
        record.student_name?.toLowerCase().includes(normalized) ||
        record.event_name?.toLowerCase().includes(normalized) ||
        record.event_type?.toLowerCase().includes(normalized) ||
        record.event_level?.toLowerCase().includes(normalized) ||
        record.iqac_verification?.toLowerCase().includes(normalized)
      );
    });
  }, [query, records]);

  // Sort records
  const sortedRecords = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredRecords;

    const sorted = [...filteredRecords];
    sorted.sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];

      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredRecords, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const computeSortIcon = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-1 inline-block h-3 w-3" />
    ) : (
      <ChevronDown className="ml-1 inline-block h-3 w-3" />
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
            <AlertCircle className="h-3 w-3" />
            Initiated
          </span>
        );
    }
  };

  const handleUpdateStatus = async (id: number, status: 'Approved' | 'Rejected', reason?: string) => {
    try {
      setUpdatingRecordId(id);
      const payload: any = { iqacVerification: status };
      if (reason) {
        payload.iqacRejectionRemarks = reason;
      }

      await apiClient.put(`/student-non-technical/${id}/iqac-status`, payload);

      // Update local state
      setRecords((prev) =>
        prev.map((record) =>
          record.id === id
            ? {
                ...record,
                iqac_verification: status,
                iqac_rejection_remarks: reason,
              }
            : record
        )
      );

      setStatusMessage(`Record ${status.toLowerCase()} successfully!`);
      setTimeout(() => setStatusMessage(''), 3000);
      setSelectedRecord(null);
      setIsConfirmingReject(false);
      setRejectReason('');
      toast.success(`Record ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update record status');
    } finally {
      setUpdatingRecordId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Non-Technical Events - IQAC Verification</h1>
          <p className="text-slate-600">Review and approve/reject non-technical event submissions</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, student, event, type, level or status..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            {statusMessage}
          </div>
        )}

        {/* Table */}
        <div className="mb-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-500 whitespace-nowrap">ID</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => handleSort('student_name')}
                  >
                    Student
                    {computeSortIcon('student_name')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => handleSort('event_name')}
                  >
                    Event
                    {computeSortIcon('event_name')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => handleSort('event_type')}
                  >
                    Type
                    {computeSortIcon('event_type')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => handleSort('event_level')}
                  >
                    Level
                    {computeSortIcon('event_level')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => handleSort('iqac_verification')}
                  >
                    Status
                    {computeSortIcon('iqac_verification')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => handleSort('created_at')}
                  >
                    Submitted
                    {computeSortIcon('created_at')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    Loading records...
                  </td>
                </tr>
              ) : sortedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No records found.
                  </td>
                </tr>
              ) : (
                sortedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700 font-medium">{record.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">{record.student_name || 'N/A'}</td>
                    <td className="px-4 py-3 text-slate-700">{record.event_name || 'N/A'}</td>
                    <td className="px-4 py-3 text-slate-700">{record.event_type || 'N/A'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">{record.event_level || 'N/A'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(record.iqac_verification)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                      {new Date(record.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors text-sm font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4"
          onClick={() => {
            setSelectedRecord(null);
            setIsConfirmingReject(false);
            setRejectReason('');
          }}
        >
          <div
            className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Non-Technical Event Details</h2>
                <p className="text-sm text-slate-500">Review the submission and approve or reject it.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedRecord(null);
                  setIsConfirmingReject(false);
                  setRejectReason('');
                }}
                className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 px-6 py-6 overflow-y-auto max-h-[70vh]">
              {/* Basic Information */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Submission ID</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedRecord.id}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Student Name</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedRecord.student_name || 'N/A'}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Event Name</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedRecord.event_name || 'N/A'}</div>
                </div>
              </div>

              {/* Event Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Event Type</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedRecord.event_type || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Event Level</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedRecord.event_level || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Organizer</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedRecord.organizer_name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Participation Mode</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedRecord.participation_mode || 'N/A'}</div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Submitted On</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {new Date(selectedRecord.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">IQAC Status</div>
                  <div className="mt-1">{getStatusBadge(selectedRecord.iqac_verification)}</div>
                </div>
              </div>

              {/* Rejection Reason (if rejected) */}
              {selectedRecord.iqac_rejection_remarks && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-rose-600">Rejection Reason</div>
                  <div className="mt-1 text-sm text-rose-800">{selectedRecord.iqac_rejection_remarks}</div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedRecord.iqac_verification === 'Initiated' && (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  {isConfirmingReject ? (
                    <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-rose-700">
                        Rejection Reason
                      </label>
                      <textarea
                        rows={4}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full rounded-xl border border-rose-200 bg-white p-3 text-sm text-slate-700 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
                        placeholder="Please explain why this event is rejected."
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
                          onClick={() =>
                            handleUpdateStatus(selectedRecord.id, 'Rejected', rejectReason.trim())
                          }
                          disabled={updatingRecordId === selectedRecord.id || !rejectReason.trim()}
                          className="inline-flex justify-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {updatingRecordId === selectedRecord.id ? 'Processing...' : 'Confirm Reject'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => setIsConfirmingReject(true)}
                        disabled={updatingRecordId === selectedRecord.id}
                        className="inline-flex justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {updatingRecordId === selectedRecord.id ? 'Processing...' : 'Reject'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedRecord.id, 'Approved')}
                        disabled={updatingRecordId === selectedRecord.id}
                        className="inline-flex justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {updatingRecordId === selectedRecord.id ? 'Processing...' : 'Approve'}
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
