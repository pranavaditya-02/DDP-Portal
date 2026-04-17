"use client";

import React, { useState } from "react";
import Link from "next/link";
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

const eContentTypeOptions = [
  "Select Type",
  "PERSONALIZED_SKILL (PS)",
  "TUTORIAL",
  "E-BOOK",
  "VIDEO LECTURES",
  "ACADEMIC BOOK",
  "ASSESSMENT",
  "ARTICLE",
  "BLOG WRITING",
  "COURSE BOARD GRAPHICS",
  "DATABASE CREATION",
  "E-LEARNING GAME",
  "NPTEL TRANSLATION",
  "PODCAST",
  "SKILL-SCOURCE-BOOK",
  "YOUTUBE-VIDEO",
  "MAGAZINE",
  "NEW METHODOLOGY IN TLP/ASSESSMENT",
  "NEW COURSE IN CURICULLAM",
  "Other",
];

export default function EContentForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    taskID: "",
    specialLabsInvolved: "no",
    specialLab: "",
    eContentType: "",
    otherEContentType: "",
    topicName: "",
    publisherName: "",
    publisherAddress: "",
    contactNo: "",
    urlOfContent: "",
    dateOfPublication: "",
    documentProof: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, documentProof: e.target.files![0] }));
      if (errors.documentProof) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.documentProof;
          return newErrors;
        });
      }
    }
  };

  const clearFile = () => {
    setFormData((prev) => ({ ...prev, documentProof: null }));
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData((prev) => ({
        ...prev,
        documentProof: e.dataTransfer.files[0],
      }));
      if (errors.documentProof) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.documentProof;
          return newErrors;
        });
      }
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.taskID) newErrors.taskID = "Task ID is required";
    if (formData.specialLabsInvolved === "yes" && !formData.specialLab)
      newErrors.specialLab = "Special Lab is required";
    if (!formData.eContentType || formData.eContentType === "Select Type")
      newErrors.eContentType = "E-Content Type is required";
    if (formData.eContentType === "Other" && !formData.otherEContentType)
      newErrors.otherEContentType = "Please specify";
    if (!formData.topicName) newErrors.topicName = "Topic Name is required";
    if (!formData.publisherName)
      newErrors.publisherName = "Publisher Name is required";
    if (!formData.publisherAddress)
      newErrors.publisherAddress = "Publisher Address is required";
    if (!formData.contactNo) newErrors.contactNo = "Contact No. is required";
    if (!formData.urlOfContent) newErrors.urlOfContent = "URL is required";
    if (!formData.dateOfPublication)
      newErrors.dateOfPublication = "Date is required";
    if (!formData.documentProof)
      newErrors.documentProof = "Document Proof is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fillTestData = () => {
    setFormData({
      taskID: "TASK-ECONTENT-001",
      specialLabsInvolved: "no",
      specialLab: "",
      eContentType: "TUTORIAL",
      otherEContentType: "",
      topicName: "React Form Submission Test",
      publisherName: "Test Publisher",
      publisherAddress: "123 Test Street, Test City",
      contactNo: "9876543210",
      urlOfContent: "https://example.com/test-content",
      dateOfPublication: "2026-04-16",
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
      await submitAchievement("e-content-developed", payload);
      router.push("/achievements/e-content-developed");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <Link
            href="/achievements/e-content-developed"
            className="mr-4 p-2 rounded-full hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Add E-Content Details
            </h1>
            <p className="text-sm text-slate-500">
              Create E-Content Developed Record
            </p>
          </div>
        </div>

        <div className="mb-4 flex justify-end">
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
                  <input
                    type="text"
                    name="specialLab"
                    id="specialLab"
                    value={formData.specialLab}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.specialLab ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter Special Lab"
                  />
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
                  htmlFor="eContentType"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  E-Content Type <RequiredAst />
                </label>
                <select
                  name="eContentType"
                  id="eContentType"
                  value={formData.eContentType}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.eContentType ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                >
                  {eContentTypeOptions.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Select Type"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.eContentType && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.eContentType}
                  </p>
                )}

                {formData.eContentType === "Other" && (
                  <div className="mt-3">
                    <label
                      htmlFor="otherEContentType"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      If Others, Please Specify <RequiredAst />
                    </label>
                    <input
                      type="text"
                      name="otherEContentType"
                      id="otherEContentType"
                      value={formData.otherEContentType}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 border ${errors.otherEContentType ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="Specify E-Content Type"
                    />
                    {errors.otherEContentType && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.otherEContentType}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="topicName"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Topic Name <RequiredAst />
                </label>
                <input
                  type="text"
                  name="topicName"
                  id="topicName"
                  value={formData.topicName}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.topicName ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter Topic Name"
                />
                {errors.topicName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.topicName}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div>
                <label
                  htmlFor="publisherAddress"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Publisher Address <RequiredAst />
                </label>
                <input
                  type="text"
                  name="publisherAddress"
                  id="publisherAddress"
                  value={formData.publisherAddress}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.publisherAddress ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter Publisher Address"
                />
                {errors.publisherAddress && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.publisherAddress}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="contactNo"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Contact No. <RequiredAst />
                </label>
                <input
                  type="text"
                  name="contactNo"
                  id="contactNo"
                  value={formData.contactNo}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.contactNo ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter Contact Number"
                />
                {errors.contactNo && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.contactNo}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="urlOfContent"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  URL of Content <RequiredAst />
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    name="urlOfContent"
                    id="urlOfContent"
                    value={formData.urlOfContent}
                    onChange={handleChange}
                    className={`block w-full pl-10 px-3 py-2 border ${errors.urlOfContent ? "border-red-500" : "border-slate-300"} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="https://example.com"
                  />
                </div>
                {errors.urlOfContent && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.urlOfContent}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Document Proof <RequiredAst />
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
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    PDF, JPG, PNG up to 10MB
                  </p>
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
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center disabled:opacity-60"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save E-Content"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
