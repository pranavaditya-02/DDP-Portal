"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
} from "lucide-react";

type RecordStatus = "Approved" | "Pending" | "Rejected";

interface JournalAppliedRecord {
  id: string;
  taskId: string;
  cadre: string;
  proposalTitle: string;
  proposalArea: string;
  fundingAgencyName: string;
  requestedFundingAmount: string;
  projectDuration: string;
  submissionDate: string;
  firstFaculty: string;
  collaboration: string;
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

export default function JournalPublicationsAppliedPage() {
  const [records, setRecords] = useState<JournalAppliedRecord[]>([
    {
      id: "1",
      taskId: "JP-A-001",
      cadre: "Professor",
      proposalTitle: "AI-enabled Smart Energy Scheduling",
      proposalArea: "Energy Systems",
      fundingAgencyName: "DST",
      requestedFundingAmount: "2500000",
      projectDuration: "24 months",
      submissionDate: "2026-03-10",
      firstFaculty: "Dr. Priya",
      collaboration: "Industry",
      status: "Pending",
      remarks: "Under evaluation by verification team",
    },
    {
      id: "2",
      taskId: "JP-A-002",
      cadre: "Associate Professor",
      proposalTitle: "Data-driven Climate Risk Modeling",
      proposalArea: "Climate Informatics",
      fundingAgencyName: "SERB",
      requestedFundingAmount: "1800000",
      projectDuration: "18 months",
      submissionDate: "2026-02-18",
      firstFaculty: "Dr. Karthik",
      collaboration: "Other Institute in India",
      status: "Approved",
      remarks: "Approved with minor document corrections",
    },
  ]);

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this Journal Publications - Applied record?",
      )
    ) {
      setRecords((prev) => prev.filter((record) => record.id !== id));
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto">
      <div className="max-w-[1320px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Journal Publications - Applied
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track submitted records with status and remarks
            </p>
          </div>
          <Link
            href="/faculty/r-and-d/journal-publications-applied/submit"
            className="w-fit inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2572ed] text-white font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Record
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {records.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">
                No records found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Add a record to see it here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-max border-collapse mx-auto">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {[
                      "Task ID",
                      "Cadre",
                      "Proposal Title",
                      "Proposal Area",
                      "Funding Agency",
                      "Requested Funding",
                      "Project Duration",
                      "Submission Date",
                      "First Faculty",
                      "Collaboration",
                      "Status",
                      "Remarks",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((item, index) => (
                    <tr
                      key={item.id}
                      className={
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      }
                    >
                      <td className="px-4 py-3 text-sm text-blue-600 font-semibold whitespace-nowrap">
                        {item.taskId}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                        {item.cadre}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 min-w-[220px]">
                        {item.proposalTitle}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                        {item.proposalArea}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                        {item.fundingAgencyName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                        {item.requestedFundingAmount}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                        {item.projectDuration}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                        {new Date(item.submissionDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                        {item.firstFaculty}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                        {item.collaboration}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 min-w-[220px]">
                        {item.remarks}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-500 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
