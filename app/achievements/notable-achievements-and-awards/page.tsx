"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Trophy,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
} from "lucide-react";

interface Achievement {
  id: string;
  taskID: string;
  specialLabsInvolved: "yes" | "no";
  specialLab?: string;
  technicalSocietyInvolved: "yes" | "no";
  technicalSocietyChapter?: string;
  typeOfRecognition: string;
  awardType?: string;
  achievementType?: string;
  awardName: string;
  organizationType: string;
  otherOrganizationName?: string;
  awardingAgency: string;
  level: string;
  receivedDate: string;
  natureOfRecognition: string;
  prizeAmount?: string;
  photoProofName: string;
  documentProofName: string;
  remarks: string;
  status: "Approved" | "Pending" | "Rejected";
}

function StatusBadge({ status }: { status: Achievement["status"] }) {
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

export default function NotableAchievementsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | Achievement["status"]
  >("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "Award" | "Achievement">(
    "all",
  );
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "1",
      taskID: "ACH001",
      specialLabsInvolved: "yes",
      specialLab: "IoT Innovation Lab",
      technicalSocietyInvolved: "yes",
      technicalSocietyChapter: "IEEE",
      typeOfRecognition: "Award",
      awardType: "Faculty Award",
      awardName: "Best Faculty Award",
      organizationType: "Government",
      awardingAgency: "AICTE",
      level: "National",
      receivedDate: "2025-06-15",
      natureOfRecognition: "Certificate",
      photoProofName: "best-faculty-award-photo.jpg",
      documentProofName: "best-faculty-award-certificate.pdf",
      remarks: "Verified by IQAC committee.",
      status: "Approved",
    },
    {
      id: "2",
      taskID: "ACH002",
      specialLabsInvolved: "no",
      technicalSocietyInvolved: "no",
      typeOfRecognition: "Achievement",
      achievementType: "NPTEL Gold Medal",
      awardName: "NPTEL Gold Medal",
      organizationType: "Government",
      awardingAgency: "NPTEL",
      level: "National",
      receivedDate: "2025-07-20",
      natureOfRecognition: "Certificate",
      photoProofName: "nptel-gold-medal-photo.png",
      documentProofName: "nptel-gold-medal-proof.pdf",
      remarks: "Pending department review.",
      status: "Pending",
    },
  ]);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this achievement?")) {
      setAchievements(achievements.filter((a) => a.id !== id));
    }
  };

  const filteredAchievements = useMemo(() => {
    let data = [...achievements];

    if (search.trim()) {
      const query = search.toLowerCase();
      data = data.filter((item) =>
        [
          item.taskID,
          item.awardName,
          item.awardingAgency,
          item.remarks,
          item.level,
          item.typeOfRecognition,
          item.status,
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
      data = data.filter((item) => item.typeOfRecognition === typeFilter);
    }

    return data;
  }, [achievements, search, statusFilter, typeFilter]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto">
      <div className="max-w-[1320px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Notable Achievements and Awards
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track and manage your faculty achievements
            </p>
          </div>
          <Link
            href="/achievements/notable-achievements-and-awards/submit"
            className="w-fit inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2572ed] text-white font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Achievement
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search achievements..."
              className="w-full h-11 rounded-full bg-white pl-12 pr-4 text-slate-700 placeholder:text-slate-400 border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="relative w-full sm:w-44">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | Achievement["status"])
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
            onChange={(e) =>
              setTypeFilter(e.target.value as "all" | "Award" | "Achievement")
            }
            className="w-full sm:w-44 h-11 rounded-lg bg-white px-3 text-slate-700 border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="all">All Types</option>
            <option value="Award">Award</option>
            <option value="Achievement">Achievement</option>
          </select>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          {filteredAchievements.length} record
          {filteredAchievements.length === 1 ? "" : "s"} found
        </p>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">
                No achievements found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Add an achievement to see records here
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
                      Technical Society Involved
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Technical Society & Chapter
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Type of Recognition
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Award Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Achievement Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Name of Award / Achievement
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Organization Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Other Organization Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Awarding Agency
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Received Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Nature of Recognition
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Prize Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Photo Proof Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Document Proof Name
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
                  {filteredAchievements.map((achievement, index) => (
                    <tr
                      key={achievement.id}
                      className={
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      }
                    >
                      <td className="px-4 py-3 text-sm text-blue-600 font-semibold whitespace-nowrap">
                        {achievement.taskID}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 capitalize">
                        {achievement.specialLabsInvolved}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {achievement.specialLab || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 capitalize">
                        {achievement.technicalSocietyInvolved}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {achievement.technicalSocietyChapter || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {achievement.typeOfRecognition}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {achievement.awardType || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {achievement.achievementType || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {achievement.awardName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {achievement.organizationType}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {achievement.otherOrganizationName || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {achievement.awardingAgency}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {achievement.level}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                        {new Date(
                          achievement.receivedDate,
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {achievement.natureOfRecognition}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {achievement.prizeAmount
                          ? `₹${achievement.prizeAmount}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {achievement.photoProofName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {achievement.documentProofName}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <StatusBadge status={achievement.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {achievement.remarks}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDelete(achievement.id)}
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
