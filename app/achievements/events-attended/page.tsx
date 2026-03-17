"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Users,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
} from "lucide-react";

type RecordStatus = "Approved" | "Pending" | "Rejected";

interface EventsAttendedRecord {
  id: string;
  taskID: string;
  specialLabsInvolved: "yes" | "no";
  specialLab?: string;
  eventType: string;
  otherEventType?: string;
  psDomain?: string;
  psDomainLevel?: string;
  topicName: string;
  organizerType: string;
  industryNameText?: string;
  industryAddress?: string;
  industryNameSelect?: string;
  instituteName?: string;
  eventLevel: string;
  eventTitle: string;
  organizationSector: string;
  eventOrganizer: string;
  eventMode: string;
  eventLocation: string;
  eventDuration: string;
  startDate: string;
  endDate: string;
  durationInDays: string;
  otherOrganizerName?: string;
  sponsorshipType: string;
  apexProofName?: string;
  fundingAgencyName?: string;
  amount?: string;
  outcome: string;
  otherOutcome?: string;
  certificateProofName: string;
  geotagPhotosName?: string;
  status: RecordStatus;
  remarks: string;
}

function StatusBadge({ status }: { status: RecordStatus }) {
  const config = {
    Approved: { icon: CheckCircle2, class: "bg-emerald-50 text-emerald-600" },
    Pending: { icon: Clock, class: "bg-amber-50 text-amber-600" },
    Rejected: { icon: XCircle, class: "bg-red-50 text-red-600" },
  };

  const cfg = config[status];
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.class}`}
    >
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

export default function EventsAttendedPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RecordStatus>("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [records, setRecords] = useState<EventsAttendedRecord[]>([
    {
      id: "1",
      taskID: "EA001",
      specialLabsInvolved: "yes",
      specialLab: "AI Research Lab",
      eventType: "Workshop",
      topicName: "Generative AI in Education",
      organizerType: "Institute in India",
      instituteName: "IIT Madras",
      eventLevel: "National (Outside Tamilnadu)",
      eventTitle: "National AI Workshop 2025",
      organizationSector: "Government",
      eventOrganizer: "IIT Madras",
      eventMode: "Offline",
      eventLocation: "Chennai",
      eventDuration: "Days",
      startDate: "2025-09-10",
      endDate: "2025-09-12",
      durationInDays: "3",
      sponsorshipType: "BIT",
      apexProofName: "apex-proof.pdf",
      amount: "5000",
      outcome: "Programs organized",
      certificateProofName: "event-certificate.pdf",
      geotagPhotosName: "geotag-photo.jpg",
      status: "Approved",
      remarks: "Approved by verification team.",
    },
    {
      id: "2",
      taskID: "EA002",
      specialLabsInvolved: "no",
      eventType: "PS-Certification (BIT)",
      psDomain: "Data Science",
      psDomainLevel: "Intermediate",
      topicName: "Applied Data Science",
      organizerType: "Industry",
      industryNameText: "Oracle Academy",
      industryAddress: "Bangalore",
      industryNameSelect: "ORACLE DATA PLATFORM 2025 FOUNDATIONS ASSOCIATE",
      eventLevel: "International",
      eventTitle: "Oracle Data Platform Certification Bootcamp",
      organizationSector: "Private",
      eventOrganizer: "Oracle Academy",
      eventMode: "Online",
      eventLocation: "Virtual",
      eventDuration: "Weeks",
      startDate: "2025-11-01",
      endDate: "2025-11-21",
      durationInDays: "21",
      sponsorshipType: "Funding Agency",
      fundingAgencyName: "Oracle Academy",
      outcome: "Others",
      otherOutcome: "Improved certification readiness",
      certificateProofName: "oracle-certification.pdf",
      status: "Pending",
      remarks: "Awaiting certificate verification.",
    },
  ]);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this event record?")) {
      setRecords(records.filter((record) => record.id !== id));
    }
  };

  const typeOptions = useMemo(() => {
    const unique = Array.from(
      new Set(records.map((record) => record.eventType)),
    );
    return ["all", ...unique];
  }, [records]);

  const filteredRecords = useMemo(() => {
    let data = [...records];

    if (search.trim()) {
      const query = search.toLowerCase();
      data = data.filter((item) =>
        [
          item.taskID,
          item.eventType,
          item.topicName,
          item.eventTitle,
          item.eventOrganizer,
          item.eventLocation,
          item.status,
          item.remarks,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query),
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((item) => item.status === statusFilter);
    }

    if (typeFilter !== "all") {
      data = data.filter((item) => item.eventType === typeFilter);
    }

    return data;
  }, [records, search, statusFilter, typeFilter]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto">
      <div className="max-w-[1320px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Events Attended
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track and manage your attended event records
            </p>
          </div>
          <Link
            href="/achievements/events-attended/submit"
            className="w-fit inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2572ed] text-white font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events attended..."
              className="w-full h-11 rounded-full bg-white pl-12 pr-4 text-slate-700 placeholder:text-slate-400 border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="relative w-full sm:w-44">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | RecordStatus)
              }
              className="w-full h-11 rounded-lg bg-white pl-10 pr-3 text-slate-700 border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-52 h-11 rounded-lg bg-white px-3 text-slate-700 border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All Types" : option}
              </option>
            ))}
          </select>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          {filteredRecords.length} record
          {filteredRecords.length === 1 ? "" : "s"} found
        </p>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">
                No event records found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Add a record to see it here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-max border-collapse mx-auto">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Special Labs Involved
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Special Lab
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Event Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Other Event Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      PS Domain
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      PS Domain Level
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Topic Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Organizer Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Industry Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Industry Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Industry Select
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Institute Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Event Level
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Event Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Organization Sector
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Event Organizer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Event Mode
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Event Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Event Duration
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Duration in Days
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Other Organizer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Sponsorship Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Apex Proof
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Funding Agency
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Outcome
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Other Outcome
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Certificate Proof
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Geotag Photos
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Remarks
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((item, index) => (
                    <tr
                      key={item.id}
                      className={
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      }
                    >
                      <td className="px-4 py-3 text-sm text-blue-600 font-semibold whitespace-nowrap">
                        {item.taskID}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 capitalize">
                        {item.specialLabsInvolved}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.specialLab || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.eventType}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.otherEventType || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.psDomain || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.psDomainLevel || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.topicName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.organizerType}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.industryNameText || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.industryAddress || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.industryNameSelect || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.instituteName || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.eventLevel}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.eventTitle}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.organizationSector}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.eventOrganizer}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.eventMode}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.eventLocation}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.eventDuration}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                        {new Date(item.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                        {new Date(item.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.durationInDays}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.otherOrganizerName || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.sponsorshipType}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.apexProofName || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.fundingAgencyName || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.amount || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.outcome}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.otherOutcome || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.certificateProofName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.geotagPhotosName || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.remarks}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-500 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
