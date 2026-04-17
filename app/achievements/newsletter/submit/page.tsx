"use client";

import { useEffect, useRef, useState, ChangeEvent, DragEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, UploadCloud, FileText, X } from "lucide-react";
import { buildFormData, submitAchievement } from "../../facultyActivitiesApi";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const MAX_FILE_SIZE_MB = 10;
const ACCEPT_STRING =
  ".pdf,.png,.jpg,.jpeg,image/png,image/jpeg,application/pdf";
const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

const NEWSLETTER_CATEGORIES = [
  "Choose an option",
  "institution-newsletter",
  "department-newsletter",
];

const DEPARTMENTS = [
  "Select Department",
  "CSE",
  "ECE",
  "EEE",
  "IT",
  "MECH",
  "CIVIL",
  "AIML",
  "AIDS",
  "BT",
  "FT",
  "ISE",
  "AGRI",
  "AUTO",
  "AERO",
  "CHEM",
];

const ACADEMIC_YEARS = [
  "Select Academic Year",
  "2024-2025",
  "2023-2024",
  "2022-2023",
  "2021-2022",
  "2020-2021",
];

const ISSUE_MONTHS = [
  "Choose an option",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const EDITOR_COUNTS = ["Choose an option", "1", "2", "3", "4", "5", "6+"];

type FormData = {
  newsletterCategory: string;
  department: string;
  academicYear: string;
  dateOfPublication: string;
  volumeNumber: string;
  issueNumber: string;
  issueMonth: string;
  facultyEditorCount: string;
  studentEditorCount: string;
  proofDocument: File | null;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

type ApiNewsletter = {
  id: number;
  newsletter_category?: string;
  department?: string;
  academic_year?: string;
  date_of_publication?: string;
  volume_number?: string;
  issue_number?: string;
  issue_month?: string;
  faculty_editor_count?: string;
  student_editor_count?: string;
  proof_document?: string;
};

export default function NewsletterSubmitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);

  const [formData, setFormData] = useState<FormData>({
    newsletterCategory: "",
    department: "",
    academicYear: "",
    dateOfPublication: "",
    volumeNumber: "",
    issueNumber: "",
    issueMonth: "",
    facultyEditorCount: "",
    studentEditorCount: "",
    proofDocument: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingFile, setExistingFile] = useState<string | null>(null);

  useEffect(() => {
    const fetchEditData = async () => {
      if (!isEditMode || !editId || !API_URL) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/api/faculty/newsLetterFormsGet`,
          {
            credentials: "include",
          },
        );
        const data = await response.json();
        const newsletters: ApiNewsletter[] = data.newsletters || [];
        const existing = newsletters.find((item) => item.id === Number(editId));

        if (existing) {
          setFormData({
            newsletterCategory: existing.newsletter_category || "",
            department: existing.department || "",
            academicYear: existing.academic_year || "",
            dateOfPublication: existing.date_of_publication
              ? existing.date_of_publication.split("T")[0]
              : "",
            volumeNumber: existing.volume_number || "",
            issueNumber: existing.issue_number || "",
            issueMonth: existing.issue_month || "",
            facultyEditorCount: existing.faculty_editor_count || "",
            studentEditorCount: existing.student_editor_count || "",
            proofDocument: null,
          });

          if (existing.proof_document) {
            setExistingFile(existing.proof_document);
          }
        }
      } catch (error) {
        console.error("Error fetching newsletter:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEditData();
  }, [isEditMode, editId]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateFile = (file: File) => {
    const validMimeTypes = ["application/pdf", "image/png", "image/jpeg"];
    const sizeLimit = MAX_FILE_SIZE_MB * 1024 * 1024;

    if (!validMimeTypes.includes(file.type)) {
      return "Only PDF, PNG, and JPG files are allowed";
    }

    if (file.size > sizeLimit) {
      return `File size must be under ${MAX_FILE_SIZE_MB}MB`;
    }

    return "";
  };

  const applyFile = (file: File) => {
    const fileError = validateFile(file);
    if (fileError) {
      setErrors((prev) => ({ ...prev, proofDocument: fileError }));
      return;
    }

    setFormData((prev) => ({ ...prev, proofDocument: file }));
    setErrors((prev) => ({ ...prev, proofDocument: "" }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      applyFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setFormData((prev) => ({ ...prev, proofDocument: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      applyFile(e.dataTransfer.files[0]);
    }
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (
      !formData.newsletterCategory ||
      formData.newsletterCategory === "Choose an option"
    ) {
      nextErrors.newsletterCategory = "Category is required";
    }

    if (
      formData.newsletterCategory === "department-newsletter" &&
      !formData.department
    ) {
      nextErrors.department = "Department is required";
    }

    if (
      !formData.academicYear ||
      formData.academicYear === "Select Academic Year"
    ) {
      nextErrors.academicYear = "Academic Year is required";
    }

    if (!formData.dateOfPublication) {
      nextErrors.dateOfPublication = "Date is required";
    }

    if (!formData.volumeNumber) {
      nextErrors.volumeNumber = "Volume Number is required";
    }

    if (!formData.issueNumber) {
      nextErrors.issueNumber = "Issue Number is required";
    }

    if (!formData.issueMonth || formData.issueMonth === "Choose an option") {
      nextErrors.issueMonth = "Issue Month is required";
    }

    if (
      !formData.facultyEditorCount ||
      formData.facultyEditorCount === "Choose an option"
    ) {
      nextErrors.facultyEditorCount = "Required";
    }

    if (
      !formData.studentEditorCount ||
      formData.studentEditorCount === "Choose an option"
    ) {
      nextErrors.studentEditorCount = "Required";
    }

    if (!formData.proofDocument && !existingFile) {
      nextErrors.proofDocument = "Proof is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const submitData = buildFormData(formData);
      if (isEditMode && editId) {
        submitData.append("id", editId);
      }
      await submitAchievement("newsletter", submitData);
      router.push("/achievements/newsletter");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to submit form: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-full hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
            <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditMode
                ? "Edit & Resubmit Newsletter"
                : "Add Newsletter Details"}
            </h1>
            <p className="text-sm text-slate-500">
              {isEditMode
                ? "Update your newsletter submission"
                : "Create record for department or institution newsletters"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFormData({
                newsletterCategory: "institution-newsletter",
                department: "CSE",
                academicYear: "2024-2025",
                dateOfPublication: "2026-04-16",
                volumeNumber: "1",
                issueNumber: "1",
                issueMonth: "January",
                facultyEditorCount: "2",
                studentEditorCount: "3",
                proofDocument: null,
              });
              setErrors({});
            }}
            className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
          >
            Auto fill test data
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="newsletterCategory"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Newsletter Category <RequiredAst />
                </label>
                <select
                  name="newsletterCategory"
                  id="newsletterCategory"
                  value={formData.newsletterCategory}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.newsletterCategory ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                >
                  {NEWSLETTER_CATEGORIES.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Choose an option"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.newsletterCategory && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.newsletterCategory}
                  </p>
                )}
              </div>

              {formData.newsletterCategory === "department-newsletter" && (
                <div>
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Department <RequiredAst />
                  </label>
                  <select
                    name="department"
                    id="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.department ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                  >
                    {DEPARTMENTS.map((option) => (
                      <option
                        key={option}
                        value={option === "Select Department" ? "" : option}
                        disabled={option === "Select Department"}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.department}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="academicYear"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Academic Year <RequiredAst />
                </label>
                <select
                  name="academicYear"
                  id="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.academicYear ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                >
                  {ACADEMIC_YEARS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Select Academic Year"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.academicYear && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.academicYear}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="dateOfPublication"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Date of Publication <RequiredAst />
                </label>
                <input
                  type="date"
                  name="dateOfPublication"
                  id="dateOfPublication"
                  value={formData.dateOfPublication}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.dateOfPublication ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.dateOfPublication && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.dateOfPublication}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="volumeNumber"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Volume Number <RequiredAst />
                </label>
                <input
                  type="text"
                  name="volumeNumber"
                  id="volumeNumber"
                  value={formData.volumeNumber}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.volumeNumber ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="e.g. 1"
                />
                {errors.volumeNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.volumeNumber}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="issueNumber"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Issue Number <RequiredAst />
                </label>
                <input
                  type="text"
                  name="issueNumber"
                  id="issueNumber"
                  value={formData.issueNumber}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.issueNumber ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="e.g. 1"
                />
                {errors.issueNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.issueNumber}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="issueMonth"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Issue Month <RequiredAst />
                </label>
                <select
                  name="issueMonth"
                  id="issueMonth"
                  value={formData.issueMonth}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.issueMonth ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                >
                  {ISSUE_MONTHS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Choose an option"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.issueMonth && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.issueMonth}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="facultyEditorCount"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  No. of Faculty Editor/Coordinator <RequiredAst />
                </label>
                <select
                  name="facultyEditorCount"
                  id="facultyEditorCount"
                  value={formData.facultyEditorCount}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.facultyEditorCount ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                >
                  {EDITOR_COUNTS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Choose an option"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.facultyEditorCount && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.facultyEditorCount}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="studentEditorCount"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  No. of Student Editor/Coordinator <RequiredAst />
                </label>
                <select
                  name="studentEditorCount"
                  id="studentEditorCount"
                  value={formData.studentEditorCount}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.studentEditorCount ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                >
                  {EDITOR_COUNTS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Choose an option"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.studentEditorCount && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.studentEditorCount}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Proof Document (PDF, JPEG, PNG) <RequiredAst />
              </label>
              <div
                className={`mt-1 flex flex-col items-center justify-center w-full h-40 px-6 pt-5 pb-6 border-2 ${
                  errors.proofDocument
                    ? "border-red-500"
                    : dragActive
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-300"
                } border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors bg-white`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-1 text-center">
                  <UploadCloud
                    className={`mx-auto h-12 w-12 ${dragActive ? "text-indigo-600" : "text-slate-400"}`}
                  />
                  <div className="flex text-sm text-slate-600">
                    <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input
                        ref={fileInputRef}
                        id="file-upload"
                        name="proofDocument"
                        type="file"
                        className="sr-only"
                        accept={ACCEPT_STRING}
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    Supported formats: PDF, PNG, JPG (max {MAX_FILE_SIZE_MB}MB)
                  </p>
                </div>
              </div>
              {formData.proofDocument && (
                <div className="mt-2 flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-200">
                  <FileText
                    size={16}
                    className="mr-2 flex-shrink-0 text-indigo-600"
                  />
                  <span className="font-medium mr-2 truncate">
                    {formData.proofDocument.name}
                  </span>
                  <span className="text-slate-500 text-xs">
                    ({(formData.proofDocument.size / 1024 / 1024).toFixed(2)}{" "}
                    MB)
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                    className="ml-auto text-red-500 hover:text-red-700 p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              {!formData.proofDocument && existingFile && (
                <div className="mt-2 flex items-center text-sm text-slate-600 bg-blue-50 p-2 rounded-md border border-blue-200">
                  <FileText
                    size={16}
                    className="mr-2 flex-shrink-0 text-blue-600"
                  />
                  <span className="font-medium mr-2">
                    Existing file uploaded
                  </span>
                  {API_URL ? (
                    <a
                      href={`${API_URL}${existingFile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-xs underline"
                    >
                      View
                    </a>
                  ) : null}
                  <span className="ml-2 text-xs text-slate-500">
                    (Upload new file to replace)
                  </span>
                </div>
              )}
              {errors.proofDocument && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.proofDocument}
                </p>
              )}
            </div>

            <div className="pt-5 flex items-center justify-end space-x-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center transition-all duration-200 hover:shadow-lg ${isSubmitting ? "opacity-75 cursor-wait" : ""}`}
              >
                {isSubmitting ? (
                  <span>{isEditMode ? "Updating..." : "Submitting..."}</span>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditMode ? "Update & Resubmit" : "Save Newsletter"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
