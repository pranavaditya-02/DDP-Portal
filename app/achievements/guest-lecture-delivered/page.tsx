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
  Mic,
} from "lucide-react";

type Status = "Approved" | "Pending" | "Rejected";

interface GuestLectureRecord {
  id: string;
  taskID: string;
  specialLabsInvolved: "yes" | "no";
  specialLab: string;
  eventType: string;
  topic: string;
  modeOfConduct: string;
  eventLevel: string;
  eventName: string;
  fromDate: string;
  toDate: string;
  numberOfDays: string;
  typeOfOrganization: string;
  companyName: string;
  companyAddress: string;
  numberOfParticipants: string;
  typeOfAudience: string;
  status: Status;
  submittedDate: string;
}

const SAMPLE_DATA: GuestLectureRecord[] = [
  {
    id: "GL001",
    taskID: "TASK-GL-2024-001",
    specialLabsInvolved: "yes",
    specialLab: "AI Lab",
    eventType: "Guest Lecture",
    topic: "Generative AI in Education",
    modeOfConduct: "Hybrid",
    eventLevel: "National",
    eventName: "Tech Talk Series 2024",
    fromDate: "2024-08-12",
    toDate: "2024-08-12",
    numberOfDays: "1",
    typeOfOrganization: "Industry",
    companyName: "Infosys",
    companyAddress: "Bengaluru, Karnataka",
    numberOfParticipants: "180",
    typeOfAudience: "Students",
    status: "Approved",
    submittedDate: "2024-08-15",
  },
  {
    id: "GL002",
    taskID: "TASK-GL-2024-002",
    specialLabsInvolved: "no",
    specialLab: "",
    eventType: "Webinar",
    topic: "Industry 4.0 Trends",
    modeOfConduct: "Online",
    eventLevel: "International",
    eventName: "Global Webinar Week",
    fromDate: "2024-09-02",
    toDate: "2024-09-03",
    numberOfDays: "2",
    typeOfOrganization: "Foreign Institute",
    companyName: "University of Sheffield",
    companyAddress: "Sheffield, UK",
    numberOfParticipants: "95",
    typeOfAudience: "Teaching Faculty",
    status: "Pending",
    submittedDate: "2024-09-04",
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

export default function GuestLectureDeliveredPage() {
  const [records, setRecords] = useState<GuestLectureRecord[]>(SAMPLE_DATA);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  const typeOptions = useMemo(
    () => [
      "All",
      ...Array.from(new Set(records.map((item) => item.eventType))),
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
        record.eventName.toLowerCase().includes(query) ||
        record.topic.toLowerCase().includes(query) ||
        record.typeOfOrganization.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;
      const matchesType =
        typeFilter === "All" || record.eventType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [records, search, statusFilter, typeFilter]);

  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mic className="text-blue-600" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Guest Lecture Delivered
              </h1>
              <p className="text-sm text-slate-500">
                {filtered.length} record{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <Link
            href="/achievements/guest-lecture-delivered/submit"
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
              placeholder="Search by ID, task, event, topic..."
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg bg-white py-2.5 px-3 text-sm border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {typeOptions.map((type) => (
                <option key={type}>{type}</option>
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
                  "Special Labs",
                  "Special Lab",
                  "Event Type",
                  "Topic",
                  "Mode",
                  "Level",
                  "Event Name",
                  "From Date",
                  "To Date",
                  "No. of Days",
                  "Organization Type",
                  "Organization Name",
                  "Organization Address",
                  "Participants",
                  "Audience Type",
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
                    colSpan={20}
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
                      {record.eventType}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.topic}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.modeOfConduct}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.eventLevel}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.eventName}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.fromDate}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.toDate}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.numberOfDays}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.typeOfOrganization}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.companyName || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.companyAddress || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.numberOfParticipants}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.typeOfAudience}
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
