"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  FileText,
  X,
  User,
  Building2,
  Calendar,
  Award,
  CheckSquare,
  Briefcase,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

type FileField =
  | "communicationProof"
  | "approvalLetter"
  | "geotagPhotos"
  | "participantsAttendance"
  | "paymentProofs"
  | "consolidatedDocument";

type FormData = {
  faculty: string;
  sigNumber: string;
  specialLabsInvolved: string;
  specialLab: string;
  eventName: string;
  eventNameOther: string;
  industryName: string;
  industryAddress: string;
  domainArea: string;
  industryType: string;
  industryTypeOther: string;
  modeOfTraining: string;
  industryWebsite: string;
  numberOfPersonsTrained: string;
  durationDays: string;
  startDate: string;
  endDate: string;
  outcomeOfTraining: string;
  honorariumReceived: string;
  communicationProof: File[];
  approvalLetter: File[];
  geotagPhotos: File[];
  participantsAttendance: File[];
  paymentProofs: File[];
  consolidatedDocument: File[];
  owiVerification: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;
type DragActiveStates = Partial<Record<FileField, boolean>>;

const specialLabsOptions = [
  { value: "", label: "Choose an option" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;

const eventNameOptions = [
  "Choose an option",
  "Conference",
  "Workshop",
  "Industry Training",
  "Seminar",
  "Others",
] as const;
const industryTypeOptions = [
  "Choose an option",
  "MNC",
  "Government",
  "Private",
  "Startup",
  "Others",
] as const;
const modeOfTrainingOptions = [
  "Choose an option",
  "Online",
  "Offline",
] as const;
const owiVerificationOptions = ["Initiated", "Approved", "Rejected"] as const;

function FileUpload({
  label,
  name,
  files,
  onFilesSelect,
  error,
  required,
  disabled,
  dragActive,
  onDrag,
  onDrop,
}: {
  label: string;
  name: FileField;
  files: File[];
  onFilesSelect: (name: FileField, files: File[]) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  dragActive?: boolean;
  onDrag: (e: React.DragEvent<HTMLLabelElement>, field: FileField) => void;
  onDrop: (e: React.DragEvent<HTMLLabelElement>, field: FileField) => void;
}) {
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelect(name, Array.from(e.target.files));
    }
    e.target.value = "";
  };

  const clearFile = (index?: number) => {
    if (typeof index === "number" && files && files.length > 0) {
      const newFiles = [...files];
      newFiles.splice(index, 1);
      onFilesSelect(name, newFiles);
    } else {
      onFilesSelect(name, []);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required ? <RequiredAst /> : null}
      </label>
      <label
        htmlFor={`file-input-${name}`}
        onDragEnter={(e) => onDrag(e, name)}
        onDragLeave={(e) => onDrag(e, name)}
        onDragOver={(e) => onDrag(e, name)}
        onDrop={(e) => onDrop(e, name)}
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors bg-white cursor-pointer ${
          dragActive
            ? "border-indigo-500 bg-indigo-50"
            : "border-slate-300 hover:border-indigo-500"
        } ${disabled ? "bg-slate-50 cursor-not-allowed opacity-60" : ""}`}
      >
        <div className="space-y-1 text-center">
          <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
          <div className="flex text-sm text-slate-600 justify-center">
            <span
              className={`font-medium text-indigo-600 hover:text-indigo-500 ${disabled ? "cursor-not-allowed" : ""}`}
            >
              Upload files
            </span>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-slate-500">
            PDF, DOC, DOCX, JPG, PNG up to 10MB
          </p>
        </div>
        <input
          ref={(el) => setInputRef(el)}
          id={`file-input-${name}`}
          type="file"
          name={name}
          className="hidden"
          onChange={handleFileChange}
          multiple
          disabled={disabled}
        />
      </label>
      {files && files.length > 0 ? (
        <div className="mt-2 space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-2 bg-indigo-50 rounded-md border border-indigo-100"
            >
              <div className="flex items-center">
                <FileText size={16} className="text-indigo-600 mr-2" />
                <span className="text-sm text-slate-700 truncate max-w-xs">
                  {file.name}
                </span>
                <span className="text-xs text-slate-400 ml-2">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => clearFile(index)}
                disabled={disabled}
                className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export default function TrainingToIndustrySubmitPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState<FormData>({
    faculty: "",
    sigNumber: "",
    specialLabsInvolved: "",
    specialLab: "",
    eventName: "",
    eventNameOther: "",
    industryName: "",
    industryAddress: "",
    domainArea: "",
    industryType: "Choose an option",
    industryTypeOther: "",
    modeOfTraining: "Choose an option",
    industryWebsite: "",
    numberOfPersonsTrained: "",
    durationDays: "",
    startDate: "",
    endDate: "",
    outcomeOfTraining: "",
    honorariumReceived: "",
    communicationProof: [],
    approvalLetter: [],
    geotagPhotos: [],
    participantsAttendance: [],
    paymentProofs: [],
    consolidatedDocument: [],
    owiVerification: "Initiated",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState<DragActiveStates>({});

  useEffect(() => {
    if (user?.name) {
      setFormData((prev) => ({ ...prev, faculty: user.name }));
    }
  }, [user?.name]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof FormErrors];
        return next;
      });
    }
  };

  const handleFileSelect = (name: FileField, files: File[]) => {
    setFormData((prev) => ({ ...prev, [name]: files }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleDrag = (
    e: React.DragEvent<HTMLLabelElement>,
    fieldName: FileField,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive((prev) => ({ ...prev, [fieldName]: true }));
    } else if (e.type === "dragleave") {
      setDragActive((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleDrop = (
    e: React.DragEvent<HTMLLabelElement>,
    fieldName: FileField,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [fieldName]: false }));
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(fieldName, Array.from(e.dataTransfer.files));
    }
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!formData.faculty.trim()) nextErrors.faculty = "Faculty is required";
    if (!formData.sigNumber.trim())
      nextErrors.sigNumber = "SIG Number is required";
    if (!formData.specialLabsInvolved)
      nextErrors.specialLabsInvolved = "Special Labs Involved is required";
    if (formData.specialLabsInvolved === "yes" && !formData.specialLab.trim())
      nextErrors.specialLab = "Special Lab Name is required";
    if (!formData.eventName || formData.eventName === "Choose an option")
      nextErrors.eventName = "Name of the Event is required";
    if (formData.eventName === "Others" && !formData.eventNameOther.trim())
      nextErrors.eventNameOther = "Please specify the event name";
    if (!formData.industryName.trim())
      nextErrors.industryName =
        "Name of the Industry / Organization is required";
    if (!formData.industryAddress.trim())
      nextErrors.industryAddress = "Address of the Industry is required";
    if (!formData.domainArea.trim())
      nextErrors.domainArea = "Domain Area of the Industry is required";
    if (!formData.industryType || formData.industryType === "Choose an option")
      nextErrors.industryType = "Type of Industry / Organization is required";
    if (
      formData.industryType === "Others" &&
      !formData.industryTypeOther.trim()
    )
      nextErrors.industryTypeOther = "Please specify the industry type";
    if (
      !formData.modeOfTraining ||
      formData.modeOfTraining === "Choose an option"
    )
      nextErrors.modeOfTraining = "Mode of Training is required";
    if (!formData.numberOfPersonsTrained.trim())
      nextErrors.numberOfPersonsTrained =
        "Number of Industry persons trained is required";
    if (!formData.durationDays.trim())
      nextErrors.durationDays = "Duration, in days is required";
    if (!formData.startDate) nextErrors.startDate = "Start date is required";
    if (!formData.endDate) nextErrors.endDate = "End date is required";
    if (!formData.outcomeOfTraining.trim())
      nextErrors.outcomeOfTraining = "Outcome of the Training is required";
    if (
      formData.honorariumReceived &&
      Number.isNaN(Number(formData.honorariumReceived))
    )
      nextErrors.honorariumReceived = "Honorarium must be a number";
    if (
      !formData.communicationProof ||
      formData.communicationProof.length === 0
    )
      nextErrors.communicationProof = "Communication Proof is required";
    if (!formData.approvalLetter || formData.approvalLetter.length === 0)
      nextErrors.approvalLetter = "Approval letter from BIT is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (!API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured");
      }

      const submitData = new FormData();
      const fileFields: FileField[] = [
        "communicationProof",
        "approvalLetter",
        "geotagPhotos",
        "participantsAttendance",
        "paymentProofs",
        "consolidatedDocument",
      ];

      (Object.keys(formData) as Array<keyof FormData>).forEach((key) => {
        if (!fileFields.includes(key as FileField)) {
          submitData.append(key, formData[key] as string);
        }
      });

      fileFields.forEach((fieldName) => {
        const files = formData[fieldName];
        if (files && files.length > 0) {
          files.forEach((file) => {
            submitData.append(fieldName, file);
          });
        }
      });

      const response = await fetch(`${API_URL}/api/owi/trainingToIndustry`, {
        method: "POST",
        body: submitData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.details || "Unknown error",
        );
      }

      alert("Training to Industry submitted successfully!");
      router.push("/faculty/outside-world/training-to-industry");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to submit form: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Training to Industry Details
            </h1>
            <p className="text-sm text-slate-500">
              Add Training to Industry details
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Faculty Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="faculty"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Faculty <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="faculty"
                    id="faculty"
                    value={formData.faculty}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.faculty ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter faculty name"
                  />
                  {errors.faculty ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.faculty}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="sigNumber"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    SIG Number <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="sigNumber"
                    id="sigNumber"
                    value={formData.sigNumber}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.sigNumber ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter SIG Number"
                  />
                  {errors.sigNumber ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.sigNumber}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="specialLabsInvolved"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Special Labs Involved <RequiredAst />
                  </label>
                  <select
                    name="specialLabsInvolved"
                    id="specialLabsInvolved"
                    value={formData.specialLabsInvolved}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 h-10 border ${errors.specialLabsInvolved ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                  >
                    {specialLabsOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={option.value === ""}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.specialLabsInvolved ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.specialLabsInvolved}
                    </p>
                  ) : null}
                </div>

                {formData.specialLabsInvolved === "yes" ? (
                  <div>
                    <label
                      htmlFor="specialLab"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Special Lab Name <RequiredAst />
                    </label>
                    <input
                      type="text"
                      name="specialLab"
                      id="specialLab"
                      value={formData.specialLab}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${errors.specialLab ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="Enter special lab name"
                    />
                    {errors.specialLab ? (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.specialLab}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                Event Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="eventName"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Name of the Event <RequiredAst />
                  </label>
                  <select
                    name="eventName"
                    id="eventName"
                    value={formData.eventName}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 h-10 border ${errors.eventName ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                  >
                    {eventNameOptions.map((option) => (
                      <option
                        key={option}
                        value={option}
                        disabled={option === "Choose an option"}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.eventName ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.eventName}
                    </p>
                  ) : null}
                </div>

                {formData.eventName === "Others" ? (
                  <div>
                    <label
                      htmlFor="eventNameOther"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      If Others, Please Specify <RequiredAst />
                    </label>
                    <input
                      type="text"
                      name="eventNameOther"
                      id="eventNameOther"
                      value={formData.eventNameOther}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${errors.eventNameOther ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="Please specify"
                    />
                    {errors.eventNameOther ? (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.eventNameOther}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Industry / Organization Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="industryName"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Name of the Industry / Organization <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="industryName"
                    id="industryName"
                    value={formData.industryName}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.industryName ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter industry/organization name"
                  />
                  {errors.industryName ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.industryName}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="domainArea"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Domain Area of the Industry <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="domainArea"
                    id="domainArea"
                    value={formData.domainArea}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.domainArea ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="e.g., AI/ML, Finance, Healthcare"
                  />
                  {errors.domainArea ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.domainArea}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="industryType"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Type of Industry / Organization <RequiredAst />
                  </label>
                  <select
                    name="industryType"
                    id="industryType"
                    value={formData.industryType}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 h-10 border ${errors.industryType ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                  >
                    {industryTypeOptions.map((option) => (
                      <option
                        key={option}
                        value={option}
                        disabled={option === "Choose an option"}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.industryType ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.industryType}
                    </p>
                  ) : null}
                </div>

                {formData.industryType === "Others" ? (
                  <div>
                    <label
                      htmlFor="industryTypeOther"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      If Others, Please Specify <RequiredAst />
                    </label>
                    <input
                      type="text"
                      name="industryTypeOther"
                      id="industryTypeOther"
                      value={formData.industryTypeOther}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${errors.industryTypeOther ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="Please specify"
                    />
                    {errors.industryTypeOther ? (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.industryTypeOther}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="modeOfTraining"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Mode of Training <RequiredAst />
                  </label>
                  <select
                    name="modeOfTraining"
                    id="modeOfTraining"
                    value={formData.modeOfTraining}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 h-10 border ${errors.modeOfTraining ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                  >
                    {modeOfTrainingOptions.map((option) => (
                      <option
                        key={option}
                        value={option}
                        disabled={option === "Choose an option"}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.modeOfTraining ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.modeOfTraining}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="industryWebsite"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Industry Website
                  </label>
                  <input
                    type="url"
                    name="industryWebsite"
                    id="industryWebsite"
                    value={formData.industryWebsite}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="https://www.company.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="industryAddress"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Address of the Industry <RequiredAst />
                </label>
                <textarea
                  name="industryAddress"
                  id="industryAddress"
                  value={formData.industryAddress}
                  onChange={handleChange}
                  rows={3}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.industryAddress ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter complete address of the industry/organization"
                />
                {errors.industryAddress ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.industryAddress}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Training Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="numberOfPersonsTrained"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Number of Industry persons trained <RequiredAst />
                  </label>
                  <input
                    type="number"
                    name="numberOfPersonsTrained"
                    id="numberOfPersonsTrained"
                    value={formData.numberOfPersonsTrained}
                    onChange={handleChange}
                    min="0"
                    className={`mt-1 block w-full px-3 py-2 border ${errors.numberOfPersonsTrained ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter number of persons"
                  />
                  {errors.numberOfPersonsTrained ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.numberOfPersonsTrained}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="durationDays"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Duration, in days <RequiredAst />
                  </label>
                  <input
                    type="number"
                    name="durationDays"
                    id="durationDays"
                    value={formData.durationDays}
                    onChange={handleChange}
                    min="0"
                    className={`mt-1 block w-full px-3 py-2 border ${errors.durationDays ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter duration in days"
                  />
                  {errors.durationDays ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.durationDays}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Start date <RequiredAst />
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.startDate ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                  {errors.startDate ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.startDate}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    End date <RequiredAst />
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.endDate ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                  {errors.endDate ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.endDate}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="outcomeOfTraining"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Outcome of the Training <RequiredAst />
                  </label>
                  <textarea
                    name="outcomeOfTraining"
                    id="outcomeOfTraining"
                    value={formData.outcomeOfTraining}
                    onChange={handleChange}
                    rows={3}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.outcomeOfTraining ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter outcome of the training"
                  />
                  {errors.outcomeOfTraining ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.outcomeOfTraining}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="honorariumReceived"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Honorarium received from the Industry (in Rs.)
                  </label>
                  <input
                    type="number"
                    name="honorariumReceived"
                    id="honorariumReceived"
                    value={formData.honorariumReceived}
                    onChange={handleChange}
                    min="0"
                    className={`mt-1 block w-full px-3 py-2 border ${errors.honorariumReceived ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter honorarium amount"
                  />
                  {errors.honorariumReceived ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.honorariumReceived}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Award className="h-5 w-5 mr-2 text-blue-600" />
                Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUpload
                  label="Upload Communication Proof"
                  name="communicationProof"
                  files={formData.communicationProof}
                  onFilesSelect={handleFileSelect}
                  required
                  error={errors.communicationProof}
                  dragActive={dragActive.communicationProof}
                  onDrag={handleDrag}
                  onDrop={handleDrop}
                />
                <FileUpload
                  label="Approval letter from BIT"
                  name="approvalLetter"
                  files={formData.approvalLetter}
                  onFilesSelect={handleFileSelect}
                  required
                  error={errors.approvalLetter}
                  dragActive={dragActive.approvalLetter}
                  onDrag={handleDrag}
                  onDrop={handleDrop}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUpload
                  label="Upload Geotag Photos"
                  name="geotagPhotos"
                  files={formData.geotagPhotos}
                  onFilesSelect={handleFileSelect}
                  error={errors.geotagPhotos}
                  dragActive={dragActive.geotagPhotos}
                  onDrag={handleDrag}
                  onDrop={handleDrop}
                />
                <FileUpload
                  label="Upload participant's attendance"
                  name="participantsAttendance"
                  files={formData.participantsAttendance}
                  onFilesSelect={handleFileSelect}
                  error={errors.participantsAttendance}
                  dragActive={dragActive.participantsAttendance}
                  onDrag={handleDrag}
                  onDrop={handleDrop}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUpload
                  label="Upload Payment Proofs"
                  name="paymentProofs"
                  files={formData.paymentProofs}
                  onFilesSelect={handleFileSelect}
                  error={errors.paymentProofs}
                  dragActive={dragActive.paymentProofs}
                  onDrag={handleDrag}
                  onDrop={handleDrop}
                />
                <FileUpload
                  label="Upload Consolidated Document"
                  name="consolidatedDocument"
                  files={formData.consolidatedDocument}
                  onFilesSelect={handleFileSelect}
                  error={errors.consolidatedDocument}
                  dragActive={dragActive.consolidatedDocument}
                  onDrag={handleDrag}
                  onDrop={handleDrop}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <CheckSquare className="h-5 w-5 mr-2 text-blue-600" />
                OWI Verification
              </h3>
              <div>
                <label
                  htmlFor="owiVerification"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  OWI Verification
                </label>
                <select
                  name="owiVerification"
                  id="owiVerification"
                  value={formData.owiVerification}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 h-10 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                >
                  {owiVerificationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-5 flex items-center justify-end space-x-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Record"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
