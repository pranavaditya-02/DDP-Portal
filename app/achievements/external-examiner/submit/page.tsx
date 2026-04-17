"use client";

import { useState, ChangeEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, UploadCloud, FileText, X } from "lucide-react";
import { buildFormData, submitAchievement } from "../../facultyActivitiesApi";

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

const PURPOSE_OF_VISIT_OPTIONS = [
  "Click to choose",
  "Central Valuation",
  "Flying Squad",
  "Hall invigilator",
  "Practical/Project viva External Examiner",
  "Question Paper Scrutiny",
  "QP Setter",
  "University Representative",
];

const EXAMINATION_NAME_PURPOSES = [
  "Central Valuation",
  "University Representative",
];

const QP_RELATED_PURPOSES = ["Question Paper Scrutiny", "QP Setter"];

const SPECIAL_LAB_OPTIONS = [
  "Select Special Lab",
  "AI Lab",
  "Robotics Lab",
  "IoT Lab",
  "Cyber Security Lab",
  "Cloud Computing Lab",
  "Data Science Lab",
];

const DEPARTMENT_OPTIONS = [
  "Select Department",
  "CSE",
  "ECE",
  "EEE",
  "IT",
  "MECH",
  "CIVIL",
  "AIML",
  "AIDS",
  "BT",
  "FT",
  "ISE",
  "AGRI",
  "AUTO",
  "AERO",
  "CHEM",
];

type FormData = {
  taskID: string;
  specialLabsInvolved: "yes" | "no";
  specialLab: string;
  collegeName: string;
  instituteAddress: string;
  purposeOfVisit: string;
  nameOfExamination: string;
  departmentOfQP: string;
  subjectOfQP: string;
  documentProof: File | null;
  numberOfDays: string;
  fromDate: string;
  toDate: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function ExternalExaminerSubmitPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    taskID: "",
    specialLabsInvolved: "no",
    specialLab: "",
    collegeName: "",
    instituteAddress: "",
    purposeOfVisit: "",
    nameOfExamination: "",
    departmentOfQP: "",
    subjectOfQP: "",
    documentProof: null,
    numberOfDays: "",
    fromDate: "",
    toDate: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const isExaminationNamePurpose = EXAMINATION_NAME_PURPOSES.includes(
    formData.purposeOfVisit,
  );
  const isQPRelatedPurpose = QP_RELATED_PURPOSES.includes(
    formData.purposeOfVisit,
  );

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, documentProof: e.target.files![0] }));
      setErrors((prev) => ({ ...prev, documentProof: "" }));
    }
  };

  const clearFile = () => {
    setFormData((prev) => ({ ...prev, documentProof: null }));
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData((prev) => ({
        ...prev,
        documentProof: e.dataTransfer.files[0],
      }));
      setErrors((prev) => ({ ...prev, documentProof: "" }));
    }
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!formData.taskID) nextErrors.taskID = "Task ID is required";

    if (formData.specialLabsInvolved === "yes" && !formData.specialLab) {
      nextErrors.specialLab = "Special Lab is required";
    }

    if (!formData.collegeName) {
      nextErrors.collegeName = "Name of College/University is required";
    }

    if (!formData.instituteAddress) {
      nextErrors.instituteAddress = "Address is required";
    }

    if (
      !formData.purposeOfVisit ||
      formData.purposeOfVisit === "Click to choose"
    ) {
      nextErrors.purposeOfVisit = "Purpose of Visit is required";
    }

    if (isExaminationNamePurpose && !formData.nameOfExamination) {
      nextErrors.nameOfExamination = "Name of Examination is required";
    }

    if (isQPRelatedPurpose) {
      if (
        !formData.departmentOfQP ||
        formData.departmentOfQP === "Select Department"
      ) {
        nextErrors.departmentOfQP = "Department of QP is required";
      }
      if (!formData.subjectOfQP) {
        nextErrors.subjectOfQP = "Subject of QP is required";
      }
    }

    if (!formData.documentProof) {
      nextErrors.documentProof = "Document Proof is required";
    }

    if (!formData.numberOfDays) {
      nextErrors.numberOfDays = "No. of Days is required";
    }

    if (!formData.fromDate) {
      nextErrors.fromDate = "From Date is required";
    }

    if (!formData.toDate) {
      nextErrors.toDate = "To Date is required";
    }

    if (formData.fromDate && formData.toDate) {
      if (new Date(formData.toDate) < new Date(formData.fromDate)) {
        nextErrors.toDate = "To Date cannot be before From Date";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const fillTestData = () => {
    setFormData({
      taskID: "TASK-EXTEXAM-001",
      specialLabsInvolved: "no",
      specialLab: "",
      collegeName: "Test College",
      instituteAddress: "123 Test Street",
      purposeOfVisit: "QP Setter",
      nameOfExamination: "QP Setter",
      departmentOfQP: "1",
      subjectOfQP: "Test Subject",
      numberOfDays: "1",
      fromDate: "2026-04-16",
      toDate: "2026-04-17",
      documentProof: null,
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildFormData(formData);
      await submitAchievement("external-examiner", payload);
      router.push("/achievements/external-examiner");
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
              Add External Examiner Details
            </h1>
            <p className="text-sm text-slate-500">
              Create record for External Examiner activities
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
                  htmlFor="collegeName"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Name of the external College/University <RequiredAst />
                </label>
                <input
                  type="text"
                  name="collegeName"
                  id="collegeName"
                  value={formData.collegeName}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.collegeName ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter College Name"
                />
                {errors.collegeName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.collegeName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="instituteAddress"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Address of the Institute <RequiredAst />
                </label>
                <input
                  type="text"
                  name="instituteAddress"
                  id="instituteAddress"
                  value={formData.instituteAddress}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.instituteAddress ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter Address"
                />
                {errors.instituteAddress && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.instituteAddress}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="purposeOfVisit"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Purpose of Visit <RequiredAst />
                </label>
                <select
                  name="purposeOfVisit"
                  id="purposeOfVisit"
                  value={formData.purposeOfVisit}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.purposeOfVisit ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                >
                  {PURPOSE_OF_VISIT_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option === "Click to choose"}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.purposeOfVisit && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.purposeOfVisit}
                  </p>
                )}
              </div>
            </div>

            {isExaminationNamePurpose && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="nameOfExamination"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Name of Examination <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="nameOfExamination"
                    id="nameOfExamination"
                    value={formData.nameOfExamination}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.nameOfExamination ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter Examination Name"
                  />
                  {errors.nameOfExamination && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.nameOfExamination}
                    </p>
                  )}
                </div>
              </div>
            )}

            {isQPRelatedPurpose && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="departmentOfQP"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Department of QP <RequiredAst />
                  </label>
                  <select
                    name="departmentOfQP"
                    id="departmentOfQP"
                    value={formData.departmentOfQP}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.departmentOfQP ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                  >
                    {DEPARTMENT_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option === "Select Department" ? "" : option}
                        disabled={option === "Select Department"}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.departmentOfQP && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.departmentOfQP}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="subjectOfQP"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Subject of QP <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="subjectOfQP"
                    id="subjectOfQP"
                    value={formData.subjectOfQP}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.subjectOfQP ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter Subject"
                  />
                  {errors.subjectOfQP && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.subjectOfQP}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Document Proof <RequiredAst />
              </label>
              <div
                className={`mt-1 flex flex-col items-center justify-center w-full h-40 px-6 pt-5 pb-6 border-2 ${errors.documentProof ? "border-red-500" : dragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-300"} border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors bg-white`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <div className="space-y-1 text-center">
                  <UploadCloud
                    className={`mx-auto h-12 w-12 ${dragActive ? "text-indigo-600" : "text-slate-400"}`}
                  />
                  <div className="flex text-sm text-slate-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="documentProof"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="numberOfDays"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  No. of Days <RequiredAst />
                </label>
                <input
                  type="number"
                  name="numberOfDays"
                  id="numberOfDays"
                  value={formData.numberOfDays}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.numberOfDays ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="e.g. 1"
                  min="1"
                />
                {errors.numberOfDays && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.numberOfDays}
                  </p>
                )}
              </div>

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
                {isSubmitting ? "Submitting..." : "Save Achievement"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
