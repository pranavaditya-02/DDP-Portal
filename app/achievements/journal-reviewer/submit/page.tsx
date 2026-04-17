"use client";

import { useState, ChangeEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  FileText,
  X,
  Link as LinkIcon,
} from "lucide-react";
import { buildFormData, submitAchievement } from "../../facultyActivitiesApi";

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

const SPECIAL_LAB_OPTIONS = [
  "Select Special Lab",
  "AI Lab",
  "Robotics Lab",
  "IoT Lab",
  "Cyber Security Lab",
  "Cloud Computing Lab",
  "Data Science Lab",
];

const JOURNAL_INDEXING_OPTIONS = [
  "Click to choose",
  "SCI",
  "SCIE",
  "Scopus",
  "WoS",
  "UGC Care",
  "Other",
];

const RECOGNITION_TYPE_OPTIONS = [
  "Click to choose",
  "Certificate",
  "Letter of Appreciation",
  "Email Acknowledgement",
  "Other",
];

type FormData = {
  taskID: string;
  specialLabsInvolved: "yes" | "no";
  specialLab: string;
  journalName: string;
  journalIndexing: string;
  otherJournalIndexing: string;
  issnNo: string;
  publisherName: string;
  impactFactor: string;
  journalHomepageURL: string;
  recognitionType: string;
  otherRecognitionType: string;
  numberOfPapersReviewed: string;
  date: string;
  documentProof: File | null;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function JournalReviewerSubmitPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    taskID: "",
    specialLabsInvolved: "no",
    specialLab: "",
    journalName: "",
    journalIndexing: "",
    otherJournalIndexing: "",
    issnNo: "",
    publisherName: "",
    impactFactor: "",
    journalHomepageURL: "",
    recognitionType: "",
    otherRecognitionType: "",
    numberOfPapersReviewed: "",
    date: "",
    documentProof: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData((prev) => ({ ...prev, documentProof: e.target.files![0] }));
      setErrors((prev) => ({ ...prev, documentProof: "" }));
    }
  };

  const clearFile = () => {
    setFormData((prev) => ({ ...prev, documentProof: null }));
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
      setFormData((prev) => ({
        ...prev,
        documentProof: e.dataTransfer.files[0],
      }));
      setErrors((prev) => ({ ...prev, documentProof: "" }));
    }
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!formData.taskID) nextErrors.taskID = "Task ID is required";
    if (formData.specialLabsInvolved === "yes" && !formData.specialLab) {
      nextErrors.specialLab = "Special Lab is required";
    }
    if (!formData.journalName)
      nextErrors.journalName = "Journal Name is required";
    if (
      !formData.journalIndexing ||
      formData.journalIndexing === "Click to choose"
    ) {
      nextErrors.journalIndexing = "Journal Indexing is required";
    }
    if (
      formData.journalIndexing === "Other" &&
      !formData.otherJournalIndexing
    ) {
      nextErrors.otherJournalIndexing = "Please specify";
    }

    if (!formData.publisherName)
      nextErrors.publisherName = "Publisher Name is required";
    if (!formData.journalHomepageURL) {
      nextErrors.journalHomepageURL = "Journal Homepage URL is required";
    }
    if (
      !formData.recognitionType ||
      formData.recognitionType === "Click to choose"
    ) {
      nextErrors.recognitionType = "Types of Recognition is required";
    }
    if (
      formData.recognitionType === "Other" &&
      !formData.otherRecognitionType
    ) {
      nextErrors.otherRecognitionType = "Please specify";
    }

    if (!formData.numberOfPapersReviewed) {
      nextErrors.numberOfPapersReviewed =
        "Number of Papers Reviewed is required";
    }
    if (!formData.date) nextErrors.date = "Date is required";
    if (!formData.documentProof)
      nextErrors.documentProof = "Document Proof is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const fillTestData = () => {
    setFormData({
      taskID: "TASK-JOURNAL-001",
      specialLabsInvolved: "no",
      specialLab: "",
      journalName: "Test Journal",
      journalIndexing: "SCI",
      otherJournalIndexing: "",
      issnNo: "1234-5678",
      publisherName: "Test Publisher",
      impactFactor: "2.5",
      journalHomepageURL: "https://example.com",
      recognitionType: "Certificate",
      otherRecognitionType: "",
      numberOfPapersReviewed: "1",
      date: "2026-04-16",
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
      await submitAchievement("journal-reviewer", payload);
      router.push("/achievements/journal-reviewer");
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
              Add Journal Reviewer Details
            </h1>
            <p className="text-sm text-slate-500">
              Create record for Journal Reviewer activities
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Special Labs Involved <RequiredAst />
                </label>
                <div className="mt-2 flex space-x-6">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="specialLabsInvolved"
                      value="yes"
                      checked={formData.specialLabsInvolved === "yes"}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="specialLabsInvolved"
                      value="no"
                      checked={formData.specialLabsInvolved === "no"}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">No</span>
                  </label>
                </div>
              </div>
            </div>

            {formData.specialLabsInvolved === "yes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="specialLab"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Special Lab <RequiredAst />
                  </label>
                  <select
                    name="specialLab"
                    id="specialLab"
                    value={formData.specialLab}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.specialLab ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                  >
                    {SPECIAL_LAB_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option === "Select Special Lab" ? "" : option}
                        disabled={option === "Select Special Lab"}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.specialLab && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.specialLab}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="journalName"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Journal Name <RequiredAst />
                </label>
                <input
                  type="text"
                  name="journalName"
                  id="journalName"
                  value={formData.journalName}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.journalName ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter Journal Name"
                />
                {errors.journalName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.journalName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="journalIndexing"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Journal Indexing <RequiredAst />
                </label>
                <select
                  name="journalIndexing"
                  id="journalIndexing"
                  value={formData.journalIndexing}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.journalIndexing ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                >
                  {JOURNAL_INDEXING_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Click to choose"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.journalIndexing && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.journalIndexing}
                  </p>
                )}

                {formData.journalIndexing === "Other" && (
                  <div className="mt-2">
                    <input
                      type="text"
                      name="otherJournalIndexing"
                      value={formData.otherJournalIndexing}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 border ${errors.otherJournalIndexing ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="Specify Indexing"
                    />
                    {errors.otherJournalIndexing && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.otherJournalIndexing}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="issnNo"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  ISSN No
                </label>
                <input
                  type="text"
                  name="issnNo"
                  id="issnNo"
                  value={formData.issnNo}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter ISSN No"
                />
              </div>

              <div>
                <label
                  htmlFor="publisherName"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Publisher Name <RequiredAst />
                </label>
                <input
                  type="text"
                  name="publisherName"
                  id="publisherName"
                  value={formData.publisherName}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.publisherName ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter Publisher Name"
                />
                {errors.publisherName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.publisherName}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="impactFactor"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Impact Factor of Journal
                </label>
                <input
                  type="text"
                  name="impactFactor"
                  id="impactFactor"
                  value={formData.impactFactor}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Impact Factor"
                />
              </div>

              <div>
                <label
                  htmlFor="journalHomepageURL"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Journal Homepage URL <RequiredAst />
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    name="journalHomepageURL"
                    id="journalHomepageURL"
                    value={formData.journalHomepageURL}
                    onChange={handleChange}
                    className={`block w-full pl-10 px-3 py-2 border ${errors.journalHomepageURL ? "border-red-500" : "border-slate-300"} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="https://example.com"
                  />
                </div>
                {errors.journalHomepageURL && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.journalHomepageURL}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="recognitionType"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Types of Recognition <RequiredAst />
                </label>
                <select
                  name="recognitionType"
                  id="recognitionType"
                  value={formData.recognitionType}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.recognitionType ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                >
                  {RECOGNITION_TYPE_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Click to choose"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.recognitionType && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.recognitionType}
                  </p>
                )}

                {formData.recognitionType === "Other" && (
                  <div className="mt-2">
                    <input
                      type="text"
                      name="otherRecognitionType"
                      value={formData.otherRecognitionType}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 border ${errors.otherRecognitionType ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="Specify Recognition"
                    />
                    {errors.otherRecognitionType && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.otherRecognitionType}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="numberOfPapersReviewed"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Number of Papers Reviewed <RequiredAst />
                </label>
                <input
                  type="number"
                  name="numberOfPapersReviewed"
                  id="numberOfPapersReviewed"
                  value={formData.numberOfPapersReviewed}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.numberOfPapersReviewed ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="e.g. 5"
                />
                {errors.numberOfPapersReviewed && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.numberOfPapersReviewed}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Date <RequiredAst />
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.date ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Document proof (Mail/Letter/Certificate ‘as a single pdf’){" "}
                <RequiredAst />
              </label>
              <div
                className={`mt-1 flex flex-col items-center justify-center w-full h-40 px-6 pt-5 pb-6 border-2 ${
                  errors.documentProof
                    ? "border-red-500"
                    : dragActive
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-300"
                } border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors bg-white`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <div className="space-y-1 text-center">
                  <UploadCloud
                    className={`mx-auto h-12 w-12 ${dragActive ? "text-indigo-600" : "text-slate-400"}`}
                  />
                  <div className="flex text-sm text-slate-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="documentProof"
                        type="file"
                        className="sr-only"
                        accept=".pdf"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500">PDF only</p>
                </div>
              </div>
              {formData.documentProof && (
                <div className="mt-2 flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-200">
                  <FileText
                    size={16}
                    className="mr-2 flex-shrink-0 text-indigo-600"
                  />
                  <span className="font-medium mr-2 truncate">
                    {formData.documentProof.name}
                  </span>
                  <span className="text-slate-500 text-xs">
                    ({(formData.documentProof.size / 1024 / 1024).toFixed(2)}{" "}
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
              {errors.documentProof && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.documentProof}
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
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center disabled:opacity-50"
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
