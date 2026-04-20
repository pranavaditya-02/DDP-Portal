"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";

const indexingOptions = [
  "SCOPUS",
  "SCI/SCIE/WOS",
  "UGC CARE",
  "OTHERS",
] as const;

const statusOptions = [
  "Submitted",
  "Under Review",
  "Accepted for Publication",
  "Rejected for Publication",
] as const;

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

const inputClass = (error?: string) =>
  `w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
    error ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
  }`;

const selectClass = (error?: string) =>
  `w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
    error ? "border-red-400" : "border-slate-200"
  }`;

export default function JournalPublicationAppliedCreatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    faculty: "",
    indexing: "",
    otherIndexing: "",
    journalName: "",
    submittedTitle: "",
    submittedDate: "",
    status: "Submitted",
    proofFile: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [facultyQuery, setFacultyQuery] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<{ id: string; name: string | null } | null>(null);
  const [facultySuggestions, setFacultySuggestions] = useState<Array<{ id: string; name: string | null }>>([]);
  const [showFacultySuggestions, setShowFacultySuggestions] = useState(false);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [facultiesError, setFacultiesError] = useState("");

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!selectedFaculty) nextErrors.faculty = "Please select a faculty from the suggestions.";
    if (!formData.indexing) nextErrors.indexing = "Indexing is required.";
    if (formData.indexing === "OTHERS" && !formData.otherIndexing.trim()) {
      nextErrors.otherIndexing = "Please specify the other indexing.";
    }
    if (!formData.journalName.trim()) nextErrors.journalName = "Journal name is required.";
    if (!formData.submittedTitle.trim()) nextErrors.submittedTitle = "Submitted journal title is required.";
    if (!formData.submittedDate) nextErrors.submittedDate = "Submitted date is required.";
    if (!formData.proofFile) nextErrors.proofFile = "Proof document is required.";
    if (formData.proofFile && formData.proofFile.type !== "application/pdf") {
      nextErrors.proofFile = "Proof document must be a PDF file.";
    }
    if (!formData.status) nextErrors.status = "Status is required.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field: keyof typeof formData, value: string | File | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleFacultyInputChange = (value: string) => {
    setFacultyQuery(value);
    setSelectedFaculty(null);
    setErrors((prev) => ({ ...prev, faculty: "" }));
    setShowFacultySuggestions(true);
  };

  const handleFacultySelect = (faculty: { id: string; name: string | null }) => {
    setSelectedFaculty(faculty);
    setFacultyQuery(faculty.name || faculty.id);
    setShowFacultySuggestions(false);
    setErrors((prev) => ({ ...prev, faculty: "" }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    handleChange("proofFile", file);
    setFileName(file?.name ?? "");
  };

  useEffect(() => {
    let cancelled = false;
    if (!facultyQuery.trim()) {
      setFacultySuggestions([]);
      setFacultyLoading(false);
      return;
    }

    setFacultyLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await apiClient.getFaculties(facultyQuery.trim());
        if (!cancelled) {
          setFacultySuggestions(Array.isArray(response.faculties) ? response.faculties : []);
          setFacultiesError("");
        }
      } catch (err) {
        if (!cancelled) {
          setFacultySuggestions([]);
          setFacultiesError("Unable to fetch faculty suggestions.");
        }
      } finally {
        if (!cancelled) setFacultyLoading(false);
      }
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [facultyQuery]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitError("");
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("faculty_id", selectedFaculty?.id ?? "");
    payload.append("indexing_type", formData.indexing);
    if (formData.indexing === "OTHERS") {
      payload.append("indexing_others_specify", formData.otherIndexing);
    }
    payload.append("journal_name", formData.journalName);
    payload.append("submitted_journal_title", formData.submittedTitle);
    payload.append("submitted_date", formData.submittedDate);
    payload.append("publication_status", formData.status);
    if (formData.proofFile) payload.append("proofFile", formData.proofFile);

    try {
      const data = await apiClient.createJournalPublicationApplied(payload);
      if (!data) {
        setSubmitError("Failed to save journal publication.");
        return;
      }
      router.push("/faculty/r-and-d/journal-publications/applied");
    } catch (error: any) {
      setSubmitError(error?.response?.data?.error || error?.message || "Unable to save the record. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Journal Publication - Applied</h1>
        <p className="mt-2 text-sm text-slate-500">
          Submit applied journal publication details including indexing, title, proof document and status.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <label htmlFor="faculty" className="block text-sm font-medium text-slate-700 mb-2">
                Faculty <RequiredAst />
              </label>
              <div className="relative">
                <input
                  id="faculty"
                  name="faculty"
                  value={facultyQuery}
                  onChange={(event) => handleFacultyInputChange(event.target.value)}
                  type="text"
                  className={inputClass(errors.faculty)}
                  placeholder="Type faculty name..."
                  autoComplete="off"
                />
                {showFacultySuggestions && facultyQuery.trim() && (
                  <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
                    {facultyLoading ? (
                      <div className="px-3 py-3 text-sm text-slate-500">Searching faculties...</div>
                    ) : facultySuggestions.length === 0 ? (
                      <div className="px-3 py-3 text-sm text-slate-500">No matching faculties found.</div>
                    ) : (
                      facultySuggestions.map((faculty) => (
                        <button
                          key={faculty.id}
                          type="button"
                          onClick={() => handleFacultySelect(faculty)}
                          className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                        >
                          {faculty.name || faculty.id}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {facultiesError ? (
                <p className="mt-2 text-sm text-rose-600">{facultiesError}</p>
              ) : null}
              {errors.faculty ? (
                <p className="mt-2 text-sm text-red-600">{errors.faculty}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="indexing" className="block text-sm font-medium text-slate-700 mb-2">
                Indexing <RequiredAst />
              </label>
              <select
                id="indexing"
                name="indexing"
                value={formData.indexing}
                onChange={(event) => handleChange("indexing", event.target.value)}
                className={selectClass(errors.indexing)}
              >
                <option value="">Select indexing</option>
                {indexingOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.indexing ? (
                <p className="mt-2 text-sm text-red-600">{errors.indexing}</p>
              ) : null}
            </div>

            {formData.indexing === "OTHERS" ? (
              <div className="lg:col-span-2">
                <label htmlFor="otherIndexing" className="block text-sm font-medium text-slate-700 mb-2">
                  If Others, Please Specify <RequiredAst />
                </label>
                <input
                  id="otherIndexing"
                  name="otherIndexing"
                  value={formData.otherIndexing}
                  onChange={(event) => handleChange("otherIndexing", event.target.value)}
                  type="text"
                  className={inputClass(errors.otherIndexing)}
                  placeholder="Specify other indexing"
                />
                {errors.otherIndexing ? (
                  <p className="mt-2 text-sm text-red-600">{errors.otherIndexing}</p>
                ) : null}
              </div>
            ) : null}

            <div>
              <label htmlFor="journalName" className="block text-sm font-medium text-slate-700 mb-2">
                Name of the Journal <RequiredAst />
              </label>
              <input
                id="journalName"
                name="journalName"
                value={formData.journalName}
                onChange={(event) => handleChange("journalName", event.target.value)}
                type="text"
                className={inputClass(errors.journalName)}
                placeholder="Enter journal name"
              />
              {errors.journalName ? (
                <p className="mt-2 text-sm text-red-600">{errors.journalName}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="submittedTitle" className="block text-sm font-medium text-slate-700 mb-2">
                Submitted Journal Title <RequiredAst />
              </label>
              <input
                id="submittedTitle"
                name="submittedTitle"
                value={formData.submittedTitle}
                onChange={(event) => handleChange("submittedTitle", event.target.value)}
                type="text"
                className={inputClass(errors.submittedTitle)}
                placeholder="Enter submitted title"
              />
              {errors.submittedTitle ? (
                <p className="mt-2 text-sm text-red-600">{errors.submittedTitle}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="submittedDate" className="block text-sm font-medium text-slate-700 mb-2">
                Submitted Date <RequiredAst />
              </label>
              <input
                id="submittedDate"
                name="submittedDate"
                value={formData.submittedDate}
                onChange={(event) => handleChange("submittedDate", event.target.value)}
                type="date"
                className={inputClass(errors.submittedDate)}
              />
              {errors.submittedDate ? (
                <p className="mt-2 text-sm text-red-600">{errors.submittedDate}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="proofFile" className="block text-sm font-medium text-slate-700 mb-2">
                Submitted Document Proof (.pdf) <RequiredAst />
              </label>
              <input
                id="proofFile"
                name="proofFile"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className={inputClass(errors.proofFile)}
              />
              {fileName ? (
                <p className="mt-2 text-sm text-slate-500">Selected file: {fileName}</p>
              ) : null}
              {errors.proofFile ? (
                <p className="mt-2 text-sm text-red-600">{errors.proofFile}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
                Status <RequiredAst />
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={(event) => handleChange("status", event.target.value)}
                className={selectClass(errors.status)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {errors.status ? (
                <p className="mt-2 text-sm text-red-600">{errors.status}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">
                All fields marked with <span className="text-red-500">*</span> are required.
              </p>
              {submitError ? (
                <p className="mt-2 text-sm text-red-600">{submitError}</p>
              ) : null}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "Saving..." : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
