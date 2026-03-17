"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Plus, Trash2 } from "lucide-react";

type Status = "Initiated" | "Approved" | "Rejected";

interface ExternalVipRecord {
  id: string;
  taskID: string;
  eventName: string;
  eventType: string;
  designation: string;
  organizationName: string;
  startDate: string;
  endDate: string;
  specialLabsInvolved: string;
  iqacVerification: Status;
  submittedOn: string;
}

const sampleData: ExternalVipRecord[] = [
  {
    id: "VIP001",
    taskID: "OWI-401",
    eventName: "Industry Connect Lecture",
    eventType: "Guest lecture",
    designation: "Vice President - Engineering",
    organizationName: "TCS",
    startDate: "2026-02-11",
    endDate: "2026-02-11",
    specialLabsInvolved: "No",
    iqacVerification: "Approved",
    submittedOn: "2026-02-15",
  },
  {
    id: "VIP002",
    taskID: "OWI-402",
    eventName: "Innovation Talk",
    eventType: "Technical Events",
    designation: "R&D Head",
    organizationName: "Zoho",
    startDate: "2026-03-03",
    endDate: "2026-03-03",
    specialLabsInvolved: "yes",
    iqacVerification: "Initiated",
    submittedOn: "2026-03-07",
  },
];

const EVENT_TYPE_OPTIONS = [
  "All",
  "Work Shop",
  "Conference",
  "Symposium",
  "Value Added Course",
  "One credit Course",
  "Non-technical Events",
  "Technical Events",
  "Special Programs",
  "Leader of the week",
  "Guest lecture",
  "Placement Visit",
  "FDP/SDP",
  "Certificate course",
  "Other",
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

export default function ExternalVipVisitPage() {
  const [records, setRecords] = useState<ExternalVipRecord[]>(sampleData);
  const [eventTypeFilter, setEventTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");

  const filtered = records.filter(
    (r) =>
      (eventTypeFilter === "All" || r.eventType === eventTypeFilter) &&
      (statusFilter === "All" || r.iqacVerification === statusFilter),
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
            <Users className="h-6 w-6 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                OWI - External VIP Visit
              </h1>
              <p className="text-sm text-slate-500">
                External VIP visit records
              </p>
            </div>
          </div>
          <Link
            href="/faculty/outside-world/external-vip-visit/submit"
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-[#2572ed] hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Event Type
            </label>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {EVENT_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              IQAC Verification
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "All" | Status)
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {STATUS_OPTIONS.map((option) => (
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
                    "Task ID",
                    "Event",
                    "Event Type",
                    "Designation",
                    "Organization",
                    "Start",
                    "End",
                    "Special Lab",
                    "IQAC",
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
                      colSpan={12}
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
                        {r.taskID}
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate">
                        {r.eventName}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {r.eventType}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {r.designation}
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-[180px] truncate">
                        {r.organizationName}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {r.startDate}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {r.endDate}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {r.specialLabsInvolved}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={r.iqacVerification} />
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {r.submittedOn}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.iqacVerification === "Initiated" && (
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
