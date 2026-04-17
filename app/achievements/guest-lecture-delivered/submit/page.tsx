"use client";

import { useState, ChangeEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  FileText,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { buildFormData, submitAchievement } from "../../facultyActivitiesApi";

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

const EVENT_TYPE_OPTIONS = [
  "Click to choose",
  "Certification Course",
  "Conference",
  "Faculty Exchange Programme",
  "FDP",
  "Guest Lecture",
  "One Credit Course",
  "School",
  "Seminar",
  "STTP",
  "Training",
  "Webinar",
  "Workshop",
  "Hands-on Training",
  "Value Added Course",
];

const EVENT_LEVEL_OPTIONS = [
  "Click to choose",
  "Within BIT",
  "State",
  "National",
  "International",
];

const TYPE_OF_ORG_OPTIONS = [
  "Click to choose",
  "BIT",
  "Industry",
  "Foreign Institute",
  "Institute in India",
  "Others",
];

const ORG_REQUIRES_DETAILS = [
  "Industry",
  "Foreign Institute",
  "Institute in India",
  "Others",
];

const TYPE_OF_AUDIENCE_OPTIONS = [
  "Click to choose",
  "Students",
  "Teaching Faculty",
  "Non Teaching Faculty",
  "Engineering Trainee",
  "Industry persons",
  "Others",
];

const MODE_OF_CONDUCT_OPTIONS = [
  "Click to choose",
  "Online",
  "Offline",
  "Hybrid",
];

const SPECIAL_LAB_OPTIONS = [
  "Select Special Lab",
  "AI Lab",
  "Robotics Lab",
  "IoT Lab",
  "Cyber Security Lab",
  "Cloud Computing Lab",
  "Data Science Lab",
];

type FileField = "documentProof" | "apexProof" | "photos";

type FormData = {
  taskID: string;
  specialLabsInvolved: "yes" | "no";
  specialLab: string;
  eventType: string;
  topic: string;
  modeOfConduct: string;
  eventLevel: string;
  eventName: string;
  fromDate: string;
  toDate: string;
  numberOfDays: string;
  typeOfOrganization: string;
  companyName: string;
  companyAddress: string;
  numberOfParticipants: string;
  typeOfAudience: string;
  documentProof: File | null;
  apexProof: File | null;
  photos: File | null;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

interface UploadCardProps {
  label: string;
  required?: boolean;
  file: File | null;
  error?: string;
  dragActive: boolean;
  setDragActive: (v: boolean) => void;
  onDropFile: (field: FileField, file: File) => void;
  fieldName: FileField;
  clearFile: (field: FileField) => void;
  accept?: string;
  icon?: "upload" | "image";
}

function UploadCard({
  label,
  required,
  file,
  error,
  dragActive,
  setDragActive,
  onDropFile,
  fieldName,
  clearFile,
  accept,
  icon = "upload",
}: UploadCardProps) {
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onDropFile(fieldName, e.dataTransfer.files[0]);
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
          {icon === "image" ? (
            <ImageIcon
              className={`mx-auto h-12 w-12 ${dragActive ? "text-indigo-600" : "text-slate-400"}`}
            />
          ) : (
            <UploadCloud
              className={`mx-auto h-12 w-12 ${dragActive ? "text-indigo-600" : "text-slate-400"}`}
            />
          )}
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
                accept={accept}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    onDropFile(fieldName, e.target.files[0]);
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
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clearFile(fieldName);
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

export default function GuestLectureDeliveredSubmitPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    taskID: "",
    specialLabsInvolved: "no",
    specialLab: "",
    eventType: "",
    topic: "",
    modeOfConduct: "",
    eventLevel: "",
    eventName: "",
    fromDate: "",
    toDate: "",
    numberOfDays: "",
    typeOfOrganization: "",
    companyName: "",
    companyAddress: "",
    numberOfParticipants: "",
    typeOfAudience: "",
    documentProof: null,
    apexProof: null,
    photos: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [docProofDragActive, setDocProofDragActive] = useState(false);
  const [apexProofDragActive, setApexProofDragActive] = useState(false);
  const [photosDragActive, setPhotosDragActive] = useState(false);

  const requiresOrgDetails = ORG_REQUIRES_DETAILS.includes(
    formData.typeOfOrganization,
  );

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFilePick = (fieldName: FileField, file: File) => {
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const clearFile = (fieldName: FileField) => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!formData.taskID) nextErrors.taskID = "Task ID is required";
    if (formData.specialLabsInvolved === "yes" && !formData.specialLab) {
      nextErrors.specialLab = "Special Lab is required";
    }
    if (!formData.eventType || formData.eventType === "Click to choose") {
      nextErrors.eventType = "Event Type is required";
    }
    if (!formData.topic) nextErrors.topic = "Topic is required";
    if (
      !formData.modeOfConduct ||
      formData.modeOfConduct === "Click to choose"
    ) {
      nextErrors.modeOfConduct = "Mode of Conduct is required";
    }
    if (!formData.eventLevel || formData.eventLevel === "Click to choose") {
      nextErrors.eventLevel = "Event Level is required";
    }
    if (!formData.eventName)
      nextErrors.eventName = "Name of the Event is required";
    if (!formData.fromDate) nextErrors.fromDate = "From Date is required";
    if (!formData.toDate) nextErrors.toDate = "To Date is required";
    if (!formData.numberOfDays)
      nextErrors.numberOfDays = "No of Days is required";
    if (
      !formData.typeOfOrganization ||
      formData.typeOfOrganization === "Click to choose"
    ) {
      nextErrors.typeOfOrganization = "Type of Organization is required";
    }
    if (requiresOrgDetails && !formData.companyName) {
      nextErrors.companyName = "Company/Organisation Name is required";
    }
    if (!formData.numberOfParticipants) {
      nextErrors.numberOfParticipants = "No of participants is required";
    }
    if (
      !formData.typeOfAudience ||
      formData.typeOfAudience === "Click to choose"
    ) {
      nextErrors.typeOfAudience = "Type of Audience is required";
    }
    if (!formData.documentProof)
      nextErrors.documentProof = "Document Proof is required";
    if (!formData.photos) nextErrors.photos = "Sample Photographs are required";

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
      taskID: "TASK-GUEST-001",
      specialLabsInvolved: "no",
      specialLab: "",
      eventType: "Guest Lecture",
      topic: "Test Guest Lecture",
      eventMode: "Online",
      eventLevel: "National",
      eventName: "Guest Lecture on Testing",
      fromDate: "2026-04-16",
      toDate: "2026-04-17",
      numberOfDays: "2",
      numberOfParticipants: "50",
      companyName: "Test Organization",
      companyAddress: "123 Test Rd",
      typeOfAudience: "Students",
      typeOfOrganisation: "Institute",
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
      await submitAchievement("guest-lecture-delivered", payload);
      router.push("/achievements/guest-lecture-delivered");
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
              Add Guest Lecture Details
            </h1>
            <p className="text-sm text-slate-500">
              Create record for Guest Lecture Delivered
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
                      className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
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
                      className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">No</span>
                  </label>
                </div>
              </div>
            </div>

            {formData.specialLabsInvolved === "yes" && (
              <div>
                <label
                  htmlFor="specialLab"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Special Lab <RequiredAst />
                </label>
                <select
                  id="specialLab"
                  name="specialLab"
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
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="eventType"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Event Type <RequiredAst />
                </label>
                <select
                  name="eventType"
                  id="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.eventType ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                >
                  {EVENT_TYPE_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Click to choose"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.eventType && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.eventType}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="topic"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Topic <RequiredAst />
                </label>
                <input
                  type="text"
                  name="topic"
                  id="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.topic ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter Topic"
                />
                {errors.topic && (
                  <p className="mt-1 text-sm text-red-600">{errors.topic}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="modeOfConduct"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Mode of Conduct <RequiredAst />
                </label>
                <select
                  name="modeOfConduct"
                  id="modeOfConduct"
                  value={formData.modeOfConduct}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.modeOfConduct ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                >
                  {MODE_OF_CONDUCT_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Click to choose"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.modeOfConduct && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.modeOfConduct}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="eventLevel"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Event Level <RequiredAst />
                </label>
                <select
                  name="eventLevel"
                  id="eventLevel"
                  value={formData.eventLevel}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.eventLevel ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                >
                  {EVENT_LEVEL_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Click to choose"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.eventLevel && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.eventLevel}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="eventName"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Name of the Event <RequiredAst />
              </label>
              <input
                type="text"
                name="eventName"
                id="eventName"
                value={formData.eventName}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${errors.eventName ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Enter Event Name"
              />
              {errors.eventName && (
                <p className="mt-1 text-sm text-red-600">{errors.eventName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div>
                <label
                  htmlFor="numberOfDays"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  No of Days <RequiredAst />
                </label>
                <input
                  type="number"
                  name="numberOfDays"
                  id="numberOfDays"
                  value={formData.numberOfDays}
                  onChange={handleChange}
                  min="1"
                  className={`mt-1 block w-full px-3 py-2 border ${errors.numberOfDays ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="e.g. 3"
                />
                {errors.numberOfDays && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.numberOfDays}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="typeOfOrganization"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Type of Organization <RequiredAst />
              </label>
              <select
                name="typeOfOrganization"
                id="typeOfOrganization"
                value={formData.typeOfOrganization}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${errors.typeOfOrganization ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
              >
                {TYPE_OF_ORG_OPTIONS.map((option) => (
                  <option
                    key={option}
                    value={option}
                    disabled={option === "Click to choose"}
                  >
                    {option}
                  </option>
                ))}
              </select>
              {errors.typeOfOrganization && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.typeOfOrganization}
                </p>
              )}
            </div>

            {requiresOrgDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="companyName"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Company/Organisation/Foreign Institute Name <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    id="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.companyName ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter Organization Name"
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.companyName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="companyAddress"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    name="companyAddress"
                    id="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter Address"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="numberOfParticipants"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  No of participants attended <RequiredAst />
                </label>
                <input
                  type="number"
                  name="numberOfParticipants"
                  id="numberOfParticipants"
                  value={formData.numberOfParticipants}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.numberOfParticipants ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="e.g. 50"
                />
                {errors.numberOfParticipants && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.numberOfParticipants}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="typeOfAudience"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Type of Audience Covered <RequiredAst />
                </label>
                <select
                  name="typeOfAudience"
                  id="typeOfAudience"
                  value={formData.typeOfAudience}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.typeOfAudience ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                >
                  {TYPE_OF_AUDIENCE_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Click to choose"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.typeOfAudience && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.typeOfAudience}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <UploadCard
                label="Document Proof (1.Request Letter / Mail Copy , 2.Confirmation Letter / Appreciation Letter, 3. Brochure as a single document)"
                required
                file={formData.documentProof}
                error={errors.documentProof}
                dragActive={docProofDragActive}
                setDragActive={setDocProofDragActive}
                onDropFile={handleFilePick}
                fieldName="documentProof"
                clearFile={clearFile}
                accept=".pdf,.jpg,.jpeg,.png"
              />

              <UploadCard
                label="Apex Proof"
                file={formData.apexProof}
                error={errors.apexProof}
                dragActive={apexProofDragActive}
                setDragActive={setApexProofDragActive}
                onDropFile={handleFilePick}
                fieldName="apexProof"
                clearFile={clearFile}
                accept=".pdf,.jpg,.jpeg,.png"
              />

              <UploadCard
                label="Sample Photographs (If online, screenshot is required. If offline, photograph is required)"
                required
                file={formData.photos}
                error={errors.photos}
                dragActive={photosDragActive}
                setDragActive={setPhotosDragActive}
                onDropFile={handleFilePick}
                fieldName="photos"
                clearFile={clearFile}
                accept=".jpg,.jpeg,.png,.pdf"
                icon="image"
              />
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
