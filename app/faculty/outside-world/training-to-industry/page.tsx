"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, Plus, Trash2 } from "lucide-react";

type Verification = "Initiated" | "Approved" | "Rejected";

interface TrainingRecord {
  id: string;
  faculty: string;
  eventName: string;
  industryName: string;
  modeOfTraining: string;
  numberOfPersonsTrained: string;
  durationDays: string;
  startDate: string;
  endDate: string;
  owiVerification: Verification;
  submittedOn: string;
}

const sampleData: TrainingRecord[] = [
  {
    id: "TTI001",
    faculty: "Dr. Priya",
    eventName: "Industry Training",
    industryName: "TechNova Pvt Ltd",
    modeOfTraining: "Offline",
    numberOfPersonsTrained: "35",
    durationDays: "3",
    startDate: "2026-02-20",
    endDate: "2026-02-22",
    owiVerification: "Approved",
    submittedOn: "2026-02-24",
  },
  {
    id: "TTI002",
    faculty: "Dr. Karthik",
    eventName: "Workshop",
    industryName: "InnoFab Systems",
    modeOfTraining: "Online",
    numberOfPersonsTrained: "22",
    durationDays: "2",
    startDate: "2026-03-09",
    endDate: "2026-03-10",
    owiVerification: "Initiated",
    submittedOn: "2026-03-11",
  },
];

const VERIFICATION_OPTIONS: Array<"All" | Verification> = [
  "All",
  "Initiated",
  "Approved",
  "Rejected",
];
const MODE_OPTIONS = ["All", "Online", "Offline"];

function VerificationBadge({ status }: { status: Verification }) {
  const styles: Record<Verification, string> = {
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

export default function TrainingToIndustryPage() {
  const [records, setRecords] = useState<TrainingRecord[]>(sampleData);
  const [verificationFilter, setVerificationFilter] = useState<
    "All" | Verification
  >("All");
  const [modeFilter, setModeFilter] = useState("All");

  const filtered = records.filter(
    (record) =>
      (verificationFilter === "All" ||
        record.owiVerification === verificationFilter) &&
      (modeFilter === "All" || record.modeOfTraining === modeFilter),
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      setRecords((prev) => prev.filter((record) => record.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Briefcase className="h-6 w-6 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                OWI - Training to Industry
              </h1>
              <p className="text-sm text-slate-500">
                Training sessions provided to industry participants
              </p>
            </div>
          </div>
          <Link
            href="/faculty/outside-world/training-to-industry/submit"
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-[#2572ed] hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Mode of Training
            </label>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {MODE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              OWI Verification
            </label>
            <select
              value={verificationFilter}
              onChange={(e) =>
                setVerificationFilter(e.target.value as "All" | Verification)
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {VERIFICATION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {[
                    "ID",
                    "Faculty",
                    "Event",
                    "Industry",
                    "Mode",
                    "Persons",
                    "Duration",
                    "Start",
                    "End",
                    "Verification",
                    "Submitted",
                    "Actions",
                  ].map((head) => (
                    <th
                      key={head}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={12}
                      className="px-4 py-10 text-center text-slate-400 text-sm"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {record.id}
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {record.faculty}
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {record.eventName}
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap max-w-[220px] truncate">
                        {record.industryName}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {record.modeOfTraining}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {record.numberOfPersonsTrained}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {record.durationDays}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {record.startDate}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {record.endDate}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <VerificationBadge status={record.owiVerification} />
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {record.submittedOn}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {record.owiVerification === "Initiated" && (
                          <button
                            onClick={() => handleDelete(record.id)}
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
