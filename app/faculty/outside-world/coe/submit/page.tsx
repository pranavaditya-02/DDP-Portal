"use client";

import { useEffect, useState, ChangeEvent, DragEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { ArrowLeft, Save, UploadCloud, FileText, X } from "lucide-react";

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

const YES_NO_OPTIONS = ["Choose an option", "yes", "No"];
const TYPE_OF_COE_OPTIONS = [
  "Choose an option",
  "Industry sponsored lab",
  "Industry supported lab",
];
const OWI_VERIFICATION_OPTIONS = ["Initiated", "Approved", "Rejected"];
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

const FILE_FIELDS = [
  "syllabusDocument",
  "labPhoto",
  "communicationProof",
  "apexDocument",
  "facilitiesReport",
  "utilizationReport",
] as const;

type FileField = (typeof FILE_FIELDS)[number];

type FormData = {
  faculty: string;
  sigNumber: string;
  taskID: string;
  coeName: string;
  centreClaimedDepartment: string;
  facultyIncharge: string;
  typeOfCOE: string;
  collaborativeIndustry1: string;
  collaborativeIndustry2: string;
  areaInSqm: string;
  domain: string;
  isMoUPart: string;
  mouName: string;
  isIRPResult: string;
  irpVisits: string;
  stockRegisterMaintained: string;
  totalAmountIncurred: string;
  bitContribution: string;
  industryContributionWithGST: string;
  industryContributionWithoutGST: string;
  studentsPerBatch: string;
  academicCourse: string;
  syllabusDocument: File | null;
  labPhoto: File | null;
  communicationProof: File | null;
  apexDocument: File | null;
  facilitiesReport: File | null;
  utilizationReport: File | null;
  owiVerification: string;
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

export default function CoeSubmitPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState<FormData>({
    faculty: "",
    sigNumber: "",
    taskID: "",
    coeName: "",
    centreClaimedDepartment: "",
    facultyIncharge: "",
    typeOfCOE: "Choose an option",
    collaborativeIndustry1: "",
    collaborativeIndustry2: "",
    areaInSqm: "",
    domain: "",
    isMoUPart: "Choose an option",
    mouName: "",
    isIRPResult: "Choose an option",
    irpVisits: "",
    stockRegisterMaintained: "Choose an option",
    totalAmountIncurred: "",
    bitContribution: "",
    industryContributionWithGST: "",
    industryContributionWithoutGST: "",
    studentsPerBatch: "",
    academicCourse: "",
    syllabusDocument: null,
    labPhoto: null,
    communicationProof: null,
    apexDocument: null,
    facilitiesReport: null,
    utilizationReport: null,
    owiVerification: "Initiated",
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
    if (!formData.faculty) nextErrors.faculty = "Faculty is required";
    if (!formData.sigNumber) nextErrors.sigNumber = "SIG Number is required";
    if (!formData.taskID) nextErrors.taskID = "Task ID is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/faculty/outside-world/coe");
    } catch (error) {
      console.error("Error submitting COE:", error);
      alert("Failed to submit COE details");
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
              Add Centre of Excellence Details
            </h1>
            <p className="text-sm text-slate-500">
              Create record for Centre of Excellence
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  placeholder="Click to choose"
                />
                {errors.faculty && (
                  <p className="mt-1 text-sm text-red-600">{errors.faculty}</p>
                )}
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
                  placeholder="Click to choose"
                />
                {errors.sigNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.sigNumber}
                  </p>
                )}
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

            <h3 className="text-lg font-medium text-slate-900 border-b pb-2">
              Centre of Excellence Information
            </h3>

            <div>
              <label
                htmlFor="coeName"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Name of the Centre of Excellence
              </label>
              <input
                type="text"
                name="coeName"
                id="coeName"
                value={formData.coeName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter COE Name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="centreClaimedDepartment"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Centre Claimed Department
                </label>
                <select
                  name="centreClaimedDepartment"
                  id="centreClaimedDepartment"
                  value={formData.centreClaimedDepartment}
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
              <div>
                <label
                  htmlFor="facultyIncharge"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Name of the Faculty Incharge
                </label>
                <input
                  type="text"
                  name="facultyIncharge"
                  id="facultyIncharge"
                  value={formData.facultyIncharge}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Faculty Incharge Name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="typeOfCOE"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Type of COE
                </label>
                <select
                  name="typeOfCOE"
                  id="typeOfCOE"
                  value={formData.typeOfCOE}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                >
                  {TYPE_OF_COE_OPTIONS.map((option) => (
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
                  htmlFor="domain"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Domain of the Centre
                </label>
                <input
                  type="text"
                  name="domain"
                  id="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Domain"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="collaborativeIndustry1"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Name of the Collaborative Industry 1
                </label>
                <input
                  type="text"
                  name="collaborativeIndustry1"
                  id="collaborativeIndustry1"
                  value={formData.collaborativeIndustry1}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Industry Name"
                />
              </div>
              <div>
                <label
                  htmlFor="collaborativeIndustry2"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Name of the Collaborative Industry 2
                </label>
                <input
                  type="text"
                  name="collaborativeIndustry2"
                  id="collaborativeIndustry2"
                  value={formData.collaborativeIndustry2}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Industry Name"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="areaInSqm"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Area in Sq.m
              </label>
              <input
                type="number"
                name="areaInSqm"
                id="areaInSqm"
                value={formData.areaInSqm}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter Area"
              />
            </div>

            <h3 className="text-lg font-medium text-slate-900 border-b pb-2">
              MoU & IRP Relations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="isMoUPart"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Is the centre established as part of the MoU?
                </label>
                <select
                  name="isMoUPart"
                  id="isMoUPart"
                  value={formData.isMoUPart}
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
              {formData.isMoUPart === "yes" && (
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
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="isIRPResult"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Is the establishment a result of the IRP visit?
                </label>
                <select
                  name="isIRPResult"
                  id="isIRPResult"
                  value={formData.isIRPResult}
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
              {formData.isIRPResult === "yes" && (
                <div>
                  <label
                    htmlFor="irpVisits"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    IRP Visits
                  </label>
                  <input
                    type="text"
                    name="irpVisits"
                    id="irpVisits"
                    value={formData.irpVisits}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter IRP Visit Details"
                  />
                </div>
              )}
            </div>

            <h3 className="text-lg font-medium text-slate-900 border-b pb-2">
              Financial & Stock Information
            </h3>

            <div>
              <label
                htmlFor="stockRegisterMaintained"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Stock Register Maintained
              </label>
              <select
                name="stockRegisterMaintained"
                id="stockRegisterMaintained"
                value={formData.stockRegisterMaintained}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="totalAmountIncurred"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Total Amount Incurred (in Rs.)
                </label>
                <input
                  type="number"
                  name="totalAmountIncurred"
                  id="totalAmountIncurred"
                  value={formData.totalAmountIncurred}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Amount"
                />
              </div>
              <div>
                <label
                  htmlFor="bitContribution"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  BIT Contribution (in Rs.)
                </label>
                <input
                  type="number"
                  name="bitContribution"
                  id="bitContribution"
                  value={formData.bitContribution}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Amount"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="industryContributionWithGST"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Industry Contribution with GST (in Rs.)
                </label>
                <input
                  type="number"
                  name="industryContributionWithGST"
                  id="industryContributionWithGST"
                  value={formData.industryContributionWithGST}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Amount"
                />
              </div>
              <div>
                <label
                  htmlFor="industryContributionWithoutGST"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Industry Contribution without GST (in Rs.)
                </label>
                <input
                  type="number"
                  name="industryContributionWithoutGST"
                  id="industryContributionWithoutGST"
                  value={formData.industryContributionWithoutGST}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Amount"
                />
              </div>
            </div>

            <h3 className="text-lg font-medium text-slate-900 border-b pb-2">
              Academic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="studentsPerBatch"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  No. of students accommodated for a single batch
                </label>
                <input
                  type="number"
                  name="studentsPerBatch"
                  id="studentsPerBatch"
                  value={formData.studentsPerBatch}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Number"
                />
              </div>
              <div>
                <label
                  htmlFor="academicCourse"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Academic Course
                </label>
                <input
                  type="text"
                  name="academicCourse"
                  id="academicCourse"
                  value={formData.academicCourse}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Course Name"
                />
              </div>
            </div>

            <h3 className="text-lg font-medium text-slate-900 border-b pb-2">
              Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FileInput
                fieldName="syllabusDocument"
                label="Upload the Syllabus"
                formData={formData}
                errors={errors}
                dragActiveStates={dragActiveStates}
                onFileChange={handleFileChange}
                onClearFile={clearFile}
                onDrag={handleDrag}
                onDrop={handleDrop}
              />
              <FileInput
                fieldName="labPhoto"
                label="Lab Photo"
                formData={formData}
                errors={errors}
                dragActiveStates={dragActiveStates}
                onFileChange={handleFileChange}
                onClearFile={clearFile}
                onDrag={handleDrag}
                onDrop={handleDrop}
              />
              <FileInput
                fieldName="communicationProof"
                label="Upload Communication Proof"
                formData={formData}
                errors={errors}
                dragActiveStates={dragActiveStates}
                onFileChange={handleFileChange}
                onClearFile={clearFile}
                onDrag={handleDrag}
                onDrop={handleDrop}
              />
              <FileInput
                fieldName="apexDocument"
                label="Upload Apex Document"
                formData={formData}
                errors={errors}
                dragActiveStates={dragActiveStates}
                onFileChange={handleFileChange}
                onClearFile={clearFile}
                onDrag={handleDrag}
                onDrop={handleDrop}
              />
              <FileInput
                fieldName="facilitiesReport"
                label="Report of Facilities Available"
                formData={formData}
                errors={errors}
                dragActiveStates={dragActiveStates}
                onFileChange={handleFileChange}
                onClearFile={clearFile}
                onDrag={handleDrag}
                onDrop={handleDrop}
              />
              <FileInput
                fieldName="utilizationReport"
                label="Report of Lab Utilization"
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
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
              >
                {OWI_VERIFICATION_OPTIONS.map((option) => (
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
                {isSubmitting ? "Saving..." : "Save COE Details"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
