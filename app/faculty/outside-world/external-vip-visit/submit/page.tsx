"use client";

import { useEffect, useState, ChangeEvent, DragEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { ArrowLeft, Save, UploadCloud, FileText, X } from "lucide-react";

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

const YES_NO_OPTIONS = ["Choose an option", "yes", "No"];
const EVENT_TYPE_OPTIONS = [
  "Choose an option",
  "Work Shop",
  "Conference",
  "Symposium",
  "Value Added Course",
  "One credit Course",
  "Non-technical Events",
  "Technical Events",
  "Special Programs",
  "Leader of the week",
  "Guest lecture",
  "Placement Visit",
  "FDP/SDP",
  "Certificate course",
  "Other",
];
const DEPARTMENT_OPTIONS = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "Information Technology",
  "MBA",
  "MCA",
];
const IQAC_VERIFICATION_OPTIONS = ["Initiated", "Approved", "Rejected"];
const SPECIAL_LAB_OPTIONS = [
  "Select Special Lab",
  "AI Lab",
  "Robotics Lab",
  "IoT Lab",
  "Cyber Security Lab",
  "Cloud Computing Lab",
  "Data Science Lab",
];

const FILE_FIELDS = ["formalPhoto", "photoProof", "approvalLetter"] as const;
type FileField = (typeof FILE_FIELDS)[number];

type FormData = {
  faculty: string;
  taskID: string;
  specialLabsInvolved: string;
  specialLab: string;
  guestBelongsToIndustry: string;
  eventName: string;
  eventType: string;
  category: string;
  designation: string;
  organizationName: string;
  organizationAddress: string;
  startDate: string;
  endDate: string;
  purposeOfVisit: string;
  mobileNumber: string;
  guestEmail: string;
  departmentVisit: string[];
  topicPresented: string;
  isBITAlumni: string;
  formalPhoto: File | null;
  photoProof: File | null;
  approvalLetter: File | null;
  iqacVerification: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;
type DragStates = Partial<Record<FileField, boolean>>;

interface FileInputProps {
  fieldName: FileField;
  label: string;
  formData: FormData;
  errors: FormErrors;
  dragActiveStates: DragStates;
  onFileChange: (
    e: ChangeEvent<HTMLInputElement>,
    fieldName: FileField,
  ) => void;
  onClearFile: (fieldName: FileField) => void;
  onDrag: (e: DragEvent<HTMLDivElement>, fieldName: FileField) => void;
  onDrop: (e: DragEvent<HTMLDivElement>, fieldName: FileField) => void;
}

function FileInput({
  fieldName,
  label,
  formData,
  errors,
  dragActiveStates,
  onFileChange,
  onClearFile,
  onDrag,
  onDrop,
}: FileInputProps) {
  const file = formData[fieldName];
  const active = !!dragActiveStates[fieldName];
  const hasError = !!errors[fieldName];

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <div
        className={`mt-1 flex flex-col items-center justify-center w-full h-32 px-6 pt-5 pb-6 border-2 ${
          hasError
            ? "border-red-500"
            : active
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-300"
        } border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors bg-white`}
        onDragEnter={(e) => onDrag(e, fieldName)}
        onDragLeave={(e) => onDrag(e, fieldName)}
        onDragOver={(e) => onDrag(e, fieldName)}
        onDrop={(e) => onDrop(e, fieldName)}
        onClick={() => document.getElementById(`${fieldName}-upload`)?.click()}
      >
        <div className="space-y-1 text-center">
          <UploadCloud
            className={`mx-auto h-10 w-10 ${active ? "text-indigo-600" : "text-slate-400"}`}
          />
          <div className="flex text-sm text-slate-600">
            <label
              htmlFor={`${fieldName}-upload`}
              className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500"
            >
              <span>Upload a file</span>
              <input
                id={`${fieldName}-upload`}
                name={fieldName}
                type="file"
                className="sr-only"
                onChange={(e) => onFileChange(e, fieldName)}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-slate-500">PDF, JPG, PNG up to 10MB</p>
        </div>
      </div>
      {file && (
        <div className="mt-2 flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-200">
          <FileText size={16} className="mr-2 shrink-0 text-indigo-600" />
          <span className="font-medium mr-2 truncate">{file.name}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClearFile(fieldName);
            }}
            className="ml-auto text-red-500 hover:text-red-700 p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {errors[fieldName] && (
        <p className="mt-1 text-sm text-red-600">{errors[fieldName]}</p>
      )}
    </div>
  );
}

export default function ExternalVipVisitSubmitPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState<FormData>({
    faculty: "",
    taskID: "",
    specialLabsInvolved: "Choose an option",
    specialLab: "",
    guestBelongsToIndustry: "Choose an option",
    eventName: "",
    eventType: "Choose an option",
    category: "",
    designation: "",
    organizationName: "",
    organizationAddress: "",
    startDate: "",
    endDate: "",
    purposeOfVisit: "",
    mobileNumber: "",
    guestEmail: "",
    departmentVisit: [],
    topicPresented: "",
    isBITAlumni: "Choose an option",
    formalPhoto: null,
    photoProof: null,
    approvalLetter: null,
    iqacVerification: "Initiated",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [dragActiveStates, setDragActiveStates] = useState<DragStates>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name as keyof FormErrors];
      return next;
    });
  };

  const handleDepartmentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map(
      (option) => option.value,
    );
    setFormData((prev) => ({ ...prev, departmentVisit: selected }));
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    fieldName: FileField,
  ) => {
    if (e.target.files?.[0]) {
      setFormData((prev) => ({ ...prev, [fieldName]: e.target.files![0] }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const clearFile = (fieldName: FileField) => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>, fieldName: FileField) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveStates((prev) => ({ ...prev, [fieldName]: true }));
    } else if (e.type === "dragleave") {
      setDragActiveStates((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, fieldName: FileField) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveStates((prev) => ({ ...prev, [fieldName]: false }));
    if (e.dataTransfer.files?.[0]) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: e.dataTransfer.files[0],
      }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!formData.taskID) nextErrors.taskID = "Task ID is required";
    if (!formData.designation)
      nextErrors.designation = "Designation is required";

    if (
      !formData.specialLabsInvolved ||
      formData.specialLabsInvolved === "Choose an option"
    ) {
      nextErrors.specialLabsInvolved = "Selection is required";
    }
    if (formData.specialLabsInvolved === "yes" && !formData.specialLab) {
      nextErrors.specialLab = "Special Lab name is required";
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        nextErrors.endDate = "End Date cannot be before Start Date";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/faculty/outside-world/external-vip-visit");
    } catch (error) {
      console.error("Error submitting External VIP Visit:", error);
      alert("Failed to submit visit details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSpecialLab = formData.specialLabsInvolved === "yes";

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
              Add External VIP Visit Details
            </h1>
            <p className="text-sm text-slate-500">
              Create record for External VIP visits
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="faculty"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Faculty
                </label>
                <input
                  type="text"
                  name="faculty"
                  id="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Faculty Name"
                />
              </div>
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
                  className={`mt-1 block w-full px-3 py-2 border ${errors.specialLabsInvolved ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                >
                  {YES_NO_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Choose an option"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.specialLabsInvolved && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.specialLabsInvolved}
                  </p>
                )}
              </div>

              {showSpecialLab && (
                <div>
                  <label
                    htmlFor="specialLab"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Special Lab Name <RequiredAst />
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
              )}
            </div>

            <h3 className="text-lg font-medium text-slate-900 border-b pb-2">
              Guest & Event Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="guestBelongsToIndustry"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Guest belongs to industry?
                </label>
                <select
                  name="guestBelongsToIndustry"
                  id="guestBelongsToIndustry"
                  value={formData.guestBelongsToIndustry}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                >
                  {YES_NO_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Choose an option"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="isBITAlumni"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Guest belongs to BIT Alumni?
                </label>
                <select
                  name="isBITAlumni"
                  id="isBITAlumni"
                  value={formData.isBITAlumni}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                >
                  {YES_NO_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Choose an option"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="eventName"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Event Name
                </label>
                <input
                  type="text"
                  name="eventName"
                  id="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Event Name"
                />
              </div>
              <div>
                <label
                  htmlFor="eventType"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Event Type
                </label>
                <select
                  name="eventType"
                  id="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                >
                  {EVENT_TYPE_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Choose an option"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  id="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Category"
                />
              </div>
              <div>
                <label
                  htmlFor="designation"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Designation <RequiredAst />
                </label>
                <input
                  type="text"
                  name="designation"
                  id="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.designation ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter Designation"
                />
                {errors.designation && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.designation}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="organizationName"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Organization Name
              </label>
              <input
                type="text"
                name="organizationName"
                id="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter Organization Name"
              />
            </div>

            <div>
              <label
                htmlFor="organizationAddress"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Organization Address
              </label>
              <textarea
                name="organizationAddress"
                id="organizationAddress"
                rows={3}
                value={formData.organizationAddress}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter Organization Address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.endDate ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="purposeOfVisit"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Purpose of Visit
              </label>
              <textarea
                name="purposeOfVisit"
                id="purposeOfVisit"
                rows={3}
                value={formData.purposeOfVisit}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter Purpose of Visit"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="mobileNumber"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  id="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Mobile Number"
                />
              </div>
              <div>
                <label
                  htmlFor="guestEmail"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Guest Email
                </label>
                <input
                  type="email"
                  name="guestEmail"
                  id="guestEmail"
                  value={formData.guestEmail}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Guest Email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="departmentVisit"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Department Visit (Hold Ctrl/Cmd to select multiple)
              </label>
              <select
                name="departmentVisit"
                id="departmentVisit"
                multiple
                value={formData.departmentVisit}
                onChange={handleDepartmentChange}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                size={5}
              >
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">
                Selected: {formData.departmentVisit.join(", ") || "None"}
              </p>
            </div>

            <div>
              <label
                htmlFor="topicPresented"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Topic Presented
              </label>
              <textarea
                name="topicPresented"
                id="topicPresented"
                rows={3}
                value={formData.topicPresented}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter Topic Presented"
              />
            </div>

            <h3 className="text-lg font-medium text-slate-900 border-b pb-2">
              Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FileInput
                fieldName="formalPhoto"
                label="Formal Photo of Guest (good clarity)"
                formData={formData}
                errors={errors}
                dragActiveStates={dragActiveStates}
                onFileChange={handleFileChange}
                onClearFile={clearFile}
                onDrag={handleDrag}
                onDrop={handleDrop}
              />
              <FileInput
                fieldName="photoProof"
                label="Photo Proof"
                formData={formData}
                errors={errors}
                dragActiveStates={dragActiveStates}
                onFileChange={handleFileChange}
                onClearFile={clearFile}
                onDrag={handleDrag}
                onDrop={handleDrop}
              />
              <FileInput
                fieldName="approvalLetter"
                label="Approval Letter"
                formData={formData}
                errors={errors}
                dragActiveStates={dragActiveStates}
                onFileChange={handleFileChange}
                onClearFile={clearFile}
                onDrag={handleDrag}
                onDrop={handleDrop}
              />
            </div>

            <div>
              <label
                htmlFor="iqacVerification"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                IQAC Verification
              </label>
              <select
                name="iqacVerification"
                id="iqacVerification"
                value={formData.iqacVerification}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
              >
                {IQAC_VERIFICATION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
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
                {isSubmitting ? "Saving..." : "Save VIP Visit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
