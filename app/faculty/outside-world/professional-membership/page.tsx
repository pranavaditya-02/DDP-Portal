"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Award, Plus, Trash2, Search } from "lucide-react";

type Status = "Initiated" | "Approved" | "Rejected";

interface ProfessionalMembershipRecord {
  id: string;
  membershipCategory: string;
  faculty: string;
  taskId: string;
  nameOfProfessionalBody: string;
  membershipType: string;
  category: string;
  owiVerification: Status;
  submittedOn: string;
}

const sampleData: ProfessionalMembershipRecord[] = [
  {
    id: "PM001",
    membershipCategory: "Faculty Membership",
    faculty: "Dr. Priya",
    taskId: "OWI-1001",
    nameOfProfessionalBody: "IEEE",
    membershipType: "Annual",
    category: "International",
    owiVerification: "Approved",
    submittedOn: "2026-03-09",
  },
  {
    id: "PM002",
    membershipCategory: "Institute Membership",
    faculty: "Dr. Karthik",
    taskId: "OWI-1002",
    nameOfProfessionalBody: "ISTE",
    membershipType: "Lifetime",
    category: "National",
    owiVerification: "Initiated",
    submittedOn: "2026-03-13",
  },
];

const STATUS_OPTIONS: Array<"All" | Status> = [
  "All",
  "Initiated",
  "Approved",
  "Rejected",
];
const MEMBERSHIP_CATEGORY_OPTIONS = [
  "All",
  "Institute Membership",
  "Faculty Membership",
];

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    Initiated: "bg-amber-50 text-amber-700 border border-amber-200",
    Approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Rejected: "bg-red-50 text-red-700 border border-red-200",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export default function ProfessionalMembershipPage() {
  const [records, setRecords] =
    useState<ProfessionalMembershipRecord[]>(sampleData);
  const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");
  const [membershipFilter, setMembershipFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(
    () =>
      records.filter(
        (record) =>
          (statusFilter === "All" || record.owiVerification === statusFilter) &&
          (membershipFilter === "All" ||
            record.membershipCategory === membershipFilter) &&
          (searchQuery === "" ||
            record.nameOfProfessionalBody.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.faculty.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.taskId.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    [records, statusFilter, membershipFilter, searchQuery]
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      setRecords((prev) => prev.filter((record) => record.id !== id));
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="inline-flex rounded-lg bg-violet-50 p-3">
              <Award className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Professional Membership
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage professional and institute membership records
              </p>
            </div>
          </div>
          <Link
            href="/faculty/outside-world/professional-membership/submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Add Record
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by organization, faculty name, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Membership Category
            </label>
            <select
              value={membershipFilter}
              onChange={(e) => setMembershipFilter(e.target.value)}
              className="w-full px-3 py-2 border border-violet-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              {MEMBERSHIP_CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Verification Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "All" | Status)
              }
              className="w-full px-3 py-2 border border-violet-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>


        <div className="rounded-2xl border border-violet-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-violet-50 to-violet-100 border-b border-violet-100">
                {[
                  "ID",
                  "Membership Category",
                  "Faculty",
                  "Task ID",
                  "Professional Body",
                  "Membership Type",
                  "Category",
                  "Verification",
                  "Submitted",
                  "Actions",
                ].map((head) => (
                  <th
                    key={head}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wide whitespace-nowrap"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-50">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-10 text-center text-slate-400 text-sm"
                  >
                    No records found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-violet-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                      {record.id}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.membershipCategory}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {record.faculty}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {record.taskId}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap max-w-[220px] truncate">
                      {record.nameOfProfessionalBody}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {record.membershipType}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {record.category}
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
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
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
        <div className="px-4 py-3 border-t border-violet-100 bg-violet-50 text-xs text-slate-600 font-medium">
          Showing {filtered.length} of {records.length} record
          {records.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
