"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Monitor,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
} from "lucide-react";

type RecordStatus = "Approved" | "Pending" | "Rejected";

interface EContentRecord {
  id: string;
  taskID: string;
  specialLabsInvolved: "yes" | "no";
  specialLab?: string;
  eContentType: string;
  otherEContentType?: string;
  topicName: string;
  publisherName: string;
  publisherAddress: string;
  contactNo: string;
  urlOfContent: string;
  dateOfPublication: string;
  documentProofName: string;
  status: RecordStatus;
  remarks: string;
}

function StatusBadge({ status }: { status: RecordStatus }) {
  const config = {
    Approved: { icon: CheckCircle2, class: "bg-emerald-50 text-emerald-600" },
    Pending: { icon: Clock, class: "bg-amber-50 text-amber-600" },
    Rejected: { icon: XCircle, class: "bg-red-50 text-red-600" },
  };

  const cfg = config[status];
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.class}`}
    >
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

export default function EContentDevelopedPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RecordStatus>("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [records, setRecords] = useState<EContentRecord[]>([
    {
      id: "1",
      taskID: "EC001",
      specialLabsInvolved: "yes",
      specialLab: "Data Science Lab",
      eContentType: "VIDEO LECTURES",
      topicName: "Machine Learning Basics",
      publisherName: "YouTube Education",
      publisherAddress: "Coimbatore",
      contactNo: "9876543210",
      urlOfContent: "https://example.com/ml-basics",
      dateOfPublication: "2025-08-12",
      documentProofName: "ml-video-proof.pdf",
      status: "Approved",
      remarks: "Verified by HoD",
    },
    {
      id: "2",
      taskID: "EC002",
      specialLabsInvolved: "no",
      eContentType: "E-BOOK",
      topicName: "AI Ethics Handbook",
      publisherName: "Academic Press",
      publisherAddress: "Chennai",
      contactNo: "9012345678",
      urlOfContent: "https://example.com/ai-ethics",
      dateOfPublication: "2025-11-03",
      documentProofName: "ebook-publication-proof.pdf",
      status: "Pending",
      remarks: "Awaiting IQAC verification",
    },
  ]);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setRecords(records.filter((item) => item.id !== id));
    }
  };

  const typeOptions = useMemo(() => {
    const uniqueTypes = Array.from(
      new Set(records.map((record) => record.eContentType)),
    );
    return ["all", ...uniqueTypes];
  }, [records]);

  const filteredRecords = useMemo(() => {
    let data = [...records];

    if (search.trim()) {
      const query = search.toLowerCase();
      data = data.filter((item) =>
        [
          item.taskID,
          item.eContentType,
          item.topicName,
          item.publisherName,
          item.contactNo,
          item.status,
          item.remarks,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query),
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((item) => item.status === statusFilter);
    }

    if (typeFilter !== "all") {
      data = data.filter((item) => item.eContentType === typeFilter);
    }

    return data;
  }, [records, search, statusFilter, typeFilter]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto">
      <div className="max-w-[1320px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              E-Content Developed
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track and manage your e-content records
            </p>
          </div>
          <Link
            href="/achievements/e-content-developed/submit"
            className="w-fit inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2572ed] text-white font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add E-Content
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search e-content..."
              className="w-full h-11 rounded-full bg-white pl-12 pr-4 text-slate-700 placeholder:text-slate-400 border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="relative w-full sm:w-44">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | RecordStatus)
              }
              className="w-full h-11 rounded-lg bg-white pl-10 pr-3 text-slate-700 border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-52 h-11 rounded-lg bg-white px-3 text-slate-700 border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All Types" : option}
              </option>
            ))}
          </select>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          {filteredRecords.length} record
          {filteredRecords.length === 1 ? "" : "s"} found
        </p>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-16">
              <Monitor className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">
                No e-content records found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Add a record to see it here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1800px] w-full border-collapse mx-auto">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Special Labs Involved
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Special Lab
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      E-Content Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Topic Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Publisher Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Publisher Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Contact No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      URL of Content
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Date of Publication
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Document Proof
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Remarks
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((item, index) => (
                    <tr
                      key={item.id}
                      className={
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      }
                    >
                      <td className="px-4 py-3 text-sm text-blue-600 font-semibold whitespace-nowrap">
                        {item.taskID}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 capitalize">
                        {item.specialLabsInvolved}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.specialLab || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.eContentType === "Other"
                          ? item.otherEContentType || "Other"
                          : item.eContentType}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.topicName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.publisherName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.publisherAddress}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.contactNo}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600 underline underline-offset-2">
                        <a
                          href={item.urlOfContent}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open Link
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                        {new Date(item.dateOfPublication).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.documentProofName}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.remarks}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-500 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
