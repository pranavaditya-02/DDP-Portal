"use client";

import { useState, useCallback, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  FileText,
  X,
  Check,
  CheckCircle,
  User,
  Users,
  Calendar,
  DollarSign,
  Briefcase,
  Layout,
} from "lucide-react";
import { buildFormData, submitAchievement } from "../../facultyActivitiesApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES = [
  { value: "", label: "Choose an option" },
  { value: "Convener", label: "Convener" },
  { value: "Co-Convener", label: "Co-Convener" },
  { value: "Co-ordinator", label: "Co-ordinator" },
  { value: "Organizing Secretary", label: "Organizing Secretary" },
];

const YES_NO = [
  { value: "", label: "Choose an option" },
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const YES_NA = [
  { value: "", label: "Choose an option" },
  { value: "Yes", label: "Yes" },
  { value: "NA", label: "NA" },
];

const PROGRAM_TYPES = [
  { value: "", label: "Choose an option" },
  { value: "Academic", label: "Academic" },
  { value: "Non Academic", label: "Non Academic" },
];

const EVENT_TYPES = [
  { value: "", label: "Choose an option" },
  { value: "HRD Programs", label: "HRD Programs" },
  { value: "Certificate course", label: "Certificate course" },
  { value: "Partial Delivery of Course", label: "Partial Delivery of Course" },
  {
    value: "Competitions for BIT students",
    label: "Competitions for BIT students",
  },
  { value: "Conference", label: "Conference" },
  { value: "Faculty training Program", label: "Faculty training Program" },
  { value: "FDP/STTP", label: "FDP/STTP" },
  { value: "Guest Lecture", label: "Guest Lecture" },
  { value: "Hands on training", label: "Hands on training" },
  { value: "Leader of the Week", label: "Leader of the Week" },
  { value: "Non Technical Event", label: "Non Technical Event" },
  { value: "One credit course", label: "One credit course" },
  { value: "Orientation program", label: "Orientation program" },
  { value: "Refresher Program", label: "Refresher Program" },
  { value: "Seminar", label: "Seminar" },
  { value: "Technical Events", label: "Technical Events" },
  { value: "Webinar", label: "Webinar" },
  { value: "Workshop", label: "Workshop" },
  {
    value: "Non-Teaching training programme",
    label: "Non-Teaching training programme",
  },
  { value: "Symposium", label: "Symposium" },
  { value: "Interaction", label: "Interaction" },
  { value: "Others", label: "Others" },
];

const EVENT_CATEGORIES = [
  { value: "", label: "Choose an option" },
  {
    value: "Awareness of trends in Technology",
    label: "Awareness of trends in Technology",
  },
  { value: "IRP", label: "IRP" },
  { value: "Research Methodology", label: "Research Methodology" },
  { value: "Entrepreneurship", label: "Entrepreneurship" },
  { value: "Placement", label: "Placement" },
  {
    value: "Technical skill Development",
    label: "Technical skill Development",
  },
  { value: "Life Skill", label: "Life Skill" },
  { value: "Soft Skill", label: "Soft Skill" },
  { value: "Communication Skill", label: "Communication Skill" },
];

const EVENT_MODES = [
  { value: "", label: "Choose an option" },
  { value: "Offline", label: "Offline" },
  { value: "Online", label: "Online" },
  { value: "Hybrid", label: "Hybrid" },
];

const EVENT_LEVELS = [
  { value: "", label: "Choose an option" },
  { value: "International", label: "International" },
  { value: "National", label: "National" },
  { value: "State", label: "State" },
  { value: "Institute (BIT)", label: "Institute (BIT)" },
];

const JOINTLY_ORGANIZED_OPTIONS = [
  { value: "", label: "Choose an option" },
  { value: "Foreign Institute", label: "Foreign Institute" },
  { value: "Industry", label: "Industry" },
  { value: "Other institute in India", label: "Other institute in India" },
  {
    value: "Professional bodies/Technical Society",
    label: "Professional bodies/Technical Society",
  },
  { value: "None", label: "None" },
];

const GUEST_SPEAKER_TYPE = [
  { value: "", label: "Choose an option" },
  { value: "Academic", label: "Academic" },
  { value: "Industry", label: "Industry" },
];

const INSTITUTION_TYPES = [
  { value: "", label: "Choose an option" },
  { value: "International", label: "International" },
  {
    value: "National (Within TamilNadu)",
    label: "National (Within TamilNadu)",
  },
  {
    value: "National (Outside TamilNadu)",
    label: "National (Outside TamilNadu)",
  },
];

const TECH_SOCIETIES = [
  { value: "", label: "Click to choose" },
  {
    value: "IEEE OCEANIC ENGINEERING SOCIETY (OES)",
    label: "IEEE OCEANIC ENGINEERING SOCIETY (OES)",
  },
  { value: "ISHRAE", label: "ISHRAE" },
  {
    value: "IAENG SOCIETY OF INTERNET COMPUTING AND WEB SERVICES",
    label: "IAENG SOCIETY OF INTERNET COMPUTING AND WEB SERVICES",
  },
  { value: "CODE CHEF BIT", label: "CODE CHEF BIT" },
  {
    value: "INTERNATIONAL ASSOCIATION OF ENGINEERS",
    label: "INTERNATIONAL ASSOCIATION OF ENGINEERS",
  },
  {
    value: "INTERNATIONAL ASSOCIATION OF ENGINEERS (IAENG)",
    label: "INTERNATIONAL ASSOCIATION OF ENGINEERS (IAENG)",
  },
  {
    value: "INTERNATIONAL ASSOCIATION OF ENGINEERS - AIML",
    label: "INTERNATIONAL ASSOCIATION OF ENGINEERS - AIML",
  },
  {
    value: "SYSTEM SOCIETY OF INDIA (SSI)",
    label: "SYSTEM SOCIETY OF INDIA (SSI)",
  },
  { value: "ANALYTICAL VIDHYA", label: "ANALYTICAL VIDHYA" },
  { value: "BVERSITY INDIA", label: "BVERSITY INDIA" },
  {
    value: "BIOTECH RESEARCH SOCIETY OF INDIA",
    label: "BIOTECH RESEARCH SOCIETY OF INDIA",
  },
  {
    value: "ASSOCIATION OF FOOD SCIENTISTS & TECHNOLOGISTS (INDIA)",
    label: "ASSOCIATION OF FOOD SCIENTISTS & TECHNOLOGISTS (INDIA)",
  },
  {
    value: "AMERICAL SOCIETY OF CIVIL ENGINEERS",
    label: "AMERICAL SOCIETY OF CIVIL ENGINEERS",
  },
  {
    value: "COMPUTER SCIENCE TEACHERS ASSOCIATION",
    label: "COMPUTER SCIENCE TEACHERS ASSOCIATION",
  },
  {
    value:
      "THE INDIAN SOCIETY OF HEATING, REFRIGERATING AND AIR CONDITIONING ENGINEERS",
    label:
      "THE INDIAN SOCIETY OF HEATING, REFRIGERATING AND AIR CONDITIONING ENGINEERS",
  },
  {
    value: "SOCIETY OF AUTOMOBILE ENGINEERING INDIA",
    label: "SOCIETY OF AUTOMOBILE ENGINEERING INDIA",
  },
  { value: "BVERSITY", label: "BVERSITY" },
  { value: "IAENG", label: "IAENG" },
  {
    value: "TEXTILE ASSOCIATION OF INDIA (TAI) - TXT",
    label: "TEXTILE ASSOCIATION OF INDIA (TAI) - TXT",
  },
  {
    value: "THE INSTITUTION OF ENGINEERS (INDIA) (IE(I)) - TXT",
    label: "THE INSTITUTION OF ENGINEERS (INDIA) (IE(I)) - TXT",
  },
  {
    value: "INTERNATIONAL SOCIETY OF AUTOMATION (ISA)",
    label: "INTERNATIONAL SOCIETY OF AUTOMATION (ISA)",
  },
  {
    value: "ROBOTIC SOCIETY OF INDIA (RSI)",
    label: "ROBOTIC SOCIETY OF INDIA (RSI)",
  },
  {
    value: "INDIAN WELDING SOCIETY (IWS)",
    label: "INDIAN WELDING SOCIETY (IWS)",
  },
  {
    value: "MARINE TECHNOLOGY SOCIETY (MTS)",
    label: "MARINE TECHNOLOGY SOCIETY (MTS)",
  },
  {
    value: "INTERNATIONAL ASSOCIATION OF ENGINEERS (IAENG) - IT",
    label: "INTERNATIONAL ASSOCIATION OF ENGINEERS (IAENG) - IT",
  },
  {
    value: "INSTITUTE FOR ENGINEERING RESEARCH AND PUBLICATION (IFERP) - IT",
    label: "INSTITUTE FOR ENGINEERING RESEARCH AND PUBLICATION (IFERP) - IT",
  },
  { value: "HACKEREARTH CHAPTER", label: "HACKEREARTH CHAPTER" },
  {
    value: "INTERNATIONAL ASSOCIATION OF ENGINEERS (IAENG) - ISE",
    label: "INTERNATIONAL ASSOCIATION OF ENGINEERS (IAENG) - ISE",
  },
  {
    value: "TEXTILE ASSOCIATION OF INDIA (TAI) - FT",
    label: "TEXTILE ASSOCIATION OF INDIA (TAI) - FT",
  },
  {
    value: "THE INSTITUTION OF ENGINEERS (INDIA) (IE(I)) - FT",
    label: "THE INSTITUTION OF ENGINEERS (INDIA) (IE(I)) - FT",
  },
  {
    value: "UNIVERSAL SOCIETY OF FOOD AND NUTRITION (USFN)",
    label: "UNIVERSAL SOCIETY OF FOOD AND NUTRITION (USFN)",
  },
  {
    value:
      "ASSOCIATION OF FOOD SCIENTISTS AND TECHNOLOGISTS INDIA (AFSTI) - FD",
    label:
      "ASSOCIATION OF FOOD SCIENTISTS AND TECHNOLOGISTS INDIA (AFSTI) - FD",
  },
  {
    value: "AUTOMATIC CONTROL & DYNAMIC OPTIMIZATION SOCIETY (ACDOS)",
    label: "AUTOMATIC CONTROL & DYNAMIC OPTIMIZATION SOCIETY (ACDOS)",
  },
  {
    value: "INTERNATIONAL ASSOCIATION OF ENGINEERS (IAENG) - EIE",
    label: "INTERNATIONAL ASSOCIATION OF ENGINEERS (IAENG) - EIE",
  },
  {
    value: "IEEE WOMEN IN ENGINEERING (IEEE_WIE)",
    label: "IEEE WOMEN IN ENGINEERING (IEEE_WIE)",
  },
  {
    value: "IEEE STUDENT BRANCH (IEEE_SB)",
    label: "IEEE STUDENT BRANCH (IEEE_SB)",
  },
  { value: "IETE STUDENTS FORUM (ISF)", label: "IETE STUDENTS FORUM (ISF)" },
  {
    value: "IEEE INDUSTRIAL ELECTRONIC SOCIETY (IEEE_IES)",
    label: "IEEE INDUSTRIAL ELECTRONIC SOCIETY (IEEE_IES)",
  },
  {
    value: "INDIAN SOCIETY OF SYSTEMS FOR SCIENCES AND ENGINEERING (ISSSE)",
    label: "INDIAN SOCIETY OF SYSTEMS FOR SCIENCES AND ENGINEERING (ISSSE)",
  },
  {
    value: "IACSIT SOFTWARE ENGINEERING SOCIETY",
    label: "IACSIT SOFTWARE ENGINEERING SOCIETY",
  },
  {
    value: "COMPUTER SOCIETY OF INDIA (CSI)",
    label: "COMPUTER SOCIETY OF INDIA (CSI)",
  },
  {
    value: "SYSTEMS SOCIETY OF INDIA (SSI)",
    label: "SYSTEMS SOCIETY OF INDIA (SSI)",
  },
  { value: "CODECHEF BIT CHAPTER", label: "CODECHEF BIT CHAPTER" },
  {
    value: "COMPUTER SCIENCE TEACHER ASSOCIATION (CSTA)",
    label: "COMPUTER SCIENCE TEACHER ASSOCIATION (CSTA)",
  },
  {
    value: "INDIAN CONCRETE INSTITUTE (ICI)",
    label: "INDIAN CONCRETE INSTITUTE (ICI)",
  },
  { value: "IGS COIMBATORE CHAPTER", label: "IGS COIMBATORE CHAPTER" },
  {
    value: "AMERICAN SOCIETY OF CIVIL ENGINEERS (ASCE)",
    label: "AMERICAN SOCIETY OF CIVIL ENGINEERS (ASCE)",
  },
  {
    value: "THE BIOTECH RESEARCH SOCIETY, INDIA (BRSI)",
    label: "THE BIOTECH RESEARCH SOCIETY, INDIA (BRSI)",
  },
  {
    value: "INSTITUTE FOR ENGINEERING RESEARCH AND PUBLICATION (IFERP) - BT",
    label: "INSTITUTE FOR ENGINEERING RESEARCH AND PUBLICATION (IFERP) - BT",
  },
  { value: "FORCE BIOMEDICAL SOCIETY", label: "FORCE BIOMEDICAL SOCIETY" },
  {
    value: "BIOMEDICAL ENGINEERING SOCIETY OF INDIA (BMESI)",
    label: "BIOMEDICAL ENGINEERING SOCIETY OF INDIA (BMESI)",
  },
  {
    value: "IMPERIAL SOCIETY OF INNOVATIVE ENGINEERS (ISIE)",
    label: "IMPERIAL SOCIETY OF INNOVATIVE ENGINEERS (ISIE)",
  },
  {
    value: "SOCIETY FOR SMART E-MOBILITY",
    label: "SOCIETY FOR SMART E-MOBILITY",
  },
  { value: "ANALYTICS VIDHYA", label: "ANALYTICS VIDHYA" },
  { value: "KAGGLE COMMUNITIES", label: "KAGGLE COMMUNITIES" },
  {
    value: "IAENG SOCIETY OF ARTIFICIAL INTELLIGENCE",
    label: "IAENG SOCIETY OF ARTIFICIAL INTELLIGENCE",
  },
  {
    value:
      "ASSOCIATION OF FOOD SCIENTISTS AND TECHNOLOGISTS INDIA (AFSTI) - AGRI",
    label:
      "ASSOCIATION OF FOOD SCIENTISTS AND TECHNOLOGISTS INDIA (AFSTI) - AGRI",
  },
  {
    value: "INDIAN SOCIETY OF AGRICULTURAL ENGINEERS (ISAE)",
    label: "INDIAN SOCIETY OF AGRICULTURAL ENGINEERS (ISAE)",
  },
  {
    value: "SOCIETY OF AUTOMOTIVE ENGINEERS INDIA (SAEINDIA)",
    label: "SOCIETY OF AUTOMOTIVE ENGINEERS INDIA (SAEINDIA)",
  },
  {
    value: "AERONAUTICAL SOCIETY OF INDIA (AESI)",
    label: "AERONAUTICAL SOCIETY OF INDIA (AESI)",
  },
];

const DEPARTMENTS = [
  { value: "", label: "Select Department" },
  { value: "CSE", label: "Computer Science & Engineering (CSE)" },
  { value: "ECE", label: "Electronics & Communication Engineering (ECE)" },
  { value: "MECH", label: "Mechanical Engineering (MECH)" },
  { value: "CIVIL", label: "Civil Engineering (CIVIL)" },
  { value: "EEE", label: "Electrical & Electronics Engineering (EEE)" },
  { value: "IT", label: "Information Technology (IT)" },
  { value: "AIML", label: "Artificial Intelligence & Machine Learning (AIML)" },
  { value: "AIDS", label: "Artificial Intelligence & Data Science (AIDS)" },
  { value: "BT", label: "Biotechnology (BT)" },
  { value: "FT", label: "Food Technology (FT)" },
  { value: "ISE", label: "Information Science & Engineering (ISE)" },
  { value: "AGRI", label: "Agricultural Engineering (AGRI)" },
  { value: "AUTO", label: "Automobile Engineering (AUTO)" },
  { value: "AERO", label: "Aeronautical Engineering (AERO)" },
  { value: "CHEM", label: "Chemical Engineering (CHEM)" },
];

const SPECIAL_LABS = [
  { value: "", label: "Select Special Lab" },
  { value: "AI_LAB", label: "Artificial Intelligence Lab" },
  { value: "ROBOTICS_LAB", label: "Robotics Lab" },
  { value: "IOT_LAB", label: "IoT Lab" },
  { value: "CYBER_LAB", label: "Cyber Security Lab" },
  { value: "CLOUD_LAB", label: "Cloud Computing Lab" },
  { value: "DATA_LAB", label: "Data Science Lab" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type FileField =
  | "syllabusFile"
  | "courseFeedbackFile"
  | "proceedingsProofFile"
  | "apexProofFile"
  | "proofFile";

interface FormData {
  // Step 1
  taskId: string;
  role: string;
  department: string;
  specialLabsInvolved: string;
  specialLabName: string;
  isIIC: string;
  iicUploadUnder: string;
  iicBipId: string;
  isDeptAssociation: string;
  isRnd: string;
  isTechSociety: string;
  techSocietyName: string;
  isMouOutcome: string;
  mouBipId: string;
  isIrpOutcome: string;
  irpBipId: string;
  isCoe: string;
  coeBipId: string;
  isIndustryLab: string;
  industryLabBipId: string;
  // Step 2
  internalFaculty1Status: string;
  internalFaculty1Name: string;
  internalFaculty1Role: string;
  internalFaculty2Status: string;
  internalFaculty2Name: string;
  internalFaculty2Role: string;
  internalFaculty3Status: string;
  internalFaculty3Name: string;
  internalFaculty3Role: string;
  internalFaculty4Status: string;
  internalFaculty4Name: string;
  internalFaculty4Role: string;
  studentMember1Status: string;
  studentMember1Name: string;
  studentMember2Status: string;
  studentMember2Name: string;
  studentMember3Status: string;
  studentMember3Name: string;
  studentMember4Status: string;
  studentMember4Name: string;
  // Step 3
  eventName: string;
  programType: string;
  clubSocietyName: string;
  eventType: string;
  otherEventType: string;
  syllabusFile: File | null;
  topicsCovered: string;
  courseFeedbackFile: File | null;
  conferenceProceedings: string;
  proceedingsProofFile: File | null;
  publisherDetail: string;
  publisherYear: string;
  volumeNumber: string;
  issueNumber: string;
  pageNumber: string;
  isbnNumber: string;
  indexingDetail: string;
  eventCategory: string;
  eventOrganizer: string;
  eventDescription: string;
  eventMode: string;
  eventLocation: string;
  eventLevel: string;
  startDate: string;
  endDate: string;
  eventDuration: string;
  jointlyOrganizedWith: string;
  jointOrgName: string;
  jointOrgAddress: string;
  // Step 4
  internalStudentsCount: string;
  internalFacultyCount: string;
  externalStudentsCount: string;
  externalFacultyCount: string;
  // Step 5
  guestSpeakerType: string;
  isAlumni: string;
  guest1Type: string;
  guest1Name: string;
  guest1Designation: string;
  guest1Email: string;
  guest1Contact: string;
  guest1Org: string;
  guest2Type: string;
  guest2Name: string;
  guest2Designation: string;
  guest2Email: string;
  guest2Contact: string;
  guest2Org: string;
  guest3Type: string;
  guest3Name: string;
  guest3Designation: string;
  guest3Email: string;
  guest3Contact: string;
  guest3Org: string;
  guest4Type: string;
  guest4Name: string;
  guest4Designation: string;
  guest4Email: string;
  guest4Contact: string;
  guest4Org: string;
  guest5Type: string;
  guest5Name: string;
  guest5Designation: string;
  guest5Email: string;
  guest5Contact: string;
  guest5Org: string;
  // Step 6
  registrationAmount: string;
  sponsoredAmount: string;
  amountReceivedFromManagement: string;
  amountReceived: string;
  apexProofFile: File | null;
  fundingAgencySponsorship: string;
  fundingAgencyName: string;
  totalRevenue: string;
  // Step 7
  proofFile: File | null;
  [key: string]: string | File | null;
}

// ─── Reusable Field Components ────────────────────────────────────────────────

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

interface LabelProps {
  label: string;
  required?: boolean;
}
interface FieldProps extends LabelProps {
  name: string;
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  error,
  disabled,
}: FieldProps & { type?: string }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label}
      {required && <RequiredAst />}
    </label>
    <input
      type={type}
      name={name}
      value={value ?? ""}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border ${error ? "border-red-400" : "border-slate-300"} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white ${disabled ? "bg-slate-100 text-slate-400" : ""}`}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  required,
  error,
}: FieldProps & { options: { value: string; label: string }[] }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label}
      {required && <RequiredAst />}
    </label>
    <select
      name={name}
      value={value ?? ""}
      onChange={onChange}
      className={`w-full px-3 py-2 border ${error ? "border-red-400" : "border-slate-300"} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const TextAreaField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  required,
  error,
}: FieldProps & { rows?: number }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label}
      {required && <RequiredAst />}
    </label>
    <textarea
      name={name}
      value={value ?? ""}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border ${error ? "border-red-400" : "border-slate-300"} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white`}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

interface FileUploadProps {
  label: string;
  fieldName: FileField;
  file: File | null;
  onFileSelect: (name: FileField, file: File | null) => void;
  error?: string;
  required?: boolean;
}

const FileUpload = ({
  label,
  fieldName,
  file,
  onFileSelect,
  error,
  required,
}: FileUploadProps) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <RequiredAst />}
      </label>
      <div
        onClick={() => ref.current?.click()}
        className={`mt-1 flex flex-col items-center justify-center px-6 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${error ? "border-red-400 bg-red-50" : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50"}`}
      >
        <UploadCloud className="h-9 w-9 text-slate-400 mb-2" />
        <span className="text-sm text-indigo-600 font-medium hover:text-indigo-500">
          Click to upload
        </span>
        <span className="text-xs text-slate-400 mt-1">
          PDF, PNG, JPG up to 10 MB
        </span>
        <input
          ref={ref}
          type="file"
          className="sr-only"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) =>
            e.target.files?.[0] && onFileSelect(fieldName, e.target.files[0])
          }
        />
      </div>
      {file && (
        <div className="mt-2 flex items-center justify-between p-2 bg-indigo-50 rounded-lg border border-indigo-100">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-indigo-600 shrink-0" />
            <span className="text-xs text-slate-700 truncate max-w-xs">
              {file.name}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onFileSelect(fieldName, null)}
            className="text-red-400 hover:text-red-600 p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

interface SectionTitleProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}
const SectionTitle = ({ icon: Icon, title, subtitle }: SectionTitleProps) => (
  <div className="mb-6 border-b border-slate-100 pb-3">
    <div className="flex items-center gap-2 mb-1">
      <Icon size={20} className="text-indigo-600" />
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
    </div>
    {subtitle && <p className="text-sm text-slate-500 ml-7">{subtitle}</p>}
  </div>
);

// ─── Step Components ──────────────────────────────────────────────────────────

interface StepProps {
  formData: FormData;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  errors: Record<string, string>;
}
interface StepWithFileProps extends StepProps {
  handleFileSelect: (name: FileField, file: File | null) => void;
}

const Step1_BasicInfo = ({ formData, handleChange, errors }: StepProps) => (
  <div className="space-y-6">
    <SectionTitle
      icon={User}
      title="Organizer & Department Details"
      subtitle="Enter details about the faculty organizer and department associations."
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <InputField
        label="Task ID"
        name="taskId"
        value={formData.taskId}
        onChange={handleChange}
        required
        error={errors.taskId}
        placeholder="Enter Task ID"
      />
      <SelectField
        label="Role"
        name="role"
        value={formData.role}
        onChange={handleChange}
        options={ROLES}
        required
        error={errors.role}
      />
      <SelectField
        label="Department"
        name="department"
        value={formData.department}
        onChange={handleChange}
        options={DEPARTMENTS}
        required
        error={errors.department}
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-4">
        <SelectField
          label="Special Labs Involved"
          name="specialLabsInvolved"
          value={formData.specialLabsInvolved}
          onChange={handleChange}
          options={YES_NO}
          required
          error={errors.specialLabsInvolved}
        />
        {formData.specialLabsInvolved === "Yes" && (
          <SelectField
            label="Special Lab"
            name="specialLabName"
            value={formData.specialLabName}
            onChange={handleChange}
            options={SPECIAL_LABS}
            required
            error={errors.specialLabName}
          />
        )}
      </div>

      <div className="space-y-4">
        <SelectField
          label="Whether this event comes under IIC"
          name="isIIC"
          value={formData.isIIC}
          onChange={handleChange}
          options={YES_NO}
          required
          error={errors.isIIC}
        />
        {formData.isIIC === "Yes" && (
          <>
            <SelectField
              label="Is this event upload under IIC"
              name="iicUploadUnder"
              value={formData.iicUploadUnder}
              onChange={handleChange}
              options={YES_NO}
              required
              error={errors.iicUploadUnder}
            />
            {formData.iicUploadUnder === "Yes" && (
              <InputField
                label="IIC BIP ID"
                name="iicBipId"
                value={formData.iicBipId}
                onChange={handleChange}
                required
                error={errors.iicBipId}
                placeholder="Enter IIC BIP ID"
              />
            )}
          </>
        )}
      </div>

      <SelectField
        label="Is this event belongs to Department Association"
        name="isDeptAssociation"
        value={formData.isDeptAssociation}
        onChange={handleChange}
        options={YES_NO}
        required
        error={errors.isDeptAssociation}
      />
      <SelectField
        label="Is this event organized by R & D"
        name="isRnd"
        value={formData.isRnd}
        onChange={handleChange}
        options={YES_NO}
        required
        error={errors.isRnd}
      />

      <div className="space-y-4">
        <SelectField
          label="Is this event involved under Technical Society?"
          name="isTechSociety"
          value={formData.isTechSociety}
          onChange={handleChange}
          options={YES_NO}
          required
          error={errors.isTechSociety}
        />
        {formData.isTechSociety === "Yes" && (
          <SelectField
            label="Technical Society & Chapter"
            name="techSocietyName"
            value={formData.techSocietyName}
            onChange={handleChange}
            options={TECH_SOCIETIES}
            required
            error={errors.techSocietyName}
          />
        )}
      </div>

      <div className="space-y-4">
        <SelectField
          label="Is this event an outcome of MoU?"
          name="isMouOutcome"
          value={formData.isMouOutcome}
          onChange={handleChange}
          options={YES_NO}
          required
          error={errors.isMouOutcome}
        />
        {formData.isMouOutcome === "Yes" && (
          <InputField
            label="BIP ID of MoU entry"
            name="mouBipId"
            value={formData.mouBipId}
            onChange={handleChange}
            required
            error={errors.mouBipId}
            placeholder="Enter MoU BIP ID"
          />
        )}
      </div>

      <div className="space-y-4">
        <SelectField
          label="Is this event an outcome of an IRP visit?"
          name="isIrpOutcome"
          value={formData.isIrpOutcome}
          onChange={handleChange}
          options={YES_NO}
          required
          error={errors.isIrpOutcome}
        />
        {formData.isIrpOutcome === "Yes" && (
          <InputField
            label="BIP ID of IRP Visit"
            name="irpBipId"
            value={formData.irpBipId}
            onChange={handleChange}
            required
            error={errors.irpBipId}
            placeholder="Enter IRP BIP ID"
          />
        )}
      </div>

      <div className="space-y-4">
        <SelectField
          label="Is this event organized through the Centre of Excellence?"
          name="isCoe"
          value={formData.isCoe}
          onChange={handleChange}
          options={YES_NO}
          required
          error={errors.isCoe}
        />
        {formData.isCoe === "Yes" && (
          <InputField
            label="BIP ID of Centre of Excellence"
            name="coeBipId"
            value={formData.coeBipId}
            onChange={handleChange}
            required
            error={errors.coeBipId}
            placeholder="Enter CoE BIP ID"
          />
        )}
      </div>

      <div className="space-y-4">
        <SelectField
          label="Is this event organized through Industry Supported Laboratories?"
          name="isIndustryLab"
          value={formData.isIndustryLab}
          onChange={handleChange}
          options={YES_NO}
          required
          error={errors.isIndustryLab}
        />
        {formData.isIndustryLab === "Yes" && (
          <InputField
            label="BIP ID of Industry Supported Lab"
            name="industryLabBipId"
            value={formData.industryLabBipId}
            onChange={handleChange}
            required
            error={errors.industryLabBipId}
            placeholder="Enter Industry Lab BIP ID"
          />
        )}
      </div>
    </div>
  </div>
);

const Step2_Committee = ({ formData, handleChange, errors }: StepProps) => (
  <div className="space-y-6">
    <SectionTitle
      icon={Users}
      title="Organizing Committee"
      subtitle="Add internal faculty and student members involved."
    />

    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
      <h4 className="text-sm font-semibold text-slate-700 mb-3 border-b border-slate-200 pb-2">
        Internal Faculty Members
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {([1, 2, 3, 4] as const).map((num) => {
          const ordinals = ["First", "Second", "Third", "Fourth"];
          return (
            <div
              key={`faculty${num}`}
              className="bg-white p-4 rounded-lg border border-slate-200"
            >
              <SelectField
                label={`${ordinals[num - 1]} internal faculty member, if involved`}
                name={`internalFaculty${num}Status`}
                value={
                  (formData[`internalFaculty${num}Status`] as string) ?? ""
                }
                onChange={handleChange}
                options={YES_NA}
                required
                error={errors[`internalFaculty${num}Status`]}
              />
              {formData[`internalFaculty${num}Status`] === "Yes" && (
                <div className="pl-4 border-l-2 border-indigo-100 mt-3 space-y-3">
                  <SelectField
                    label={`Faculty ${num} Name`}
                    name={`internalFaculty${num}Name`}
                    value={
                      (formData[`internalFaculty${num}Name`] as string) ?? ""
                    }
                    onChange={handleChange}
                    options={[
                      { value: "", label: "Click to choose" },
                      { value: "FAC001", label: "Dr. Smith (CSE)" },
                      { value: "FAC002", label: "Prof. Johnson (ECE)" },
                      { value: "FAC003", label: "Dr. Williams (MECH)" },
                    ]}
                    required
                    error={errors[`internalFaculty${num}Name`]}
                  />
                  <SelectField
                    label={`Faculty ${num} Role`}
                    name={`internalFaculty${num}Role`}
                    value={
                      (formData[`internalFaculty${num}Role`] as string) ?? ""
                    }
                    onChange={handleChange}
                    options={ROLES}
                    required
                    error={errors[`internalFaculty${num}Role`]}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>

    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
      <h4 className="text-sm font-semibold text-slate-700 mb-3 border-b border-slate-200 pb-2">
        Student Members
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {([1, 2, 3, 4] as const).map((num) => {
          const ordinals = ["first", "second", "third", "fourth"];
          return (
            <div
              key={`student${num}`}
              className="bg-white p-4 rounded-lg border border-slate-200"
            >
              <SelectField
                label={`Name of the ${ordinals[num - 1]} student member, if involved`}
                name={`studentMember${num}Status`}
                value={(formData[`studentMember${num}Status`] as string) ?? ""}
                onChange={handleChange}
                options={YES_NA}
              />
              {formData[`studentMember${num}Status`] === "Yes" && (
                <div className="mt-3">
                  <InputField
                    label={`Student ${num} Name`}
                    name={`studentMember${num}Name`}
                    value={
                      (formData[`studentMember${num}Name`] as string) ?? ""
                    }
                    onChange={handleChange}
                    placeholder={`Enter Student ${num} Name`}
                    required
                    error={errors[`studentMember${num}Name`]}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

const Step3_EventDetails = ({
  formData,
  handleChange,
  handleFileSelect,
  errors,
}: StepWithFileProps) => (
  <div className="space-y-6">
    <SectionTitle
      icon={Layout}
      title="Event Information"
      subtitle="Details about the event itself."
    />

    <InputField
      label="Event Name"
      name="eventName"
      value={formData.eventName}
      onChange={handleChange}
      required
      error={errors.eventName}
      placeholder="Full title of the event"
    />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <SelectField
        label="Type of Program"
        name="programType"
        value={formData.programType}
        onChange={handleChange}
        options={PROGRAM_TYPES}
        required
        error={errors.programType}
      />
      {formData.programType === "Non Academic" && (
        <InputField
          label="Name of the Club/Society (NCC, NSS & others)"
          name="clubSocietyName"
          value={formData.clubSocietyName}
          onChange={handleChange}
          required
          error={errors.clubSocietyName}
          placeholder="Enter Club/Society name"
        />
      )}
      <SelectField
        label="Event Type"
        name="eventType"
        value={formData.eventType}
        onChange={handleChange}
        options={EVENT_TYPES}
        required
        error={errors.eventType}
      />
      {formData.eventType === "Others" && (
        <InputField
          label="If Others, Please Specify"
          name="otherEventType"
          value={formData.otherEventType}
          onChange={handleChange}
          required
          error={errors.otherEventType}
          placeholder="Specify event type"
        />
      )}
    </div>

    {formData.eventType === "Partial Delivery of Course" && (
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
        <h4 className="text-sm font-semibold text-blue-800 mb-4">
          Course Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FileUpload
            label="Upload the Syllabus"
            fieldName="syllabusFile"
            file={formData.syllabusFile}
            onFileSelect={handleFileSelect}
            required
            error={errors.syllabusFile}
          />
          <InputField
            label="Topics Covered"
            name="topicsCovered"
            value={formData.topicsCovered}
            onChange={handleChange}
            required
            error={errors.topicsCovered}
            placeholder="Enter topics covered"
          />
          <FileUpload
            label="Upload the Course Feedback"
            fieldName="courseFeedbackFile"
            file={formData.courseFeedbackFile}
            onFileSelect={handleFileSelect}
            error={errors.courseFeedbackFile}
          />
        </div>
      </div>
    )}

    {formData.eventType === "Conference" && (
      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
        <h4 className="text-sm font-semibold text-purple-800 mb-4">
          Conference Details
        </h4>
        <SelectField
          label="Conference Proceedings"
          name="conferenceProceedings"
          value={formData.conferenceProceedings}
          onChange={handleChange}
          options={YES_NO}
          required
          error={errors.conferenceProceedings}
        />
        {formData.conferenceProceedings === "Yes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
            <FileUpload
              label="Submit the Proceedings proof"
              fieldName="proceedingsProofFile"
              file={formData.proceedingsProofFile}
              onFileSelect={handleFileSelect}
              required
              error={errors.proceedingsProofFile}
            />
            <InputField
              label="Publisher Detail"
              name="publisherDetail"
              value={formData.publisherDetail}
              onChange={handleChange}
              required
              error={errors.publisherDetail}
              placeholder="Enter publisher details"
            />
            <InputField
              label="Publisher Year"
              name="publisherYear"
              value={formData.publisherYear}
              onChange={handleChange}
              type="number"
              required
              error={errors.publisherYear}
              placeholder="Enter year"
            />
            <InputField
              label="Volume Number"
              name="volumeNumber"
              value={formData.volumeNumber}
              onChange={handleChange}
              error={errors.volumeNumber}
              placeholder="Enter volume number"
            />
            <InputField
              label="Issue Number"
              name="issueNumber"
              value={formData.issueNumber}
              onChange={handleChange}
              error={errors.issueNumber}
              placeholder="Enter issue number"
            />
            <InputField
              label="Page Number"
              name="pageNumber"
              value={formData.pageNumber}
              onChange={handleChange}
              error={errors.pageNumber}
              placeholder="Enter page number"
            />
            <InputField
              label="ISBN Number"
              name="isbnNumber"
              value={formData.isbnNumber}
              onChange={handleChange}
              error={errors.isbnNumber}
              placeholder="Enter ISBN number"
            />
            <InputField
              label="Indexing Detail"
              name="indexingDetail"
              value={formData.indexingDetail}
              onChange={handleChange}
              error={errors.indexingDetail}
              placeholder="Enter indexing detail"
            />
          </div>
        )}
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <SelectField
        label="Event Category"
        name="eventCategory"
        value={formData.eventCategory}
        onChange={handleChange}
        options={EVENT_CATEGORIES}
        required
        error={errors.eventCategory}
      />
      <InputField
        label="Event Organizer"
        name="eventOrganizer"
        value={formData.eventOrganizer}
        onChange={handleChange}
        required
        error={errors.eventOrganizer}
        placeholder="Organizer Name/Body"
      />
    </div>

    <TextAreaField
      label="Event Description"
      name="eventDescription"
      value={formData.eventDescription}
      onChange={handleChange}
      required
      error={errors.eventDescription}
      rows={4}
    />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <SelectField
        label="Event Mode"
        name="eventMode"
        value={formData.eventMode}
        onChange={handleChange}
        options={EVENT_MODES}
        required
        error={errors.eventMode}
      />
      {(formData.eventMode === "Offline" ||
        formData.eventMode === "Hybrid") && (
        <InputField
          label="Event Location"
          name="eventLocation"
          value={formData.eventLocation}
          onChange={handleChange}
          required
          error={errors.eventLocation}
          placeholder="Enter event location"
        />
      )}
      <SelectField
        label="Event Level"
        name="eventLevel"
        value={formData.eventLevel}
        onChange={handleChange}
        options={EVENT_LEVELS}
        required
        error={errors.eventLevel}
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <InputField
        label="Start Date"
        name="startDate"
        value={formData.startDate}
        onChange={handleChange}
        type="date"
        required
        error={errors.startDate}
      />
      <InputField
        label="End Date"
        name="endDate"
        value={formData.endDate}
        onChange={handleChange}
        type="date"
        required
        error={errors.endDate}
      />
      <InputField
        label="Event Duration (In Days)"
        name="eventDuration"
        value={formData.eventDuration}
        onChange={handleChange}
        type="number"
        required
        error={errors.eventDuration}
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <SelectField
        label="Jointly organized with"
        name="jointlyOrganizedWith"
        value={formData.jointlyOrganizedWith}
        onChange={handleChange}
        options={JOINTLY_ORGANIZED_OPTIONS}
        error={errors.jointlyOrganizedWith}
      />
      {formData.jointlyOrganizedWith &&
        formData.jointlyOrganizedWith !== "None" &&
        formData.jointlyOrganizedWith !== "" && (
          <>
            <InputField
              label="Name of the joint Organization"
              name="jointOrgName"
              value={formData.jointOrgName}
              onChange={handleChange}
              required
              error={errors.jointOrgName}
              placeholder="Enter organization name"
            />
            <InputField
              label="Address of the joint Organization"
              name="jointOrgAddress"
              value={formData.jointOrgAddress}
              onChange={handleChange}
              error={errors.jointOrgAddress}
              placeholder="Enter organization address"
            />
          </>
        )}
    </div>
  </div>
);

const Step4_Participants = ({ formData, handleChange, errors }: StepProps) => (
  <div className="space-y-6">
    <SectionTitle
      icon={Users}
      title="Participant Details"
      subtitle="Count of internal and external participants."
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
        <h4 className="font-semibold text-blue-800 mb-4">
          Internal Participants
        </h4>
        <div className="space-y-4">
          <InputField
            label="Students Count"
            name="internalStudentsCount"
            value={formData.internalStudentsCount}
            onChange={handleChange}
            type="number"
            required
            error={errors.internalStudentsCount}
          />
          <InputField
            label="Faculty Count"
            name="internalFacultyCount"
            value={formData.internalFacultyCount}
            onChange={handleChange}
            type="number"
            required
            error={errors.internalFacultyCount}
          />
        </div>
      </div>
      <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
        <h4 className="font-semibold text-emerald-800 mb-4">
          External Participants
        </h4>
        <div className="space-y-4">
          <InputField
            label="Students Count"
            name="externalStudentsCount"
            value={formData.externalStudentsCount}
            onChange={handleChange}
            type="number"
            required
            error={errors.externalStudentsCount}
          />
          <InputField
            label="Faculty Count"
            name="externalFacultyCount"
            value={formData.externalFacultyCount}
            onChange={handleChange}
            type="number"
            required
            error={errors.externalFacultyCount}
          />
        </div>
      </div>
    </div>
  </div>
);

const Step5_Guests = ({ formData, handleChange, errors }: StepProps) => (
  <div className="space-y-6">
    <SectionTitle
      icon={Briefcase}
      title="Guest Speakers / Resource Persons"
      subtitle="Details of invited guests."
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <SelectField
        label="Invited Guest or Notable Speaker Details"
        name="guestSpeakerType"
        value={formData.guestSpeakerType}
        onChange={handleChange}
        options={GUEST_SPEAKER_TYPE}
        required
        error={errors.guestSpeakerType}
      />
      <SelectField
        label="Whether the resource person, an alumni of BIT?"
        name="isAlumni"
        value={formData.isAlumni}
        onChange={handleChange}
        options={YES_NO}
        required
        error={errors.isAlumni}
      />
    </div>
    {([1, 2, 3, 4, 5] as const).map((num) => (
      <div
        key={`guest${num}`}
        className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm"
      >
        <h4 className="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2 flex justify-between items-center">
          <span>Guest Speaker {num}</span>
          {num > 1 && (
            <span className="text-xs text-slate-400 font-normal">Optional</span>
          )}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SelectField
            label="Type of Institution"
            name={`guest${num}Type`}
            value={(formData[`guest${num}Type`] as string) ?? ""}
            onChange={handleChange}
            options={INSTITUTION_TYPES}
          />
          <InputField
            label="Name"
            name={`guest${num}Name`}
            value={(formData[`guest${num}Name`] as string) ?? ""}
            onChange={handleChange}
            placeholder="Guest Name"
          />
          <InputField
            label="Designation"
            name={`guest${num}Designation`}
            value={(formData[`guest${num}Designation`] as string) ?? ""}
            onChange={handleChange}
            placeholder="Designation"
          />
          <InputField
            label="Email ID"
            name={`guest${num}Email`}
            value={(formData[`guest${num}Email`] as string) ?? ""}
            onChange={handleChange}
            type="email"
            placeholder="Email"
          />
          <InputField
            label="Contact No"
            name={`guest${num}Contact`}
            value={(formData[`guest${num}Contact`] as string) ?? ""}
            onChange={handleChange}
            type="tel"
            placeholder="Phone Number"
          />
          <InputField
            label="Organization Details"
            name={`guest${num}Org`}
            value={(formData[`guest${num}Org`] as string) ?? ""}
            onChange={handleChange}
            placeholder="Organization Name & Address"
          />
        </div>
      </div>
    ))}
  </div>
);

const Step6_Financials = ({
  formData,
  handleChange,
  handleFileSelect,
  errors,
}: StepWithFileProps) => (
  <div className="space-y-6">
    <SectionTitle
      icon={DollarSign}
      title="Financial Details"
      subtitle="Revenue and sponsorship information."
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <InputField
        label="Registration Amount (Collected from participants)"
        name="registrationAmount"
        value={formData.registrationAmount}
        onChange={handleChange}
        type="number"
        required
        error={errors.registrationAmount}
      />
      <InputField
        label="Total Sponsored Amount"
        name="sponsoredAmount"
        value={formData.sponsoredAmount}
        onChange={handleChange}
        type="number"
        required
        error={errors.sponsoredAmount}
      />
      <SelectField
        label="Amount Received From Management"
        name="amountReceivedFromManagement"
        value={formData.amountReceivedFromManagement}
        onChange={handleChange}
        options={YES_NO}
        required
        error={errors.amountReceivedFromManagement}
      />
      {formData.amountReceivedFromManagement === "Yes" && (
        <InputField
          label="Amount Received"
          name="amountReceived"
          value={formData.amountReceived}
          onChange={handleChange}
          type="number"
          required
          error={errors.amountReceived}
          placeholder="Enter amount"
        />
      )}
      <FileUpload
        label="Apex Proof"
        fieldName="apexProofFile"
        file={formData.apexProofFile}
        onFileSelect={handleFileSelect}
        error={errors.apexProofFile}
      />
      <SelectField
        label="Sponsorship from Funding agency"
        name="fundingAgencySponsorship"
        value={formData.fundingAgencySponsorship}
        onChange={handleChange}
        options={YES_NO}
        required
        error={errors.fundingAgencySponsorship}
      />
      {formData.fundingAgencySponsorship === "Yes" && (
        <InputField
          label="Funding Agency Name"
          name="fundingAgencyName"
          value={formData.fundingAgencyName}
          onChange={handleChange}
          required
          error={errors.fundingAgencyName}
          placeholder="Enter funding agency name"
        />
      )}
      <InputField
        label="Total Revenue Generated"
        name="totalRevenue"
        value={formData.totalRevenue}
        onChange={handleChange}
        type="number"
        required
        error={errors.totalRevenue}
      />
    </div>
  </div>
);

const Step7_Proof = ({
  formData,
  handleFileSelect,
  errors,
}: {
  formData: FormData;
  handleFileSelect: (name: FileField, file: File | null) => void;
  errors: Record<string, string>;
}) => (
  <div className="space-y-6">
    <SectionTitle
      icon={UploadCloud}
      title="Proof Documents"
      subtitle="Upload relevant documents."
    />
    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm text-amber-800">
      <p className="font-semibold mb-2">Required Proofs:</p>
      <ul className="list-disc ml-5 space-y-1">
        <li>Approval letter</li>
        <li>Brochure / Poster / Invitation</li>
        <li>Attendance Sheet</li>
        <li>Photos (At least 3)</li>
        <li>Feedback</li>
      </ul>
      <p className="mt-2 text-xs">
        Please combine all into a single PDF if possible, or upload a ZIP file.
      </p>
    </div>
    <FileUpload
      label="Upload the relevant proof"
      fieldName="proofFile"
      file={formData.proofFile}
      onFileSelect={handleFileSelect}
      required
      error={errors.proofFile}
    />
  </div>
);

const ReviewStep = ({ formData }: { formData: FormData }) => {
  const Item = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="border-b border-slate-100 py-2 last:border-0">
      <span className="text-xs text-slate-500 block">{label}</span>
      <span className="text-sm font-medium text-slate-800 block mt-0.5 break-words">
        {value || "—"}
      </span>
    </div>
  );
  const Card = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 font-semibold text-slate-700 text-sm">
        {title}
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
  return (
    <div className="space-y-5">
      <SectionTitle
        icon={CheckCircle}
        title="Review & Submit"
        subtitle="Please review all details before submitting."
      />
      <Card title="Basic Info">
        <Item label="Task ID" value={formData.taskId} />
        <Item label="Role" value={formData.role} />
        <Item label="Department" value={formData.department} />
      </Card>
      <Card title="Event Details">
        <Item label="Event Name" value={formData.eventName} />
        <Item label="Program Type" value={formData.programType} />
        <Item label="Event Type" value={formData.eventType} />
        <Item label="Event Category" value={formData.eventCategory} />
        <Item label="Event Mode" value={formData.eventMode} />
        <Item label="Event Level" value={formData.eventLevel} />
        <Item
          label="Dates"
          value={`${formData.startDate} to ${formData.endDate}`}
        />
        <Item label="Duration (Days)" value={formData.eventDuration} />
      </Card>
      <Card title="Participants">
        <Item
          label="Internal Students"
          value={formData.internalStudentsCount}
        />
        <Item label="Internal Faculty" value={formData.internalFacultyCount} />
        <Item
          label="External Students"
          value={formData.externalStudentsCount}
        />
        <Item label="External Faculty" value={formData.externalFacultyCount} />
      </Card>
      <Card title="Financial Details">
        <Item label="Registration Amount" value={formData.registrationAmount} />
        <Item label="Sponsored Amount" value={formData.sponsoredAmount} />
        <Item label="Total Revenue" value={formData.totalRevenue} />
      </Card>
    </div>
  );
};

// ─── Wizard Config ────────────────────────────────────────────────────────────

const STEPS = [
  { title: "Basic Info", icon: User },
  { title: "Committee", icon: Users },
  { title: "Event Details", icon: Layout },
  { title: "Participants", icon: Users },
  { title: "Guests", icon: Briefcase },
  { title: "Financials", icon: DollarSign },
  { title: "Proof", icon: UploadCloud },
  { title: "Review", icon: CheckCircle },
];

const INITIAL_FORM: FormData = {
  taskId: "",
  role: "",
  department: "",
  specialLabsInvolved: "",
  specialLabName: "",
  isIIC: "",
  iicUploadUnder: "",
  iicBipId: "",
  isDeptAssociation: "",
  isRnd: "",
  isTechSociety: "",
  techSocietyName: "",
  isMouOutcome: "",
  mouBipId: "",
  isIrpOutcome: "",
  irpBipId: "",
  isCoe: "",
  coeBipId: "",
  isIndustryLab: "",
  industryLabBipId: "",
  internalFaculty1Status: "",
  internalFaculty1Name: "",
  internalFaculty1Role: "",
  internalFaculty2Status: "",
  internalFaculty2Name: "",
  internalFaculty2Role: "",
  internalFaculty3Status: "",
  internalFaculty3Name: "",
  internalFaculty3Role: "",
  internalFaculty4Status: "",
  internalFaculty4Name: "",
  internalFaculty4Role: "",
  studentMember1Status: "",
  studentMember1Name: "",
  studentMember2Status: "",
  studentMember2Name: "",
  studentMember3Status: "",
  studentMember3Name: "",
  studentMember4Status: "",
  studentMember4Name: "",
  eventName: "",
  programType: "",
  clubSocietyName: "",
  eventType: "",
  otherEventType: "",
  syllabusFile: null,
  topicsCovered: "",
  courseFeedbackFile: null,
  conferenceProceedings: "",
  proceedingsProofFile: null,
  publisherDetail: "",
  publisherYear: "",
  volumeNumber: "",
  issueNumber: "",
  pageNumber: "",
  isbnNumber: "",
  indexingDetail: "",
  eventCategory: "",
  eventOrganizer: "",
  eventDescription: "",
  eventMode: "",
  eventLocation: "",
  eventLevel: "",
  startDate: "",
  endDate: "",
  eventDuration: "",
  jointlyOrganizedWith: "",
  jointOrgName: "",
  jointOrgAddress: "",
  internalStudentsCount: "",
  internalFacultyCount: "",
  externalStudentsCount: "",
  externalFacultyCount: "",
  guestSpeakerType: "",
  isAlumni: "",
  guest1Type: "",
  guest1Name: "",
  guest1Designation: "",
  guest1Email: "",
  guest1Contact: "",
  guest1Org: "",
  guest2Type: "",
  guest2Name: "",
  guest2Designation: "",
  guest2Email: "",
  guest2Contact: "",
  guest2Org: "",
  guest3Type: "",
  guest3Name: "",
  guest3Designation: "",
  guest3Email: "",
  guest3Contact: "",
  guest3Org: "",
  guest4Type: "",
  guest4Name: "",
  guest4Designation: "",
  guest4Email: "",
  guest4Contact: "",
  guest4Org: "",
  guest5Type: "",
  guest5Name: "",
  guest5Designation: "",
  guest5Email: "",
  guest5Contact: "",
  guest5Org: "",
  registrationAmount: "",
  sponsoredAmount: "",
  amountReceivedFromManagement: "",
  amountReceived: "",
  apexProofFile: null,
  fundingAgencySponsorship: "",
  fundingAgencyName: "",
  totalRevenue: "",
  proofFile: null,
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EventsOrganizedSubmitPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);

  const handleChange = useCallback(
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [],
  );

  const handleFileSelect = useCallback((name: FileField, file: File | null) => {
    setFormData((prev) => ({ ...prev, [name]: file }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: Record<string, string> = {};
    const d = formData;

    if (stepIndex === 0) {
      if (!d.taskId) newErrors.taskId = "Required";
      if (!d.role) newErrors.role = "Required";
      if (!d.department) newErrors.department = "Required";
      if (d.specialLabsInvolved === "Yes" && !d.specialLabName)
        newErrors.specialLabName = "Required";
      if (d.isIIC === "Yes") {
        if (!d.iicUploadUnder) newErrors.iicUploadUnder = "Required";
        if (d.iicUploadUnder === "Yes" && !d.iicBipId)
          newErrors.iicBipId = "Required";
      }
      if (d.isTechSociety === "Yes" && !d.techSocietyName)
        newErrors.techSocietyName = "Required";
      if (d.isMouOutcome === "Yes" && !d.mouBipId)
        newErrors.mouBipId = "Required";
      if (d.isIrpOutcome === "Yes" && !d.irpBipId)
        newErrors.irpBipId = "Required";
      if (d.isCoe === "Yes" && !d.coeBipId) newErrors.coeBipId = "Required";
      if (d.isIndustryLab === "Yes" && !d.industryLabBipId)
        newErrors.industryLabBipId = "Required";
    }

    if (stepIndex === 1) {
      for (let i = 1; i <= 4; i++) {
        if (d[`internalFaculty${i}Status`] === "Yes") {
          if (!d[`internalFaculty${i}Name`])
            newErrors[`internalFaculty${i}Name`] = "Required";
          if (!d[`internalFaculty${i}Role`])
            newErrors[`internalFaculty${i}Role`] = "Required";
        }
        if (
          d[`studentMember${i}Status`] === "Yes" &&
          !d[`studentMember${i}Name`]
        )
          newErrors[`studentMember${i}Name`] = "Required";
      }
    }

    if (stepIndex === 2) {
      if (!d.eventName) newErrors.eventName = "Required";
      if (!d.programType) newErrors.programType = "Required";
      if (d.programType === "Non Academic" && !d.clubSocietyName)
        newErrors.clubSocietyName = "Required";
      if (!d.eventType) newErrors.eventType = "Required";
      if (d.eventType === "Others" && !d.otherEventType)
        newErrors.otherEventType = "Required";
      if (d.eventType === "Partial Delivery of Course") {
        if (!d.syllabusFile) newErrors.syllabusFile = "Required";
        if (!d.topicsCovered) newErrors.topicsCovered = "Required";
      }
      if (d.eventType === "Conference" && d.conferenceProceedings === "Yes") {
        if (!d.proceedingsProofFile)
          newErrors.proceedingsProofFile = "Required";
        if (!d.publisherDetail) newErrors.publisherDetail = "Required";
        if (!d.publisherYear) newErrors.publisherYear = "Required";
      }
      if (!d.eventCategory) newErrors.eventCategory = "Required";
      if (!d.eventOrganizer) newErrors.eventOrganizer = "Required";
      if (!d.eventMode) newErrors.eventMode = "Required";
      if (
        (d.eventMode === "Offline" || d.eventMode === "Hybrid") &&
        !d.eventLocation
      )
        newErrors.eventLocation = "Required";
      if (!d.eventLevel) newErrors.eventLevel = "Required";
      if (!d.startDate) newErrors.startDate = "Required";
      if (!d.endDate) newErrors.endDate = "Required";
      if (!d.eventDuration) newErrors.eventDuration = "Required";
      if (
        d.jointlyOrganizedWith &&
        d.jointlyOrganizedWith !== "None" &&
        d.jointlyOrganizedWith !== "" &&
        !d.jointOrgName
      )
        newErrors.jointOrgName = "Required";
    }

    if (stepIndex === 3) {
      if (!d.internalStudentsCount)
        newErrors.internalStudentsCount = "Required";
      if (!d.internalFacultyCount) newErrors.internalFacultyCount = "Required";
      if (!d.externalStudentsCount)
        newErrors.externalStudentsCount = "Required";
      if (!d.externalFacultyCount) newErrors.externalFacultyCount = "Required";
    }

    if (stepIndex === 4) {
      if (!d.guestSpeakerType) newErrors.guestSpeakerType = "Required";
      if (!d.isAlumni) newErrors.isAlumni = "Required";
    }

    if (stepIndex === 5) {
      if (!d.registrationAmount) newErrors.registrationAmount = "Required";
      if (!d.sponsoredAmount) newErrors.sponsoredAmount = "Required";
      if (d.amountReceivedFromManagement === "Yes" && !d.amountReceived)
        newErrors.amountReceived = "Required";
      if (d.fundingAgencySponsorship === "Yes" && !d.fundingAgencyName)
        newErrors.fundingAgencyName = "Required";
      if (!d.totalRevenue) newErrors.totalRevenue = "Required";
    }

    if (stepIndex === 6) {
      if (!d.proofFile) newErrors.proofFile = "Proof file is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const fillTestData = () => {
    setFormData({
      ...INITIAL_FORM,
      taskID: "TASK-ORG-001",
      facultyName: "Test Faculty",
      facultyRole: "Convener",
      claimedDepartment: "CSE",
      specialLabsInvolved: "No",
      eventName: "Test Organized Event",
      eventType: "Workshop",
      eventCategory: "Technical Skill Development",
      programType: "Academic",
      eventMode: "Online",
      startDate: "2026-04-16",
      endDate: "2026-04-17",
      eventDuration: "2",
      eventLevel: "National",
      eventOrganizer: "Test Organizer",
      eventLocation: "Online",
      internalStudentParticipants: "10",
      internalFacultyParticipants: "2",
      externalStudentParticipants: "5",
      externalFacultyParticipants: "1",
      typeOfSponsorship: "Self-Sponsored",
      registrationAmount: "0",
      sponsoredAmount: "0",
      amountReceived: "0",
      fundingAgencyName: "",
      totalRevenue: "0",
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    try {
      const payload = buildFormData(formData);
      await submitAchievement("events-organized", payload);
      router.push("/achievements/events-organized");
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepComponents = [
    <Step1_BasicInfo
      key="1"
      formData={formData}
      handleChange={handleChange}
      errors={errors}
    />,
    <Step2_Committee
      key="2"
      formData={formData}
      handleChange={handleChange}
      errors={errors}
    />,
    <Step3_EventDetails
      key="3"
      formData={formData}
      handleChange={handleChange}
      handleFileSelect={handleFileSelect}
      errors={errors}
    />,
    <Step4_Participants
      key="4"
      formData={formData}
      handleChange={handleChange}
      errors={errors}
    />,
    <Step5_Guests
      key="5"
      formData={formData}
      handleChange={handleChange}
      errors={errors}
    />,
    <Step6_Financials
      key="6"
      formData={formData}
      handleChange={handleChange}
      handleFileSelect={handleFileSelect}
      errors={errors}
    />,
    <Step7_Proof
      key="7"
      formData={formData}
      handleFileSelect={handleFileSelect}
      errors={errors}
    />,
    <ReviewStep key="8" formData={formData} />,
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Events Organized
            </h1>
            <p className="text-sm text-slate-500">
              Submit details for events organized by you.
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
      </div>

        {/* Step Progress (desktop) */}
        <div className="mb-8 hidden md:block">
          <div className="flex items-center justify-between relative px-2">
            <div className="absolute left-0 top-5 w-full h-0.5 bg-slate-200 -z-10" />
            {STEPS.map((step, idx) => {
              const done = idx < currentStep;
              const curr = idx === currentStep;
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center bg-slate-50 px-2"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${done ? "bg-indigo-600 border-indigo-600 text-white" : curr ? "bg-white border-indigo-600 text-indigo-600" : "bg-white border-slate-300 text-slate-300"}`}
                  >
                    {done ? <Check size={18} /> : <Icon size={18} />}
                  </div>
                  <span
                    className={`text-xs font-medium mt-2 whitespace-nowrap ${curr ? "text-indigo-600" : "text-slate-500"}`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile step indicator */}
        <div className="md:hidden mb-5 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <span className="font-semibold text-slate-800">
            {STEPS[currentStep].title}
          </span>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
            Step {currentStep + 1} of {STEPS.length}
          </span>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8 min-h-[400px]">
            {stepComponents[currentStep]}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-t border-slate-100">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`px-6 py-2.5 rounded-lg border text-sm font-medium transition-colors ${currentStep === 0 ? "border-slate-200 text-slate-300 cursor-not-allowed" : "border-slate-300 text-slate-700 hover:bg-white hover:shadow-sm"}`}
            >
              Back
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-2"
              >
                Next <ArrowLeft size={15} className="rotate-180" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={16} />
                {isSubmitting ? "Submitting…" : "Submit Event"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
