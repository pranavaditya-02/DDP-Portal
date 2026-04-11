"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, PlusCircle, FileText, Download, Trash2, Eye, Calendar, Award, ChevronRight, X } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useRoles } from "@/hooks/useRoles";

interface PaperPresentation {
  id: number;
  studentId: string;
  studentName: string;
  paperTitle: string;
  eventStartDate: string;
  eventEndDate: string;
  status: "participated" | "winner";
  iqacVerification: "initiated" | "approved" | "rejected";
  isAcademicProjectOutcome: string;
  parentalDepartmentId?: number;
  imageProofPath?: string;
  abstractProofPath?: string;
  certificateProofPath?: string;
  attestedCertificatePath?: string;
  createdAt: string;
}

const BACKEND_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(
  /\/api$/,
  ""
);

const formatDate = (value: string) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN");
};

function StatusBadge({ status }: { status: string }) {
  if (!status) return null;
  
  const styles: Record<string, string> = {
    initiated: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    participated: "bg-slate-100 text-slate-800",
    winner: "bg-amber-100 text-amber-800",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.initiated}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function PaperPresentationReportPage() {
  const [records, setRecords] = useState<PaperPresentation[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<PaperPresentation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const roleUtils = useRoles();
  const isVerification = roleUtils.isVerification();

  // Fetch records on mount
  useEffect(() => {
    const loadRecords = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/student-paper-presentations?page=1&limit=50");
        setRecords(response?.records || []);
      } catch (err: any) {
        console.error("Failed to load paper presentations:", err);
        setError(err?.response?.data?.message || "Failed to load records");
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return records;

    return records.filter(
      (item) =>
        item.studentName.toLowerCase().includes(normalized) ||
        item.studentId.toLowerCase().includes(normalized) ||
        item.paperTitle.toLowerCase().includes(normalized) ||
        item.status.toLowerCase().includes(normalized)
    );
  }, [query, records]);

  const handleDeleteRecord = async (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      setDeletingId(id);
      await apiClient.delete(`/student-paper-presentations/${id}`);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      console.error("Failed to delete record:", err);
      setError(err?.response?.data?.message || "Failed to delete record");
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateIqacStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "initiated" ? "processing" : 
                      currentStatus === "approved" ? "rejected" : null;
    
    if (!nextStatus) return;

    try {
      setUpdatingId(id);
      const response = await apiClient.put(`/student-paper-presentations/${id}/iqac-status`, {
        iqacVerification: nextStatus,
      });
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, iqacVerification: nextStatus } : r))
      );
    } catch (err: any) {
      console.error("Failed to update IQAC status:", err);
      setError(err?.response?.data?.message || "Failed to update IQAC status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Paper Presentations Report</h1>
              <p className="text-sm text-slate-500">View and manage your paper presentation records</p>
            </div>
          </div>

          <Link
            href="/student/paper-presentation/submit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Record
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-3 p-4 border-b border-slate-200">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by student name, ID, or paper title..."
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <span className="text-sm text-slate-500">{filteredRecords.length} records</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
              <p>Loading paper presentations...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="inline-block rounded-full bg-red-50 p-3 mb-3">
                <p className="text-red-700 font-medium">Error</p>
              </div>
              <p className="text-red-600">{error}</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-block rounded-full bg-slate-100 p-4 mb-4">
                <PlusCircle className="w-8 h-8 text-slate-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">No Records Yet</h2>
              <p className="text-slate-600 mb-6">Start by adding your first paper presentation record.</p>
              <Link
                href="/student/paper-presentation/submit"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <PlusCircle className="w-4 h-4" />
                Add First Record
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-8 px-8">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col"
                >
                  {/* Card Header Badge */}
                  <div className="h-1 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-1">
                    {/* Title */}
                    <h3 className="font-semibold text-slate-900 line-clamp-2 mb-6 text-base leading-tight">
                      {record.paperTitle}
                    </h3>

                    {/* Student Info */}
                    <div className="mb-5 pb-4 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Student Details</p>
                      <p className="text-sm text-slate-900 font-medium">{record.studentName}</p>
                      <p className="text-xs text-slate-600">{record.studentId}</p>
                    </div>

                    {/* Status Badges */}
                    <div className="mb-5 pb-4 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Statuses</p>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <p className="text-xs text-slate-600 mb-1">Participation</p>
                          <StatusBadge status={record.status} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-600 mb-1">IQAC</p>
                          <StatusBadge status={record.iqacVerification} />
                        </div>
                      </div>
                    </div>

                    {/* Event Information */}
                    <div className="mb-5 pb-4 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Event Details</p>
                      <div className="space-y-2.5">
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <p className="text-slate-900 font-medium">{formatDate(record.eventStartDate)}</p>
                            <p className="text-slate-600">to {formatDate(record.eventEndDate)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Academic Project */}
                    <div className="mb-5 pb-4 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Academic Project</p>
                      {record.isAcademicProjectOutcome === "yes" ? (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                          ✓ Yes
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs font-semibold">
                          ✗ No
                        </span>
                      )}
                    </div>

                    {/* Submission Date */}
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Submitted</p>
                      <p className="text-xs text-slate-900">{formatDate(record.createdAt)}</p>
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={() => {
                        setSelectedRecord(record);
                        setModalOpen(true);
                      }}
                      className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center justify-center gap-2 mt-auto"
                    >
                      <Eye className="w-4 h-4" />
                      View Full Details & Documents
                    </button>

                    {/* IQAC Update Button (if verification role) */}
                    {isVerification && (
                      <button
                        onClick={() => handleUpdateIqacStatus(record.id, record.iqacVerification)}
                        disabled={updatingId === record.id || record.iqacVerification === "rejected"}
                        className="w-full mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
                      >
                        <ChevronRight className="w-4 h-4" />
                        {updatingId === record.id ? "Updating..." : "Update IQAC Status"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Details Modal */}
          {selectedRecord && (
            <DetailsModal
              record={selectedRecord}
              isOpen={modalOpen}
              onClose={() => {
                setModalOpen(false);
                setSelectedRecord(null);
              }}
              onDelete={handleDeleteRecord}
              onUpdateIqacStatus={handleUpdateIqacStatus}
              isVerification={isVerification}
              isDeleting={deletingId === selectedRecord?.id}
              isUpdating={updatingId === selectedRecord?.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DetailsModal({
  record,
  isOpen,
  onClose,
  onDelete,
  onUpdateIqacStatus,
  isVerification,
  isDeleting,
  isUpdating,
}: {
  record: PaperPresentation | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: number) => void;
  onUpdateIqacStatus: (id: number, status: string) => void;
  isVerification: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
}) {
  if (!isOpen || !record) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-white">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">{record.paperTitle}</h2>
              <p className="text-sm text-slate-500 mt-1">
                {record.studentName} ({record.studentId})
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
              title="Close"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Badges */}
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Participation Status</p>
                <StatusBadge status={record.status} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">IQAC Verification</p>
                <StatusBadge status={record.iqacVerification} />
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 rounded-lg p-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Student ID</p>
                <p className="text-slate-900 font-medium">{record.studentId}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Student Name</p>
                <p className="text-slate-900 font-medium">{record.studentName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Event Start Date</p>
                <p className="text-slate-900 font-medium">{formatDate(record.eventStartDate)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Event End Date</p>
                <p className="text-slate-900 font-medium">{formatDate(record.eventEndDate)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Academic Project</p>
                {record.isAcademicProjectOutcome === "yes" ? (
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    Yes
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm font-semibold">
                    No
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Submitted On</p>
                <p className="text-slate-900 font-medium">{formatDate(record.createdAt)}</p>
              </div>
            </div>

            {/* Documents/Images Section */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Uploaded Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Photo/Geotag */}
                {record.imageProofPath && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 aspect-video flex items-center justify-center">
                      <img
                        src={`${BACKEND_BASE}${record.imageProofPath}`}
                        alt="Photo/Geotag Proof"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                    <div className="p-3 bg-white">
                      <p className="text-sm font-medium text-slate-900 mb-2">Photo/Geotag Proof</p>
                      <a
                        href={`${BACKEND_BASE}${record.imageProofPath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  </div>
                )}

                {/* Abstract */}
                {record.abstractProofPath && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 p-8 flex items-center justify-center">
                      <FileText className="w-12 h-12 text-slate-400" />
                    </div>
                    <div className="p-3 bg-white">
                      <p className="text-sm font-medium text-slate-900 mb-2">Abstract Document</p>
                      <a
                        href={`${BACKEND_BASE}${record.abstractProofPath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  </div>
                )}

                {/* Certificate */}
                {record.certificateProofPath && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 p-8 flex items-center justify-center">
                      <Award className="w-12 h-12 text-slate-400" />
                    </div>
                    <div className="p-3 bg-white">
                      <p className="text-sm font-medium text-slate-900 mb-2">Original Certificate</p>
                      <a
                        href={`${BACKEND_BASE}${record.certificateProofPath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  </div>
                )}

                {/* Attested Certificate */}
                {record.attestedCertificatePath && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 p-8 flex items-center justify-center">
                      <Award className="w-12 h-12 text-slate-400" />
                    </div>
                    <div className="p-3 bg-white">
                      <p className="text-sm font-medium text-slate-900 mb-2">Attested Certificate</p>
                      <a
                        href={`${BACKEND_BASE}${record.attestedCertificatePath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {(record.imageProofPath || record.abstractProofPath || record.certificateProofPath || record.attestedCertificatePath) ? null : (
                <div className="text-center py-8 bg-slate-50 rounded-lg">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No documents uploaded</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-slate-200 pt-6 flex flex-wrap gap-3">
              {isVerification && (
                <button
                  onClick={() => onUpdateIqacStatus(record.id, record.iqacVerification)}
                  disabled={isUpdating || record.iqacVerification === "completed"}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition font-medium flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4" />
                  {isUpdating ? "Updating..." : "Update IQAC Status"}
                </button>
              )}
              <button
                onClick={() => onDelete(record.id)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Delete Record"}
              </button>
              <button
                onClick={onClose}
                className="ml-auto px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
