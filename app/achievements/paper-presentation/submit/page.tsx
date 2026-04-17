"use client";

import { useState, ChangeEvent, DragEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  FileText,
  X,
  Users,
  Building2,
  GraduationCap,
  Award,
} from "lucide-react";

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

const FACULTY_NA_OPTIONS = ["Click to choose", "Faculty", "NA"];
const STUDENT_NA_OPTIONS = ["Click to choose", "Student", "NA"];
const EVENT_MODE_OPTIONS = ["Click to choose", "Online", "Offline"];
const EVENT_ORGANIZER_OPTIONS = [
  "Click to choose",
  "BIT",
  "Industry",
  "Foreign Institute",
  "Institute",
  "Others",
];
const EVENT_LEVEL_OPTIONS = ["Click to choose", "International", "National"];
const SPONSORSHIP_OPTIONS = [
  "Click to choose",
  "Self",
  "BIT",
  "Funding Agency",
  "Others",
];
const YEAR_OF_STUDY_OPTIONS = [
  "Click to choose",
  "First",
  "Second",
  "Third",
  "Fourth",
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

type FormData = {
  taskID: string;
  specialLabsInvolved: "Yes" | "No";
  specialLab: string;
  // BIT Faculty
  otherAuthorsBIT: "Yes" | "No";
  chooseFirstFaculty: string;
  firstFaculty: string;
  chooseSecondFaculty: string;
  secondFaculty: string;
  chooseThirdFaculty: string;
  thirdFaculty: string;
  chooseFourthFaculty: string;
  fourthFaculty: string;
  chooseFifthFaculty: string;
  fifthFaculty: string;
  // External Faculty
  facultyOtherInstitute: "Yes" | "No";
  externalFaculty1: string;
  externalFaculty2: string;
  externalFaculty3: string;
  // Industrial Person
  industrialPersonInvolved: "Yes" | "No";
  industrialPerson1: string;
  industrialPerson2: string;
  industrialPerson3: string;
  // International Collaboration
  internationalCollaboration: "Yes" | "No";
  instituteName: string;
  // Conference
  conferenceName: string;
  eventMode: string;
  eventLocation: string;
  eventOrganizer: string;
  industryOrganizerName: string;
  instituteNameLocation: string;
  eventLevel: string;
  paperTitle: string;
  eventStartDate: string;
  eventEndDate: string;
  eventDurationDays: string;
  // Publication
  publishedInProceedings: "Yes" | "No";
  pageFrom: string;
  pageTo: string;
  // Sponsorship
  typeOfSponsorship: string;
  apexProof: File | null;
  fundingAgencyName: string;
  fundingAmount: string;
  // Students
  studentsInvolved: "Yes" | "No";
  firstStudent: string;
  firstStudentYear: string;
  chooseSecondStudent: string;
  secondStudent: string;
  secondStudentYear: string;
  chooseThirdStudent: string;
  thirdStudent: string;
  thirdStudentYear: string;
  chooseFourthStudent: string;
  fourthStudent: string;
  fourthStudentYear: string;
  chooseFifthStudent: string;
  fifthStudent: string;
  fifthStudentYear: string;
  // Other
  registrationAmount: string;
  documentProof: File | null;
  awardReceived: "Yes" | "No";
  awardProof: File | null;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

interface FileUploadAreaProps {
  fieldName: keyof FormData;
  label: string;
  dragActive: boolean;
  setDragActive: (v: boolean) => void;
  required?: boolean;
  formData: FormData;
  errors: FormErrors;
  onFileChange: (
    e: ChangeEvent<HTMLInputElement>,
    field: keyof FormData,
  ) => void;
  onClear: (field: keyof FormData) => void;
  onDrag: (e: DragEvent<HTMLDivElement>, set: (v: boolean) => void) => void;
  onDrop: (
    e: DragEvent<HTMLDivElement>,
    field: keyof FormData,
    set: (v: boolean) => void,
  ) => void;
}

function FileUploadArea({
  fieldName,
  label,
  dragActive,
  setDragActive,
  required = false,
  formData,
  errors,
  onFileChange,
  onClear,
  onDrag,
  onDrop,
}: FileUploadAreaProps) {
  const file = formData[fieldName] as File | null;
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <RequiredAst />}
      </label>
      <div
        className={`mt-1 flex flex-col items-center justify-center w-full h-32 px-6 pt-5 pb-6 border-2 ${
          errors[fieldName]
            ? "border-red-500"
            : dragActive
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-300"
        } border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors bg-white`}
        onDragEnter={(e) => onDrag(e, setDragActive)}
        onDragLeave={(e) => onDrag(e, setDragActive)}
        onDragOver={(e) => onDrag(e, setDragActive)}
        onDrop={(e) => onDrop(e, fieldName, setDragActive)}
        onClick={() => document.getElementById(`${fieldName}-upload`)?.click()}
      >
        <div className="space-y-1 text-center">
          <UploadCloud
            className={`mx-auto h-10 w-10 ${dragActive ? "text-indigo-600" : "text-slate-400"}`}
          />
          <div className="flex text-sm text-slate-600">
            <label
              htmlFor={`${fieldName}-upload`}
              className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500"
            >
              <span>Upload a file</span>
              <input
                id={`${fieldName}-upload`}
                name={String(fieldName)}
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

export default function PaperPresentationSubmitPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    taskID: "",
    specialLabsInvolved: "No",
    specialLab: "",
    otherAuthorsBIT: "No",
    chooseFirstFaculty: "Click to choose",
    firstFaculty: "",
    chooseSecondFaculty: "Click to choose",
    secondFaculty: "",
    chooseThirdFaculty: "Click to choose",
    thirdFaculty: "",
    chooseFourthFaculty: "Click to choose",
    fourthFaculty: "",
    chooseFifthFaculty: "Click to choose",
    fifthFaculty: "",
    facultyOtherInstitute: "No",
    externalFaculty1: "",
    externalFaculty2: "",
    externalFaculty3: "",
    industrialPersonInvolved: "No",
    industrialPerson1: "",
    industrialPerson2: "",
    industrialPerson3: "",
    internationalCollaboration: "No",
    instituteName: "",
    conferenceName: "",
    eventMode: "Click to choose",
    eventLocation: "",
    eventOrganizer: "Click to choose",
    industryOrganizerName: "",
    instituteNameLocation: "",
    eventLevel: "Click to choose",
    paperTitle: "",
    eventStartDate: "",
    eventEndDate: "",
    eventDurationDays: "",
    publishedInProceedings: "No",
    pageFrom: "",
    pageTo: "",
    typeOfSponsorship: "Click to choose",
    apexProof: null,
    fundingAgencyName: "",
    fundingAmount: "",
    studentsInvolved: "No",
    firstStudent: "",
    firstStudentYear: "Click to choose",
    chooseSecondStudent: "Click to choose",
    secondStudent: "",
    secondStudentYear: "Click to choose",
    chooseThirdStudent: "Click to choose",
    thirdStudent: "",
    thirdStudentYear: "Click to choose",
    chooseFourthStudent: "Click to choose",
    fourthStudent: "",
    fourthStudentYear: "Click to choose",
    chooseFifthStudent: "Click to choose",
    fifthStudent: "",
    fifthStudentYear: "Click to choose",
    registrationAmount: "",
    documentProof: null,
    awardReceived: "No",
    awardProof: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [documentDragActive, setDocumentDragActive] = useState(false);
  const [apexDragActive, setApexDragActive] = useState(false);
  const [awardDragActive, setAwardDragActive] = useState(false);

  // Conditionals
  const showSpecialLab = formData.specialLabsInvolved === "Yes";
  const showOtherAuthorsBIT = formData.otherAuthorsBIT === "Yes";
  const showExternalFaculty = formData.facultyOtherInstitute === "Yes";
  const showIndustrialPerson = formData.industrialPersonInvolved === "Yes";
  const showInstituteName = formData.internationalCollaboration === "Yes";
  const showOrganizerDetails =
    formData.eventOrganizer !== "Click to choose" &&
    formData.eventOrganizer !== "BIT";
  const showPublicationPages = formData.publishedInProceedings === "Yes";
  const showApexProof = formData.typeOfSponsorship === "BIT";
  const showFundingAgency = formData.typeOfSponsorship === "Funding Agency";
  const showStudents = formData.studentsInvolved === "Yes";
  const showAwardProof = formData.awardReceived === "Yes";

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const n = { ...prev };
      delete n[name as keyof FormErrors];
      return n;
    });
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: keyof FormData,
  ) => {
    if (e.target.files?.[0]) {
      setFormData((prev) => ({ ...prev, [field]: e.target.files![0] }));
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  const clearFile = (field: keyof FormData) =>
    setFormData((prev) => ({ ...prev, [field]: null }));

  const handleDrag = (
    e: DragEvent<HTMLDivElement>,
    set: (v: boolean) => void,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    set(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (
    e: DragEvent<HTMLDivElement>,
    field: keyof FormData,
    set: (v: boolean) => void,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    set(false);
    if (e.dataTransfer.files?.[0]) {
      setFormData((prev) => ({ ...prev, [field]: e.dataTransfer.files[0] }));
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  const validate = () => {
    const e: FormErrors = {};
    if (!formData.taskID) e.taskID = "Task ID is required";
    if (showSpecialLab && !formData.specialLab)
      e.specialLab = "Special Lab is required";

    if (showOtherAuthorsBIT) {
      if (formData.chooseFirstFaculty === "Faculty" && !formData.firstFaculty)
        e.firstFaculty = "First Faculty is required";
      if (formData.chooseSecondFaculty === "Faculty" && !formData.secondFaculty)
        e.secondFaculty = "Second Faculty is required";
      if (formData.chooseThirdFaculty === "Faculty" && !formData.thirdFaculty)
        e.thirdFaculty = "Third Faculty is required";
      if (formData.chooseFourthFaculty === "Faculty" && !formData.fourthFaculty)
        e.fourthFaculty = "Fourth Faculty is required";
      if (formData.chooseFifthFaculty === "Faculty" && !formData.fifthFaculty)
        e.fifthFaculty = "Fifth Faculty is required";
    }

    if (showInstituteName && !formData.instituteName)
      e.instituteName = "Institute Name is required";

    if (!formData.conferenceName)
      e.conferenceName = "Conference Name is required";
    if (formData.eventMode === "Click to choose")
      e.eventMode = "Event Mode is required";
    if (formData.eventOrganizer === "Click to choose")
      e.eventOrganizer = "Event Organizer is required";

    if (showOrganizerDetails) {
      if (
        (formData.eventOrganizer === "Industry" ||
          formData.eventOrganizer === "Others") &&
        !formData.industryOrganizerName
      ) {
        e.industryOrganizerName = "Industry/Organizer Name is required";
      }
      if (
        (formData.eventOrganizer === "Institute" ||
          formData.eventOrganizer === "Foreign Institute") &&
        !formData.instituteNameLocation
      ) {
        e.instituteNameLocation = "Institute Name & Location is required";
      }
    }

    if (formData.eventLevel === "Click to choose")
      e.eventLevel = "Event Level is required";
    if (!formData.paperTitle) e.paperTitle = "Paper Title is required";
    if (!formData.eventStartDate) e.eventStartDate = "Start Date is required";
    if (!formData.eventEndDate) e.eventEndDate = "End Date is required";
    if (!formData.eventDurationDays)
      e.eventDurationDays = "Duration is required";

    if (showPublicationPages) {
      if (!formData.pageFrom) e.pageFrom = "Page From is required";
      if (!formData.pageTo) e.pageTo = "Page To is required";
    }

    if (formData.typeOfSponsorship === "Click to choose")
      e.typeOfSponsorship = "Type of Sponsorship is required";
    if (showApexProof && !formData.apexProof)
      e.apexProof = "Apex Proof is required";
    if (showFundingAgency) {
      if (!formData.fundingAgencyName)
        e.fundingAgencyName = "Funding Agency Name is required";
      if (!formData.fundingAmount)
        e.fundingAmount = "Funding Amount is required";
    }

    if (showStudents) {
      if (!formData.firstStudent) e.firstStudent = "First Student is required";
      if (formData.firstStudentYear === "Click to choose")
        e.firstStudentYear = "Year of Study is required";
      if (formData.chooseSecondStudent === "Student") {
        if (!formData.secondStudent)
          e.secondStudent = "Second Student is required";
        if (formData.secondStudentYear === "Click to choose")
          e.secondStudentYear = "Year of Study is required";
      }
      if (formData.chooseThirdStudent === "Student") {
        if (!formData.thirdStudent)
          e.thirdStudent = "Third Student is required";
        if (formData.thirdStudentYear === "Click to choose")
          e.thirdStudentYear = "Year of Study is required";
      }
      if (formData.chooseFourthStudent === "Student") {
        if (!formData.fourthStudent)
          e.fourthStudent = "Fourth Student is required";
        if (formData.fourthStudentYear === "Click to choose")
          e.fourthStudentYear = "Year of Study is required";
      }
      if (formData.chooseFifthStudent === "Student") {
        if (!formData.fifthStudent)
          e.fifthStudent = "Fifth Student is required";
        if (formData.fifthStudentYear === "Click to choose")
          e.fifthStudentYear = "Year of Study is required";
      }
    }

    if (!formData.documentProof) e.documentProof = "Document Proof is required";
    if (showAwardProof && !formData.awardProof)
      e.awardProof = "Award Proof is required";

    if (formData.eventStartDate && formData.eventEndDate) {
      if (new Date(formData.eventEndDate) < new Date(formData.eventStartDate)) {
        e.eventEndDate = "End Date cannot be before Start Date";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const fillTestData = () => {
    setFormData({
      taskID: "TASK-PAPER-001",
      specialLabsInvolved: "no",
      specialLab: "",
      hasIntlInstituteCollab: "no",
      instituteName: "",
      conferenceName: "Test Conference",
      eventMode: "Online",
      eventLocation: "Online",
      eventOrganizer: "Test Organizer",
      eventLevel: "National",
      paperTitle: "Test Paper",
      eventStartDate: "2026-04-16",
      eventEndDate: "2026-04-17",
      eventDurationDays: "2",
      publishedInProceedings: "no",
      pageFrom: "1",
      pageTo: "5",
      typeOfSponsorship: "Self-Sponsored",
      fundingAgencyName: "",
      fundingAmount: "0",
      registrationAmount: "0",
      awardReceived: "no",
      apexProof: null,
      documentProof: null,
      awardProof: null,
    });
    setErrors({});
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload = buildFormData(formData);
      await submitAchievement("paper-presentation", payload);
      router.push("/achievements/paper-presentation");
    } catch (err) {
      console.error(err);
      alert("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadProps = {
    formData,
    errors,
    onFileChange: handleFileChange,
    onClear: clearFile,
    onDrag: handleDrag,
    onDrop: handleDrop,
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
              Add Paper Presentation Details
            </h1>
            <p className="text-sm text-slate-500">
              Create record for Paper Presentations in Conferences
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
            {/* Task ID & Special Labs */}
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
                <div className="mt-1 flex space-x-4">
                  {(["Yes", "No"] as const).map((v) => (
                    <label key={v} className="flex items-center">
                      <input
                        type="radio"
                        name="specialLabsInvolved"
                        value={v}
                        checked={formData.specialLabsInvolved === v}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span className="ml-2 text-sm text-slate-700">{v}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {showSpecialLab && (
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
                    {SPECIAL_LAB_OPTIONS.map((o) => (
                      <option
                        key={o}
                        value={o === "Select Special Lab" ? "" : o}
                        disabled={o === "Select Special Lab"}
                      >
                        {o}
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

            {/* BIT Faculty Authors Section */}
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-indigo-600" />
                BIT Faculty Authors
              </h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Other Authors from BIT <RequiredAst />
                </label>
                <div className="mt-1 flex space-x-4">
                  {(["Yes", "No"] as const).map((v) => (
                    <label key={v} className="flex items-center">
                      <input
                        type="radio"
                        name="otherAuthorsBIT"
                        value={v}
                        checked={formData.otherAuthorsBIT === v}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span className="ml-2 text-sm text-slate-700">{v}</span>
                    </label>
                  ))}
                </div>
              </div>

              {showOtherAuthorsBIT && (
                <div className="space-y-4">
                  {(
                    [
                      {
                        choose: "chooseFirstFaculty",
                        name: "firstFaculty",
                        label: "First",
                      },
                      {
                        choose: "chooseSecondFaculty",
                        name: "secondFaculty",
                        label: "Second",
                      },
                      {
                        choose: "chooseThirdFaculty",
                        name: "thirdFaculty",
                        label: "Third",
                      },
                      {
                        choose: "chooseFourthFaculty",
                        name: "fourthFaculty",
                        label: "Fourth",
                      },
                      {
                        choose: "chooseFifthFaculty",
                        name: "fifthFaculty",
                        label: "Fifth",
                      },
                    ] as {
                      choose: keyof FormData;
                      name: keyof FormData;
                      label: string;
                    }[]
                  ).map(({ choose, name, label }) => (
                    <div
                      key={label}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Choose {label} Faculty
                        </label>
                        <select
                          name={choose as string}
                          value={formData[choose] as string}
                          onChange={handleChange}
                          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          {FACULTY_NA_OPTIONS.map((o) => (
                            <option
                              key={o}
                              value={o}
                              disabled={o === "Click to choose"}
                            >
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      {formData[choose] === "Faculty" && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            {label} Faculty <RequiredAst />
                          </label>
                          <input
                            type="text"
                            name={name as string}
                            value={formData[name] as string}
                            onChange={handleChange}
                            className={`mt-1 block w-full px-3 py-2 border ${errors[name] ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                            placeholder="Enter Faculty Name"
                          />
                          {errors[name] && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors[name]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* External Faculty & Industry */}
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-indigo-600" />
                External Faculty & Industry
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Faculty Member from Other Institute <RequiredAst />
                  </label>
                  <div className="mt-1 flex space-x-4">
                    {(["Yes", "No"] as const).map((v) => (
                      <label key={v} className="flex items-center">
                        <input
                          type="radio"
                          name="facultyOtherInstitute"
                          value={v}
                          checked={formData.facultyOtherInstitute === v}
                          onChange={handleChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                        <span className="ml-2 text-sm text-slate-700">{v}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Whether Industrial Person Involved <RequiredAst />
                  </label>
                  <div className="mt-1 flex space-x-4">
                    {(["Yes", "No"] as const).map((v) => (
                      <label key={v} className="flex items-center">
                        <input
                          type="radio"
                          name="industrialPersonInvolved"
                          value={v}
                          checked={formData.industrialPersonInvolved === v}
                          onChange={handleChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                        <span className="ml-2 text-sm text-slate-700">{v}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {showExternalFaculty && (
                <div className="space-y-4 mt-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n}>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        External Faculty {n} (Faculty name & Institution)
                      </label>
                      <input
                        type="text"
                        name={`externalFaculty${n}`}
                        value={
                          formData[
                            `externalFaculty${n}` as keyof FormData
                          ] as string
                        }
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder={`e.g., Dr. Name, Institute ${n}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {showIndustrialPerson && (
                <div className="space-y-4 mt-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n}>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Name of the person {n} & Industry name
                      </label>
                      <input
                        type="text"
                        name={`industrialPerson${n}`}
                        value={
                          formData[
                            `industrialPerson${n}` as keyof FormData
                          ] as string
                        }
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder={`e.g., Name, Company ${n}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* International Collaboration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Collaboration with any International Institute / University{" "}
                  <RequiredAst />
                </label>
                <div className="mt-1 flex space-x-4">
                  {(["Yes", "No"] as const).map((v) => (
                    <label key={v} className="flex items-center">
                      <input
                        type="radio"
                        name="internationalCollaboration"
                        value={v}
                        checked={formData.internationalCollaboration === v}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span className="ml-2 text-sm text-slate-700">{v}</span>
                    </label>
                  ))}
                </div>
              </div>
              {showInstituteName && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Institute Name <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="instituteName"
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
              )}
            </div>

            {/* Conference Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="conferenceName"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Name of Conference <RequiredAst />
                </label>
                <input
                  type="text"
                  name="conferenceName"
                  id="conferenceName"
                  value={formData.conferenceName}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.conferenceName ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter Conference Name"
                />
                {errors.conferenceName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.conferenceName}
                  </p>
                )}
              </div>
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
                  {EVENT_MODE_OPTIONS.map((o) => (
                    <option
                      key={o}
                      value={o}
                      disabled={o === "Click to choose"}
                    >
                      {o}
                    </option>
                  ))}
                </select>
                {errors.eventMode && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.eventMode}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="eventLocation"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Event Location
                </label>
                <input
                  type="text"
                  name="eventLocation"
                  id="eventLocation"
                  value={formData.eventLocation}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Event Location"
                />
              </div>
              <div>
                <label
                  htmlFor="eventOrganizer"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Event Organizer <RequiredAst />
                </label>
                <select
                  name="eventOrganizer"
                  id="eventOrganizer"
                  value={formData.eventOrganizer}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.eventOrganizer ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                >
                  {EVENT_ORGANIZER_OPTIONS.map((o) => (
                    <option
                      key={o}
                      value={o}
                      disabled={o === "Click to choose"}
                    >
                      {o}
                    </option>
                  ))}
                </select>
                {errors.eventOrganizer && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.eventOrganizer}
                  </p>
                )}
              </div>
            </div>

            {showOrganizerDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(formData.eventOrganizer === "Industry" ||
                  formData.eventOrganizer === "Others") && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Name of the Industry / Organizer Name <RequiredAst />
                    </label>
                    <input
                      type="text"
                      name="industryOrganizerName"
                      value={formData.industryOrganizerName}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${errors.industryOrganizerName ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="Enter Industry/Organizer Name"
                    />
                    {errors.industryOrganizerName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.industryOrganizerName}
                      </p>
                    )}
                  </div>
                )}
                {(formData.eventOrganizer === "Institute" ||
                  formData.eventOrganizer === "Foreign Institute") && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Name of the Institute & Location <RequiredAst />
                    </label>
                    <input
                      type="text"
                      name="instituteNameLocation"
                      value={formData.instituteNameLocation}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${errors.instituteNameLocation ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="Enter Institute Name & Location"
                    />
                    {errors.instituteNameLocation && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.instituteNameLocation}
                      </p>
                    )}
                  </div>
                )}
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
                  {EVENT_LEVEL_OPTIONS.map((o) => (
                    <option
                      key={o}
                      value={o}
                      disabled={o === "Click to choose"}
                    >
                      {o}
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
                  htmlFor="paperTitle"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Paper Title <RequiredAst />
                </label>
                <input
                  type="text"
                  name="paperTitle"
                  id="paperTitle"
                  value={formData.paperTitle}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.paperTitle ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter Paper Title"
                />
                {errors.paperTitle && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.paperTitle}
                  </p>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="eventStartDate"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Event Start Date <RequiredAst />
                </label>
                <input
                  type="date"
                  name="eventStartDate"
                  id="eventStartDate"
                  value={formData.eventStartDate}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.eventStartDate ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.eventStartDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.eventStartDate}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="eventEndDate"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Event End Date <RequiredAst />
                </label>
                <input
                  type="date"
                  name="eventEndDate"
                  id="eventEndDate"
                  value={formData.eventEndDate}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.eventEndDate ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.eventEndDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.eventEndDate}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="eventDurationDays"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Event Duration (Days) <RequiredAst />
                </label>
                <input
                  type="number"
                  name="eventDurationDays"
                  id="eventDurationDays"
                  value={formData.eventDurationDays}
                  onChange={handleChange}
                  min="1"
                  className={`mt-1 block w-full px-3 py-2 border ${errors.eventDurationDays ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="e.g., 2"
                />
                {errors.eventDurationDays && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.eventDurationDays}
                  </p>
                )}
              </div>
            </div>

            {/* Publication */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Paper Published in Conference Proceedings <RequiredAst />
                </label>
                <div className="mt-1 flex space-x-4">
                  {(["Yes", "No"] as const).map((v) => (
                    <label key={v} className="flex items-center">
                      <input
                        type="radio"
                        name="publishedInProceedings"
                        value={v}
                        checked={formData.publishedInProceedings === v}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span className="ml-2 text-sm text-slate-700">{v}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {showPublicationPages && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Page From <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="pageFrom"
                    value={formData.pageFrom}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.pageFrom ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="e.g., 1"
                  />
                  {errors.pageFrom && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.pageFrom}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Page To <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="pageTo"
                    value={formData.pageTo}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.pageTo ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="e.g., 10"
                  />
                  {errors.pageTo && (
                    <p className="mt-1 text-sm text-red-600">{errors.pageTo}</p>
                  )}
                </div>
              </div>
            )}

            {/* Sponsorship */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="typeOfSponsorship"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Type of Sponsorship <RequiredAst />
                </label>
                <select
                  name="typeOfSponsorship"
                  id="typeOfSponsorship"
                  value={formData.typeOfSponsorship}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.typeOfSponsorship ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                >
                  {SPONSORSHIP_OPTIONS.map((o) => (
                    <option
                      key={o}
                      value={o}
                      disabled={o === "Click to choose"}
                    >
                      {o}
                    </option>
                  ))}
                </select>
                {errors.typeOfSponsorship && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.typeOfSponsorship}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="registrationAmount"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Registration Amount (in Rs.)
                </label>
                <input
                  type="number"
                  name="registrationAmount"
                  id="registrationAmount"
                  value={formData.registrationAmount}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., 5000"
                />
              </div>
            </div>

            {showApexProof && (
              <FileUploadArea
                fieldName="apexProof"
                label="Apex Proof"
                dragActive={apexDragActive}
                setDragActive={setApexDragActive}
                required
                {...uploadProps}
              />
            )}

            {showFundingAgency && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Name of the Funding Agency <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="fundingAgencyName"
                    value={formData.fundingAgencyName}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.fundingAgencyName ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter Funding Agency Name"
                  />
                  {errors.fundingAgencyName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.fundingAgencyName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Amount (in Rs.) <RequiredAst />
                  </label>
                  <input
                    type="number"
                    name="fundingAmount"
                    value={formData.fundingAmount}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.fundingAmount ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter Amount"
                  />
                  {errors.fundingAmount && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.fundingAmount}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Students Section */}
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-indigo-600" />
                Students Involved
              </h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Students Involved <RequiredAst />
                </label>
                <div className="mt-1 flex space-x-4">
                  {(["Yes", "No"] as const).map((v) => (
                    <label key={v} className="flex items-center">
                      <input
                        type="radio"
                        name="studentsInvolved"
                        value={v}
                        checked={formData.studentsInvolved === v}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span className="ml-2 text-sm text-slate-700">{v}</span>
                    </label>
                  ))}
                </div>
              </div>

              {showStudents && (
                <div className="space-y-4">
                  {/* First Student – always required when students involved */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        First Student <RequiredAst />
                      </label>
                      <input
                        type="text"
                        name="firstStudent"
                        value={formData.firstStudent}
                        onChange={handleChange}
                        className={`mt-1 block w-full px-3 py-2 border ${errors.firstStudent ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        placeholder="Enter Student Name"
                      />
                      {errors.firstStudent && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.firstStudent}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        First Student Year of Study <RequiredAst />
                      </label>
                      <select
                        name="firstStudentYear"
                        value={formData.firstStudentYear}
                        onChange={handleChange}
                        className={`mt-1 block w-full px-3 py-2 border ${errors.firstStudentYear ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      >
                        {YEAR_OF_STUDY_OPTIONS.map((o) => (
                          <option
                            key={o}
                            value={o}
                            disabled={o === "Click to choose"}
                          >
                            {o}
                          </option>
                        ))}
                      </select>
                      {errors.firstStudentYear && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.firstStudentYear}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 2nd – 5th Students */}
                  {(
                    [
                      {
                        choose: "chooseSecondStudent",
                        name: "secondStudent",
                        year: "secondStudentYear",
                        label: "Second",
                      },
                      {
                        choose: "chooseThirdStudent",
                        name: "thirdStudent",
                        year: "thirdStudentYear",
                        label: "Third",
                      },
                      {
                        choose: "chooseFourthStudent",
                        name: "fourthStudent",
                        year: "fourthStudentYear",
                        label: "Fourth",
                      },
                      {
                        choose: "chooseFifthStudent",
                        name: "fifthStudent",
                        year: "fifthStudentYear",
                        label: "Fifth",
                      },
                    ] as {
                      choose: keyof FormData;
                      name: keyof FormData;
                      year: keyof FormData;
                      label: string;
                    }[]
                  ).map(({ choose, name, year, label }) => (
                    <div
                      key={label}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Choose {label} Student
                        </label>
                        <select
                          name={choose as string}
                          value={formData[choose] as string}
                          onChange={handleChange}
                          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          {STUDENT_NA_OPTIONS.map((o) => (
                            <option
                              key={o}
                              value={o}
                              disabled={o === "Click to choose"}
                            >
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      {formData[choose] === "Student" && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Student <RequiredAst />
                            </label>
                            <input
                              type="text"
                              name={name as string}
                              value={formData[name] as string}
                              onChange={handleChange}
                              className={`mt-1 block w-full px-3 py-2 border ${errors[name] ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                              placeholder="Enter Student Name"
                            />
                            {errors[name] && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors[name]}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Year of Study <RequiredAst />
                            </label>
                            <select
                              name={year as string}
                              value={formData[year] as string}
                              onChange={handleChange}
                              className={`mt-1 block w-full px-3 py-2 border ${errors[year] ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                            >
                              {YEAR_OF_STUDY_OPTIONS.map((o) => (
                                <option
                                  key={o}
                                  value={o}
                                  disabled={o === "Click to choose"}
                                >
                                  {o}
                                </option>
                              ))}
                            </select>
                            {errors[year] && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors[year]}
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Document Proof */}
            <FileUploadArea
              fieldName="documentProof"
              label="Document Proof (Certificate & Proceeding page if applicable)"
              dragActive={documentDragActive}
              setDragActive={setDocumentDragActive}
              required
              {...uploadProps}
            />

            {/* Award Section */}
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Award className="h-5 w-5 mr-2 text-indigo-600" />
                Award Information
              </h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Award / Cash / Prize received <RequiredAst />
                </label>
                <div className="mt-1 flex space-x-4">
                  {(["Yes", "No"] as const).map((v) => (
                    <label key={v} className="flex items-center">
                      <input
                        type="radio"
                        name="awardReceived"
                        value={v}
                        checked={formData.awardReceived === v}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span className="ml-2 text-sm text-slate-700">{v}</span>
                    </label>
                  ))}
                </div>
              </div>
              {showAwardProof && (
                <FileUploadArea
                  fieldName="awardProof"
                  label="Award Proof"
                  dragActive={awardDragActive}
                  setDragActive={setAwardDragActive}
                  required
                  {...uploadProps}
                />
              )}
            </div>

            {/* Actions */}
            <div className="pt-5 flex items-center justify-end space-x-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Paper Presentation"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
