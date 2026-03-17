"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Plus, Trash2 } from "lucide-react";

type Status = "Initiated" | "Approved" | "Rejected";

interface IndustryAdvisorRecord {
  id: string;
  sigNumber: string;
  industryName: string;
  expertName: string;
  designation: string;
  domainArea: string;
  dateOfMeeting: string;
  frequencyOfInteraction: string;
  verification: Status;
  submittedOn: string;
}

const sampleData: IndustryAdvisorRecord[] = [
  {
    id: "IA001",
    sigNumber: "SIG-22-AI",
    industryName: "Infosys Ltd.",
    expertName: "Raghav Sharma",
    designation: "Senior Engineering Manager",
    domainArea: "Artificial Intelligence",
    dateOfMeeting: "2026-02-10",
    frequencyOfInteraction: "3",
    verification: "Approved",
    submittedOn: "2026-02-12",
  },
  {
    id: "IA002",
    sigNumber: "SIG-18-IOT",
    industryName: "TechSpark Systems",
    expertName: "Priya Menon",
    designation: "CTO",
    domainArea: "IoT Systems",
    dateOfMeeting: "2026-03-05",
    frequencyOfInteraction: "1",
    verification: "Initiated",
    submittedOn: "2026-03-06",
  },
];

const STATUS_OPTIONS: Array<"All" | Status> = [
  "All",
  "Initiated",
  "Approved",
  "Rejected",
];

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    Initiated: "bg-yellow-100 text-yellow-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export default function IndustryAdvisorsPage() {
  const [records, setRecords] = useState<IndustryAdvisorRecord[]>(sampleData);
  const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");

  const filtered = records.filter(
    (r) => statusFilter === "All" || r.verification === statusFilter,
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                OWI - Industry Advisors
              </h1>
              <p className="text-sm text-slate-500">
                Industry advisor interaction records
              </p>
            </div>
          </div>
          <Link
            href="/faculty/outside-world/industry-advisors/submit"
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-[#2572ed] hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            OWI Verification
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "All" | Status)}
            className="w-full md:w-72 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {[
                    "ID",
                    "SIG No",
                    "Industry",
                    "Expert",
                    "Designation",
                    "Domain",
                    "Meeting Date",
                    "Freq (Months)",
                    "Verification",
                    "Submitted",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-10 text-center text-slate-400 text-sm"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {r.id}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {r.sigNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-[180px] truncate">
                        {r.industryName}
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {r.expertName}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {r.designation}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {r.domainArea}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {r.dateOfMeeting}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-center">
                        {r.frequencyOfInteraction}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={r.verification} />
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {r.submittedOn}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.verification === "Initiated" && (
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
            Showing {filtered.length} of {records.length} record
            {records.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
