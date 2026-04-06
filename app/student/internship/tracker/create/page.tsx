"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { apiClient } from "@/lib/api";

interface IndustryOption {
  id: number;
  industry: string;
}

export default function CreateTrackerPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const studentName = user
    ? `${user.name} (${user.email}) - ${user.departmentId ?? "SWE"}`
    : "";

  const [industries, setIndustries] = useState<IndustryOption[]>([]);
  const [industryQuery, setIndustryQuery] = useState<string>("");
  const [selectedIndustryId, setSelectedIndustryId] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [aimObjectiveFile, setAimObjectiveFile] = useState<File | null>(null);
  const [offerLetterFile, setOfferLetterFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const duration = useMemo(() => {
    if (!startDate || !endDate) return "";
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";
    const diff = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    return diff.toString();
  }, [startDate, endDate]);

  useEffect(() => {
    const loadIndustries = async () => {
      try {
        const response = await apiClient.getActiveIndustries();
        const fetched = response?.industries || [];
        setIndustries(fetched);
      } catch (loadError) {
        console.error('Failed to load active industries:', loadError);
      }
    };

    loadIndustries();
  }, []);

  const handleIndustrySelect = (industry: IndustryOption) => {
    setIndustryQuery(industry.industry);
    setSelectedIndustryId(industry.id);
    setShowSuggestions(false);
  };

  const clearForm = () => {
    setIndustryQuery("");
    setSelectedIndustryId(null);
    setStartDate("");
    setEndDate("");
    setAimObjectiveFile(null);
    setOfferLetterFile(null);
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent, clearAfter = false) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!user) {
      setError('You must be logged in to submit an internship tracker.');
      return;
    }

    const selectedIndustry = industries.find(
      (item) => item.id === selectedIndustryId || item.industry.toLowerCase() === industryQuery.trim().toLowerCase()
    );

    if (!selectedIndustry) {
      setError('Please choose a valid industry from the list.');
      return;
    }

    if (!startDate || !endDate) {
      setError('Start date and end date are required.');
      return;
    }

    if (!aimObjectiveFile || !offerLetterFile) {
      setError('Both Aim & Objective and Offer Letter files must be uploaded.');
      return;
    }

    const formData = new FormData();
    formData.append('student_id', String(user.id));
    formData.append('industry_id', String(selectedIndustry.id));
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);
    formData.append('aimObjectiveFile', aimObjectiveFile);
    formData.append('offerLetterFile', offerLetterFile);

    try {
      setSubmitting(true);
      const response = await apiClient.createInternshipTracker(formData);
      setMessage('Internship tracker submitted successfully.');

      if (clearAfter) {
        clearForm();
        return;
      }

      router.push('/student/internship/tracker');
    } catch (submitError: any) {
      console.error('Submission failed:', submitError);
      setError(submitError?.response?.data?.error || submitError?.message || 'Failed to submit internship tracker.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold p-2">Create Internship Tracker</h1>
          <p className="text-sm text-slate-500 mt-1">Fill in details and upload proof documents to submit an internship tracker.</p>
        </div>
        <Link href="/student/internship/tracker" className="btn-outline">Back</Link>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6 mt-6 p-5">
        <div className="card-base p-10 space-y-5">
          {message && <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">{message}</div>}
          {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-md font-medium text-slate-700 mb-4">Student *</label>
              <input
                type="text"
                value={studentName}
                disabled
                className="input-base w-full"
              />
            </div>

            <div className="sm:col-span-2 space-y-2 relative">
              <label className="block text-sm font-medium text-slate-700 mt-2 mb-2">Industry *</label>
              <input
                type="text"
                value={industryQuery}
                onChange={(e) => {
                  setIndustryQuery(e.target.value);
                  setSelectedIndustryId(null);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder={industries.length === 0 ? "Loading industries..." : "Type to search industry"}
                className="input-base"
                autoComplete="off"
              />
              {showSuggestions && industryQuery.trim().length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded shadow-lg max-h-56 overflow-auto">
                  {industries.filter((opt) => opt.industry.toLowerCase().includes(industryQuery.toLowerCase())).length === 0 ? (
                    <div className="p-2 text-xs text-slate-500">No matching industries</div>
                  ) : (
                    industries
                      .filter((opt) => opt.industry.toLowerCase().includes(industryQuery.toLowerCase()))
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
              <p className="text-xs text-slate-500">Type text to search the industry list; click a result to select.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">End Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-base"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Duration in days</label>
              <input
                type="text"
                value={duration}
                readOnly
                className="input-base"
              />
            </div>
          </div>

          <div className="grid gap-4">
            <label className="block text-sm font-medium text-slate-700">Aim & Objective *</label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setAimObjectiveFile(e.target.files?.[0] ?? null)}
              className="input-base"
            />
            <p className="text-xs text-red-500">* Please find the Aim & Objective format <a href="https://docs.google.com/document/d/1ki-95XbVVzKdh-TXJEOsRh0OEpEZXmkQ/edit" target="_blank" rel="noreferrer" className="underline">here</a></p>

            <label className="block text-sm font-medium text-slate-700">Offer Letter *</label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setOfferLetterFile(e.target.files?.[0] ?? null)}
              className="input-base"
            />
            <p className="text-xs text-red-500">* Please specify the Proof name only in the following format 201CS111-ITI-08.06.2025</p>

          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Link href="/student/internship/tracker" className="btn-outline">Cancel</Link>
            <button
              type="button"
              onClick={(e) => handleSubmit(e as any, true)}
              className="btn-secondary"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Create & Add Another'}
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Create Internship Tracker'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
{/* <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm text-slate-200">Student *</span>
            <input
              type="text"
              value={user?.name ?? ""}
              disabled
              className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-200">Industry *</span>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded"
            >
              {INDUSTRY_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-slate-800">
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-slate-200">Start Date *</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-200">End Date *</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm text-slate-200">Duration in days</span>
            <input
              type="text"
              value={duration}
              readOnly
              className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-400 rounded"
            />
          </label>
        </div>

        <div className="grid gap-4">
          <label className="block">
            <span className="text-sm text-slate-200">Aim & Objective *</span>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setAimObjectiveFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm text-slate-200 file:bg-blue-600 file:text-white file:px-3 file:py-1 file:rounded"
            />
          </label>
          <p className="text-xs text-red-500">* Please find the Aim & Objective format here</p>

          <label className="block">
            <span className="text-sm text-slate-200">Offer Letter *</span>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setOfferLetterFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm text-slate-200 file:bg-blue-600 file:text-white file:px-3 file:py-1 file:rounded"
            />
          </label>
          <p className="text-xs text-red-500">* Please specify the Proof name only in the following format 201CS111-ITI-08.06.2025</p>
        </div>

        <label className="block">
          <span className="text-sm text-slate-200">IQAC Verification *</span>
          <select
            value={iqacStatus}
            onChange={(e) => setIqacStatus(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded"
          >
            <option value="Initiated">Initiated</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </label>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-700">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded border border-slate-600 text-slate-100 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e as any, true)}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Create & Add Another
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Create Internship Tracker
          </button>
        </div>
      </form>
    </div>
  );
} */}