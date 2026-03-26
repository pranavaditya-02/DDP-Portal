"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Plus, Trash2 } from "lucide-react";

type Status = "Initiated" | "Approved" | "Rejected";

interface LaboratoryRecord {
  id: string;
  taskId: string;
  sigNumber: string;
  faculty: string;
  nameOfLaboratory: string;
  collaborativeIndustry: string;
  totalAmountIncurred: string;
  bitContribution: string;
  verification: Status;
  submittedOn: string;
}

const sampleData: LaboratoryRecord[] = [
  {
    id: "LBI001",
    taskId: "OWI-801",
    sigNumber: "SIG-24-AI",
    faculty: "Dr. Priya",
    nameOfLaboratory: "AI Innovation Lab",
    collaborativeIndustry: "TechNova Pvt Ltd",
    totalAmountIncurred: "500000",
    bitContribution: "250000",
    verification: "Approved",
    submittedOn: "2026-03-05",
  },
  {
    id: "LBI002",
    taskId: "OWI-802",
    sigNumber: "SIG-31-IOT",
    faculty: "Dr. Karthik",
    nameOfLaboratory: "IoT Systems Lab",
    collaborativeIndustry: "InnoDevices",
    totalAmountIncurred: "320000",
    bitContribution: "180000",
    verification: "Initiated",
    submittedOn: "2026-03-10",
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

export default function LaboratoryByIndustryPage() {
  const [records, setRecords] = useState<LaboratoryRecord[]>(sampleData);
  const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");

  const filtered = records.filter(
    (item) => statusFilter === "All" || item.verification === statusFilter,
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      setRecords((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                OWI - Laboratory by Industry
              </h1>
              <p className="text-sm text-slate-500">
                Laboratory setup details by industry collaboration
              </p>
            </div>
          </div>
          <Link
            href="/faculty/outside-world/laboratory-by-industry/submit"
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
            className="w-full md:w-64 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
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
                    "Task ID",
                    "SIG",
                    "Faculty",
                    "Laboratory",
                    "Industry",
                    "Total Amount",
                    "BIT Contribution",
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
                      colSpan={11}
                      className="px-4 py-10 text-center text-slate-400 text-sm"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {item.id}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {item.taskId}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {item.sigNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {item.faculty}
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap max-w-[220px] truncate">
                        {item.nameOfLaboratory}
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap max-w-[220px] truncate">
                        {item.collaborativeIndustry}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        ₹ {item.totalAmountIncurred}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        ₹ {item.bitContribution}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={item.verification} />
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {item.submittedOn}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.verification === "Initiated" && (
                          <button
                            onClick={() => handleDelete(item.id)}
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
