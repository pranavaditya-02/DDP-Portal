"use client";

import { useMemo, useState } from "react";
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Trophy,
  XCircle,
} from "lucide-react";

type Status = "Approved" | "Pending" | "Rejected";

interface CompetitionReport {
  id: string;
  competitionName: string;
  level: string;
  participant: string;
  prize: string;
  status: Status;
  reportedOn: string;
}

const SAMPLE_DATA: CompetitionReport[] = [
  {
    id: "CR-001",
    competitionName: "Inter-College Hackathon",
    level: "State",
    participant: "Aarav Singh",
    prize: "Winner",
    status: "Approved",
    reportedOn: "2026-03-10",
  },
  {
    id: "CR-002",
    competitionName: "Smart India Challenge",
    level: "National",
    participant: "Meera Patel",
    prize: "Finalist",
    status: "Pending",
    reportedOn: "2026-03-18",
  },
  {
    id: "CR-003",
    competitionName: "Coding Sprint 2026",
    level: "University",
    participant: "Rahul Verma",
    prize: "Second Prize",
    status: "Rejected",
    reportedOn: "2026-03-24",
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

export default function CompetitionReportPage() {
  const [records] = useState<CompetitionReport[]>(SAMPLE_DATA);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [levelFilter, setLevelFilter] = useState<string>("All");

  const levelOptions = useMemo(
    () => ["All", ...Array.from(new Set(records.map((item) => item.level)))],
    [records],
  );

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        !query ||
        record.id.toLowerCase().includes(query) ||
        record.competitionName.toLowerCase().includes(query) ||
        record.participant.toLowerCase().includes(query) ||
        record.prize.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;
      const matchesLevel = levelFilter === "All" || record.level === levelFilter;

      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [records, search, statusFilter, levelFilter]);

  const approvedCount = records.filter((record) => record.status === "Approved").length;
  const pendingCount = records.filter((record) => record.status === "Pending").length;
  const rejectedCount = records.filter((record) => record.status === "Rejected").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-[#12233d] text-white shadow-xl shadow-slate-200/60">
          <div className="relative px-6 py-8 sm:px-8 sm:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.20),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.16),_transparent_28%)]" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">
                  <Award size={14} />
                  Student Achievements
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Competition Report
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                    Review competition submissions, prizes, and approval status in one place.
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
                placeholder="Search by ID, competition, participant, or prize"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-amber-300 focus:bg-white focus:ring-4 focus:ring-amber-100"
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
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-amber-300 focus:bg-white"
              >
                {['All', 'Approved', 'Pending', 'Rejected'].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-amber-300 focus:bg-white"
              >
                {levelOptions.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  {['ID', 'Competition', 'Level', 'Participant', 'Prize', 'Status', 'Reported On'].map((head) => (
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
                      <td className="px-4 py-4 font-semibold text-amber-700 whitespace-nowrap">
                        {record.id}
                      </td>
                      <td className="px-4 py-4 text-slate-700 whitespace-nowrap">
                        {record.competitionName}
                      </td>
                      <td className="px-4 py-4 text-slate-600 whitespace-nowrap">
                        {record.level}
                      </td>
                      <td className="px-4 py-4 text-slate-600 whitespace-nowrap">
                        {record.participant}
                      </td>
                      <td className="px-4 py-4 text-slate-600 whitespace-nowrap">
                        {record.prize}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-4 py-4 text-slate-600 whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          {record.reportedOn}
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