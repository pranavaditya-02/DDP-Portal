"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FileCheck, Plus, Trash2, Search } from "lucide-react";

type Status = "Initiated" | "Approved" | "Rejected";

interface MouRecord {
  id: string;
  taskID: string;
  sigNumber: string;
  department: string;
  legalNameOfIndustry: string;
  purposeOfMoU: string;
  typeOfMoU: string;
  owiVerification: Status;
  submittedOn: string;
}

const sampleData: MouRecord[] = [
  {
    id: "MOU001",
    taskID: "OWI-901",
    sigNumber: "SIG-24-AI",
    department: "CSE",
    legalNameOfIndustry: "TechNova Pvt Ltd",
    purposeOfMoU: "Internship",
    typeOfMoU: "National",
    owiVerification: "Approved",
    submittedOn: "2026-03-08",
  },
  {
    id: "MOU002",
    taskID: "OWI-902",
    sigNumber: "SIG-31-IOT",
    department: "ECE",
    legalNameOfIndustry: "Global Embedded Systems",
    purposeOfMoU: "Laboratory enhancement",
    typeOfMoU: "International",
    owiVerification: "Initiated",
    submittedOn: "2026-03-12",
  },
];

const STATUS_OPTIONS: Array<"All" | Status> = [
  "All",
  "Initiated",
  "Approved",
  "Rejected",
];
const PURPOSE_OPTIONS = [
  "All",
  "Internship",
  "centre of Excellence",
  "faculty training",
  "World Skil Training",
  "Certificate Course",
  "Placement traininf",
  "Colloborative Projects",
  "Laboratory enhancement",
  "Consultancy",
  "Sharing facilities",
  "Product Development",
  "Publication",
  "Funding",
  "Patents",
  "Organizing events",
  "students Projects",
  "one Credit Course",
  "placement offers",
  "Syllabus Framing for Curriculum",
  "Syllabus framing for one credit",
  "Students Training",
  "others",
];

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    Initiated: "bg-amber-50 text-amber-700 border border-amber-200",
    Approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Rejected: "bg-red-50 text-red-700 border border-red-200",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export default function MouPage() {
  const [records, setRecords] = useState<MouRecord[]>(sampleData);
  const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");
  const [purposeFilter, setPurposeFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() =>
    records.filter(
      (record) =>
        (statusFilter === "All" || record.owiVerification === statusFilter) &&
        (purposeFilter === "All" || record.purposeOfMoU === purposeFilter) &&
        (searchQuery === "" ||
          record.legalNameOfIndustry.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.department.toLowerCase().includes(searchQuery.toLowerCase())),
    ),
    [records, statusFilter, purposeFilter, searchQuery]
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      setRecords((prev) => prev.filter((record) => record.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-violet-50 p-3 rounded-lg">
              <FileCheck className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">OWI - MoU</h1>
              <p className="text-sm text-slate-500">
                Memorandum of Understanding records
              </p>
            </div>
          </div>
          <Link
            href="/faculty/outside-world/mou/submit"
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Link>
        </div>

        <div className="bg-white border border-violet-100 rounded-2xl p-5 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by industry or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-violet-200 rounded-md text-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Purpose of MoU
            </label>
            <select
              value={purposeFilter}
              onChange={(e) => setPurposeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-violet-200 rounded-md text-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
            >
              {PURPOSE_OPTIONS.map((option) => (
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
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "All" | Status)
              }
              className="w-full px-3 py-2 border border-violet-200 rounded-md text-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white border border-violet-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-violet-50 to-violet-100 border-b border-violet-200 text-slate-900">
                  {[
                    "ID",
                    "Task ID",
                    "SIG",
                    "Department",
                    "Industry",
                    "Purpose",
                    "Type",
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
                      colSpan={10}
                      className="px-4 py-10 text-center text-slate-400 text-sm"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-violet-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {record.id}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {record.taskID}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {record.sigNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {record.department}
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap max-w-[220px] truncate">
                        {record.legalNameOfIndustry}
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {record.purposeOfMoU}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {record.typeOfMoU}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={record.owiVerification} />
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
          <div className="px-4 py-3 border-t border-violet-100 bg-violet-50 text-xs text-slate-500">
            Showing {filtered.length} of {records.length} record
            {records.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
