'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
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
  Plus,
  Trash2,
  Download,
  FileText,
  Award,
} from 'lucide-react';

interface PaperPresentation {
  id: number;
  studentId: string;
  studentName: string;
  paperTitle: string;
  conferenceName?: string;
  eventLevel?: string;
  eventMode?: string;
  eventStartDate: string;
  eventEndDate: string;
  sponsorshipType?: string;
  status: 'participated' | 'winner';
  iqacVerification: 'initiated' | 'approved' | 'rejected';
  createdAt: string;
  imageProofPath?: string;
  abstractProofPath?: string;
  certificateProofPath?: string;
  attestedCertificatePath?: string;
}

type SortKey = 'studentName' | 'paperTitle' | 'eventLevel' | 'iqacVerification' | 'createdAt';
type SortDirection = 'asc' | 'desc' | null;

const BACKEND_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

export default function PaperPresentationPage() {
  const [records, setRecords] = useState<PaperPresentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedRecord, setSelectedRecord] = useState<PaperPresentation | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch records
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/student-paper-presentations?page=1&limit=1000');
        setRecords(response.records || []);
      } catch (error) {
        console.error('Failed to fetch records:', error);
        toast.error('Failed to load records');
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
        record.studentName?.toLowerCase().includes(normalized) ||
        record.paperTitle?.toLowerCase().includes(normalized) ||
        record.conferenceName?.toLowerCase().includes(normalized) ||
        record.eventLevel?.toLowerCase().includes(normalized) ||
        record.iqacVerification?.toLowerCase().includes(normalized)
      );
    });
  }, [query, records]);

  // Sort records
  const sortedRecords = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredRecords;

    const sorted = [...filteredRecords];
    sorted.sort((a, b) => {
      let aValue = a[sortKey as keyof PaperPresentation];
      let bValue = b[sortKey as keyof PaperPresentation];

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
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </span>
        );
      case 'rejected':
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

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      setDeletingId(id);
      await apiClient.delete(`/student-paper-presentations/${id}`);
      setRecords((prev) => prev.filter((record) => record.id !== id));
      toast.success('Record deleted successfully');
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete record');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Paper Presentations</h1>
            <p className="text-slate-600">Manage your paper presentation submissions</p>
          </div>
          <Link
            href="/student/paper-presentation/submit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            <Plus className="h-5 w-5" />
            Add Record
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, student, paper, conference, level or IQAC status..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

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
                    onClick={() => handleSort('studentName')}
                  >
                    Student
                    {computeSortIcon('studentName')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => handleSort('paperTitle')}
                  >
                    Paper Title
                    {computeSortIcon('paperTitle')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => handleSort('eventLevel')}
                  >
                    Level
                    {computeSortIcon('eventLevel')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left bg-amber-50 font-semibold text-amber-900">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => handleSort('iqacVerification')}
                  >
                    IQAC Status
                    {computeSortIcon('iqacVerification')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => handleSort('createdAt')}
                  >
                    Submitted
                    {computeSortIcon('createdAt')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Loading records...
                  </td>
                </tr>
              ) : sortedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No records found.
                  </td>
                </tr>
              ) : (
                sortedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700 font-medium">{record.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">{record.studentName || 'N/A'}</td>
                    <td className="px-4 py-3 text-slate-700">{record.paperTitle || 'N/A'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">{record.eventLevel || 'N/A'}</td>
                    <td className="px-4 py-3 whitespace-nowrap bg-amber-50">{getStatusBadge(record.iqacVerification)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors text-sm font-medium"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          disabled={deletingId === record.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Paper Presentation Details</h2>
                <p className="text-sm text-slate-500">View the submission details</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
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
                  <div className="mt-1 font-medium text-slate-900">{selectedRecord.studentName || 'N/A'}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Paper Title</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedRecord.paperTitle || 'N/A'}</div>
                </div>
              </div>

              {/* Conference Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Conference Name</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedRecord.conferenceName || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Event Level</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedRecord.eventLevel || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Event Mode</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedRecord.eventMode || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Status</div>
                  <div className="mt-1 font-medium text-slate-900 capitalize">{selectedRecord.status || 'N/A'}</div>
                </div>
              </div>

              {/* IQAC Status - Highlighted */}
              <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
                <div className="text-sm font-semibold uppercase tracking-wide text-amber-900 mb-2">🎯 IQAC Verification Status</div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedRecord.iqacVerification)}
                  <span className="text-sm text-amber-800">
                    {selectedRecord.iqacVerification === 'initiated'
                      ? 'Pending review by IQAC'
                      : selectedRecord.iqacVerification === 'approved'
                        ? 'Approved by IQAC'
                        : 'Rejected by IQAC'}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Event Start Date</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {selectedRecord.eventStartDate ? new Date(selectedRecord.eventStartDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Event End Date</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {selectedRecord.eventEndDate ? new Date(selectedRecord.eventEndDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Submitted On</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {new Date(selectedRecord.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Sponsorship Type</div>
                  <div className="mt-1 font-medium text-slate-900">{selectedRecord.sponsorshipType || 'N/A'}</div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <div className="text-sm font-semibold uppercase tracking-wide text-slate-700 mb-3">Uploaded Documents</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {selectedRecord.imageProofPath && (
                    <a
                      href={`${BACKEND_BASE}${selectedRecord.imageProofPath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col items-center gap-2 hover:bg-slate-100 transition"
                    >
                      <FileText className="h-5 w-5 text-slate-600" />
                      <span className="text-xs font-medium text-slate-700 text-center">Image Proof</span>
                    </a>
                  )}
                  {selectedRecord.abstractProofPath && (
                    <a
                      href={`${BACKEND_BASE}${selectedRecord.abstractProofPath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col items-center gap-2 hover:bg-slate-100 transition"
                    >
                      <FileText className="h-5 w-5 text-slate-600" />
                      <span className="text-xs font-medium text-slate-700 text-center">Abstract</span>
                    </a>
                  )}
                  {selectedRecord.certificateProofPath && (
                    <a
                      href={`${BACKEND_BASE}${selectedRecord.certificateProofPath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col items-center gap-2 hover:bg-slate-100 transition"
                    >
                      <Award className="h-5 w-5 text-slate-600" />
                      <span className="text-xs font-medium text-slate-700 text-center">Certificate</span>
                    </a>
                  )}
                  {selectedRecord.attestedCertificatePath && (
                    <a
                      href={`${BACKEND_BASE}${selectedRecord.attestedCertificatePath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col items-center gap-2 hover:bg-slate-100 transition"
                    >
                      <Award className="h-5 w-5 text-slate-600" />
                      <span className="text-xs font-medium text-slate-700 text-center">Attested Cert</span>
                    </a>
                  )}
                </div>
                {!selectedRecord.imageProofPath &&
                  !selectedRecord.abstractProofPath &&
                  !selectedRecord.certificateProofPath &&
                  !selectedRecord.attestedCertificatePath && (
                    <div className="text-center py-6 bg-slate-50 rounded-lg">
                      <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">No documents uploaded</p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

