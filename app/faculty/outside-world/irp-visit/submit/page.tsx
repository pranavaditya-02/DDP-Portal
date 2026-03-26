"use client";

import { useEffect, useState, ChangeEvent, DragEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/lib/store";
import { ArrowLeft, Save, UploadCloud, FileText, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

const SPECIAL_LABS_OPTIONS = ["Choose an option", "Yes", "No"];
const TYPE_OF_APPROVAL_OPTIONS = [
  "Choose an option",
  "Apex",
  "Non-Apex",
  "Dean",
  "Principal",
];
const YES_NO_OPTIONS = ["Choose an option", "Yes", "No"];
const MODE_OF_INTERACTION_OPTIONS = [
  "Choose an option",
  "Email",
  "Visit to compancy permises",
  "With in BIT",
  "Phone call",
  "others",
];
const PURPOSE_OF_VISIT_OPTIONS = [
  "Choose an option",
  "Industry Interaction",
  "Field visit",
  "Exhibition",
  "IECC Planned Activity",
  "Pskill",
];
const IQAC_VERIFICATION_OPTIONS = ["Initiated", "Approved", "Rejected"];
const DEPARTMENT_OPTIONS = [
  "CSE",
  "IT",
  "ECE",
  "EEE",
  "MECH",
  "CIVIL",
  "Admin",
  "MA",
  "PHY",
  "CHEM",
];
const SPECIAL_LAB_LIST = [
  "Select Special Lab",
  "AI Lab",
  "Robotics Lab",
  "IoT Lab",
  "Cyber Security Lab",
  "Cloud Computing Lab",
  "Data Science Lab",
];

type FileField =
  | "apexProof"
  | "geotagPhotos"
  | "irpFormSigned"
  | "consolidatedDocument";

type FormData = {
  faculty: string;
  sigNumber: string;
  taskID: string;
  specialLabsInvolved: string;
  specialLab: string;
  numberOfFaculty: string;
  claimedForFaculty: string;
  claimedForDepartment: string;
  typeOfApproval: string;
  isIrpVisitPartOfMou: string;
  mouName: string;
  mouPointsDiscussed: string;
  fromDate: string;
  toDate: string;
  modeOfInteraction: string;
  purposeOfVisit: string;
  amountIncurred: string;
  numberOfIndustry: string;
  apexProof: File | null;
  geotagPhotos: File | null;
  irpFormSigned: File | null;
  consolidatedDocument: File | null;
  iqacVerification: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;
type DragActiveStates = Partial<Record<FileField, boolean>>;

interface FileInputProps {
  fieldName: FileField;
  label: string;
  acceptedTypes?: string;
  formData: FormData;
  errors: FormErrors;
  dragActiveStates: DragActiveStates;
  onFileChange: (
    e: ChangeEvent<HTMLInputElement>,
    fieldName: FileField,
  ) => void;
  onClear: (fieldName: FileField) => void;
  onDrag: (e: DragEvent<HTMLDivElement>, fieldName: FileField) => void;
  onDrop: (e: DragEvent<HTMLDivElement>, fieldName: FileField) => void;
}

function FileInput({
  fieldName,
  label,
  acceptedTypes = "PDF, JPG, PNG",
  formData,
  errors,
  dragActiveStates,
  onFileChange,
  onClear,
  onDrag,
  onDrop,
}: FileInputProps) {
  const file = formData[fieldName];
  const active = !!dragActiveStates[fieldName];

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <div
        className={`mt-1 flex flex-col items-center justify-center w-full h-32 px-6 pt-5 pb-6 border-2 ${
          errors[fieldName]
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
          <p className="text-xs text-slate-500">{acceptedTypes} up to 10MB</p>
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
              onClear(fieldName);
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

export default function IrpVisitSubmitPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState<FormData>({
    faculty: "",
    sigNumber: "",
    taskID: "",
    specialLabsInvolved: "Choose an option",
    specialLab: "",
    numberOfFaculty: "",
    claimedForFaculty: "",
    claimedForDepartment: "",
    typeOfApproval: "Choose an option",
    isIrpVisitPartOfMou: "Choose an option",
    mouName: "",
    mouPointsDiscussed: "",
    fromDate: "",
    toDate: "",
    modeOfInteraction: "Choose an option",
    purposeOfVisit: "Choose an option",
    amountIncurred: "",
    numberOfIndustry: "",
    apexProof: null,
    geotagPhotos: null,
    irpFormSigned: null,
    consolidatedDocument: null,
    iqacVerification: "Initiated",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [dragActiveStates, setDragActiveStates] = useState<DragActiveStates>(
    {},
  );
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

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof FormErrors];
        return next;
      });
    }
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    fieldName: FileField,
  ) => {
    if (e.target.files?.[0]) {
      setFormData((prev) => ({ ...prev, [fieldName]: e.target.files![0] }));
      if (errors[fieldName]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[fieldName];
          return next;
        });
      }
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
      if (errors[fieldName]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[fieldName];
          return next;
        });
      }
    }
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!formData.taskID) nextErrors.taskID = "Task ID is required";
    if (
      !formData.specialLabsInvolved ||
      formData.specialLabsInvolved === "Choose an option"
    ) {
      nextErrors.specialLabsInvolved = "Selection is required";
    }
    if (formData.specialLabsInvolved === "Yes" && !formData.specialLab) {
      nextErrors.specialLab = "Special Lab name is required";
    }
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

      const data = new FormData();

      (Object.keys(formData) as Array<keyof FormData>).forEach((key) => {
        const value = formData[key];
        if (
          value !== null &&
          typeof value !== "object" &&
          key !== "iqacVerification"
        ) {
          data.append(key, value);
        }
      });

      if (formData.apexProof) data.append("apexProof", formData.apexProof);
      if (formData.irpFormSigned)
        data.append("irpFormSigned", formData.irpFormSigned);
      if (formData.consolidatedDocument)
        data.append("consolidatedDocument", formData.consolidatedDocument);
      if (formData.geotagPhotos)
        data.append("geotagPhotos", formData.geotagPhotos);

      const response = await axios.post(
        `${API_URL}/api/faculty/irpVisitPost`,
        data,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        alert("IRP Visit details submitted successfully!");
        router.push("/faculty/outside-world/irp-visit");
      }
    } catch (error) {
      console.error("Error submitting IRP Visit:", error);
      let errorMessage = "Unknown error";
      if (axios.isAxiosError(error)) {
        errorMessage =
          (
            error.response?.data as
              | { error?: string; details?: string }
              | undefined
          )?.error ||
          (
            error.response?.data as
              | { error?: string; details?: string }
              | undefined
          )?.details ||
          error.message ||
          "Unknown error";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(`Failed to submit IRP Visit: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSpecialLab = formData.specialLabsInvolved === "Yes";
  const showMouDetails = formData.isIrpVisitPartOfMou === "Yes";

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
              Add IRP Visit Details
            </h1>
            <p className="text-sm text-slate-500">
              Create record for Intellectual Property Rights visits
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
                  htmlFor="sigNumber"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  SIG Number
                </label>
                <input
                  type="text"
                  name="sigNumber"
                  id="sigNumber"
                  value={formData.sigNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter SIG Number"
                />
              </div>
            </div>

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
                  htmlFor="numberOfFaculty"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  No. of Faculty
                </label>
                <input
                  type="number"
                  name="numberOfFaculty"
                  id="numberOfFaculty"
                  value={formData.numberOfFaculty}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Count"
                />
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
                  {SPECIAL_LABS_OPTIONS.map((option) => (
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
                    {SPECIAL_LAB_LIST.map((option) => (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="claimedForFaculty"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Claimed for Faculty
                </label>
                <input
                  type="text"
                  name="claimedForFaculty"
                  id="claimedForFaculty"
                  value={formData.claimedForFaculty}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Details"
                />
              </div>
              <div>
                <label
                  htmlFor="claimedForDepartment"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Claimed for Department
                </label>
                <select
                  name="claimedForDepartment"
                  id="claimedForDepartment"
                  value={formData.claimedForDepartment}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                >
                  <option value="">Select Department</option>
                  {DEPARTMENT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="typeOfApproval"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Type of Approval
                </label>
                <select
                  name="typeOfApproval"
                  id="typeOfApproval"
                  value={formData.typeOfApproval}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                >
                  {TYPE_OF_APPROVAL_OPTIONS.map((option) => (
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
                  htmlFor="isIrpVisitPartOfMou"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Is the IRP visit part of the MoU?
                </label>
                <select
                  name="isIrpVisitPartOfMou"
                  id="isIrpVisitPartOfMou"
                  value={formData.isIrpVisitPartOfMou}
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

            {showMouDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-md border border-slate-200">
                <div>
                  <label
                    htmlFor="mouName"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Name of the MoU
                  </label>
                  <input
                    type="text"
                    name="mouName"
                    id="mouName"
                    value={formData.mouName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter MoU Name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="mouPointsDiscussed"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Points discussed in relation with the MoU
                  </label>
                  <textarea
                    name="mouPointsDiscussed"
                    id="mouPointsDiscussed"
                    rows={2}
                    value={formData.mouPointsDiscussed}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter Points"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="fromDate"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  From Date
                </label>
                <input
                  type="date"
                  name="fromDate"
                  id="fromDate"
                  value={formData.fromDate}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="toDate"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  To Date
                </label>
                <input
                  type="date"
                  name="toDate"
                  id="toDate"
                  value={formData.toDate}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="modeOfInteraction"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Mode of the Interaction
                </label>
                <select
                  name="modeOfInteraction"
                  id="modeOfInteraction"
                  value={formData.modeOfInteraction}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                >
                  {MODE_OF_INTERACTION_OPTIONS.map((option) => (
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
                  htmlFor="purposeOfVisit"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Purpose of Visit
                </label>
                <select
                  name="purposeOfVisit"
                  id="purposeOfVisit"
                  value={formData.purposeOfVisit}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                >
                  {PURPOSE_OF_VISIT_OPTIONS.map((option) => (
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
                  htmlFor="amountIncurred"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Amount Incurred in Rs.
                </label>
                <input
                  type="number"
                  name="amountIncurred"
                  id="amountIncurred"
                  value={formData.amountIncurred}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Amount"
                />
              </div>
              <div>
                <label
                  htmlFor="numberOfIndustry"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  No. of Industry
                </label>
                <input
                  type="number"
                  name="numberOfIndustry"
                  id="numberOfIndustry"
                  value={formData.numberOfIndustry}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Number"
                />
              </div>
            </div>

            <h3 className="text-lg font-medium text-slate-900 border-b pb-2">
              Documents
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-slate-800 mb-4">
                  Proof Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileInput
                    fieldName="apexProof"
                    label="Upload Apex Proof"
                    formData={formData}
                    errors={errors}
                    dragActiveStates={dragActiveStates}
                    onFileChange={handleFileChange}
                    onClear={clearFile}
                    onDrag={handleDrag}
                    onDrop={handleDrop}
                  />
                  <FileInput
                    fieldName="geotagPhotos"
                    label="Upload Geotag Photos"
                    formData={formData}
                    errors={errors}
                    dragActiveStates={dragActiveStates}
                    onFileChange={handleFileChange}
                    onClear={clearFile}
                    onDrag={handleDrag}
                    onDrop={handleDrop}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-slate-800 mb-4">
                  Form Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileInput
                    fieldName="irpFormSigned"
                    label="Upload IRP form duly signed by Industry person"
                    formData={formData}
                    errors={errors}
                    dragActiveStates={dragActiveStates}
                    onFileChange={handleFileChange}
                    onClear={clearFile}
                    onDrag={handleDrag}
                    onDrop={handleDrop}
                  />
                  <FileInput
                    fieldName="consolidatedDocument"
                    label="Upload Consolidated Document"
                    formData={formData}
                    errors={errors}
                    dragActiveStates={dragActiveStates}
                    onFileChange={handleFileChange}
                    onClear={clearFile}
                    onDrag={handleDrag}
                    onDrop={handleDrop}
                  />
                </div>
              </div>
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
                {isSubmitting ? "Saving..." : "Save IRP Visit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
