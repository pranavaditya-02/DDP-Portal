"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  FileText,
  X,
  Trophy,
  Image as ImageIcon,
} from "lucide-react";
import { buildFormData, submitAchievement } from "../../facultyActivitiesApi";

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

// Technical Society & Chapter Options
const TECHNICAL_SOCIETY_OPTIONS = [
  "Click to choose",
  "ACM",
  "CSI",
  "CSIR",
  "IEEE",
  "ISTE",
  "SAE",
  "Other",
];

// Type of Recognition Options
const TYPE_OF_RECOGNITION_OPTIONS = ["Click to choose", "Award", "Achievement"];

// Award Types (when Type of Recognition = Award)
const AWARD_TYPE_OPTIONS = [
  "Click to choose",
  "Faculty Award",
  "Individual Recognition Award",
  "Teacher Award",
  "Mentor Award",
  "Outstanding Performance Award",
  "Research Award",
  "Scientist Award",
];

// Achievement Types (when Type of Recognition = Achievement)
const ACHIEVEMENT_TYPE_OPTIONS = [
  "Click to choose",
  "GATE Scorer",
  "NPTEL Gold Medal",
  "NPTEL Stars",
  "NPTEL Topper",
  "SIH Mentor",
  "Best Mentor",
  "Journal Editor",
  "Quality Journal Reviewer Recognition",
  "National Level Fellowship",
  "Invited as a Visiting Faculty",
  "Individual Recognition",
];

// Organization Type Options
const ORGANIZATION_TYPE_OPTIONS = [
  "Click to choose",
  "Government",
  "Private",
  "Others",
];

// Awarding Agency Options
const AWARDING_AGENCY_OPTIONS = [
  "Click to choose",
  "AICTE",
  "CSIR",
  "GATE",
  "NET",
  "SLET",
  "VIFRA",
  "Other",
];

// Level Options
const LEVEL_OPTIONS = [
  "Click to choose",
  "BIT",
  "State",
  "National",
  "International",
];

// Nature of Recognition Options
const NATURE_OF_RECOGNITION_OPTIONS = [
  "Click to choose",
  "Cash Prize",
  "Certificate",
  "Momento",
];

export default function NotableAchievementsForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    taskID: "",
    specialLabsInvolved: "no",
    specialLab: "",
    technicalSocietyInvolved: "no",
    technicalSocietyChapter: "",
    typeOfRecognition: "",
    awardType: "",
    achievementType: "",
    awardName: "",
    organizationType: "",
    otherOrganizationName: "",
    awardingAgency: "",
    level: "",
    receivedDate: "",
    natureOfRecognition: "",
    prizeAmount: "",
    photoProofs: null,
    documentProof: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [docProofDragActive, setDocProofDragActive] = useState(false);
  const [photoProofDragActive, setPhotoProofDragActive] = useState(false);

  // Conditional field helpers
  const showSpecialLab = formData.specialLabsInvolved === "yes";
  const showTechnicalSocietyChapter =
    formData.technicalSocietyInvolved === "yes";
  const showAwardType = formData.typeOfRecognition === "Award";
  const showAchievementType = formData.typeOfRecognition === "Achievement";
  const showOtherOrganization = formData.organizationType === "Others";
  const showPrizeAmount = formData.natureOfRecognition === "Cash Prize";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, [fieldName]: e.target.files![0] }));
      if (errors[fieldName]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    }
  };

  const clearFile = (fieldName: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
  };

  const handleDrag = (
    e: React.DragEvent<HTMLDivElement>,
    setDragActiveState: (state: boolean) => void,
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
    e: React.DragEvent<HTMLDivElement>,
    fieldName: string,
    setDragActiveState: (state: boolean) => void,
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
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.taskID) newErrors.taskID = "Task ID is required";

    if (showSpecialLab && !formData.specialLab) {
      newErrors.specialLab = "Special Lab is required";
    }

    if (
      showTechnicalSocietyChapter &&
      (!formData.technicalSocietyChapter ||
        formData.technicalSocietyChapter === "Click to choose")
    ) {
      newErrors.technicalSocietyChapter =
        "Technical Society & Chapter is required";
    }

    if (
      !formData.typeOfRecognition ||
      formData.typeOfRecognition === "Click to choose"
    ) {
      newErrors.typeOfRecognition = "Type of Recognition is required";
    }

    if (
      showAwardType &&
      (!formData.awardType || formData.awardType === "Click to choose")
    ) {
      newErrors.awardType = "Award type is required";
    }
    if (
      showAchievementType &&
      (!formData.achievementType ||
        formData.achievementType === "Click to choose")
    ) {
      newErrors.achievementType = "Achievement type is required";
    }

    if (!formData.awardName)
      newErrors.awardName = "Name of the Award/Achievement is required";

    if (
      !formData.organizationType ||
      formData.organizationType === "Click to choose"
    ) {
      newErrors.organizationType = "Organization type is required";
    }
    if (showOtherOrganization && !formData.otherOrganizationName) {
      newErrors.otherOrganizationName = "Organization Name is required";
    }

    if (
      !formData.awardingAgency ||
      formData.awardingAgency === "Click to choose"
    ) {
      newErrors.awardingAgency = "Awarding agency is required";
    }
    if (!formData.level || formData.level === "Click to choose")
      newErrors.level = "Level is required";
    if (!formData.receivedDate)
      newErrors.receivedDate = "Received Date is required";

    if (
      !formData.natureOfRecognition ||
      formData.natureOfRecognition === "Click to choose"
    ) {
      newErrors.natureOfRecognition = "Nature of recognition is required";
    }
    if (showPrizeAmount && !formData.prizeAmount) {
      newErrors.prizeAmount = "Prize Amount is required";
    }

    if (!formData.photoProofs)
      newErrors.photoProofs = "Photo Proofs are required";
    if (!formData.documentProof)
      newErrors.documentProof = "Document Proof is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fillTestData = () => {
    setFormData({
      taskID: "TASK-NOTABLE-001",
      specialLabsInvolved: "no",
      specialLab: "",
      technicalSocietyChapter: "ACM",
      technicalSocietyInvolved: "no",
      typeOfRecognition: "Award",
      awardType: "Faculty Award",
      achievementType: "Best Performer",
      awardName: "Test Award",
      organizationType: "Government",
      otherOrganizationName: "",
      organizationName: "Test Organization",
      awardingAgency: "Test Agency",
      level: "1",
      receivedDate: "2026-04-16",
      natureOfRecognition: "Certificate",
      prizeAmount: "1000",
      specialLab: "",
      specialLabsInvolved: "no",
      photoProofs: null,
      documentProof: null,
      typeOfRecognition: "Award",
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      try {
        const payload = buildFormData(formData);
        await submitAchievement("notable-achievements-and-awards", payload);
        router.push("/achievements/notable-achievements-and-awards");
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("Failed to submit form");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 light-achievement-form [&_.text-slate-200]:!text-slate-700 [&_.text-slate-300]:!text-slate-700 [&_.text-slate-400]:!text-slate-500 [&_.text-slate-500]:!text-slate-400 [&_.bg-slate-800]:!bg-white [&_.bg-slate-900]:!bg-white [&_.border-slate-700]:!border-slate-300 [&_.border-slate-800]:!border-slate-200 [&_input.text-white]:!text-slate-900 [&_select.text-white]:!text-slate-900 [&_.hover\:bg-slate-800:hover]:!bg-slate-100">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/achievements/notable-achievements-and-awards"
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Add Notable Achievement
              </h1>
              <p className="text-sm text-slate-500">
                Create record for Awards and Achievements
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fillTestData}
            className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
          >
            Auto fill test data
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            {/* Task ID & Special Labs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="taskID"
                  className="block text-sm font-medium text-slate-200 mb-2"
                >
                  Task ID <RequiredAst />
                </label>
                <input
                  type="text"
                  name="taskID"
                  id="taskID"
                  value={formData.taskID}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.taskID ? "border-red-500" : "border-slate-700"
                  }`}
                  placeholder="Enter Task ID"
                />
                {errors.taskID && (
                  <p className="mt-1 text-sm text-red-400">{errors.taskID}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Special Labs Involved <RequiredAst />
                </label>
                <div className="flex space-x-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="specialLabsInvolved"
                      value="yes"
                      checked={formData.specialLabsInvolved === "yes"}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600"
                    />
                    <span className="ml-2 text-sm text-slate-300">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="specialLabsInvolved"
                      value="no"
                      checked={formData.specialLabsInvolved === "no"}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600"
                    />
                    <span className="ml-2 text-sm text-slate-300">No</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Conditional Special Lab */}
            {showSpecialLab && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="specialLab"
                    className="block text-sm font-medium text-slate-200 mb-2"
                  >
                    Special Lab <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="specialLab"
                    id="specialLab"
                    value={formData.specialLab}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.specialLab ? "border-red-500" : "border-slate-700"
                    }`}
                    placeholder="Enter Special Lab"
                  />
                  {errors.specialLab && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.specialLab}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Technical Society */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Is this event involved under Technical Society?{" "}
                  <RequiredAst />
                </label>
                <div className="flex space-x-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="technicalSocietyInvolved"
                      value="yes"
                      checked={formData.technicalSocietyInvolved === "yes"}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600"
                    />
                    <span className="ml-2 text-sm text-slate-300">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="technicalSocietyInvolved"
                      value="no"
                      checked={formData.technicalSocietyInvolved === "no"}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600"
                    />
                    <span className="ml-2 text-sm text-slate-300">No</span>
                  </label>
                </div>
              </div>

              {showTechnicalSocietyChapter && (
                <div>
                  <label
                    htmlFor="technicalSocietyChapter"
                    className="block text-sm font-medium text-slate-200 mb-2"
                  >
                    Technical Society & Chapter <RequiredAst />
                  </label>
                  <select
                    name="technicalSocietyChapter"
                    id="technicalSocietyChapter"
                    value={formData.technicalSocietyChapter}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.technicalSocietyChapter
                        ? "border-red-500"
                        : "border-slate-700"
                    }`}
                  >
                    {TECHNICAL_SOCIETY_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option}
                        disabled={option === "Click to choose"}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.technicalSocietyChapter && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.technicalSocietyChapter}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Type of Recognition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="typeOfRecognition"
                  className="block text-sm font-medium text-slate-200 mb-2"
                >
                  Type of Recognition <RequiredAst />
                </label>
                <select
                  name="typeOfRecognition"
                  id="typeOfRecognition"
                  value={formData.typeOfRecognition}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.typeOfRecognition
                      ? "border-red-500"
                      : "border-slate-700"
                  }`}
                >
                  {TYPE_OF_RECOGNITION_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Click to choose"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.typeOfRecognition && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.typeOfRecognition}
                  </p>
                )}
              </div>

              {/* Award Type */}
              {showAwardType && (
                <div>
                  <label
                    htmlFor="awardType"
                    className="block text-sm font-medium text-slate-200 mb-2"
                  >
                    Award Type <RequiredAst />
                  </label>
                  <select
                    name="awardType"
                    id="awardType"
                    value={formData.awardType}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.awardType ? "border-red-500" : "border-slate-700"
                    }`}
                  >
                    {AWARD_TYPE_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option}
                        disabled={option === "Click to choose"}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.awardType && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.awardType}
                    </p>
                  )}
                </div>
              )}

              {/* Achievement Type */}
              {showAchievementType && (
                <div>
                  <label
                    htmlFor="achievementType"
                    className="block text-sm font-medium text-slate-200 mb-2"
                  >
                    Achievement Type <RequiredAst />
                  </label>
                  <select
                    name="achievementType"
                    id="achievementType"
                    value={formData.achievementType}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.achievementType
                        ? "border-red-500"
                        : "border-slate-700"
                    }`}
                  >
                    {ACHIEVEMENT_TYPE_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option}
                        disabled={option === "Click to choose"}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.achievementType && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.achievementType}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Award Name & Organization Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="awardName"
                  className="block text-sm font-medium text-slate-200 mb-2"
                >
                  Name of the Award / Achievement <RequiredAst />
                </label>
                <input
                  type="text"
                  name="awardName"
                  id="awardName"
                  value={formData.awardName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.awardName ? "border-red-500" : "border-slate-700"
                  }`}
                  placeholder="Enter Name"
                />
                {errors.awardName && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.awardName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="organizationType"
                  className="block text-sm font-medium text-slate-200 mb-2"
                >
                  Organization Type <RequiredAst />
                </label>
                <select
                  name="organizationType"
                  id="organizationType"
                  value={formData.organizationType}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.organizationType
                      ? "border-red-500"
                      : "border-slate-700"
                  }`}
                >
                  {ORGANIZATION_TYPE_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Click to choose"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.organizationType && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.organizationType}
                  </p>
                )}
              </div>
            </div>

            {/* Conditional Other Organization Name */}
            {showOtherOrganization && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="otherOrganizationName"
                    className="block text-sm font-medium text-slate-200 mb-2"
                  >
                    Organization Name <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="otherOrganizationName"
                    id="otherOrganizationName"
                    value={formData.otherOrganizationName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.otherOrganizationName
                        ? "border-red-500"
                        : "border-slate-700"
                    }`}
                    placeholder="Enter Organization Name"
                  />
                  {errors.otherOrganizationName && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.otherOrganizationName}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Awarding Agency & Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="awardingAgency"
                  className="block text-sm font-medium text-slate-200 mb-2"
                >
                  Name of the body / Awarding Agency <RequiredAst />
                </label>
                <select
                  name="awardingAgency"
                  id="awardingAgency"
                  value={formData.awardingAgency}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.awardingAgency
                      ? "border-red-500"
                      : "border-slate-700"
                  }`}
                >
                  {AWARDING_AGENCY_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Click to choose"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.awardingAgency && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.awardingAgency}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="level"
                  className="block text-sm font-medium text-slate-200 mb-2"
                >
                  Level <RequiredAst />
                </label>
                <select
                  name="level"
                  id="level"
                  value={formData.level}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.level ? "border-red-500" : "border-slate-700"
                  }`}
                >
                  {LEVEL_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Click to choose"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.level && (
                  <p className="mt-1 text-sm text-red-400">{errors.level}</p>
                )}
              </div>
            </div>

            {/* Date & Nature of Recognition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="receivedDate"
                  className="block text-sm font-medium text-slate-200 mb-2"
                >
                  Received Date <RequiredAst />
                </label>
                <input
                  type="date"
                  name="receivedDate"
                  id="receivedDate"
                  value={formData.receivedDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.receivedDate ? "border-red-500" : "border-slate-700"
                  }`}
                />
                {errors.receivedDate && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.receivedDate}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="natureOfRecognition"
                  className="block text-sm font-medium text-slate-200 mb-2"
                >
                  Nature of Recognition <RequiredAst />
                </label>
                <select
                  name="natureOfRecognition"
                  id="natureOfRecognition"
                  value={formData.natureOfRecognition}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.natureOfRecognition
                      ? "border-red-500"
                      : "border-slate-700"
                  }`}
                >
                  {NATURE_OF_RECOGNITION_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Click to choose"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.natureOfRecognition && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.natureOfRecognition}
                  </p>
                )}
              </div>
            </div>

            {/* Conditional Prize Amount */}
            {showPrizeAmount && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="prizeAmount"
                    className="block text-sm font-medium text-slate-200 mb-2"
                  >
                    Prize Amount (in Rs.) <RequiredAst />
                  </label>
                  <input
                    type="number"
                    name="prizeAmount"
                    id="prizeAmount"
                    value={formData.prizeAmount}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.prizeAmount ? "border-red-500" : "border-slate-700"
                    }`}
                    placeholder="Enter Prize Amount"
                    min="0"
                  />
                  {errors.prizeAmount && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.prizeAmount}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* File Uploads */}
            <div className="space-y-6">
              {/* Photo Proofs */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Photo Proofs <RequiredAst />
                </label>
                <div
                  className={`mt-2 flex flex-col items-center justify-center w-full h-32 px-6 pt-5 pb-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    errors.photoProofs
                      ? "border-red-500 bg-red-500/5"
                      : photoProofDragActive
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-slate-700 hover:border-slate-600"
                  }`}
                  onDragEnter={(e) => handleDrag(e, setPhotoProofDragActive)}
                  onDragLeave={(e) => handleDrag(e, setPhotoProofDragActive)}
                  onDragOver={(e) => handleDrag(e, setPhotoProofDragActive)}
                  onDrop={(e) =>
                    handleDrop(e, "photoProofs", setPhotoProofDragActive)
                  }
                  onClick={() =>
                    document.getElementById("photo-upload")?.click()
                  }
                >
                  <div className="space-y-1 text-center">
                    <ImageIcon
                      className={`mx-auto h-12 w-12 ${
                        photoProofDragActive
                          ? "text-blue-400"
                          : "text-slate-500"
                      }`}
                    />
                    <div className="flex text-sm text-slate-400">
                      <label
                        htmlFor="photo-upload"
                        className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="photo-upload"
                          name="photoProofs"
                          type="file"
                          className="sr-only"
                          onChange={(e) => handleFileChange(e, "photoProofs")}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500">
                      JPG, PNG up to 10MB
                    </p>
                  </div>
                </div>
                {formData.photoProofs && (
                  <div className="mt-2 flex items-center text-sm text-slate-300 bg-slate-800 p-3 rounded-lg border border-slate-700">
                    <FileText
                      size={16}
                      className="mr-2 flex-shrink-0 text-blue-400"
                    />
                    <span className="font-medium mr-2 truncate">
                      {(formData.photoProofs as File).name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile("photoProofs");
                      }}
                      className="ml-auto text-red-400 hover:text-red-300 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                {errors.photoProofs && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.photoProofs}
                  </p>
                )}
              </div>

              {/* Document Proof */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Document Proof <RequiredAst />
                </label>
                <div
                  className={`mt-2 flex flex-col items-center justify-center w-full h-32 px-6 pt-5 pb-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    errors.documentProof
                      ? "border-red-500 bg-red-500/5"
                      : docProofDragActive
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-slate-700 hover:border-slate-600"
                  }`}
                  onDragEnter={(e) => handleDrag(e, setDocProofDragActive)}
                  onDragLeave={(e) => handleDrag(e, setDocProofDragActive)}
                  onDragOver={(e) => handleDrag(e, setDocProofDragActive)}
                  onDrop={(e) =>
                    handleDrop(e, "documentProof", setDocProofDragActive)
                  }
                  onClick={() => document.getElementById("doc-upload")?.click()}
                >
                  <div className="space-y-1 text-center">
                    <UploadCloud
                      className={`mx-auto h-12 w-12 ${
                        docProofDragActive ? "text-blue-400" : "text-slate-500"
                      }`}
                    />
                    <div className="flex text-sm text-slate-400">
                      <label
                        htmlFor="doc-upload"
                        className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="doc-upload"
                          name="documentProof"
                          type="file"
                          className="sr-only"
                          onChange={(e) => handleFileChange(e, "documentProof")}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500">
                      PDF, JPG, PNG up to 10MB
                    </p>
                  </div>
                </div>
                {formData.documentProof && (
                  <div className="mt-2 flex items-center text-sm text-slate-300 bg-slate-800 p-3 rounded-lg border border-slate-700">
                    <FileText
                      size={16}
                      className="mr-2 flex-shrink-0 text-blue-400"
                    />
                    <span className="font-medium mr-2 truncate">
                      {(formData.documentProof as File).name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile("documentProof");
                      }}
                      className="ml-auto text-red-400 hover:text-red-300 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                {errors.documentProof && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.documentProof}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 flex items-center justify-end space-x-4 border-t border-slate-800">
              <Link
                href="/achievements/notable-achievements-and-awards"
                className="px-4 py-2 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Achievement"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
