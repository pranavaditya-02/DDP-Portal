"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  ClipboardCheck,
} from "lucide-react";

type Status = "Approved" | "Pending" | "Rejected";

interface ExternalExaminerRecord {
  id: string;
  taskID: string;
  specialLabsInvolved: "yes" | "no";
  specialLab: string;
  collegeName: string;
  instituteAddress: string;
  purposeOfVisit: string;
  nameOfExamination: string;
  departmentOfQP: string;
  subjectOfQP: string;
  numberOfDays: string;
  fromDate: string;
  toDate: string;
  status: Status;
  submittedDate: string;
}

const SAMPLE_DATA: ExternalExaminerRecord[] = [
  {
    id: "EX001",
    taskID: "TASK-EX-2024-001",
    specialLabsInvolved: "no",
    specialLab: "",
    collegeName: "Anna University",
    instituteAddress: "Chennai, Tamil Nadu",
    purposeOfVisit: "Central Valuation",
    nameOfExamination: "UG End Semester Examination",
    departmentOfQP: "",
    subjectOfQP: "",
    numberOfDays: "2",
    fromDate: "2024-06-10",
    toDate: "2024-06-11",
    status: "Approved",
    submittedDate: "2024-06-12",
  },
  {
    id: "EX002",
    taskID: "TASK-EX-2024-002",
    specialLabsInvolved: "yes",
    specialLab: "AI Lab",
    collegeName: "PSG College of Technology",
    instituteAddress: "Coimbatore, Tamil Nadu",
    purposeOfVisit: "QP Setter",
    nameOfExamination: "",
    departmentOfQP: "CSE",
    subjectOfQP: "Machine Learning",
    numberOfDays: "1",
    fromDate: "2024-07-05",
    toDate: "2024-07-05",
    status: "Pending",
    submittedDate: "2024-07-06",
  },
];

const StatusBadge = ({ status }: { status: Status }) => {
  const config = {
    Approved: {
      icon: CheckCircle2,
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    Pending: {
      icon: Clock,
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    Rejected: {
      icon: XCircle,
      cls: "bg-red-50 text-red-700 border-red-200",
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.cls}`}
    >
      <Icon size={12} />
      {status}
    </span>
  );
};

export default function ExternalExaminerPage() {
  const [records, setRecords] = useState<ExternalExaminerRecord[]>(SAMPLE_DATA);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [purposeFilter, setPurposeFilter] = useState<string>("All");

  const purposeOptions = useMemo(
    () => ["All", ...Array.from(new Set(records.map((r) => r.purposeOfVisit)))],
    [records],
  );

  const filtered = useMemo(() => {
    return records.filter((record) => {
      const query = search.toLowerCase();
      const matchesSearch =
        !query ||
        record.id.toLowerCase().includes(query) ||
        record.taskID.toLowerCase().includes(query) ||
        record.collegeName.toLowerCase().includes(query) ||
        record.purposeOfVisit.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;

      const matchesPurpose =
        purposeFilter === "All" || record.purposeOfVisit === purposeFilter;

      return matchesSearch && matchesStatus && matchesPurpose;
    });
  }, [records, search, statusFilter, purposeFilter]);

  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClipboardCheck className="text-blue-600" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                External Examiner
              </h1>
              <p className="text-sm text-slate-500">
                {filtered.length} record{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <Link
            href="/achievements/external-examiner/submit"
            className="w-fit inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2572ed] text-white font-semibold shadow-sm hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus size={18} />
            Add Record
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, task, college..."
              className="w-full rounded-full bg-white pl-10 pr-4 py-2.5 text-sm border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg bg-white py-2.5 px-3 text-sm border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {["All", "Approved", "Pending", "Rejected"].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>

            <select
              value={purposeFilter}
              onChange={(e) => setPurposeFilter(e.target.value)}
              className="rounded-lg bg-white py-2.5 px-3 text-sm border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {purposeOptions.map((purpose) => (
                <option key={purpose}>{purpose}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: "2200px" }}>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  "ID",
                  "Task ID",
                  "Special Labs",
                  "Special Lab",
                  "College / University",
                  "Institute Address",
                  "Purpose of Visit",
                  "Name of Examination",
                  "Department of QP",
                  "Subject of QP",
                  "No. of Days",
                  "From Date",
                  "To Date",
                  "Status",
                  "Submitted",
                  "Actions",
                ].map((head) => (
                  <th
                    key={head}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
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
                    colSpan={16}
                    className="px-4 py-12 text-center text-slate-400 text-sm"
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
                    <td className="px-4 py-3 text-blue-600 font-semibold whitespace-nowrap">
                      {record.id}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.taskID}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap capitalize">
                      {record.specialLabsInvolved}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.specialLab || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.collegeName}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.instituteAddress}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.purposeOfVisit}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.nameOfExamination || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.departmentOfQP || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.subjectOfQP || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.numberOfDays}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.fromDate}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.toDate}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {record.submittedDate}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
