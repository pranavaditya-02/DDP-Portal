"use client";

import {
  useState,
  useCallback,
  useEffect,
  ChangeEvent,
  FormEvent,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  FileText,
  X,
  Check,
  Building2,
  Calendar,
  Users,
  ArrowRight,
  Contact,
  LucideIcon,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const PROGRAMMES = [
  { value: "", label: "Select Programme" },
  { value: "UG", label: "UG (Undergraduate)" },
  { value: "PG", label: "PG (Postgraduate)" },
] as const;

const INDUSTRY_TYPES = [
  { value: "", label: "Select Type" },
  { value: "MNC", label: "MNC" },
  { value: "Large Scale", label: "Large Scale" },
  { value: "MSME", label: "MSME" },
  { value: "Small Scale", label: "Small Scale" },
  { value: "Others", label: "Others" },
] as const;

const YEAR_OF_STUDY = [
  { value: "", label: "Select Year" },
  { value: "First", label: "First Year" },
  { value: "Second", label: "Second Year" },
  { value: "Third", label: "Third Year" },
  { value: "Fourth", label: "Fourth Year" },
] as const;

const SOURCES = [
  { value: "", label: "Select Source" },
  { value: "Self", label: "Self" },
  { value: "Department", label: "Department" },
  { value: "Special Lab", label: "Special Lab" },
  { value: "Institute", label: "Institute" },
] as const;

const OWI_STATUS = [
  { value: "", label: "Select Status" },
  { value: "Initiated", label: "Initiated" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
] as const;

type FormData = {
  faculty: string;
  sigNumber: string;
  taskId: string;
  programme: string;
  industryName: string;
  domainArea: string;
  industryType: string;
  industryTypeOther: string;
  industryLocation: string;
  industryWebsite: string;
  contactPersonName: string;
  contactPersonDesignation: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  visitStartDate: string;
  visitEndDate: string;
  yearOfStudy: string;
  numberOfStudents: string;
  maleStudents: string;
  femaleStudents: string;
  purposeOfVisit: string;
  faculty2Status: string;
  faculty3Status: string;
  faculty1: string;
  faculty2: string;
  faculty3: string;
  sourceOfArrangement: string;
  curriculumMapping: string;
  outcomeOfVisit: string;
  owiVerification: string;
  proofDocument: File[];
};

type FormErrors = Partial<Record<keyof FormData, string>>;

type StepProps = {
  formData: FormData;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  handleFileSelect?: (name: "proofDocument", files: File[]) => void;
  errors: FormErrors;
  faculty2Selected?: boolean;
  setFaculty2Selected?: (v: boolean) => void;
  faculty3Selected?: boolean;
  setFaculty3Selected?: (v: boolean) => void;
};

const RequiredAst = () => <span className="text-red-500 ml-1">*</span>;

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6 border-b border-slate-100 pb-2">
      <div className="flex items-center text-primary-600 mb-1">
        {Icon ? <Icon size={20} className="mr-2 text-indigo-600" /> : null}
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      </div>
      {subtitle ? (
        <p className="text-sm text-slate-500 ml-7">{subtitle}</p>
      ) : null}
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  error,
  disabled,
}: {
  label: string;
  name: keyof FormData;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required ? <RequiredAst /> : null}
      </label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border ${error ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors ${
          disabled
            ? "bg-slate-100 text-slate-500 cursor-not-allowed"
            : "bg-white"
        }`}
      />
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  required,
  error,
  disabled,
}: {
  label: string;
  name: keyof FormData;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required ? <RequiredAst /> : null}
      </label>
      <textarea
        name={name}
        value={value || ""}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 border ${error ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors bg-white`}
      />
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required,
  error,
  disabled,
}: {
  label: string;
  name: keyof FormData;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required ? <RequiredAst /> : null}
      </label>
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2 h-10 border ${error ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white transition-colors ${
          disabled ? "bg-slate-100 text-slate-500 cursor-not-allowed" : ""
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value || opt.label} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function FileUpload({
  label,
  name,
  files,
  onFilesSelect,
  error,
  required,
  disabled,
}: {
  label: string;
  name: "proofDocument";
  files: File[];
  onFilesSelect: (name: "proofDocument", files: File[]) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  const fileInputRef = useState<HTMLInputElement | null>(null)[0];
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelect(name, Array.from(e.target.files));
    }
  };

  const clearFile = (index?: number) => {
    if (typeof index === "number" && files.length > 0) {
      const newFiles = [...files];
      newFiles.splice(index, 1);
      onFilesSelect(name, newFiles);
    } else {
      onFilesSelect(name, []);
    }
    if (inputRef) inputRef.value = "";
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required ? <RequiredAst /> : null}
      </label>
      <div
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors bg-white ${disabled ? "bg-slate-50 cursor-not-allowed opacity-60" : "hover:border-indigo-500 cursor-pointer border-slate-300"}`}
      >
        <div className="space-y-1 text-center">
          <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
          <div className="flex text-sm text-slate-600 justify-center">
            <label
              className={`relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none ${disabled ? "cursor-not-allowed" : ""}`}
            >
              <span>Upload files</span>
              <input
                ref={(el) => setInputRef(el)}
                type="file"
                name={name}
                className="sr-only"
                onChange={handleFileChange}
                multiple
                disabled={disabled}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-slate-500">
            ex : PDF, PNG, JPG up to 10MB
          </p>
        </div>
      </div>
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

function FacultyCard({
  label,
  name,
  value,
  onChange,
  isSelected,
  onToggle,
  placeholder,
  error,
  disabled,
}: {
  label: string;
  name: "faculty2" | "faculty3";
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isSelected: boolean;
  onToggle: () => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <div
        onClick={!disabled ? onToggle : undefined}
        className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
          disabled
            ? "border-slate-200 bg-slate-50 cursor-not-allowed opacity-60"
            : isSelected
              ? "border-indigo-500 bg-indigo-50 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-sm font-medium ${disabled ? "text-slate-400" : isSelected ? "text-indigo-700" : "text-slate-600"}`}
          >
            {isSelected
              ? "✓ Selected - Enter Faculty Name"
              : "Click to Select Faculty"}
          </span>
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              disabled
                ? "border-slate-300"
                : isSelected
                  ? "border-indigo-500 bg-indigo-500"
                  : "border-slate-300"
            }`}
          >
            {isSelected && !disabled ? (
              <Check size={12} className="text-white" />
            ) : null}
          </div>
        </div>
        <input
          type="text"
          name={name}
          value={value || ""}
          onChange={onChange}
          onClick={(e) => e.stopPropagation()}
          disabled={disabled || !isSelected}
          placeholder={placeholder || "Enter faculty name"}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors ${
            disabled || !isSelected
              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
              : "bg-white text-slate-900 border-slate-300"
          }`}
        />
      </div>
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function Step1_IndustryDetails({ formData, handleChange, errors }: StepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionTitle
        icon={Building2}
        title="Industry & Organization Details"
        subtitle="Details about the organization for the visit."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Name of the Industry"
          name="industryName"
          value={formData.industryName}
          onChange={handleChange as (e: ChangeEvent<HTMLInputElement>) => void}
          required
          error={errors.industryName}
          placeholder="Enter Industry Name"
        />
        <div>
          <SelectField
            label="Type of Industry"
            name="industryType"
            value={formData.industryType}
            onChange={
              handleChange as (e: ChangeEvent<HTMLSelectElement>) => void
            }
            options={INDUSTRY_TYPES}
            required
            error={errors.industryType}
          />
          {formData.industryType === "Others" ? (
            <div className="animate-fadeIn">
              <InputField
                label="Please Specify"
                name="industryTypeOther"
                value={formData.industryTypeOther}
                onChange={
                  handleChange as (e: ChangeEvent<HTMLInputElement>) => void
                }
                required={formData.industryType === "Others"}
                error={errors.industryTypeOther}
                placeholder="Specify industry type"
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Domain Area of the Industry"
          name="domainArea"
          value={formData.domainArea}
          onChange={handleChange as (e: ChangeEvent<HTMLInputElement>) => void}
          required
          error={errors.domainArea}
          placeholder="e.g., AI/ML, Finance"
        />
        <InputField
          label="Industry Website"
          name="industryWebsite"
          value={formData.industryWebsite}
          onChange={handleChange as (e: ChangeEvent<HTMLInputElement>) => void}
          placeholder="https://www.example.com"
        />
      </div>

      <TextAreaField
        label="Location"
        name="industryLocation"
        value={formData.industryLocation}
        onChange={handleChange as (e: ChangeEvent<HTMLTextAreaElement>) => void}
        required
        error={errors.industryLocation}
        placeholder="Full address of the industry"
        rows={3}
      />

      <div className="border-t border-slate-100 pt-6 mt-6">
        <SectionTitle
          icon={Contact}
          title="Industry Contact Person"
          subtitle="Primary contact at the organization."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Name of the Contact Person"
            name="contactPersonName"
            value={formData.contactPersonName}
            onChange={
              handleChange as (e: ChangeEvent<HTMLInputElement>) => void
            }
            required
            error={errors.contactPersonName}
            placeholder="Contact Person Name"
          />
          <InputField
            label="Designation"
            name="contactPersonDesignation"
            value={formData.contactPersonDesignation}
            onChange={
              handleChange as (e: ChangeEvent<HTMLInputElement>) => void
            }
            required
            error={errors.contactPersonDesignation}
            placeholder="Job Title"
          />
          <InputField
            label="E-mail ID"
            name="contactPersonEmail"
            value={formData.contactPersonEmail}
            onChange={
              handleChange as (e: ChangeEvent<HTMLInputElement>) => void
            }
            type="email"
            required
            error={errors.contactPersonEmail}
            placeholder="email@company.com"
          />
          <InputField
            label="Phone Number"
            name="contactPersonPhone"
            value={formData.contactPersonPhone}
            onChange={
              handleChange as (e: ChangeEvent<HTMLInputElement>) => void
            }
            required
            error={errors.contactPersonPhone}
            placeholder="10-digit Phone Number"
          />
        </div>
      </div>
    </div>
  );
}

function Step2_VisitDetails({
  formData,
  handleChange,
  handleFileSelect,
  errors,
  faculty2Selected,
  setFaculty2Selected,
  faculty3Selected,
  setFaculty3Selected,
}: StepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionTitle
        icon={Calendar}
        title="Visit Information"
        subtitle="Dates and academic details."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Start Date"
          name="visitStartDate"
          value={formData.visitStartDate}
          onChange={handleChange as (e: ChangeEvent<HTMLInputElement>) => void}
          type="date"
          required
          error={errors.visitStartDate}
        />
        <InputField
          label="End Date"
          name="visitEndDate"
          value={formData.visitEndDate}
          onChange={handleChange as (e: ChangeEvent<HTMLInputElement>) => void}
          type="date"
          required
          error={errors.visitEndDate}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <SelectField
          label="Programme"
          name="programme"
          value={formData.programme}
          onChange={handleChange as (e: ChangeEvent<HTMLSelectElement>) => void}
          options={PROGRAMMES}
          required
          error={errors.programme}
        />
        <SelectField
          label="Year of Study"
          name="yearOfStudy"
          value={formData.yearOfStudy}
          onChange={handleChange as (e: ChangeEvent<HTMLSelectElement>) => void}
          options={YEAR_OF_STUDY}
          required
          error={errors.yearOfStudy}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <InputField
          label="Number of Students Visited"
          name="numberOfStudents"
          value={formData.numberOfStudents}
          onChange={handleChange as (e: ChangeEvent<HTMLInputElement>) => void}
          type="number"
          required
          error={errors.numberOfStudents}
          placeholder="Total"
        />
        <InputField
          label="No. of Male students"
          name="maleStudents"
          value={formData.maleStudents}
          onChange={handleChange as (e: ChangeEvent<HTMLInputElement>) => void}
          type="number"
          placeholder="Male count"
        />
        <InputField
          label="No. of Female students"
          name="femaleStudents"
          value={formData.femaleStudents}
          onChange={handleChange as (e: ChangeEvent<HTMLInputElement>) => void}
          type="number"
          placeholder="Female count"
        />
      </div>

      <TextAreaField
        label="Purpose of Visit"
        name="purposeOfVisit"
        value={formData.purposeOfVisit}
        onChange={handleChange as (e: ChangeEvent<HTMLTextAreaElement>) => void}
        required
        error={errors.purposeOfVisit}
        rows={3}
        placeholder="Objective of the industrial visit"
      />

      <div className="border-t border-slate-100 pt-6 mt-6">
        <SectionTitle
          icon={Users}
          title="Faculty Co-ordinators"
          subtitle="Faculty members involved in the visit."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Faculty 1"
            name="faculty1"
            value={formData.faculty1}
            onChange={
              handleChange as (e: ChangeEvent<HTMLInputElement>) => void
            }
            required
            error={errors.faculty1}
            placeholder="Enter name"
          />

          <FacultyCard
            label="Faculty 2"
            name="faculty2"
            value={formData.faculty2}
            onChange={
              handleChange as (e: ChangeEvent<HTMLInputElement>) => void
            }
            isSelected={Boolean(faculty2Selected)}
            onToggle={() => setFaculty2Selected?.(!faculty2Selected)}
            placeholder="Enter faculty 2 name"
            error={errors.faculty2}
          />

          <FacultyCard
            label="Faculty 3"
            name="faculty3"
            value={formData.faculty3}
            onChange={
              handleChange as (e: ChangeEvent<HTMLInputElement>) => void
            }
            isSelected={Boolean(faculty3Selected)}
            onToggle={() => setFaculty3Selected?.(!faculty3Selected)}
            placeholder="Enter faculty 3 name"
            error={errors.faculty3}
            disabled={!faculty2Selected}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Source of Arrangement"
          name="sourceOfArrangement"
          value={formData.sourceOfArrangement}
          onChange={handleChange as (e: ChangeEvent<HTMLSelectElement>) => void}
          options={SOURCES}
          required
          error={errors.sourceOfArrangement}
        />
      </div>

      <TextAreaField
        label="Curriculum Mapping"
        name="curriculumMapping"
        value={formData.curriculumMapping}
        onChange={handleChange as (e: ChangeEvent<HTMLTextAreaElement>) => void}
        placeholder="Mention course code & Name (e.g., 21CSE301 - Machine Learning)"
      />
      <TextAreaField
        label="Outcome of the visit"
        name="outcomeOfVisit"
        value={formData.outcomeOfVisit}
        onChange={handleChange as (e: ChangeEvent<HTMLTextAreaElement>) => void}
        required
        error={errors.outcomeOfVisit}
        placeholder="Describe the outcomes"
      />

      <FileUpload
        label="Proof (IV Approval Letter / Approval from Institute / IV Report / Student feedback)"
        name="proofDocument"
        files={formData.proofDocument}
        onFilesSelect={handleFileSelect!}
        required
        error={errors.proofDocument}
      />
      <SelectField
        label="OWI Verification"
        name="owiVerification"
        value={formData.owiVerification}
        onChange={handleChange as (e: ChangeEvent<HTMLSelectElement>) => void}
        options={OWI_STATUS}
        required
        error={errors.owiVerification}
      />
    </div>
  );
}

const STEPS = [
  {
    title: "Industry Details",
    component: Step1_IndustryDetails,
    icon: Building2,
  },
  { title: "Visit Details", component: Step2_VisitDetails, icon: Calendar },
] as const;

export default function StudentsIndustrialVisitSubmitPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [faculty2Selected, setFaculty2Selected] = useState(false);
  const [faculty3Selected, setFaculty3Selected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    faculty: "",
    sigNumber: "",
    taskId: "",
    programme: "",
    industryName: "",
    domainArea: "",
    industryType: "",
    industryTypeOther: "",
    industryLocation: "",
    industryWebsite: "",
    contactPersonName: "",
    contactPersonDesignation: "",
    contactPersonEmail: "",
    contactPersonPhone: "",
    visitStartDate: "",
    visitEndDate: "",
    yearOfStudy: "",
    numberOfStudents: "",
    maleStudents: "",
    femaleStudents: "",
    purposeOfVisit: "",
    faculty2Status: "",
    faculty3Status: "",
    faculty1: "",
    faculty2: "",
    faculty3: "",
    sourceOfArrangement: "",
    curriculumMapping: "",
    outcomeOfVisit: "",
    owiVerification: "",
    proofDocument: [],
  });

  useEffect(() => {
    if (user?.name) {
      setFormData((prev) => ({ ...prev, faculty: user.name }));
    }
  }, [user?.name]);

  const handleChange = useCallback(
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors],
  );

  const handleFileSelect = useCallback(
    (name: "proofDocument", files: File[]) => {
      setFormData((prev) => ({ ...prev, [name]: files }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [errors],
  );

  const validateStep = (stepIndex: number) => {
    const nextErrors: FormErrors = {};
    const d = formData;

    if (stepIndex === 0) {
      if (!d.industryName) nextErrors.industryName = "Required";
      if (!d.industryType) nextErrors.industryType = "Required";
      if (d.industryType === "Others" && !d.industryTypeOther)
        nextErrors.industryTypeOther = "Required";
      if (!d.domainArea) nextErrors.domainArea = "Required";
      if (!d.industryLocation) nextErrors.industryLocation = "Required";
      if (!d.contactPersonName) nextErrors.contactPersonName = "Required";
      if (!d.contactPersonDesignation)
        nextErrors.contactPersonDesignation = "Required";
      if (!d.contactPersonEmail) nextErrors.contactPersonEmail = "Required";
      if (!d.contactPersonPhone) nextErrors.contactPersonPhone = "Required";
    }

    if (stepIndex === 1) {
      if (!d.visitStartDate) nextErrors.visitStartDate = "Required";
      if (!d.visitEndDate) nextErrors.visitEndDate = "Required";
      if (!d.programme) nextErrors.programme = "Required";
      if (!d.yearOfStudy) nextErrors.yearOfStudy = "Required";
      if (!d.numberOfStudents) nextErrors.numberOfStudents = "Required";
      if (!d.purposeOfVisit) nextErrors.purposeOfVisit = "Required";
      if (!d.faculty1) nextErrors.faculty1 = "Required";
      if (!d.sourceOfArrangement) nextErrors.sourceOfArrangement = "Required";
      if (!d.outcomeOfVisit) nextErrors.outcomeOfVisit = "Required";
      if (!d.owiVerification) nextErrors.owiVerification = "Required";
      if (!d.proofDocument || d.proofDocument.length === 0)
        nextErrors.proofDocument = "Proof document is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      if (!API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured");
      }

      const submitData = new FormData();
      (Object.keys(formData) as Array<keyof FormData>).forEach((key) => {
        if (key !== "proofDocument") {
          submitData.append(key, formData[key] as string);
        }
      });

      if (formData.proofDocument && formData.proofDocument.length > 0) {
        formData.proofDocument.forEach((file) => {
          submitData.append("proofDocument", file);
        });
      }

      const response = await fetch(
        `${API_URL}/api/owi/studentsIndustrialVisit`,
        {
          method: "POST",
          body: submitData,
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.details || "Unknown error",
        );
      }

      alert("Students Industrial Visit submitted successfully!");
      router.push("/faculty/outside-world/students-industrial-visit");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to submit form: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = STEPS[currentStep].component;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full hover:bg-slate-200 text-slate-600 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Students Industrial Visit
            </h1>
            <p className="text-sm text-slate-500">
              Add details for the industrial visit.
            </p>
          </div>
        </div>

        <div className="mb-8 hidden md:block">
          <div className="flex items-center justify-center relative px-2">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10" />
            {STEPS.map((step, idx) => {
              const isCompleted = idx < currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div
                  key={step.title}
                  className="flex flex-col items-center bg-slate-50 px-32"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-200 ${
                      isCompleted
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : isCurrent
                          ? "bg-white border-indigo-600 text-indigo-600"
                          : "bg-white border-slate-300 text-slate-300"
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={20} />
                    ) : (
                      <step.icon size={20} />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium mt-2 ${isCurrent ? "text-indigo-600" : "text-slate-500"}`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="md:hidden mb-6 bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
          <span className="font-medium text-slate-900">
            {STEPS[currentStep].title}
          </span>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
            Step {currentStep + 1} of {STEPS.length}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 min-h-[400px]">
            <CurrentStepComponent
              formData={formData}
              handleChange={handleChange}
              handleFileSelect={handleFileSelect}
              errors={errors}
              faculty2Selected={faculty2Selected}
              setFaculty2Selected={setFaculty2Selected}
              faculty3Selected={faculty3Selected}
              setFaculty3Selected={setFaculty3Selected}
            />
          </form>

          <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-t border-slate-100">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0 || isSubmitting}
              className={`px-6 py-2 rounded-lg border text-sm font-medium transition-colors ${
                currentStep === 0
                  ? "border-slate-200 text-slate-300 cursor-not-allowed"
                  : "border-slate-300 text-slate-700 hover:bg-white hover:shadow-sm"
              }`}
            >
              Back
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-6 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors flex items-center disabled:opacity-50"
              >
                Next <ArrowRight size={16} className="ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isSubmitting}
                className="px-6 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 shadow-sm transition-colors flex items-center disabled:opacity-50"
              >
                <Save size={18} className="mr-2" />{" "}
                {isSubmitting ? "Submitting..." : "Submit Record"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
