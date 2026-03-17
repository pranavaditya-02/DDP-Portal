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
  Globe,
} from "lucide-react";

type Status = "Approved" | "Pending" | "Rejected";

interface InternationalVisitRecord {
  id: string;
  taskID: string;
  countryVisited: string;
  purposeOfVisit: string;
  fromDate: string;
  toDate: string;
  fundType: string;
  fundingAgencyName: string;
  apexProofUploaded: "Yes" | "No";
  status: Status;
  submittedDate: string;
}

const SAMPLE_DATA: InternationalVisitRecord[] = [
  {
    id: "IV001",
    taskID: "TASK-IV-2024-001",
    countryVisited: "Singapore",
    purposeOfVisit: "Research Collaboration",
    fromDate: "2024-08-04",
    toDate: "2024-08-08",
    fundType: "Management",
    fundingAgencyName: "",
    apexProofUploaded: "Yes",
    status: "Approved",
    submittedDate: "2024-08-12",
  },
  {
    id: "IV002",
    taskID: "TASK-IV-2024-002",
    countryVisited: "Germany",
    purposeOfVisit: "Conference Participation",
    fromDate: "2024-09-15",
    toDate: "2024-09-20",
    fundType: "Funding Agency",
    fundingAgencyName: "AICTE",
    apexProofUploaded: "No",
    status: "Pending",
    submittedDate: "2024-09-22",
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

export default function InternationalVisitPage() {
  const [records, setRecords] =
    useState<InternationalVisitRecord[]>(SAMPLE_DATA);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [fundTypeFilter, setFundTypeFilter] = useState<string>("All");

  const fundTypeOptions = useMemo(
    () => ["All", ...Array.from(new Set(records.map((item) => item.fundType)))],
    [records],
  );

  const filtered = useMemo(() => {
    return records.filter((record) => {
      const query = search.toLowerCase();
      const matchesSearch =
        !query ||
        record.id.toLowerCase().includes(query) ||
        record.taskID.toLowerCase().includes(query) ||
        record.countryVisited.toLowerCase().includes(query) ||
        record.purposeOfVisit.toLowerCase().includes(query) ||
        record.fundType.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;
      const matchesFund =
        fundTypeFilter === "All" || record.fundType === fundTypeFilter;

      return matchesSearch && matchesStatus && matchesFund;
    });
  }, [records, search, statusFilter, fundTypeFilter]);

  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Globe className="text-blue-600" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                International Visit
              </h1>
              <p className="text-sm text-slate-500">
                {filtered.length} record{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <Link
            href="/achievements/international-visit/submit"
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
              placeholder="Search by ID, task, country, purpose..."
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
              value={fundTypeFilter}
              onChange={(e) => setFundTypeFilter(e.target.value)}
              className="rounded-lg bg-white py-2.5 px-3 text-sm border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {fundTypeOptions.map((item) => (
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
                  "Country Visited",
                  "Purpose of Visit",
                  "From Date",
                  "To Date",
                  "Fund Type",
                  "Funding Agency Name",
                  "Apex Proof",
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
                    colSpan={12}
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
                      {record.countryVisited}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.purposeOfVisit}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.fromDate}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.toDate}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.fundType}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.fundingAgencyName || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.apexProofUploaded}
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
