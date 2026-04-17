"use client";

import { useState, ChangeEvent, DragEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, UploadCloud, FileText, X } from "lucide-react";
import { buildFormData, submitAchievement } from "../../facultyActivitiesApi";

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

const MODE_OF_COURSE_OPTIONS = [
  "Click to choose",
  "Online",
  "Offline",
  "Hybrid",
];

const COURSE_TYPE_OPTIONS = [
  "Click to choose",
  "AICTE",
  "CEC",
  "CISCO",
  "COURSERA",
  "edX",
  "GOOGLE",
  "IBM",
  "IGNOU",
  "IIMB",
  "INI",
  "NITTTR",
  "MICROSOFT",
  "NMEICT",
  "NPTEL",
  "SWAYAM",
  "ICMR",
  "UDEMY",
  "UGC",
  "AICTE QIP PG certificate Programme",
  "AI Infinity",
  "Oracle",
  "Other",
];

const TYPE_OF_ORGANIZER_OPTIONS = ["Click to choose", "Private", "Government"];

const LEVEL_OF_EVENT_OPTIONS = [
  "Click to choose",
  "State",
  "National",
  "International",
];

const DURATION_OPTIONS = ["Click to choose", "Hours", "Weeks", "Days"];

const COURSE_CATEGORY_OPTIONS = [
  "Click to choose",
  "Proctored-Exam",
  "Self-paced with final assessment",
  "Self-paced without final assessment",
];

const TYPE_OF_SPONSORSHIP_OPTIONS = [
  "Click to choose",
  "Self",
  "BIT",
  "Funding Agency",
];

const CLAIMED_FOR_OPTIONS = [
  "Click to choose",
  "FAP",
  "Competency",
  "Not-Applicable",
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
  specialLabsInvolved: "yes" | "no";
  specialLab: string;
  modeOfCourse: string;
  courseType: string;
  otherCourseType: string;
  typeOfOrganizer: string;
  courseName: string;
  organizationName: string;
  organizationAddress: string;
  levelOfEvent: string;
  duration: string;
  numberOfHours: string;
  numberOfWeeks: string;
  numberOfDays: string;
  startDate: string;
  endDate: string;
  courseCategory: string;
  dateOfExamination: string;
  gradeObtained: string;
  markSheetProof: File | null;
  isApprovedFDP: "yes" | "no";
  fdpProof: File | null;
  typeOfSponsorship: string;
  apexProof: File | null;
  fundingAgencyName: string;
  certificateProof: File | null;
  claimedFor: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function OnlineCourseSubmitPage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    taskID: "",
    specialLabsInvolved: "no",
    specialLab: "",
    modeOfCourse: "Click to choose",
    courseType: "Click to choose",
    otherCourseType: "",
    typeOfOrganizer: "Click to choose",
    courseName: "",
    organizationName: "",
    organizationAddress: "",
    levelOfEvent: "Click to choose",
    duration: "Click to choose",
    numberOfHours: "",
    numberOfWeeks: "",
    numberOfDays: "",
    startDate: "",
    endDate: "",
    courseCategory: "Click to choose",
    dateOfExamination: "",
    gradeObtained: "",
    markSheetProof: null,
    isApprovedFDP: "no",
    fdpProof: null,
    typeOfSponsorship: "Click to choose",
    apexProof: null,
    fundingAgencyName: "",
    certificateProof: null,
    claimedFor: "Click to choose",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [markSheetDragActive, setMarkSheetDragActive] = useState(false);
  const [fdpDragActive, setFdpDragActive] = useState(false);
  const [apexDragActive, setApexDragActive] = useState(false);
  const [certDragActive, setCertDragActive] = useState(false);

  const showSpecialLab = formData.specialLabsInvolved === "yes";
  const showOtherCourseType = formData.courseType === "Other";
  const showNumberOfHours = formData.duration === "Hours";
  const showNumberOfWeeks = formData.duration === "Weeks";
  const showNumberOfDays = formData.duration === "Days";
  const showExamFields =
    formData.courseCategory === "Proctored-Exam" ||
    formData.courseCategory === "Self-paced with final assessment";
  const showFDPProof = formData.isApprovedFDP === "yes";
  const showApexProof = formData.typeOfSponsorship === "BIT";
  const showFundingAgencyName = formData.typeOfSponsorship === "Funding Agency";

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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
    fieldName: keyof FormData,
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

  const clearFile = (fieldName: keyof FormData) => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
  };

  const handleDrag = (
    e: DragEvent<HTMLDivElement>,
    setDragActiveState: (value: boolean) => void,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveState(true);
    } else if (e.type === "dragleave") {
      setDragActiveState(false);
    }
  };

  const handleDrop = (
    e: DragEvent<HTMLDivElement>,
    fieldName: keyof FormData,
    setDragActiveState: (value: boolean) => void,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveState(false);
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
    const nextErrors: FormErrors = {};

    if (!formData.taskID) nextErrors.taskID = "Task ID is required";

    if (showSpecialLab && !formData.specialLab) {
      nextErrors.specialLab = "Special Lab is required";
    }

    if (!formData.modeOfCourse || formData.modeOfCourse === "Click to choose") {
      nextErrors.modeOfCourse = "Mode of Course is required";
    }

    if (!formData.courseType || formData.courseType === "Click to choose") {
      nextErrors.courseType = "Course Type is required";
    }
    if (showOtherCourseType && !formData.otherCourseType) {
      nextErrors.otherCourseType = "Please specify Course Type";
    }

    if (
      !formData.typeOfOrganizer ||
      formData.typeOfOrganizer === "Click to choose"
    ) {
      nextErrors.typeOfOrganizer = "Type of Organizer is required";
    }

    if (!formData.courseName) nextErrors.courseName = "Course Name is required";
    if (!formData.organizationName) {
      nextErrors.organizationName = "Organization Name is required";
    }
    if (!formData.organizationAddress) {
      nextErrors.organizationAddress = "Organization Address is required";
    }
    if (!formData.levelOfEvent || formData.levelOfEvent === "Click to choose") {
      nextErrors.levelOfEvent = "Level of Event is required";
    }
    if (!formData.duration || formData.duration === "Click to choose") {
      nextErrors.duration = "Duration is required";
    }
    if (showNumberOfHours && !formData.numberOfHours) {
      nextErrors.numberOfHours = "Number of Hours is required";
    }
    if (showNumberOfWeeks && !formData.numberOfWeeks) {
      nextErrors.numberOfWeeks = "Number of Weeks is required";
    }
    if (showNumberOfDays && !formData.numberOfDays) {
      nextErrors.numberOfDays = "Number of Days is required";
    }

    if (!formData.startDate) nextErrors.startDate = "Start Date is required";
    if (!formData.endDate) nextErrors.endDate = "End Date is required";

    if (
      !formData.courseCategory ||
      formData.courseCategory === "Click to choose"
    ) {
      nextErrors.courseCategory = "Course Category is required";
    }

    if (showExamFields) {
      if (!formData.dateOfExamination) {
        nextErrors.dateOfExamination = "Date of Examination is required";
      }
      if (!formData.gradeObtained) {
        nextErrors.gradeObtained = "Grade Obtained is required";
      }
      if (!formData.markSheetProof) {
        nextErrors.markSheetProof = "Mark Sheet Proof is required";
      }
    }

    if (showFDPProof && !formData.fdpProof) {
      nextErrors.fdpProof = "FDP Proof is required";
    }

    if (
      !formData.typeOfSponsorship ||
      formData.typeOfSponsorship === "Click to choose"
    ) {
      nextErrors.typeOfSponsorship = "Type of Sponsorship is required";
    }
    if (showApexProof && !formData.apexProof) {
      nextErrors.apexProof = "Apex Proof is required";
    }
    if (showFundingAgencyName && !formData.fundingAgencyName) {
      nextErrors.fundingAgencyName = "Name of the Funding Agency is required";
    }

    if (!formData.certificateProof) {
      nextErrors.certificateProof = "Certificate Proof is required";
    }

    if (!formData.claimedFor || formData.claimedFor === "Click to choose") {
      nextErrors.claimedFor = "Claimed For is required";
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        nextErrors.endDate = "End Date cannot be before Start Date";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const fillTestData = () => {
    setFormData({
      taskID: "TASK-ONLINE-001",
      modeOfCourse: "Online",
      courseType: "NPTEL",
      courseName: "Testing Course",
      organizationName: "Test Organization",
      organizationAddress: "123 Test Street",
      levelOfEvent: "National",
      duration: "Hours",
      numberOfHours: "10",
      numberOfWeeks: "",
      numberOfDays: "",
      startDate: "2026-04-16",
      endDate: "2026-04-20",
      courseCategory: "Proctored-Exam",
      dateOfExamination: "2026-05-01",
      gradeObtained: "A",
      isApprovedFDP: "no",
      typeOfSponsorship: "Self-Sponsored",
      fundingAgencyName: "",
      claimedFor: "Not-Applicable",
      marksheetProof: null,
      fdpProof: null,
      apexProof: null,
      certificateProof: null,
    });
    setErrors({});
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = buildFormData(formData);
      await submitAchievement("online-course", payload);
      router.push("/achievements/online-course");
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
              Add Online Course Details
            </h1>
            <p className="text-sm text-slate-500">
              Create record for Online Courses completed
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
                <div className="mt-1 flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="specialLabsInvolved"
                      value="yes"
                      checked={formData.specialLabsInvolved === "yes"}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="ml-2 text-sm text-slate-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="specialLabsInvolved"
                      value="no"
                      checked={formData.specialLabsInvolved === "no"}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="ml-2 text-sm text-slate-700">No</span>
                  </label>
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
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="modeOfCourse"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Mode of Course <RequiredAst />
                </label>
                <select
                  name="modeOfCourse"
                  id="modeOfCourse"
                  value={formData.modeOfCourse}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.modeOfCourse ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                >
                  {MODE_OF_COURSE_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Click to choose"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.modeOfCourse && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.modeOfCourse}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="courseType"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Course Type <RequiredAst />
                </label>
                <select
                  name="courseType"
                  id="courseType"
                  value={formData.courseType}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.courseType ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                >
                  {COURSE_TYPE_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Click to choose"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.courseType && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.courseType}
                  </p>
                )}

                {showOtherCourseType && (
                  <div className="mt-2">
                    <input
                      type="text"
                      name="otherCourseType"
                      value={formData.otherCourseType}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 border ${errors.otherCourseType ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="Specify Course Type"
                    />
                    {errors.otherCourseType && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.otherCourseType}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="courseName"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Course Name <RequiredAst />
                </label>
                <input
                  type="text"
                  name="courseName"
                  id="courseName"
                  value={formData.courseName}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.courseName ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter Course Name"
                />
                {errors.courseName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.courseName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="typeOfOrganizer"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Type of Organizer <RequiredAst />
                </label>
                <select
                  name="typeOfOrganizer"
                  id="typeOfOrganizer"
                  value={formData.typeOfOrganizer}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.typeOfOrganizer ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                >
                  {TYPE_OF_ORGANIZER_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Click to choose"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.typeOfOrganizer && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.typeOfOrganizer}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="organizationName"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Organization Name <RequiredAst />
                </label>
                <input
                  type="text"
                  name="organizationName"
                  id="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.organizationName ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter Organization Name"
                />
                {errors.organizationName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.organizationName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="organizationAddress"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Organization Address <RequiredAst />
                </label>
                <input
                  type="text"
                  name="organizationAddress"
                  id="organizationAddress"
                  value={formData.organizationAddress}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.organizationAddress ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter Address"
                />
                {errors.organizationAddress && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.organizationAddress}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="levelOfEvent"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Level of Event <RequiredAst />
                </label>
                <select
                  name="levelOfEvent"
                  id="levelOfEvent"
                  value={formData.levelOfEvent}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.levelOfEvent ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                >
                  {LEVEL_OF_EVENT_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Click to choose"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.levelOfEvent && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.levelOfEvent}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Duration <RequiredAst />
                </label>
                <select
                  name="duration"
                  id="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.duration ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                >
                  {DURATION_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Click to choose"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                )}

                {showNumberOfHours && (
                  <div className="mt-3">
                    <label
                      htmlFor="numberOfHours"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Number of Hours <RequiredAst />
                    </label>
                    <input
                      type="number"
                      name="numberOfHours"
                      id="numberOfHours"
                      value={formData.numberOfHours}
                      onChange={handleChange}
                      min="1"
                      className={`mt-1 block w-full px-3 py-2 border ${errors.numberOfHours ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="Enter number of hours"
                    />
                    {errors.numberOfHours && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.numberOfHours}
                      </p>
                    )}
                  </div>
                )}

                {showNumberOfWeeks && (
                  <div className="mt-3">
                    <label
                      htmlFor="numberOfWeeks"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Number of Weeks <RequiredAst />
                    </label>
                    <input
                      type="number"
                      name="numberOfWeeks"
                      id="numberOfWeeks"
                      value={formData.numberOfWeeks}
                      onChange={handleChange}
                      min="1"
                      className={`mt-1 block w-full px-3 py-2 border ${errors.numberOfWeeks ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="Enter number of weeks"
                    />
                    {errors.numberOfWeeks && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.numberOfWeeks}
                      </p>
                    )}
                  </div>
                )}

                {showNumberOfDays && (
                  <div className="mt-3">
                    <label
                      htmlFor="numberOfDays"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Number of Days <RequiredAst />
                    </label>
                    <input
                      type="number"
                      name="numberOfDays"
                      id="numberOfDays"
                      value={formData.numberOfDays}
                      onChange={handleChange}
                      min="1"
                      className={`mt-1 block w-full px-3 py-2 border ${errors.numberOfDays ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="Enter number of days"
                    />
                    {errors.numberOfDays && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.numberOfDays}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  htmlFor="courseCategory"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Course Category <RequiredAst />
                </label>
                <select
                  name="courseCategory"
                  id="courseCategory"
                  value={formData.courseCategory}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.courseCategory ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                >
                  {COURSE_CATEGORY_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Click to choose"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.courseCategory && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.courseCategory}
                  </p>
                )}
              </div>
            </div>

            {showExamFields && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="dateOfExamination"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Date of Examination <RequiredAst />
                    </label>
                    <input
                      type="date"
                      name="dateOfExamination"
                      id="dateOfExamination"
                      value={formData.dateOfExamination}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${errors.dateOfExamination ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {errors.dateOfExamination && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.dateOfExamination}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="gradeObtained"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Grade Obtained <RequiredAst />
                    </label>
                    <input
                      type="text"
                      name="gradeObtained"
                      id="gradeObtained"
                      value={formData.gradeObtained}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${errors.gradeObtained ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="e.g. A, 9.0"
                    />
                    {errors.gradeObtained && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.gradeObtained}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Upload Mark Sheet Proof <RequiredAst />
                  </label>
                  <div
                    className={`mt-1 flex flex-col items-center justify-center w-full h-32 px-6 pt-5 pb-6 border-2 ${
                      errors.markSheetProof
                        ? "border-red-500"
                        : markSheetDragActive
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-300"
                    } border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors bg-white`}
                    onDragEnter={(e) => handleDrag(e, setMarkSheetDragActive)}
                    onDragLeave={(e) => handleDrag(e, setMarkSheetDragActive)}
                    onDragOver={(e) => handleDrag(e, setMarkSheetDragActive)}
                    onDrop={(e) =>
                      handleDrop(e, "markSheetProof", setMarkSheetDragActive)
                    }
                    onClick={() =>
                      document.getElementById("marksheet-upload")?.click()
                    }
                  >
                    <div className="space-y-1 text-center">
                      <UploadCloud
                        className={`mx-auto h-10 w-10 ${markSheetDragActive ? "text-indigo-600" : "text-slate-400"}`}
                      />
                      <div className="flex text-sm text-slate-600">
                        <label
                          htmlFor="marksheet-upload"
                          className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="marksheet-upload"
                            name="markSheetProof"
                            type="file"
                            className="sr-only"
                            onChange={(e) =>
                              handleFileChange(e, "markSheetProof")
                            }
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-slate-500">
                        PDF, JPG, PNG up to 10MB
                      </p>
                    </div>
                  </div>
                  {formData.markSheetProof && (
                    <div className="mt-2 flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-200">
                      <FileText
                        size={16}
                        className="mr-2 flex-shrink-0 text-indigo-600"
                      />
                      <span className="font-medium mr-2 truncate">
                        {formData.markSheetProof.name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFile("markSheetProof");
                        }}
                        className="ml-auto text-red-500 hover:text-red-700 p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  {errors.markSheetProof && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.markSheetProof}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Is it an approved FDP? <RequiredAst />
                </label>
                <div className="mt-1 flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isApprovedFDP"
                      value="yes"
                      checked={formData.isApprovedFDP === "yes"}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="ml-2 text-sm text-slate-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isApprovedFDP"
                      value="no"
                      checked={formData.isApprovedFDP === "no"}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="ml-2 text-sm text-slate-700">No</span>
                  </label>
                </div>
              </div>
            </div>

            {showFDPProof && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Upload FDP Proof <RequiredAst />
                </label>
                <div
                  className={`mt-1 flex flex-col items-center justify-center w-full h-32 px-6 pt-5 pb-6 border-2 ${
                    errors.fdpProof
                      ? "border-red-500"
                      : fdpDragActive
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-300"
                  } border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors bg-white`}
                  onDragEnter={(e) => handleDrag(e, setFdpDragActive)}
                  onDragLeave={(e) => handleDrag(e, setFdpDragActive)}
                  onDragOver={(e) => handleDrag(e, setFdpDragActive)}
                  onDrop={(e) => handleDrop(e, "fdpProof", setFdpDragActive)}
                  onClick={() => document.getElementById("fdp-upload")?.click()}
                >
                  <div className="space-y-1 text-center">
                    <UploadCloud
                      className={`mx-auto h-10 w-10 ${fdpDragActive ? "text-indigo-600" : "text-slate-400"}`}
                    />
                    <div className="flex text-sm text-slate-600">
                      <label
                        htmlFor="fdp-upload"
                        className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="fdp-upload"
                          name="fdpProof"
                          type="file"
                          className="sr-only"
                          onChange={(e) => handleFileChange(e, "fdpProof")}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500">
                      PDF, JPG, PNG up to 10MB
                    </p>
                  </div>
                </div>
                {formData.fdpProof && (
                  <div className="mt-2 flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-200">
                    <FileText
                      size={16}
                      className="mr-2 flex-shrink-0 text-indigo-600"
                    />
                    <span className="font-medium mr-2 truncate">
                      {formData.fdpProof.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile("fdpProof");
                      }}
                      className="ml-auto text-red-500 hover:text-red-700 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                {errors.fdpProof && (
                  <p className="mt-1 text-sm text-red-600">{errors.fdpProof}</p>
                )}
              </div>
            )}

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
                  {TYPE_OF_SPONSORSHIP_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Click to choose"}
                    >
                      {option}
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
                  htmlFor="claimedFor"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Claimed For <RequiredAst />
                </label>
                <select
                  name="claimedFor"
                  id="claimedFor"
                  value={formData.claimedFor}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.claimedFor ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                >
                  {CLAIMED_FOR_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Click to choose"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.claimedFor && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.claimedFor}
                  </p>
                )}
              </div>
            </div>

            {showApexProof && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Apex Proof <RequiredAst />
                </label>
                <div
                  className={`mt-1 flex flex-col items-center justify-center w-full h-32 px-6 pt-5 pb-6 border-2 ${
                    errors.apexProof
                      ? "border-red-500"
                      : apexDragActive
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-300"
                  } border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors bg-white`}
                  onDragEnter={(e) => handleDrag(e, setApexDragActive)}
                  onDragLeave={(e) => handleDrag(e, setApexDragActive)}
                  onDragOver={(e) => handleDrag(e, setApexDragActive)}
                  onDrop={(e) => handleDrop(e, "apexProof", setApexDragActive)}
                  onClick={() =>
                    document.getElementById("apex-upload")?.click()
                  }
                >
                  <div className="space-y-1 text-center">
                    <UploadCloud
                      className={`mx-auto h-10 w-10 ${apexDragActive ? "text-indigo-600" : "text-slate-400"}`}
                    />
                    <div className="flex text-sm text-slate-600">
                      <label
                        htmlFor="apex-upload"
                        className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="apex-upload"
                          name="apexProof"
                          type="file"
                          className="sr-only"
                          onChange={(e) => handleFileChange(e, "apexProof")}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500">
                      PDF, JPG, PNG up to 10MB
                    </p>
                  </div>
                </div>
                {formData.apexProof && (
                  <div className="mt-2 flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-200">
                    <FileText
                      size={16}
                      className="mr-2 flex-shrink-0 text-indigo-600"
                    />
                    <span className="font-medium mr-2 truncate">
                      {formData.apexProof.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile("apexProof");
                      }}
                      className="ml-auto text-red-500 hover:text-red-700 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                {errors.apexProof && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.apexProof}
                  </p>
                )}
              </div>
            )}

            {showFundingAgencyName && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="fundingAgencyName"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Name of the Funding Agency <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="fundingAgencyName"
                    id="fundingAgencyName"
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
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Upload Certificate Proof <RequiredAst />
              </label>
              <div
                className={`mt-1 flex flex-col items-center justify-center w-full h-40 px-6 pt-5 pb-6 border-2 ${
                  errors.certificateProof
                    ? "border-red-500"
                    : certDragActive
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-300"
                } border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors bg-white`}
                onDragEnter={(e) => handleDrag(e, setCertDragActive)}
                onDragLeave={(e) => handleDrag(e, setCertDragActive)}
                onDragOver={(e) => handleDrag(e, setCertDragActive)}
                onDrop={(e) =>
                  handleDrop(e, "certificateProof", setCertDragActive)
                }
                onClick={() => document.getElementById("cert-upload")?.click()}
              >
                <div className="space-y-1 text-center">
                  <UploadCloud
                    className={`mx-auto h-12 w-12 ${certDragActive ? "text-indigo-600" : "text-slate-400"}`}
                  />
                  <div className="flex text-sm text-slate-600">
                    <label
                      htmlFor="cert-upload"
                      className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="cert-upload"
                        name="certificateProof"
                        type="file"
                        className="sr-only"
                        onChange={(e) =>
                          handleFileChange(e, "certificateProof")
                        }
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    PDF, JPG, PNG up to 10MB
                  </p>
                </div>
              </div>
              {formData.certificateProof && (
                <div className="mt-2 flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-200">
                  <FileText
                    size={16}
                    className="mr-2 flex-shrink-0 text-indigo-600"
                  />
                  <span className="font-medium mr-2 truncate">
                    {formData.certificateProof.name}
                  </span>
                  <span className="text-slate-500 text-xs">
                    ({(formData.certificateProof.size / 1024 / 1024).toFixed(2)}{" "}
                    MB)
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile("certificateProof");
                    }}
                    className="ml-auto text-red-500 hover:text-red-700 p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              {errors.certificateProof && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.certificateProof}
                </p>
              )}
            </div>

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
                {isSubmitting ? "Saving..." : "Save Course"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
