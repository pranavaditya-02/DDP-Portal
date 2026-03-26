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
  Newspaper,
} from "lucide-react";

type Status = "Approved" | "Pending" | "Rejected";

interface NewsletterRecord {
  id: string;
  taskID: string;
  newsletterCategory: string;
  department: string;
  academicYear: string;
  dateOfPublication: string;
  volumeNumber: string;
  issueNumber: string;
  issueMonth: string;
  facultyEditorCount: string;
  studentEditorCount: string;
  status: Status;
  submittedDate: string;
}

const SAMPLE_DATA: NewsletterRecord[] = [
  {
    id: "NL001",
    taskID: "TASK-NL-2024-001",
    newsletterCategory: "department-newsletter",
    department: "CSE",
    academicYear: "2024-2025",
    dateOfPublication: "2024-09-20",
    volumeNumber: "1",
    issueNumber: "2",
    issueMonth: "September",
    facultyEditorCount: "2",
    studentEditorCount: "4",
    status: "Approved",
    submittedDate: "2024-09-22",
  },
  {
    id: "NL002",
    taskID: "TASK-NL-2024-002",
    newsletterCategory: "institution-newsletter",
    department: "-",
    academicYear: "2024-2025",
    dateOfPublication: "2024-10-12",
    volumeNumber: "3",
    issueNumber: "1",
    issueMonth: "October",
    facultyEditorCount: "6+",
    studentEditorCount: "6+",
    status: "Pending",
    submittedDate: "2024-10-14",
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

export default function NewsletterPage() {
  const [records, setRecords] = useState<NewsletterRecord[]>(SAMPLE_DATA);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const categoryOptions = useMemo(
    () => [
      "All",
      ...Array.from(new Set(records.map((item) => item.newsletterCategory))),
    ],
    [records],
  );

  const filtered = useMemo(() => {
    return records.filter((record) => {
      const query = search.toLowerCase();
      const matchesSearch =
        !query ||
        record.id.toLowerCase().includes(query) ||
        record.taskID.toLowerCase().includes(query) ||
        record.newsletterCategory.toLowerCase().includes(query) ||
        record.department.toLowerCase().includes(query) ||
        record.academicYear.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;
      const matchesCategory =
        categoryFilter === "All" ||
        record.newsletterCategory === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [records, search, statusFilter, categoryFilter]);

  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Newspaper className="text-blue-600" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Newsletter</h1>
              <p className="text-sm text-slate-500">
                {filtered.length} record{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <Link
            href="/achievements/newsletter/submit"
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
              placeholder="Search by ID, task, category, year..."
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg bg-white py-2.5 px-3 text-sm border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {categoryOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-max border-collapse mx-auto text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  "ID",
                  "Task ID",
                  "Category",
                  "Department",
                  "Academic Year",
                  "Date of Publication",
                  "Volume",
                  "Issue",
                  "Issue Month",
                  "Faculty Editors",
                  "Student Editors",
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
                    colSpan={14}
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
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.newsletterCategory}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.department}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.academicYear}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.dateOfPublication}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.volumeNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.issueNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.issueMonth}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.facultyEditorCount}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.studentEditorCount}
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
