"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
} from "lucide-react";

type Status = "Approved" | "Pending" | "Rejected";

interface EventOrganized {
  id: string;
  taskId: string;
  role: string;
  department: string;
  eventName: string;
  programType: string;
  eventType: string;
  eventCategory: string;
  eventMode: string;
  eventLevel: string;
  startDate: string;
  endDate: string;
  duration: string;
  internalStudents: number;
  internalFaculty: number;
  externalStudents: number;
  externalFaculty: number;
  jointlyOrganizedWith: string;
  registrationAmount: number;
  sponsoredAmount: number;
  totalRevenue: number;
  isIIC: string;
  isDeptAssociation: string;
  isRnd: string;
  isTechSociety: string;
  isMouOutcome: string;
  isIrpOutcome: string;
  isCoe: string;
  isIndustryLab: string;
  status: Status;
  submittedDate: string;
}

const SAMPLE_DATA: EventOrganized[] = [
  {
    id: "EO001",
    taskId: "TASK-2024-001",
    role: "Convener",
    department: "CSE",
    eventName: "National Workshop on AI & Machine Learning",
    programType: "Academic",
    eventType: "Workshop",
    eventCategory: "Technical skill Development",
    eventMode: "Hybrid",
    eventLevel: "National",
    startDate: "2024-03-01",
    endDate: "2024-03-03",
    duration: "3",
    internalStudents: 120,
    internalFaculty: 15,
    externalStudents: 80,
    externalFaculty: 10,
    jointlyOrganizedWith: "Industry",
    registrationAmount: 5000,
    sponsoredAmount: 20000,
    totalRevenue: 25000,
    isIIC: "Yes",
    isDeptAssociation: "Yes",
    isRnd: "No",
    isTechSociety: "No",
    isMouOutcome: "No",
    isIrpOutcome: "No",
    isCoe: "No",
    isIndustryLab: "No",
    status: "Approved",
    submittedDate: "2024-03-10",
  },
  {
    id: "EO002",
    taskId: "TASK-2024-002",
    role: "Co-ordinator",
    department: "ECE",
    eventName: "International Conference on Embedded Systems",
    programType: "Academic",
    eventType: "Conference",
    eventCategory: "Research Methodology",
    eventMode: "Offline",
    eventLevel: "International",
    startDate: "2024-04-15",
    endDate: "2024-04-17",
    duration: "3",
    internalStudents: 50,
    internalFaculty: 20,
    externalStudents: 150,
    externalFaculty: 30,
    jointlyOrganizedWith: "Foreign Institute",
    registrationAmount: 15000,
    sponsoredAmount: 50000,
    totalRevenue: 65000,
    isIIC: "No",
    isDeptAssociation: "Yes",
    isRnd: "Yes",
    isTechSociety: "Yes",
    isMouOutcome: "Yes",
    isIrpOutcome: "No",
    isCoe: "No",
    isIndustryLab: "No",
    status: "Pending",
    submittedDate: "2024-04-20",
  },
];

const StatusBadge = ({ status }: { status: Status }) => {
  const cfg = {
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
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.cls}`}
    >
      <Icon size={12} />
      {status}
    </span>
  );
};

export default function EventsOrganizedPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [records, setRecords] = useState<EventOrganized[]>(SAMPLE_DATA);

  const eventTypes = useMemo(
    () => ["All", ...Array.from(new Set(records.map((r) => r.eventType)))],
    [records],
  );

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.eventName.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.eventType.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      const matchType = typeFilter === "All" || r.eventType === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [records, search, statusFilter, typeFilter]);

  const handleDelete = (id: string) =>
    setRecords((prev) => prev.filter((r) => r.id !== id));

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="text-blue-600" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Events Organized
              </h1>
              <p className="text-sm text-slate-500">
                {filtered.length} record{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Link
            href="/achievements/events-organized/submit"
            className="w-fit inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2572ed] text-white font-semibold shadow-sm hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus size={18} />
            Add Record
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by ID, event name, dept…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg bg-white py-2.5 px-3 text-sm border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {eventTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: "3600px" }}>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  "ID",
                  "Task ID",
                  "Role",
                  "Department",
                  "Event Name",
                  "Program Type",
                  "Event Type",
                  "Event Category",
                  "Event Mode",
                  "Event Level",
                  "Start Date",
                  "End Date",
                  "Duration (Days)",
                  "Int. Students",
                  "Int. Faculty",
                  "Ext. Students",
                  "Ext. Faculty",
                  "Jointly Organized",
                  "IIC",
                  "Dept Assoc.",
                  "R&D",
                  "Tech Society",
                  "MoU",
                  "IRP",
                  "CoE",
                  "Industry Lab",
                  "Reg. Amount",
                  "Sponsored Amt.",
                  "Total Revenue",
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
                    colSpan={32}
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
                      {r.taskId}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {r.role}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {r.department}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {r.eventName}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {r.programType}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {r.eventType}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {r.eventCategory}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {r.eventMode}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {r.eventLevel}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {r.startDate}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {r.endDate}
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-center">
                      {r.duration}
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-center">
                      {r.internalStudents}
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-center">
                      {r.internalFaculty}
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-center">
                      {r.externalStudents}
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-center">
                      {r.externalFaculty}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {r.jointlyOrganizedWith}
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-center">
                      {r.isIIC}
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-center">
                      {r.isDeptAssociation}
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-center">
                      {r.isRnd}
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-center">
                      {r.isTechSociety}
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-center">
                      {r.isMouOutcome}
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-center">
                      {r.isIrpOutcome}
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-center">
                      {r.isCoe}
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-center">
                      {r.isIndustryLab}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      ₹{r.registrationAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      ₹{r.sponsoredAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      ₹{r.totalRevenue.toLocaleString()}
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
