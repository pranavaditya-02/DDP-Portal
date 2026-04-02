"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Trophy,
  Video,
  XCircle,
} from "lucide-react";

type Status = "Approved" | "Pending" | "Rejected";

interface OnlineCourseRecord {
  id: string;
  courseName: string;
  provider: string;
  mode: string;
  duration: string;
  status: Status;
  submittedOn: string;
}

const SAMPLE_DATA: OnlineCourseRecord[] = [
  {
    id: "SC-001",
    courseName: "Machine Learning Foundations",
    provider: "NPTEL",
    mode: "Online",
    duration: "8 Weeks",
    status: "Approved",
    submittedOn: "2026-03-14",
  },
  {
    id: "SC-002",
    courseName: "Cloud Essentials",
    provider: "Coursera",
    mode: "Online",
    duration: "40 Hours",
    status: "Pending",
    submittedOn: "2026-03-22",
  },
  {
    id: "SC-003",
    courseName: "Data Visualization with Power BI",
    provider: "edX",
    mode: "Hybrid",
    duration: "6 Weeks",
    status: "Rejected",
    submittedOn: "2026-03-25",
  },
];

const StatusBadge = ({ status }: { status: Status }) => {
  const config = {
    Approved: {
      icon: CheckCircle2,
      classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    Pending: {
      icon: Clock,
      classes: "bg-amber-50 text-amber-700 border-amber-200",
    },
    Rejected: {
      icon: XCircle,
      classes: "bg-rose-50 text-rose-700 border-rose-200",
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.classes}`}
    >
      <Icon size={12} />
      {status}
    </span>
  );
};

export default function StudentOnlineCoursePage() {
  const [records] = useState<OnlineCourseRecord[]>(SAMPLE_DATA);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [modeFilter, setModeFilter] = useState<string>("All");

  const modeOptions = useMemo(
    () => ["All", ...Array.from(new Set(records.map((item) => item.mode)))],
    [records],
  );

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        !query ||
        record.id.toLowerCase().includes(query) ||
        record.courseName.toLowerCase().includes(query) ||
        record.provider.toLowerCase().includes(query) ||
        record.duration.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;
      const matchesMode = modeFilter === "All" || record.mode === modeFilter;

      return matchesSearch && matchesStatus && matchesMode;
    });
  }, [records, search, statusFilter, modeFilter]);

  const approvedCount = records.filter((record) => record.status === "Approved").length;
  const pendingCount = records.filter((record) => record.status === "Pending").length;
  const rejectedCount = records.filter((record) => record.status === "Rejected").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 text-white shadow-xl shadow-slate-200/60">
          <div className="relative px-6 py-8 sm:px-8 sm:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.24),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.16),_transparent_28%)]" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-100">
                  <Video size={14} />
                  Student Achievements
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Online Course Records
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                    Track student online course submissions, review statuses, and keep the record list filterable for quick checks.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: "Total", value: records.length, icon: Trophy },
                  { label: "Approved", value: approvedCount, icon: CheckCircle2 },
                  { label: "Pending", value: pendingCount, icon: Clock },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur"
                    >
                      <div className="flex items-center gap-2 text-slate-200">
                        <Icon size={14} />
                        <span className="text-xs font-medium">{item.label}</span>
                      </div>
                      <div className="mt-2 text-2xl font-bold">{item.value}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Approved",
              value: approvedCount,
              classes: "border-emerald-200 bg-emerald-50 text-emerald-700",
            },
            {
              label: "Pending",
              value: pendingCount,
              classes: "border-amber-200 bg-amber-50 text-amber-700",
            },
            {
              label: "Rejected",
              value: rejectedCount,
              classes: "border-rose-200 bg-rose-50 text-rose-700",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-2xl border px-5 py-4 shadow-sm ${item.classes}`}
            >
              <div className="text-xs font-semibold uppercase tracking-wide opacity-80">
                {item.label}
              </div>
              <div className="mt-2 text-3xl font-bold">{item.value}</div>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-md">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, course, provider, or duration"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Filter size={15} />
                <span>Filters</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-300 focus:bg-white"
              >
                {['All', 'Approved', 'Pending', 'Rejected'].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-300 focus:bg-white"
              >
                {modeOptions.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  {['ID', 'Course', 'Provider', 'Mode', 'Duration', 'Status', 'Submitted On'].map((head) => (
                    <th key={head} className="px-4 py-3 whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-4 py-4 font-semibold text-sky-700 whitespace-nowrap">
                        {record.id}
                      </td>
                      <td className="px-4 py-4 text-slate-700 whitespace-nowrap">
                        {record.courseName}
                      </td>
                      <td className="px-4 py-4 text-slate-600 whitespace-nowrap">
                        {record.provider}
                      </td>
                      <td className="px-4 py-4 text-slate-600 whitespace-nowrap">
                        {record.mode}
                      </td>
                      <td className="px-4 py-4 text-slate-600 whitespace-nowrap">
                        {record.duration}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-4 py-4 text-slate-600 whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          {record.submittedOn}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}