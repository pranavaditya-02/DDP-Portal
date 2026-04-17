"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, UploadCloud, FileText, X } from "lucide-react";
import { buildFormData, submitAchievement } from "../../facultyActivitiesApi";

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

const EVENT_TYPE_OPTIONS = [
  "Select Event Type",
  "Certificate course",
  "Conference attended-without presentation",
  "Educational fair",
  "Faculty exchange programme",
  "FDP",
  "Guest Lecture",
  "Non-technical events",
  "One credit course",
  "Orientation programme",
  "Seminar",
  "Session chair",
  "STTP",
  "Summer School",
  "Training",
  "Value-Added course",
  "Webinar",
  "Winter School",
  "Workshop",
  "Hands-On Training",
  "PS-Certification (BIT)",
  "NPTEL-FDP",
  "AICTE-UHV-FDP",
  "Innovation Ambassador- IIC Certificate",
  "CEE-ACO & BEI panelist workshop certificate",
  "Other",
];

const PS_DOMAIN_OPTIONS = [
  "Select PS Domain",
  "Web Development",
  "Mobile App Development",
  "Data Science",
  "Machine Learning",
  "Artificial Intelligence",
  "Cloud Computing",
  "Cybersecurity",
  "Internet of Things",
  "Blockchain",
  "DevOps",
  "Database Management",
  "Embedded Systems",
  "Networking",
  "Software Testing",
  "UI/UX Design",
  "Game Development",
  "AR/VR",
  "Robotics",
  "Other",
];

const PS_DOMAIN_LEVEL_OPTIONS = [
  "Select Level",
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
];

const ORGANIZER_TYPE_OPTIONS = [
  "Select Organizer Type",
  "BIT",
  "Industry",
  "Foreign Institute",
  "Institute in India",
  "Others",
];

const INDUSTRY_NAME_SELECT_OPTIONS = [
  "Select Industry",
  "ADOBE CERTIFIED PROFESSIONAL",
  "ADOBE ILLUSTRATOR FOR FASHION",
  "AGRIBUSINESS MANAGEMENT",
  "ANSYS / CFD / FEA SIMULATION TRAINING",
  "APPAREL PRODUCTION & MERCHANDISING",
  "AUTOCAD / SOLIDWORKS PROFESSIONAL CERTIFICATION",
  "AUTODESK CERTIFIED PROFESSIONAL: AUTOCAD FOR DESIGN AND DRAFTING",
  "AUTOMATION WITH PLC/SCADA",
  "AWS CERTIFIED AI PRACTITIONER",
  "AWS CERTIFIED CLOUD PRACTITIONER",
  "AWS CERTIFIED MACHINE LEARNING",
  "BIOINFORMATICS SPECIALIZATION",
  "BIOTECHNOLOGY FUNDAMENTALS",
  "CERTIFIED BIOMEDICAL EQUIPMENT TECHNICIAN (CBET)",
  "CERTIFIED BUSINESS ANALYST",
  "CERTIFIED CLOUD PRACTITIONER",
  "CERTIFIED ELECTRICAL POWER ENGINEER",
  "CERTIFIED ELECTRONICS TECHNICIAN (CETA)",
  "CERTIFIED ETHICAL HACKER (CEH)",
  "CERTIFIED FINANCIAL ANALYST (CFA)",
  "CERTIFIED INFORMATION SYSTEMS SECURITY PROFESSIONAL (CISSP)",
  "CERTIFIED MANUFACTURING ENGINEER – SME",
  "CERTIFIED RF ENGINEER",
  "CHEMICAL ENGINEERING THERMODYNAMICS",
  "CISCO CERTIFIED NETWORK ASSOCIATE (CCNA)",
  "COMPTIA A+ / NETWORK+ CERTIFICATION",
  "COMPUTATIONAL PHYSICS WITH PYTHON",
  "CREATIVE WRITING",
  "CYBERSECURITY ANALYST",
  "CYBERSECURITY FUNDAMENTALS",
  "DATA SCIENCE FOR PHYSICISTS",
  "DATA SCIENCE MATH SKILLS",
  "DATA STRUCTURES AND ALGORITHMS SPECIALIZATION",
  "DEEP LEARNING SPECIALIZATION",
  "DIGITAL MARKETING SPECIALIZATION",
  "E WASTE RECYCLING BUSINESS",
  "EFFECTIVE COMMUNICATION SKILLS",
  "EMBEDDED SYSTEMS CERTIFICATION",
  "FASHION DESIGN CERTIFICATION",
  "FOOD SAFETY AND STANDARDS (FSSAI CERTIFICATION)",
  "FUNDAMENTALS OF DIGITAL MARKETING",
  "GOOGLE DATA ANALYTICS CERTIFICATE",
  "GOOGLE IT SUPPORT PROFESSIONAL CERTIFICATE",
  "HACCP CERTIFICATION",
  "HARVARD CS50X + BUSINESS STRATEGY",
  "IBM DATA SCIENCE PROFESSIONAL CERTIFICATE",
  "INDUSTRIAL BIOTECHNOLOGY",
  "INDUSTRIAL IOT (IIOT) CERTIFICATION",
  "INTERACTION DESIGN",
  "INTRODUCTION TO FPGA DESIGN FOR EMBEDDED SYSTEMS",
  "INTRODUCTION TO MEDICAL IMAGING",
  "ISO 22000 FOOD SAFETY MANAGEMENT SYSTEM",
  "ITECH METAL ALLOYS",
  "JAVA FOUNDATIONS",
  "JAVA FULL STACK",
  "JAVA SE 17 DEVELOPER",
  "LABVIEW CERTIFICATION",
  "MACHINE LEARNING MATH",
  "MATHEMATICAL THINKING",
  "MATHEMATICS FOR MACHINE LEARNING SPECIALIZATION",
  "MATLAB FOR ELECTRICAL ENGINEERS",
  "MATLAB FOR ROBOTICS & MECHATRONICS",
  "MEDICAL DEVICE REGULATORY AFFAIRS",
  "MEDICAL EQUIPMENT TROUBLESHOOTING",
  "MICROSOFT CERTIFIED: AZURE AI ENGINEER ASSOCIATE",
  "MICROSOFT CERTIFIED: AZURE FUNDAMENTALS / SOLUTIONS ARCHITECT",
  "MYSQL 8.0 DATABASE DEVELOPER",
  "MYSQL IMPLEMENTATION ASSOCIATE",
  "NVIDIA-CERTIFIED GENERATIVE AI LLMS SPECIALIZATION",
  "ORACLE AI VECTOR SEARCH PROFESSIONAL",
  "ORACLE ANALYTICS CLOUD 2025 PROFESSIONAL",
  "ORACLE APEX CLOUD DEVELOPER PROFESSIONAL",
  "ORACLE AUTONOMOUS DATABASE CLOUD 2025 PROFESSIONAL",
  "ORACLE CERTIFIED JAVA PROGRAMMER / PYTHON",
  "ORACLE CLOUD DATABASE SERVICES 2025 PROFESSIONAL",
  "ORACLE CLOUD INFRASTRUCTURE 2025 AI FOUNDATIONS ASSOCIATE",
  "ORACLE CLOUD INFRASTRUCTURE 2025 APPLICATION INTEGRATION PROFESSIONAL",
  "ORACLE CLOUD INFRASTRUCTURE 2025 ARCHITECT ASSOCIATE",
  "ORACLE CLOUD INFRASTRUCTURE 2025 DATA SCIENCE PROFESSIONAL",
  "ORACLE CLOUD INFRASTRUCTURE 2025 DEVELOPER PROFESSIONAL",
  "ORACLE CLOUD INFRASTRUCTURE 2025 DEVOPS PROFESSIONAL",
  "ORACLE CLOUD INFRASTRUCTURE 2025 FOUNDATIONS ASSOCIATE",
  "ORACLE CLOUD INFRASTRUCTURE 2025 MIGRATION ARCHITECT PROFESSIONAL",
  "ORACLE CLOUD INFRASTRUCTURE 2025 MULTICLOUD ARCHITECT PROFESSIONAL",
  "ORACLE CLOUD INFRASTRUCTURE 2025 NETWORKING PROFESSIONAL",
  "ORACLE CLOUD INFRASTRUCTURE 2025 OBSERVABILITY PROFESSIONAL",
  "ORACLE DATA PLATFORM 2025 FOUNDATIONS ASSOCIATE",
  "ORACLE DATABASE PROGRAM WITH PL/SQL",
  "ORACLE DATABASE SQL",
  "ORACLE REDWOOD APPLICATION 2025 DEVELOPER ASSOCIATE",
  "PLC & SCADA AUTOMATION CERTIFICATION",
  "PMP (PROJECT MANAGEMENT PROFESSIONAL) – PMI",
  "POST-HARVEST TECHNOLOGY",
  "POWER SECTOR SKILLS (GREEN ENERGY, SAFETY, POWER, ETC.)",
  "PRECISION AGRICULTURE TECHNOLOGY CERTIFICATE",
  "PROCESS AUTOMATION USING DCS/PLC/SCADA",
  "PROCESS DESIGN AND SIMULATION",
  "PROFESSIONAL CERTIFICATE IN AI & ML",
  "PROJECT MANAGEMENT PROFESSIONAL (PMP)",
  "PYTHON FOR EVERYBODY",
  "PYTHON PROGRAMMING",
  "QUANTUM MECHANICS CERTIFICATION",
  "REMOTE SENSING AND GIS FOR AGRICULTURE",
  "ROBOTICS SPECIALIZATION",
  "SOLAR WATER HEATER COURSE",
  "STAAD PRO / ETABS STRUCTURAL DESIGN CERTIFICATION",
  "SUSTAINABLE FASHION",
  "SUSTAINABLE TEXTILE MANUFACTURING",
  "SUSTAINABLE TEXTILES",
  "TENSORFLOW DEVELOPER CERTIFICATE",
  "TESOL / TEFL CERTIFICATION FOR ENGLISH LANGUAGE TEACHING",
  "TESOL/TOEFL CERTIFICATION",
  "TEXTILE TESTING & QUALITY CONTROL",
  "UI/UX DESIGN SPECIALIZATION",
  "VLSI DESIGN USING CADENCE TOOLS",
  "WINTEX PROCESSING MILLS",
];

const EVENT_LEVEL_OPTIONS = [
  "Select Event Level",
  "State",
  "National (within Tamilnadu)",
  "National (Outside Tamilnadu)",
  "International",
];

const ORGANIZATION_SECTOR_OPTIONS = ["Select Sector", "Private", "Government"];
const EVENT_MODE_OPTIONS = ["Select Mode", "Online", "Offline"];
const EVENT_DURATION_OPTIONS = [
  "Select Duration Type",
  "Months",
  "Weeks",
  "Hours",
  "Days",
];
const SPONSORSHIP_TYPE_OPTIONS = [
  "Select Sponsorship Type",
  "Self",
  "BIT",
  "Funding Agency",
  "Others",
];
const OUTCOME_OPTIONS = [
  "Select Outcome",
  "Programs organized",
  "Development of working Models and prototypes",
  "Funded projects received",
  "Others",
];

type FileField = "apexProof" | "certificateProof" | "geotagPhotos";

interface FormDataShape {
  taskID: string;
  specialLabsInvolved: string;
  specialLabName: string;
  specialLab: string;
  eventType: string;
  otherEventType: string;
  psDomain: string;
  psDomainLevel: string;
  topicName: string;
  organizerType: string;
  industryNameText: string;
  industryAddress: string;
  industryNameSelect: string;
  instituteName: string;
  eventLevel: string;
  eventTitle: string;
  organizationSector: string;
  eventOrganizer: string;
  eventMode: string;
  eventLocation: string;
  eventDuration: string;
  startDate: string;
  endDate: string;
  durationInDays: string;
  otherOrganizerName: string;
  sponsorshipType: string;
  apexProof: File | null;
  fundingAgencyName: string;
  amount: string;
  outcome: string;
  otherOutcome: string;
  certificateProof: File | null;
  geotagPhotos: File | null;
}

export default function EventsAttendedForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormDataShape>({
    taskID: "",
    specialLabsInvolved: "no",
    specialLab: "",
    eventType: "",
    otherEventType: "",
    psDomain: "",
    psDomainLevel: "",
    topicName: "",
    organizerType: "",
    industryNameText: "",
    industryAddress: "",
    industryNameSelect: "",
    instituteName: "",
    eventLevel: "",
    eventTitle: "",
    organizationSector: "",
    eventOrganizer: "",
    eventMode: "",
    eventLocation: "",
    eventDuration: "",
    startDate: "",
    endDate: "",
    durationInDays: "",
    otherOrganizerName: "",
    sponsorshipType: "",
    apexProof: null,
    fundingAgencyName: "",
    amount: "",
    outcome: "",
    otherOutcome: "",
    certificateProof: null,
    geotagPhotos: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState<Record<FileField, boolean>>({
    apexProof: false,
    certificateProof: false,
    geotagPhotos: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "eventType" && value !== "PS-Certification (BIT)") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        psDomain: "",
        psDomainLevel: "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: FileField,
  ) => {
    if (e.target.files && e.target.files[0]) {
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

  const handleDrag = (
    e: React.DragEvent<HTMLDivElement>,
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
    e: React.DragEvent<HTMLDivElement>,
    fieldName: FileField,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [fieldName]: false }));
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
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
    const newErrors: Record<string, string> = {};
    if (!formData.taskID) newErrors.taskID = "Task ID is required";
    if (formData.specialLabsInvolved === "yes" && !formData.specialLab) {
      newErrors.specialLab = "Special Lab is required";
    }
    if (!formData.eventType || formData.eventType === "Select Event Type") {
      newErrors.eventType = "Event Type is required";
    }
    if (formData.eventType === "Other" && !formData.otherEventType) {
      newErrors.otherEventType = "Please specify event type";
    }
    if (formData.eventType === "PS-Certification (BIT)") {
      if (!formData.psDomain || formData.psDomain === "Select PS Domain") {
        newErrors.psDomain = "PS Domain is required";
      }
      if (
        !formData.psDomainLevel ||
        formData.psDomainLevel === "Select Level"
      ) {
        newErrors.psDomainLevel = "PS Domain Level is required";
      }
    }
    if (!formData.topicName) newErrors.topicName = "Topic Name is required";
    if (
      !formData.organizerType ||
      formData.organizerType === "Select Organizer Type"
    ) {
      newErrors.organizerType = "Organizer Type is required";
    }
    if (formData.organizerType === "Industry") {
      if (!formData.industryNameText)
        newErrors.industryNameText = "Industry Name is required";
      if (!formData.industryAddress)
        newErrors.industryAddress = "Industry Address is required";
    }
    if (
      (formData.organizerType === "Foreign Institute" ||
        formData.organizerType === "Institute in India") &&
      !formData.instituteName
    ) {
      newErrors.instituteName = "Institute Name is required";
    }
    if (!formData.eventLevel || formData.eventLevel === "Select Event Level") {
      newErrors.eventLevel = "Event Level is required";
    }
    if (!formData.eventTitle) newErrors.eventTitle = "Event Title is required";
    if (
      !formData.organizationSector ||
      formData.organizationSector === "Select Sector"
    ) {
      newErrors.organizationSector = "Organization Sector is required";
    }
    if (!formData.eventOrganizer)
      newErrors.eventOrganizer = "Event Organizer is required";
    if (!formData.eventMode || formData.eventMode === "Select Mode") {
      newErrors.eventMode = "Event Mode is required";
    }
    if (!formData.eventLocation)
      newErrors.eventLocation = "Event Location is required";
    if (
      !formData.eventDuration ||
      formData.eventDuration === "Select Duration Type"
    ) {
      newErrors.eventDuration = "Event Duration is required";
    }
    if (!formData.startDate) newErrors.startDate = "Start Date is required";
    if (!formData.endDate) newErrors.endDate = "End Date is required";
    if (!formData.durationInDays)
      newErrors.durationInDays = "Duration in days is required";
    if (
      !formData.sponsorshipType ||
      formData.sponsorshipType === "Select Sponsorship Type"
    ) {
      newErrors.sponsorshipType = "Sponsorship Type is required";
    }
    if (
      (formData.sponsorshipType === "Funding Agency" ||
        formData.sponsorshipType === "Others") &&
      !formData.fundingAgencyName
    ){
      newErrors.fundingAgencyName = "Funding Agency / Other name is required";
    }
    if (!formData.outcome || formData.outcome === "Select Outcome") {
      newErrors.outcome = "Outcome is required";
    }
    if (formData.outcome === "Others" && !formData.otherOutcome) {``
      newErrors.otherOutcome = "Please specify outcome";
    }
    if (!formData.certificateProof) {
      newErrors.certificateProof = "Certificate Proof is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fillTestData = () => {
    setFormData({
      taskID: "TASK-EVENTS-001",
      specialLabsInvolved: "no",
      specialLabName: "",
      eventType: "Conference attended-without presentation",
      organizerType: "Institute",
      industryNameSelect: "",
      industryAddress: "",
      instituteName: "Test Institute",
      eventLevel: "National",
      eventTitle: "Test Event",
      organizationSector: "Private",
      eventOrganizer: "Test Organizer",
      eventMode: "Online",
      eventLocation: "Online",
      eventDuration: "DAYS",
      eventDurationValue: "1",
      startDate: "2026-04-16",
      endDate: "2026-04-17",
      durationInDays: "1",
      otherOrganizerName: "",
      sponsorshipType: "Self-Sponsored",
      fundingAgencyName: "",
      amount: "0",
      outcome: "Certificate Received",
      otherOutcome: "",
      certificateProof: null,
      geotagPhotos: null,
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = buildFormData(formData);
      await submitAchievement("events-attended", payload);
      router.push("/achievements/events-attended");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const FileUpload = ({
    fieldName,
    label,
    required = false,
  }: {
    fieldName: FileField;
    label: string;
    required?: boolean;
  }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <RequiredAst />}
      </label>
      <div
        className={`mt-1 flex flex-col items-center justify-center w-full h-32 px-6 pt-5 pb-6 border-2 ${
          errors[fieldName]
            ? "border-red-500"
            : dragActive[fieldName]
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-300"
        } border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors bg-white`}
        onDragEnter={(e) => handleDrag(e, fieldName)}
        onDragLeave={(e) => handleDrag(e, fieldName)}
        onDragOver={(e) => handleDrag(e, fieldName)}
        onDrop={(e) => handleDrop(e, fieldName)}
        onClick={() => document.getElementById(`file-${fieldName}`)?.click()}
      >
        <div className="space-y-1 text-center">
          <UploadCloud
            className={`mx-auto h-10 w-10 ${dragActive[fieldName] ? "text-indigo-600" : "text-slate-400"}`}
          />
          <div className="flex text-sm text-slate-600">
            <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
              <span>Upload a file</span>
              <input
                id={`file-${fieldName}`}
                name={fieldName}
                type="file"
                className="sr-only"
                onChange={(e) => handleFileChange(e, fieldName)}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-slate-500">PDF, JPG, PNG up to 10MB</p>
        </div>
      </div>
      {formData[fieldName] && (
        <div className="mt-2 flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-200">
          <FileText size={16} className="mr-2 flex-shrink-0 text-indigo-600" />
          <span className="font-medium mr-2 truncate">
            {formData[fieldName]?.name}
          </span>
          <span className="text-slate-500 text-xs">
            ({((formData[fieldName]?.size || 0) / 1024 / 1024).toFixed(2)} MB)
          </span>
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
      {errors[fieldName] && (
        <p className="mt-1 text-sm text-red-600">{errors[fieldName]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <Link
            href="/achievements/events-attended"
            className="mr-4 p-2 rounded-full hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Add Events Attended Details
            </h1>
            <p className="text-sm text-slate-500">
              Record events, workshops, seminars and trainings attended
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
                  className={`mt-1 block w-full px-3 py-2 border ${errors.eventType ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                >
                  {EVENT_TYPE_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Select Event Type"}
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
                {formData.eventType === "Other" && (
                  <div className="mt-3">
                    <label
                      htmlFor="otherEventType"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      If Others, Please Specify <RequiredAst />
                    </label>
                    <input
                      type="text"
                      name="otherEventType"
                      id="otherEventType"
                      value={formData.otherEventType}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 border ${errors.otherEventType ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="Specify event type"
                    />
                    {errors.otherEventType && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.otherEventType}
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

            {formData.eventType === "PS-Certification (BIT)" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="psDomain"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    PS Domain <RequiredAst />
                  </label>
                  <select
                    name="psDomain"
                    id="psDomain"
                    value={formData.psDomain}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.psDomain ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  >
                    {PS_DOMAIN_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option}
                        disabled={option === "Select PS Domain"}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.psDomain && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.psDomain}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="psDomainLevel"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    PS Domain - Level <RequiredAst />
                  </label>
                  <select
                    name="psDomainLevel"
                    id="psDomainLevel"
                    value={formData.psDomainLevel}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.psDomainLevel ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  >
                    {PS_DOMAIN_LEVEL_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option}
                        disabled={option === "Select Level"}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.psDomainLevel && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.psDomainLevel}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="organizerType"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Organizer Type <RequiredAst />
                </label>
                <select
                  name="organizerType"
                  id="organizerType"
                  value={formData.organizerType}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.organizerType ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                >
                  {ORGANIZER_TYPE_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Select Organizer Type"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.organizerType && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.organizerType}
                  </p>
                )}
              </div>
              {formData.organizerType === "Others" && (
                <div>
                  <label
                    htmlFor="otherOrganizerName"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Other Organizer Name <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="otherOrganizerName"
                    id="otherOrganizerName"
                    value={formData.otherOrganizerName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter organizer name"
                  />
                </div>
              )}
            </div>

            {formData.organizerType === "Industry" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="industryNameText"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Industry Name (Text) <RequiredAst />
                    </label>
                    <input
                      type="text"
                      name="industryNameText"
                      id="industryNameText"
                      value={formData.industryNameText}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${errors.industryNameText ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="Enter Industry Name"
                    />
                    {errors.industryNameText && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.industryNameText}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="industryAddress"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Address of the Industry <RequiredAst />
                    </label>
                    <input
                      type="text"
                      name="industryAddress"
                      id="industryAddress"
                      value={formData.industryAddress}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${errors.industryAddress ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="Enter Industry Address"
                    />
                    {errors.industryAddress && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.industryAddress}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="industryNameSelect"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Industry Name (Select)
                  </label>
                  <select
                    name="industryNameSelect"
                    id="industryNameSelect"
                    value={formData.industryNameSelect}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    {INDUSTRY_NAME_SELECT_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option}
                        disabled={option === "Select Industry"}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {(formData.organizerType === "Foreign Institute" ||
              formData.organizerType === "Institute in India") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="instituteName"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Mention the name of Institute <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="instituteName"
                    id="instituteName"
                    value={formData.instituteName}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.instituteName ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter Institute Name"
                  />
                  {errors.instituteName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.instituteName}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className={`mt-1 block w-full px-3 py-2 border ${errors.eventLevel ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                >
                  {EVENT_LEVEL_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Select Event Level"}
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
              <div>
                <label
                  htmlFor="eventTitle"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Event Title <RequiredAst />
                </label>
                <input
                  type="text"
                  name="eventTitle"
                  id="eventTitle"
                  value={formData.eventTitle}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.eventTitle ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter Event Title"
                />
                {errors.eventTitle && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.eventTitle}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="organizationSector"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Organization Sector <RequiredAst />
                </label>
                <select
                  name="organizationSector"
                  id="organizationSector"
                  value={formData.organizationSector}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.organizationSector ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                >
                  {ORGANIZATION_SECTOR_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Select Sector"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.organizationSector && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.organizationSector}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="eventOrganizer"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Event Organizer <RequiredAst />
                </label>
                <input
                  type="text"
                  name="eventOrganizer"
                  id="eventOrganizer"
                  value={formData.eventOrganizer}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.eventOrganizer ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter Event Organizer"
                />
                {errors.eventOrganizer && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.eventOrganizer}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="eventMode"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Event Mode <RequiredAst />
                </label>
                <select
                  name="eventMode"
                  id="eventMode"
                  value={formData.eventMode}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.eventMode ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                >
                  {EVENT_MODE_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Select Mode"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.eventMode && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.eventMode}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="eventLocation"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Event Location <RequiredAst />
                </label>
                <input
                  type="text"
                  name="eventLocation"
                  id="eventLocation"
                  value={formData.eventLocation}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.eventLocation ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter Event Location"
                />
                {errors.eventLocation && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.eventLocation}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="eventDuration"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Event Duration <RequiredAst />
                </label>
                <select
                  name="eventDuration"
                  id="eventDuration"
                  value={formData.eventDuration}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.eventDuration ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                >
                  {EVENT_DURATION_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Select Duration Type"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.eventDuration && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.eventDuration}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Start Date <RequiredAst />
                </label>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.startDate ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.startDate}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  End Date <RequiredAst />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="durationInDays"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Duration (in days) <RequiredAst />
                </label>
                <input
                  type="number"
                  name="durationInDays"
                  id="durationInDays"
                  value={formData.durationInDays}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.durationInDays ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter duration in days"
                  min="1"
                />
                {errors.durationInDays && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.durationInDays}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="sponsorshipType"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Type of Sponsorship <RequiredAst />
                </label>
                <select
                  name="sponsorshipType"
                  id="sponsorshipType"
                  value={formData.sponsorshipType}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.sponsorshipType ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                >
                  {SPONSORSHIP_TYPE_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Select Sponsorship Type"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.sponsorshipType && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.sponsorshipType}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Amount, in Rs
                </label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter amount"
                  min="0"
                />
              </div>
            </div>

            {(formData.sponsorshipType === "Funding Agency" ||
              formData.sponsorshipType === "Others") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="fundingAgencyName"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Name of the funding agency or If Others, Please Specify{" "}
                    <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="fundingAgencyName"
                    id="fundingAgencyName"
                    value={formData.fundingAgencyName}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.fundingAgencyName ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter name"
                  />
                  {errors.fundingAgencyName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.fundingAgencyName}
                    </p>
                  )}
                </div>
              </div>
            )}

            <FileUpload
              fieldName="apexProof"
              label="Apex Proof"
              required={false}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="outcome"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Outcome of the attended event <RequiredAst />
                </label>
                <select
                  name="outcome"
                  id="outcome"
                  value={formData.outcome}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.outcome ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                >
                  {OUTCOME_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Select Outcome"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.outcome && (
                  <p className="mt-1 text-sm text-red-600">{errors.outcome}</p>
                )}
                {formData.outcome === "Others" && (
                  <div className="mt-3">
                    <label
                      htmlFor="otherOutcome"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      If Others, Please Specify <RequiredAst />
                    </label>
                    <input
                      type="text"
                      name="otherOutcome"
                      id="otherOutcome"
                      value={formData.otherOutcome}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 border ${errors.otherOutcome ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="Specify outcome"
                    />
                    {errors.otherOutcome && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.otherOutcome}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUpload
                fieldName="certificateProof"
                label="Certificate Proof"
                required={true}
              />
              <FileUpload
                fieldName="geotagPhotos"
                label="Upload Geotag Photos"
                required={false}
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
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Submitting..." : "Save Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
