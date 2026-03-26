"use client";

import { useEffect, useState, ChangeEvent, DragEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { ArrowLeft, Save, UploadCloud, FileText, X } from "lucide-react";

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

const YES_NO_OPTIONS = ["Choose an option", "yes", "No"];
const TYPE_OF_INDUSTRY_OPTIONS = [
  "Choose an option",
  "MNC",
  "Large Scale",
  "MSME",
  "Small Scale",
  "others",
];
const INDUSTRY_PROJECT_OPTIONS = ["Choose an option", "Product", "Process"];
const OWI_VERIFICATION_OPTIONS = ["Initiated", "Approved", "Rejected"];
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
  faculty: string;
  taskID: string;
  specialLabsInvolved: string;
  specialLab: string;
  numberOfFaculty: string;
  faculty2: string;
  faculty2SIG: string;
  faculty3: string;
  faculty3SIG: string;
  faculty4: string;
  faculty4SIG: string;
  faculty5: string;
  faculty5SIG: string;
  numberOfStudents: string;
  student1: string;
  student2: string;
  student3: string;
  student4: string;
  student5: string;
  industryName: string;
  typeOfIndustry: string;
  othersSpecify: string;
  industryProject: string;
  projectTitle: string;
  durationMonths: string;
  startDate: string;
  endDate: string;
  outcome: string;
  industryProjectProof: File | null;
  owiVerification: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function FacultyIndustryProjectsSubmitPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState<FormData>({
    faculty: "",
    taskID: "",
    specialLabsInvolved: "Choose an option",
    specialLab: "",
    numberOfFaculty: "0",
    faculty2: "",
    faculty2SIG: "",
    faculty3: "",
    faculty3SIG: "",
    faculty4: "",
    faculty4SIG: "",
    faculty5: "",
    faculty5SIG: "",
    numberOfStudents: "0",
    student1: "",
    student2: "",
    student3: "",
    student4: "",
    student5: "",
    industryName: "",
    typeOfIndustry: "Choose an option",
    othersSpecify: "",
    industryProject: "Choose an option",
    projectTitle: "",
    durationMonths: "",
    startDate: "",
    endDate: "",
    outcome: "",
    industryProjectProof: null,
    owiVerification: "Initiated",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [dragActive, setDragActive] = useState(false);
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData((prev) => ({
        ...prev,
        industryProjectProof: e.target.files![0],
      }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.industryProjectProof;
        return next;
      });
    }
  };

  const clearFile = () => {
    setFormData((prev) => ({ ...prev, industryProjectProof: null }));
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
    if (e.dataTransfer.files?.[0]) {
      setFormData((prev) => ({
        ...prev,
        industryProjectProof: e.dataTransfer.files[0],
      }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.industryProjectProof;
        return next;
      });
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
    if (formData.specialLabsInvolved === "yes" && !formData.specialLab) {
      nextErrors.specialLab = "Special Lab name is required";
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        nextErrors.endDate = "End Date cannot be before Start Date";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/faculty/outside-world/faculty-industry-projects");
    } catch (error) {
      console.error("Error submitting Industry Project:", error);
      alert("Failed to submit project details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const numberOfFaculty = Math.max(
    0,
    Math.min(4, Number(formData.numberOfFaculty) || 0),
  );
  const numberOfStudents = Math.max(
    0,
    Math.min(5, Number(formData.numberOfStudents) || 0),
  );
  const showSpecialLab = formData.specialLabsInvolved === "yes";

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
              Add Faculty Industry Project Details
            </h1>
            <p className="text-sm text-slate-500">
              Create record for Faculty Industry Projects
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
              )}
            </div>

            <h3 className="text-lg font-medium text-slate-900 border-b pb-2">
              Additional Faculty Members
            </h3>
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
                min="0"
                max="4"
                value={formData.numberOfFaculty}
                onChange={handleChange}
                className="mt-1 block w-full md:w-64 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter Count (0-4)"
              />
            </div>

            {numberOfFaculty > 0 && (
              <div className="space-y-4">
                {[2, 3, 4, 5].slice(0, numberOfFaculty).map((num) => (
                  <div
                    key={num}
                    className="bg-slate-50 p-4 rounded-md border border-slate-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Faculty {num} Name
                        </label>
                        <input
                          type="text"
                          name={`faculty${num}`}
                          value={
                            formData[
                              `faculty${num}` as keyof FormData
                            ] as string
                          }
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Enter Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Faculty {num} SIG
                        </label>
                        <input
                          type="text"
                          name={`faculty${num}SIG`}
                          value={
                            formData[
                              `faculty${num}SIG` as keyof FormData
                            ] as string
                          }
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Enter SIG"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 className="text-lg font-medium text-slate-900 border-b pb-2">
              Students Involved
            </h3>
            <div>
              <label
                htmlFor="numberOfStudents"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                How many students are involved?
              </label>
              <input
                type="number"
                name="numberOfStudents"
                id="numberOfStudents"
                min="0"
                max="5"
                value={formData.numberOfStudents}
                onChange={handleChange}
                className="mt-1 block w-full md:w-64 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter Count (0-5)"
              />
            </div>

            {numberOfStudents > 0 && (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].slice(0, numberOfStudents).map((num) => (
                  <div
                    key={num}
                    className="bg-blue-50 p-4 rounded-md border border-blue-200"
                  >
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Student {num}
                      </label>
                      <input
                        type="text"
                        name={`student${num}`}
                        value={
                          formData[`student${num}` as keyof FormData] as string
                        }
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter Student Name"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 className="text-lg font-medium text-slate-900 border-b pb-2">
              Industry & Project Information
            </h3>

            <div>
              <label
                htmlFor="industryName"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Name of the Industry / Organization / Others
              </label>
              <input
                type="text"
                name="industryName"
                id="industryName"
                value={formData.industryName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter Industry/Organization Name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="typeOfIndustry"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Type of Industry
                </label>
                <select
                  name="typeOfIndustry"
                  id="typeOfIndustry"
                  value={formData.typeOfIndustry}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                >
                  {TYPE_OF_INDUSTRY_OPTIONS.map((option) => (
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
              {formData.typeOfIndustry === "others" && (
                <div>
                  <label
                    htmlFor="othersSpecify"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    If Others, Please Specify
                  </label>
                  <input
                    type="text"
                    name="othersSpecify"
                    id="othersSpecify"
                    value={formData.othersSpecify}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Specify Type"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="industryProject"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Industry Project
                </label>
                <select
                  name="industryProject"
                  id="industryProject"
                  value={formData.industryProject}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                >
                  {INDUSTRY_PROJECT_OPTIONS.map((option) => (
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
                  htmlFor="durationMonths"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Duration (in months)
                </label>
                <input
                  type="number"
                  name="durationMonths"
                  id="durationMonths"
                  value={formData.durationMonths}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Duration"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="projectTitle"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Title of the Project
              </label>
              <input
                type="text"
                name="projectTitle"
                id="projectTitle"
                value={formData.projectTitle}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter Project Title"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  End Date
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

            <div>
              <label
                htmlFor="outcome"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Outcome
              </label>
              <textarea
                name="outcome"
                id="outcome"
                rows={4}
                value={formData.outcome}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Describe the outcome of the project"
              />
            </div>

            <h3 className="text-lg font-medium text-slate-900 border-b pb-2">
              Documents
            </h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Industry Project Proof
                <span className="block text-xs text-slate-500 mt-1">
                  (Approval Letter, Certificate, Project Report, Sample photos,
                  Joint IPR)
                </span>
              </label>
              <div
                className={`mt-1 flex flex-col items-center justify-center w-full h-32 px-6 pt-5 pb-6 border-2 ${
                  errors.industryProjectProof
                    ? "border-red-500"
                    : dragActive
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-300"
                } border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors bg-white`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("proof-upload")?.click()}
              >
                <div className="space-y-1 text-center">
                  <UploadCloud
                    className={`mx-auto h-10 w-10 ${dragActive ? "text-indigo-600" : "text-slate-400"}`}
                  />
                  <div className="flex text-sm text-slate-600">
                    <label
                      htmlFor="proof-upload"
                      className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="proof-upload"
                        name="industryProjectProof"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    PDF, JPG, PNG up to 10MB
                  </p>
                </div>
              </div>
              {formData.industryProjectProof && (
                <div className="mt-2 flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-200">
                  <FileText
                    size={16}
                    className="mr-2 flex-shrink-0 text-indigo-600"
                  />
                  <span className="font-medium mr-2 truncate">
                    {formData.industryProjectProof.name}
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
              {errors.industryProjectProof && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.industryProjectProof}
                </p>
              )}
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
                {isSubmitting ? "Saving..." : "Save Industry Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
