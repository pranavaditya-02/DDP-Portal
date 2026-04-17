"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { apiClient } from "@/lib/api";

interface IndustryOption {
  id: number;
  industry: string;
}

interface StudentOption {
  id: number;
  student_name: string;
  roll_no?: string | null;
  college_email?: string | null;
  department?: string | null;
}

export default function CreateTrackerPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  // Student autocomplete state — start empty, require explicit selection
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [studentQuery, setStudentQuery] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(
    null,
  );
  const [showStudentSuggestions, setShowStudentSuggestions] =
    useState<boolean>(false);

  // Industry autocomplete state
  const [industries, setIndustries] = useState<IndustryOption[]>([]);
  const [industryQuery, setIndustryQuery] = useState<string>("");
  const [selectedIndustryId, setSelectedIndustryId] = useState<number | null>(
    null,
  );
  const [showIndustrySuggestions, setShowIndustrySuggestions] =
    useState<boolean>(false);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [aimObjectiveFile, setAimObjectiveFile] = useState<File | null>(null);
  const [offerLetterFile, setOfferLetterFile] = useState<File | null>(null);
  const aimObjectiveInputRef = useRef<HTMLInputElement | null>(null);
  const offerLetterInputRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const duration = useMemo(() => {
    if (!startDate || !endDate) return "";
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";
    const diff = Math.max(
      0,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    );
    return diff.toString();
  }, [startDate, endDate]);

  // Load industries on mount
  useEffect(() => {
    const loadIndustries = async () => {
      try {
        const response = await apiClient.getActiveIndustries();
        setIndustries(response?.industries || []);
      } catch (loadError) {
        console.error("Failed to load active industries:", loadError);
      }
    };

    loadIndustries();
  }, []);

  // Debounced load students on query change
  useEffect(() => {
    let cancelled = false;

    if (!studentQuery || studentQuery.trim().length === 0) {
      setStudents([]);
      return;
    }

    const loadStudents = async () => {
      try {
        const response = await apiClient.getStudents(studentQuery.trim());
        if (!cancelled) {
          setStudents(response?.students || []);
        }
      } catch (loadError) {
        console.error("Failed to load students:", loadError);
      }
    };

    const timer = window.setTimeout(() => {
      loadStudents();
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [studentQuery]);

  const filteredStudents = useMemo(() => {
    const normalizedQuery = studentQuery.trim().toLowerCase();
    if (!normalizedQuery) return [];
    return students
      .filter((item) => {
        const searchableText = [
          item.student_name,
          item.roll_no,
          item.college_email,
          item.department,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchableText.includes(normalizedQuery);
      })
      .slice(0, 50);
  }, [students, studentQuery]);

  const handleStudentSelect = (student: StudentOption) => {
    setSelectedStudent(student);
    setStudentQuery(
      student.student_name +
        (student.college_email ? ` (${student.college_email})` : ""),
    );
    setShowStudentSuggestions(false);
  };

  const handleStudentInputChange = (value: string) => {
    // typing invalidates explicit selection
    setStudentQuery(value);
    setSelectedStudent(null);
    setShowStudentSuggestions(true);
  };

  const handleIndustrySelect = (industry: IndustryOption) => {
    setIndustryQuery(industry.industry);
    setSelectedIndustryId(industry.id);
    setShowIndustrySuggestions(false);
  };

  const clearForm = () => {
    setStudentQuery("");
    setSelectedStudent(null);
    setIndustryQuery("");
    setSelectedIndustryId(null);
    setStartDate("");
    setEndDate("");
    setAimObjectiveFile(null);
    setOfferLetterFile(null);
    if (aimObjectiveInputRef.current) {
      aimObjectiveInputRef.current.value = "";
    }
    if (offerLetterInputRef.current) {
      offerLetterInputRef.current.value = "";
    }
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent, clearAfter = false) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    // Require explicit selection from suggestions before submit
    if (!selectedStudent) {
      setError("Please select a student from the suggestions.");
      return;
    }

    if (!selectedIndustryId && industryQuery.trim().length === 0) {
      setError("Please choose an industry from the suggestions.");
      return;
    }

    const selectedIndustry = industries.find(
      (item) =>
        item.id === selectedIndustryId ||
        item.industry.toLowerCase() === industryQuery.trim().toLowerCase(),
    );

    if (!selectedIndustry) {
      setError("Please choose a valid industry from the list.");
      return;
    }

    if (!startDate || !endDate) {
      setError("Start date and end date are required.");
      return;
    }

    if (!aimObjectiveFile || !offerLetterFile) {
      setError("Both Aim & Objective and Offer Letter files must be uploaded.");
      return;
    }

    const formData = new FormData();
    formData.append("student_id", String(selectedStudent.id));
    formData.append("industry_id", String(selectedIndustry.id));
    formData.append("start_date", startDate);
    formData.append("end_date", endDate);
    formData.append("aimObjectiveFile", aimObjectiveFile);
    formData.append("offerLetterFile", offerLetterFile);

    try {
      setSubmitting(true);
      await apiClient.createInternshipTracker(formData);
      setMessage("Internship tracker submitted successfully.");

      if (clearAfter) {
        clearForm();
        return;
      }

      router.push("/student/internship/tracker");
    } catch (submitError: any) {
      console.error("Submission failed:", submitError);
      setError(
        submitError?.response?.data?.error ||
          submitError?.message ||
          "Failed to submit internship tracker.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Create Internship Tracker</h1>
            <p className="text-sm text-slate-500 mt-1">Fill in details and upload proof documents to submit an internship tracker.</p>
          </div>
          <Link href="/student/internship/tracker" className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition">Back</Link>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden">
          <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 md:p-8 space-y-6">
            {message && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>
            )}
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
            {/* Student autocomplete */}
            <div className="sm:col-span-2 relative">
              <label className="block text-md font-medium text-slate-700 mb-2">
                Student *
              </label>
              <input
                type="text"
                value={studentQuery}
                onChange={(e) => handleStudentInputChange(e.target.value)}
                onFocus={() => setShowStudentSuggestions(true)}
                onBlur={() =>
                  setTimeout(() => setShowStudentSuggestions(false), 150)
                }
                placeholder="Type to search students (selection required)"
                className="input-base w-full"
                autoComplete="off"
              />
              {showStudentSuggestions && studentQuery.trim().length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded shadow-lg max-h-56 overflow-auto">
                  {filteredStudents.length === 0 ? (
                    <div className="p-2 text-xs text-slate-500">
                      No matching students
                    </div>
                  ) : (
                    filteredStudents.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className="w-full text-left px-2 py-1 hover:bg-slate-100"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleStudentSelect(opt)}
                      >
                        <div className="text-sm font-medium text-slate-700">
                          {opt.student_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {opt.roll_no ? `${opt.roll_no} • ` : ""}
                          {opt.college_email ?? opt.department ?? ""}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
              <p className="text-xs text-slate-500">
                Type student name / roll / email to search; you must select a
                result from the suggestions to submit.
              </p>
              {selectedStudent && (
                <div className="mt-2 text-sm text-slate-600">
                  Selected: {selectedStudent.student_name}{" "}
                  {selectedStudent.college_email
                    ? `(${selectedStudent.college_email})`
                    : ""}
                </div>
              )}
            </div>

            {/* Industry autocomplete */}
            <div className="sm:col-span-2 space-y-2 relative">
              <label className="block text-sm font-medium text-slate-700 mt-2 mb-2">
                Industry *
              </label>
              <input
                type="text"
                value={industryQuery}
                onChange={(e) => {
                  setIndustryQuery(e.target.value);
                  setSelectedIndustryId(null);
                  setShowIndustrySuggestions(true);
                }}
                onFocus={() => setShowIndustrySuggestions(true)}
                onBlur={() =>
                  setTimeout(() => setShowIndustrySuggestions(false), 150)
                }
                placeholder={
                  industries.length === 0
                    ? "Loading industries..."
                    : "Type to search industry"
                }
                className="input-base"
                autoComplete="off"
              />
              {showIndustrySuggestions && industryQuery.trim().length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded shadow-lg max-h-56 overflow-auto">
                  {industries.filter((opt) =>
                    opt.industry
                      .toLowerCase()
                      .includes(industryQuery.toLowerCase()),
                  ).length === 0 ? (
                    <div className="p-2 text-xs text-slate-500">
                      No matching industries
                    </div>
                  ) : (
                    industries
                      .filter((opt) =>
                        opt.industry
                          .toLowerCase()
                          .includes(industryQuery.toLowerCase()),
                      )
                      .slice(0, 50)
                      .map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          className="w-full text-left px-2 py-1 hover:bg-slate-100"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleIndustrySelect(opt)}
                        >
                          {opt.industry}
                        </button>
                      ))
                  )}
                </div>
              )}
              <p className="text-xs text-slate-500">
                Type text to search the industry list; click a result to select.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-base"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Duration in days
              </label>
              <input
                type="text"
                value={duration}
                readOnly
                className="input-base"
              />
            </div>
          </div>

          <div className="grid gap-4">
            <label className="block text-sm font-medium text-slate-700">
              Aim & Objective *
            </label>
            <input
              ref={aimObjectiveInputRef}
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setAimObjectiveFile(e.target.files?.[0] ?? null)}
              className="input-base"
            />
            <p className="text-xs text-red-500">
              * Please find the Aim & Objective format{" "}

              <a
                href="https://docs.google.com/document/d/1ki-95XbVVzKdh-TXJEOsRh0OEpEZXmkQ/edit"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                here
              </a>
              
            </p>

            <label className="block text-sm font-medium text-slate-700">
              Offer Letter *
            </label>
            <input
              ref={offerLetterInputRef}
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setOfferLetterFile(e.target.files?.[0] ?? null)}
              className="input-base"
            />
            <p className="text-xs text-red-500">
              * File names should follow the expected student format, for example &nbsp;
              <b className="text-blue-700">7376251CS492-internship-04072026.pdf.</b>
            </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <Link href="/student/internship/tracker" className="inline-flex justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">Cancel</Link>
              <button
                type="button"
                onClick={(e) => handleSubmit(e as any, true)}
                className="inline-flex justify-center rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Create & Add Another"}
              </button>
              <button type="submit" className="inline-flex justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition" disabled={submitting}>
                {submitting ? "Submitting..." : "Create Internship Tracker"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
