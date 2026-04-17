"use client";

import { useState, ChangeEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, UploadCloud, FileText, X, Globe } from "lucide-react";
import { buildFormData, submitAchievement } from "../../facultyActivitiesApi";

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

const FUND_TYPE_OPTIONS = [
  "Click to choose",
  "Self",
  "Management",
  "Funding Agency",
];

type FileField = "apexProof" | "documentProof";

type FormData = {
  taskID: string;
  countryVisited: string;
  purposeOfVisit: string;
  fromDate: string;
  toDate: string;
  fundType: string;
  fundingAgencyName: string;
  apexProof: File | null;
  documentProof: File | null;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

interface FileUploadProps {
  label: string;
  required?: boolean;
  fieldName: FileField;
  file: File | null;
  error?: string;
  dragActive: boolean;
  setDragActive: (v: boolean) => void;
  onFilePick: (field: FileField, file: File) => void;
  onClear: (field: FileField) => void;
}

function FileUpload({
  label,
  required,
  fieldName,
  file,
  error,
  dragActive,
  setDragActive,
  onFilePick,
  onClear,
}: FileUploadProps) {
  const inputId = `${fieldName}-upload`;

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
      onFilePick(fieldName, e.dataTransfer.files[0]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <RequiredAst />}
      </label>
      <div
        className={`mt-1 flex flex-col items-center justify-center w-full h-32 px-6 pt-5 pb-6 border-2 ${
          error
            ? "border-red-500"
            : dragActive
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-300"
        } border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors bg-white`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById(inputId)?.click()}
      >
        <div className="space-y-1 text-center">
          <UploadCloud
            className={`mx-auto h-10 w-10 ${dragActive ? "text-indigo-600" : "text-slate-400"}`}
          />
          <div className="flex text-sm text-slate-600">
            <label
              htmlFor={inputId}
              className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
            >
              <span>Upload a file</span>
              <input
                id={inputId}
                name={fieldName}
                type="file"
                className="sr-only"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    onFilePick(fieldName, e.target.files[0]);
                  }
                }}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-slate-500">PDF, JPG, PNG up to 10MB</p>
        </div>
      </div>

      {file && (
        <div className="mt-2 flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-200">
          <FileText size={16} className="mr-2 flex-shrink-0 text-indigo-600" />
          <span className="font-medium mr-2 truncate">{file.name}</span>
          <span className="text-slate-500 text-xs">
            ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear(fieldName);
            }}
            className="ml-auto text-red-500 hover:text-red-700 p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function InternationalVisitSubmitPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    taskID: "",
    countryVisited: "",
    purposeOfVisit: "",
    fromDate: "",
    toDate: "",
    fundType: "",
    fundingAgencyName: "",
    apexProof: null,
    documentProof: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [apexDragActive, setApexDragActive] = useState(false);

  const showApexProof = formData.fundType === "Management";
  const showFundingAgencyName = formData.fundType === "Funding Agency";

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (fieldName: FileField, file: File) => {
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const clearFile = (fieldName: FileField) => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!formData.taskID) nextErrors.taskID = "Task ID is required";
    if (!formData.countryVisited)
      nextErrors.countryVisited = "Country Visited is required";
    if (!formData.purposeOfVisit)
      nextErrors.purposeOfVisit = "Purpose of Visit is required";
    if (!formData.fromDate) nextErrors.fromDate = "From Date is required";
    if (!formData.toDate) nextErrors.toDate = "To Date is required";
    if (!formData.fundType || formData.fundType === "Click to choose") {
      nextErrors.fundType = "Fund Type is required";
    }

    if (showApexProof && !formData.apexProof) {
      nextErrors.apexProof = "Apex Proof is required";
    }

    if (showFundingAgencyName && !formData.fundingAgencyName) {
      nextErrors.fundingAgencyName = "Funding Agency Name is required";
    }

    if (!formData.documentProof) {
      nextErrors.documentProof = "Document Proof is required";
    }

    if (formData.fromDate && formData.toDate) {
      if (new Date(formData.toDate) < new Date(formData.fromDate)) {
        nextErrors.toDate = "To Date cannot be before From Date";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const fillTestData = () => {
    setFormData({
      taskID: "TASK-INTERNATIONAL-001",
      countryVisited: "France",
      purposeOfVisit: "Research Collaboration",
      fromDate: "2026-04-16",
      toDate: "2026-04-20",
      fundType: "Self",
      fundingAgencyName: "",
      apexProof: null,
      documentProof: null,
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = buildFormData(formData);
      await submitAchievement("international-visit", payload);
      router.push("/achievements/international-visit");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Add International Trip Details
            </h1>
            <p className="text-sm text-slate-500">
              Create record for International Visits
            </p>
          </div>
          <button
            type="button"
            onClick={fillTestData}
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
                  htmlFor="taskID"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Task ID <RequiredAst />
                </label>
                <input
                  type="text"
                  name="taskID"
                  id="taskID"
                  value={formData.taskID}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.taskID ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter Task ID"
                />
                {errors.taskID && (
                  <p className="mt-1 text-sm text-red-600">{errors.taskID}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="countryVisited"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Country Visited <RequiredAst />
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="countryVisited"
                    id="countryVisited"
                    value={formData.countryVisited}
                    onChange={handleChange}
                    className={`block w-full pl-10 px-3 py-2 border ${errors.countryVisited ? "border-red-500" : "border-slate-300"} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter Country Name"
                  />
                </div>
                {errors.countryVisited && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.countryVisited}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="purposeOfVisit"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Purpose of Visit <RequiredAst />
                </label>
                <input
                  type="text"
                  name="purposeOfVisit"
                  id="purposeOfVisit"
                  value={formData.purposeOfVisit}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.purposeOfVisit ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter Purpose"
                />
                {errors.purposeOfVisit && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.purposeOfVisit}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="fundType"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Fund Type <RequiredAst />
                </label>
                <select
                  name="fundType"
                  id="fundType"
                  value={formData.fundType}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.fundType ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                >
                  {FUND_TYPE_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Click to choose"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.fundType && (
                  <p className="mt-1 text-sm text-red-600">{errors.fundType}</p>
                )}
              </div>
            </div>

            {showFundingAgencyName && (
              <div>
                <label
                  htmlFor="fundingAgencyName"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Name of the Funding Agency <RequiredAst />
                </label>
                <input
                  type="text"
                  name="fundingAgencyName"
                  id="fundingAgencyName"
                  value={formData.fundingAgencyName}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.fundingAgencyName ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter Funding Agency Name"
                />
                {errors.fundingAgencyName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.fundingAgencyName}
                  </p>
                )}
              </div>
            )}

            {showApexProof && (
              <FileUpload
                label="Apex Proof"
                required
                fieldName="apexProof"
                file={formData.apexProof}
                error={errors.apexProof}
                dragActive={apexDragActive}
                setDragActive={setApexDragActive}
                onFilePick={handleFileChange}
                onClear={clearFile}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="fromDate"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  From Date <RequiredAst />
                </label>
                <input
                  type="date"
                  name="fromDate"
                  id="fromDate"
                  value={formData.fromDate}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.fromDate ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.fromDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.fromDate}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="toDate"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  To Date <RequiredAst />
                </label>
                <input
                  type="date"
                  name="toDate"
                  id="toDate"
                  value={formData.toDate}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.toDate ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.toDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.toDate}</p>
                )}
              </div>
            </div>

            <FileUpload
              label="Upload the relevant proof (1.Approval letter,2.Brochure /Poster/Invitation,3.Attendance sheet & 4.Photo )"
              required
              fieldName="documentProof"
              file={formData.documentProof}
              error={errors.documentProof}
              dragActive={dragActive}
              setDragActive={setDragActive}
              onFilePick={handleFileChange}
              onClear={clearFile}
            />

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
                className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSubmitting
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center`}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Submitting..." : "Save Achievement"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
