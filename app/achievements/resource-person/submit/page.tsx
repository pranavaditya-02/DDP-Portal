"use client";

import { useState, ChangeEvent, DragEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  FileText,
  X,
  UserCheck,
} from "lucide-react";

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

const SPECIAL_LAB_OPTIONS = [
  "Select Special Lab",
  "AI Lab",
  "Robotics Lab",
  "IoT Lab",
  "Cyber Security Lab",
  "Cloud Computing Lab",
  "Data Science Lab",
];

const RESOURCE_PERSON_CATEGORY_OPTIONS = [
  "Choose an option",
  "BoS Member",
  "Chief Guest",
  "Conference Session Chair",
  "DC member",
  "Energy Audit",
  "Examiner - Ph.D Viva voce",
  "External Academic Audit",
  "Internal Academic Audit",
  "Jury Member",
  "Quality Expert",
  "Technical Expert",
  "Thesis Evaluator",
  "Interaction",
  "Panel-Member",
];

const TYPE_OF_ORGANISATION_OPTIONS = [
  "Choose an option",
  "Industry",
  "Institute",
];

type FormData = {
  taskID: string;
  specialLabsInvolved: string;
  specialLab: string;
  resourcePersonCategory: string;
  purposeOfInteraction: string;
  nameOfPanel: string;
  typeOfOrganisation: string;
  visitingDepartmentIndustry: string;
  visitingDepartmentInstitute: string;
  organisationNameAndAddress: string;
  numberOfDays: string;
  fromDate: string;
  toDate: string;
  documentProof: File | null;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function ResourcePersonSubmitPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    taskID: "",
    specialLabsInvolved: "Choose an option",
    specialLab: "",
    resourcePersonCategory: "Choose an option",
    purposeOfInteraction: "",
    nameOfPanel: "",
    typeOfOrganisation: "Choose an option",
    visitingDepartmentIndustry: "",
    visitingDepartmentInstitute: "",
    organisationNameAndAddress: "",
    numberOfDays: "",
    fromDate: "",
    toDate: "",
    documentProof: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Conditionals
  const showSpecialLab = formData.specialLabsInvolved === "Yes";
  const showPurpose = formData.resourcePersonCategory === "Interaction";
  const showNameOfPanel = formData.resourcePersonCategory === "Panel-Member";
  const showIndustryDept = formData.typeOfOrganisation === "Industry";
  const showInstituteDept = formData.typeOfOrganisation === "Institute";

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const n = { ...prev };
      delete n[name as keyof FormErrors];
      return n;
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData((prev) => ({ ...prev, documentProof: e.target.files![0] }));
      setErrors((prev) => {
        const n = { ...prev };
        delete n.documentProof;
        return n;
      });
    }
  };

  const clearFile = () =>
    setFormData((prev) => ({ ...prev, documentProof: null }));

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setFormData((prev) => ({
        ...prev,
        documentProof: e.dataTransfer.files[0],
      }));
      setErrors((prev) => {
        const n = { ...prev };
        delete n.documentProof;
        return n;
      });
    }
  };

  const validate = (): boolean => {
    const e: FormErrors = {};

    if (!formData.taskID) e.taskID = "Task ID is required";

    if (formData.specialLabsInvolved === "Choose an option")
      e.specialLabsInvolved = "Selection is required";

    if (showSpecialLab && !formData.specialLab)
      e.specialLab = "Special Lab is required";

    if (formData.resourcePersonCategory === "Choose an option")
      e.resourcePersonCategory = "Resource Person Category is required";

    if (showPurpose && !formData.purposeOfInteraction)
      e.purposeOfInteraction = "Purpose of Interaction is required";

    if (showNameOfPanel && !formData.nameOfPanel)
      e.nameOfPanel = "Name of Panel is required";

    if (formData.typeOfOrganisation === "Choose an option")
      e.typeOfOrganisation = "Type of Organisation is required";

    if (showIndustryDept && !formData.visitingDepartmentIndustry)
      e.visitingDepartmentIndustry =
        "Visiting Department in Industry is required";

    if (showInstituteDept && !formData.visitingDepartmentInstitute)
      e.visitingDepartmentInstitute =
        "Visiting Department in Institute is required";

    if (!formData.organisationNameAndAddress)
      e.organisationNameAndAddress =
        "Organization Name and Address is required";

    if (!formData.numberOfDays) e.numberOfDays = "Number of Days is required";
    if (!formData.fromDate) e.fromDate = "From Date is required";
    if (!formData.toDate) e.toDate = "To Date is required";
    if (!formData.documentProof) e.documentProof = "Document Proof is required";

    if (formData.fromDate && formData.toDate) {
      if (new Date(formData.toDate) < new Date(formData.fromDate))
        e.toDate = "To Date cannot be before From Date";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const fillTestData = () => {
    setFormData({
      taskID: "TASK-RESOURCE-001",
      specialLabsInvolved: "no",
      specialLab: "",
      resourcePersonCategory: "Seminar",
      purposeOfInteraction: "Guest session",
      nameOfPanel: "Test Panel",
      typeOfOrganisation: "Institute",
      organisationNameAndAddress: "Test Institute, 123 Main St",
      visitingDepartmentIndustry: "",
      visitingDepartmentInstitute: "",
      numberOfDays: "1",
      fromDate: "2026-04-16",
      toDate: "2026-04-17",
      documentProof: null,
    });
    setErrors({});
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload = buildFormData(formData);
      await submitAchievement("resource-person", payload);
      router.push("/achievements/resource-person");
    } catch (err) {
      console.error(err);
      alert("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-full hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
            <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Add Resource Person Details
            </h1>
            <p className="text-sm text-slate-500">
              Create record for acting as a Resource Person
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
            {/* Task ID & Special Labs Involved */}
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
                  placeholder="Enter Task ID"
                  className={`mt-1 block w-full px-3 py-2 border ${errors.taskID ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.taskID && (
                  <p className="mt-1 text-sm text-red-600">{errors.taskID}</p>
                )}
              </div>

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
                  {["Choose an option", "Yes", "No"].map((o) => (
                    <option
                      key={o}
                      value={o}
                      disabled={o === "Choose an option"}
                    >
                      {o}
                    </option>
                  ))}
                </select>
                {errors.specialLabsInvolved && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.specialLabsInvolved}
                  </p>
                )}
              </div>
            </div>

            {/* Special Lab (conditional) */}
            {showSpecialLab && (
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
            )}

            {/* Resource Person Category */}
            <div>
              <label
                htmlFor="resourcePersonCategory"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Resource Person Category <RequiredAst />
              </label>
              <select
                name="resourcePersonCategory"
                id="resourcePersonCategory"
                value={formData.resourcePersonCategory}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${errors.resourcePersonCategory ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
              >
                {RESOURCE_PERSON_CATEGORY_OPTIONS.map((o) => (
                  <option key={o} value={o} disabled={o === "Choose an option"}>
                    {o}
                  </option>
                ))}
              </select>
              {errors.resourcePersonCategory && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.resourcePersonCategory}
                </p>
              )}
            </div>

            {/* Purpose of Interaction (conditional on Interaction) */}
            {showPurpose && (
              <div>
                <label
                  htmlFor="purposeOfInteraction"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Mention the Purpose of Interaction <RequiredAst />
                </label>
                <textarea
                  name="purposeOfInteraction"
                  id="purposeOfInteraction"
                  rows={3}
                  value={formData.purposeOfInteraction}
                  onChange={handleChange}
                  placeholder="Enter purpose of interaction"
                  className={`mt-1 block w-full px-3 py-2 border ${errors.purposeOfInteraction ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.purposeOfInteraction && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.purposeOfInteraction}
                  </p>
                )}
              </div>
            )}

            {/* Name of Panel (conditional on Panel-Member) */}
            {showNameOfPanel && (
              <div>
                <label
                  htmlFor="nameOfPanel"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Name of the Panel <RequiredAst />
                </label>
                <input
                  type="text"
                  name="nameOfPanel"
                  id="nameOfPanel"
                  value={formData.nameOfPanel}
                  onChange={handleChange}
                  placeholder="Enter name of the panel"
                  className={`mt-1 block w-full px-3 py-2 border ${errors.nameOfPanel ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.nameOfPanel && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.nameOfPanel}
                  </p>
                )}
              </div>
            )}

            {/* Type of Organisation */}
            <div>
              <label
                htmlFor="typeOfOrganisation"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Type of Organisation <RequiredAst />
              </label>
              <select
                name="typeOfOrganisation"
                id="typeOfOrganisation"
                value={formData.typeOfOrganisation}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${errors.typeOfOrganisation ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
              >
                {TYPE_OF_ORGANISATION_OPTIONS.map((o) => (
                  <option key={o} value={o} disabled={o === "Choose an option"}>
                    {o}
                  </option>
                ))}
              </select>
              {errors.typeOfOrganisation && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.typeOfOrganisation}
                </p>
              )}
            </div>

            {/* Visiting Department in Industry (conditional) */}
            {showIndustryDept && (
              <div>
                <label
                  htmlFor="visitingDepartmentIndustry"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Visiting Department in Industry <RequiredAst />
                </label>
                <input
                  type="text"
                  name="visitingDepartmentIndustry"
                  id="visitingDepartmentIndustry"
                  value={formData.visitingDepartmentIndustry}
                  onChange={handleChange}
                  placeholder="Enter visiting department in industry"
                  className={`mt-1 block w-full px-3 py-2 border ${errors.visitingDepartmentIndustry ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.visitingDepartmentIndustry && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.visitingDepartmentIndustry}
                  </p>
                )}
              </div>
            )}

            {/* Visiting Department in Institute (conditional) */}
            {showInstituteDept && (
              <div>
                <label
                  htmlFor="visitingDepartmentInstitute"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Visiting Department in Institute <RequiredAst />
                </label>
                <input
                  type="text"
                  name="visitingDepartmentInstitute"
                  id="visitingDepartmentInstitute"
                  value={formData.visitingDepartmentInstitute}
                  onChange={handleChange}
                  placeholder="Enter visiting department in institute"
                  className={`mt-1 block w-full px-3 py-2 border ${errors.visitingDepartmentInstitute ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.visitingDepartmentInstitute && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.visitingDepartmentInstitute}
                  </p>
                )}
              </div>
            )}

            {/* Org Name & Number of Days */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="organisationNameAndAddress"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Organization Name And Address <RequiredAst />
                </label>
                <textarea
                  name="organisationNameAndAddress"
                  id="organisationNameAndAddress"
                  rows={3}
                  value={formData.organisationNameAndAddress}
                  onChange={handleChange}
                  placeholder="Enter Organization Details"
                  className={`mt-1 block w-full px-3 py-2 border ${errors.organisationNameAndAddress ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.organisationNameAndAddress && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.organisationNameAndAddress}
                  </p>
                )}
              </div>
              <div>
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
                  min="1"
                  value={formData.numberOfDays}
                  onChange={handleChange}
                  placeholder="e.g. 2"
                  className={`mt-1 block w-full px-3 py-2 border ${errors.numberOfDays ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.numberOfDays && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.numberOfDays}
                  </p>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="fromDate"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  From Date <RequiredAst />
                </label>
                <input
                  type="date"
                  name="fromDate"
                  id="fromDate"
                  value={formData.fromDate}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.fromDate ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.fromDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.fromDate}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="toDate"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  To Date <RequiredAst />
                </label>
                <input
                  type="date"
                  name="toDate"
                  id="toDate"
                  value={formData.toDate}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.toDate ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.toDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.toDate}</p>
                )}
              </div>
            </div>

            {/* Document Proof */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Document Proof (PDF - max 2MB) <RequiredAst />
              </label>
              <div
                className={`mt-1 flex flex-col items-center justify-center w-full h-32 px-6 pt-5 pb-6 border-2 ${
                  errors.documentProof
                    ? "border-red-500"
                    : dragActive
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-300"
                } border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors bg-white`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <div className="space-y-1 text-center">
                  <UploadCloud
                    className={`mx-auto h-10 w-10 ${dragActive ? "text-indigo-600" : "text-slate-400"}`}
                  />
                  <div className="flex text-sm text-slate-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="documentProof"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    PDF, JPG, PNG up to 2MB
                  </p>
                </div>
              </div>
              {formData.documentProof && (
                <div className="mt-2 flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-200">
                  <FileText
                    size={16}
                    className="mr-2 flex-shrink-0 text-indigo-600"
                  />
                  <span className="font-medium mr-2 truncate">
                    {formData.documentProof.name}
                  </span>
                  <span className="text-slate-500 text-xs">
                    ({(formData.documentProof.size / 1024 / 1024).toFixed(2)}{" "}
                    MB)
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                    className="ml-auto text-red-500 hover:text-red-700 p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              {errors.documentProof && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.documentProof}
                </p>
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
                {isSubmitting ? "Saving..." : "Save Achievement"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
