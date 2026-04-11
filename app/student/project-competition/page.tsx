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

interface ProjectCompetition {
  id: number;
  studentId: string;
  studentName: string;
  projectTitle: string;
  competitionType: 'national' | 'international';
  eventStartDate: string;
  eventEndDate: string;
  status: 'participated' | 'winner' | 'runner';
  iqacVerification: 'initiated' | 'approved' | 'rejected';
  isAcademicProjectOutcome: string;
  imageProofPath?: string;
  abstractProofPath?: string;
  winnerCertificateProofPath?: string;
  runnerCertificateProofPath?: string;
  createdAt: string;
}


type SortKey = 'studentName' | 'projectTitle' | 'competitionType' | 'iqacVerification' | 'createdAt';
type SortDirection = 'asc' | 'desc' | null;

const BACKEND_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

const formatDate = (value: string) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-IN');
};

const getStatusBadge = (status: string) => {
  if (!status) return null;

  const statusConfig: Record<
    string,
    { bg: string; color: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    initiated: { bg: 'bg-amber-50', color: 'text-amber-900', icon: AlertCircle },
    approved: { bg: 'bg-emerald-50', color: 'text-emerald-900', icon: CheckCircle2 },
    rejected: { bg: 'bg-red-50', color: 'text-red-900', icon: XCircle },
  };

  const config = statusConfig[status];
  if (!config) return null;

  const Icon = config.icon;
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bg}`}>
      <Icon className={`w-4 h-4 ${config.color}`} />
      <span className={`text-xs font-semibold ${config.color}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
};

export default function ProjectCompetitionPage() {
  const [records, setRecords] = useState<ProjectCompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedRecord, setSelectedRecord] = useState<ProjectCompetition | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await apiClient.get('/student-project-competitions');
        setRecords(res.records || []);
      } catch (error) {
        console.error('Error fetching records:', error);
        toast.error('Failed to load records');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    if (!query.trim()) return records;

    const lowerQuery = query.toLowerCase();
    return records.filter(
      (record) =>
        record.studentId.toLowerCase().includes(lowerQuery) ||
        record.studentName.toLowerCase().includes(lowerQuery) ||
        record.projectTitle.toLowerCase().includes(lowerQuery) ||
        record.competitionType.toLowerCase().includes(lowerQuery) ||
        record.iqacVerification.toLowerCase().includes(lowerQuery)
    );
  }, [query, records]);

  const sortedRecords = useMemo(() => {
    if (!sortKey) return filteredRecords;

    const sorted = [...filteredRecords].sort((a, b) => {
      const aValue = a[sortKey] || '';
      const bValue = b[sortKey] || '';

      if (typeof aValue === 'string') {
        return aValue.localeCompare(bValue);
      }
      return 0;
    });

    if (sortDirection === 'asc') {
      return sorted;
    } else if (sortDirection === 'desc') {
      return sorted.reverse();
    }
    return sorted;
  }, [filteredRecords, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const computeSortIcon = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-amber-900" />
    ) : (
      <ChevronDown className="w-4 h-4 text-amber-900" />
    );
  };

  const handleDeleteRecord = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    setDeletingId(id);
    try {
      await apiClient.delete(`/student-project-competitions/${id}`);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setModalOpen(false);
      toast.success('Record deleted successfully');
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Failed to delete record');
    } finally {
      setDeletingId(null);
    }
  };

  const openDetails = (record: ProjectCompetition) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Project Competitions</h1>
              <p className="text-slate-600 mt-1">Manage your project competition submissions</p>
            </div>
            <Link
              href="/student/project-competition/submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              <Plus className="w-4 h-4" />
              New Submission
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, name, title, type, or IQAC status..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Loading records...</p>
            </div>
          ) : sortedRecords.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No records found</p>
            </div>
          ) : (
            <table className="w-full">
              {/* Table Header */}
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => handleSort('studentName')}
                    >
                      Student Name
                      {computeSortIcon('studentName')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => handleSort('projectTitle')}
                    >
                      Project Title
                      {computeSortIcon('projectTitle')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => handleSort('competitionType')}
                    >
                      Competition Type
                      {computeSortIcon('competitionType')}
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
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Submitted</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700">Actions</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {sortedRecords.map((record) => (
                  <tr key={record.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-sm text-slate-900 font-medium">{record.studentName}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{record.projectTitle}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold">
                        {record.competitionType.charAt(0).toUpperCase() + record.competitionType.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm bg-amber-50">
                      {getStatusBadge(record.iqacVerification)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{formatDate(record.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => openDetails(record)}
                          className="p-2 hover:bg-slate-200 rounded-lg transition text-indigo-600 hover:text-indigo-700"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(record.id)}
                          disabled={deletingId === record.id}
                          className="p-2 hover:bg-slate-200 rounded-lg transition text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {modalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-slate-900">Project Competition Details</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Basic Information */}
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Student ID</p>
                    <p className="text-slate-900 font-medium">{selectedRecord.studentId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Name</p>
                    <p className="text-slate-900 font-medium">{selectedRecord.studentName}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Project Title</p>
                    <p className="text-slate-900 font-medium">{selectedRecord.projectTitle}</p>
                  </div>
                </div>
              </div>

              {/* Competition Details */}
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <h3 className="font-semibold text-slate-900">Competition Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Type</p>
                    <p className="text-slate-900 font-medium">
                      {selectedRecord.competitionType.charAt(0).toUpperCase() +
                        selectedRecord.competitionType.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Status</p>
                    <p className="text-slate-900 font-medium">
                      {selectedRecord.status.charAt(0).toUpperCase() + selectedRecord.status.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Start Date</p>
                    <p className="text-slate-900 font-medium">{formatDate(selectedRecord.eventStartDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">End Date</p>
                    <p className="text-slate-900 font-medium">{formatDate(selectedRecord.eventEndDate)}</p>
                  </div>
                </div>
              </div>

              {/* IQAC Status */}
              <div className="border-2 border-amber-200 bg-amber-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-amber-900">IQAC Verification Status</h3>
                <div className="flex items-center gap-2">{getStatusBadge(selectedRecord.iqacVerification)}</div>
                <p className="text-xs text-amber-800">
                  {selectedRecord.iqacVerification === 'initiated' &&
                    'Your submission is awaiting IQAC verification. Please wait for feedback.'}
                  {selectedRecord.iqacVerification === 'approved' &&
                    'Your submission has been approved by IQAC. Congratulations!'}
                  {selectedRecord.iqacVerification === 'rejected' &&
                    'Your submission was rejected. Please review the feedback and resubmit if needed.'}
                </p>
              </div>

              {/* Documents */}
              {(selectedRecord.imageProofPath ||
                selectedRecord.abstractProofPath ||
                selectedRecord.winnerCertificateProofPath ||
                selectedRecord.runnerCertificateProofPath) && (
                <div className="space-y-2 border-t border-slate-200 pt-4">
                  <h3 className="font-semibold text-slate-900">Documents</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedRecord.imageProofPath && (
                      <a
                        href={`${BACKEND_BASE}${selectedRecord.imageProofPath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition border border-slate-200"
                      >
                        <FileText className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-900 flex-1">Photo/Geotag Proof</span>
                        <Download className="w-4 h-4 text-indigo-600" />
                      </a>
                    )}
                    {selectedRecord.abstractProofPath && (
                      <a
                        href={`${BACKEND_BASE}${selectedRecord.abstractProofPath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition border border-slate-200"
                      >
                        <FileText className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-900 flex-1">Abstract Document</span>
                        <Download className="w-4 h-4 text-indigo-600" />
                      </a>
                    )}
                    {selectedRecord.winnerCertificateProofPath && (
                      <a
                        href={`${BACKEND_BASE}${selectedRecord.winnerCertificateProofPath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition border border-slate-200"
                      >
                        <Award className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-900 flex-1">Winner Certificate</span>
                        <Download className="w-4 h-4 text-indigo-600" />
                      </a>
                    )}
                    {selectedRecord.runnerCertificateProofPath && (
                      <a
                        href={`${BACKEND_BASE}${selectedRecord.runnerCertificateProofPath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition border border-slate-200"
                      >
                        <Award className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-900 flex-1">Runner Certificate</span>
                        <Download className="w-4 h-4 text-indigo-600" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-slate-200 pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => handleDeleteRecord(selectedRecord.id)}
                  disabled={deletingId === selectedRecord.id}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
