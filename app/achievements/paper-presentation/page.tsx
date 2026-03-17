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
  FileText,
} from "lucide-react";

type Status = "Approved" | "Pending" | "Rejected";

interface PaperPresentationRecord {
  id: string;
  taskID: string;
  paperTitle: string;
  conferenceName: string;
  eventMode: string;
  eventLevel: string;
  eventStartDate: string;
  eventEndDate: string;
  sponsorshipType: string;
  studentsInvolved: string;
  awardReceived: string;
  status: Status;
  submittedDate: string;
}

const SAMPLE_DATA: PaperPresentationRecord[] = [
  {
    id: "PP001",
    taskID: "TASK-PP-2024-001",
    paperTitle: "Deep Learning Techniques for Medical Image Analysis",
    conferenceName: "IEEE International Conference on AI",
    eventMode: "Offline",
    eventLevel: "International",
    eventStartDate: "2024-07-10",
    eventEndDate: "2024-07-12",
    sponsorshipType: "Self",
    studentsInvolved: "Yes",
    awardReceived: "No",
    status: "Approved",
    submittedDate: "2024-07-15",
  },
  {
    id: "PP002",
    taskID: "TASK-PP-2024-002",
    paperTitle: "Blockchain for Supply Chain Transparency",
    conferenceName: "National Conference on Emerging Technologies",
    eventMode: "Online",
    eventLevel: "National",
    eventStartDate: "2024-09-05",
    eventEndDate: "2024-09-06",
    sponsorshipType: "BIT",
    studentsInvolved: "No",
    awardReceived: "Yes",
    status: "Pending",
    submittedDate: "2024-09-08",
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
    Rejected: { icon: XCircle, cls: "bg-red-50 text-red-700 border-red-200" },
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

export default function PaperPresentationPage() {
  const [records, setRecords] =
    useState<PaperPresentationRecord[]>(SAMPLE_DATA);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");

  const levelOptions = useMemo(
    () => ["All", ...Array.from(new Set(records.map((r) => r.eventLevel)))],
    [records],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return records.filter((r) => {
      const matchSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.taskID.toLowerCase().includes(q) ||
        r.paperTitle.toLowerCase().includes(q) ||
        r.conferenceName.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      const matchLevel = levelFilter === "All" || r.eventLevel === levelFilter;
      return matchSearch && matchStatus && matchLevel;
    });
  }, [records, search, statusFilter, levelFilter]);

  const handleDelete = (id: string) =>
    setRecords((prev) => prev.filter((r) => r.id !== id));

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="text-blue-600" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Paper Presentation
              </h1>
              <p className="text-sm text-slate-500">
                {filtered.length} record{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Link
            href="/achievements/paper-presentation/submit"
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
              placeholder="Search by ID, task, title, conference..."
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
              {["All", "Approved", "Pending", "Rejected"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="rounded-lg bg-white py-2.5 px-3 text-sm border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {levelOptions.map((l) => (
                <option key={l}>{l}</option>
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
                  "Paper Title",
                  "Conference Name",
                  "Mode",
                  "Level",
                  "Start Date",
                  "End Date",
                  "Sponsorship",
                  "Students",
                  "Award",
                  "Status",
                  "Submitted",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
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
                    colSpan={14}
                    className="px-4 py-12 text-center text-slate-400 text-sm"
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
                    <td className="px-4 py-3 text-blue-600 font-semibold whitespace-nowrap">
                      {r.id}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {r.taskID}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap max-w-[240px] truncate">
                      {r.paperTitle}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {r.conferenceName}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {r.eventMode}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {r.eventLevel}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {r.eventStartDate}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {r.eventEndDate}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {r.sponsorshipType}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {r.studentsInvolved}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {r.awardReceived}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {r.submittedDate}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(r.id)}
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
