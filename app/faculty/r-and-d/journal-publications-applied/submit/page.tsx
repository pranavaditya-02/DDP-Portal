"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, UploadCloud, FileText, X } from "lucide-react";
import { useAuthStore } from "@/lib/store";

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

type FileField = "documentProof1" | "submittedDocumentProof1";

type SelectYesNo = "" | "Yes" | "No";
type FacultyOrNA = "" | "Faculty" | "NA";

type FormData = {
  cadre: string;
  taskId: string;
  specialLabsInvolved: SelectYesNo;
  specialLab: string;
  industryInvolved: SelectYesNo;
  industryPersonAddress: string;
  role: "" | "PI" | "Co-PI" | "Co-ordinator" | "Fellowship Awardee" | "Grant";
  fundingAgencyType: "" | "Government" | "Non-Government";
  fundingAgencyName: string;
  fundingScheme: string;
  proposalTitle: string;
  proposalArea: string;
  requestedFundingAmount: string;
  projectDuration: string;
  internalFirstType: FacultyOrNA;
  firstFaculty: string;
  internalSecondType: FacultyOrNA;
  secondFaculty: string;
  internalThirdType: FacultyOrNA;
  thirdFaculty: string;
  internalFourthType: FacultyOrNA;
  fourthFaculty: string;
  internalFifthType: FacultyOrNA;
  fifthFaculty: string;
  externalInvestigator: "" | "Outside India" | "Outside BIT" | "NA";
  collaboration:
    | ""
    | "Industry"
    | "Other Institute in India"
    | "Foreign university";
  institutionNameIncluded: SelectYesNo;
  otherInvestigatorDetails: string;
  submissionDate: string;
  calledForPresentation: SelectYesNo;
  technicalReviewDate: string;
  documentProof1: File[];
  submittedDocumentProof1: File[];
  proposalSelectionStatus: "" | "Selected" | "Under Evaluation" | "Rejected";
};

type FormErrors = Partial<Record<keyof FormData, string>>;
type DragActiveStates = Partial<Record<FileField, boolean>>;

function FileUpload({
  label,
  name,
  files,
  onFilesSelect,
  error,
  required,
  dragActive,
  onDrag,
  onDrop,
}: {
  label: string;
  name: FileField;
  files: File[];
  onFilesSelect: (name: FileField, files: File[]) => void;
  error?: string;
  required?: boolean;
  dragActive?: boolean;
  onDrag: (e: React.DragEvent<HTMLLabelElement>, field: FileField) => void;
  onDrop: (e: React.DragEvent<HTMLLabelElement>, field: FileField) => void;
}) {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelect(name, Array.from(e.target.files));
    }
    e.target.value = "";
  };

  const clearFile = (index?: number) => {
    if (typeof index === "number" && files.length > 0) {
      const next = [...files];
      next.splice(index, 1);
      onFilesSelect(name, next);
      return;
    }
    onFilesSelect(name, []);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required ? <RequiredAst /> : null}
      </label>
      <label
        htmlFor={`file-input-${name}`}
        onDragEnter={(e) => onDrag(e, name)}
        onDragLeave={(e) => onDrag(e, name)}
        onDragOver={(e) => onDrag(e, name)}
        onDrop={(e) => onDrop(e, name)}
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors bg-white cursor-pointer ${
          dragActive
            ? "border-indigo-500 bg-indigo-50"
            : "border-slate-300 hover:border-indigo-500"
        }`}
      >
        <div className="space-y-1 text-center">
          <UploadCloud className="mx-auto h-10 w-10 text-slate-400" />
          <div className="flex text-sm text-slate-600 justify-center">
            <span className="font-medium text-indigo-600 hover:text-indigo-500">
              Upload files
            </span>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-slate-500">PDF, DOC, DOCX, JPG, PNG</p>
        </div>
        <input
          id={`file-input-${name}`}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          multiple
        />
      </label>

      {files.length > 0 ? (
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
                className="text-red-500 hover:text-red-700 p-1"
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

export default function JournalPublicationsAppliedSubmitPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [formData, setFormData] = useState<FormData>({
    cadre: "",
    taskId: "",
    specialLabsInvolved: "",
    specialLab: "",
    industryInvolved: "",
    industryPersonAddress: "",
    role: "",
    fundingAgencyType: "",
    fundingAgencyName: "",
    fundingScheme: "",
    proposalTitle: "",
    proposalArea: "",
    requestedFundingAmount: "",
    projectDuration: "",
    internalFirstType: "",
    firstFaculty: "",
    internalSecondType: "",
    secondFaculty: "",
    internalThirdType: "",
    thirdFaculty: "",
    internalFourthType: "",
    fourthFaculty: "",
    internalFifthType: "",
    fifthFaculty: "",
    externalInvestigator: "",
    collaboration: "",
    institutionNameIncluded: "",
    otherInvestigatorDetails: "",
    submissionDate: "",
    calledForPresentation: "",
    technicalReviewDate: "",
    documentProof1: [],
    submittedDocumentProof1: [],
    proposalSelectionStatus: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [dragActive, setDragActive] = useState<DragActiveStates>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.name && !formData.firstFaculty.trim()) {
      setFormData((prev) => ({
        ...prev,
        firstFaculty: user.name,
        internalFirstType: "Faculty",
      }));
    }
  }, [user?.name, formData.firstFaculty]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value } as FormData;

      if (name === "internalFirstType" && value === "NA")
        next.firstFaculty = "";
      if (name === "internalSecondType" && value === "NA")
        next.secondFaculty = "";
      if (name === "internalThirdType" && value === "NA")
        next.thirdFaculty = "";
      if (name === "internalFourthType" && value === "NA")
        next.fourthFaculty = "";
      if (name === "internalFifthType" && value === "NA")
        next.fifthFaculty = "";

      if (name === "specialLabsInvolved" && value === "No")
        next.specialLab = "";
      if (name === "industryInvolved" && value === "No")
        next.industryPersonAddress = "";
      if (name === "calledForPresentation" && value === "No")
        next.technicalReviewDate = "";

      return next;
    });

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof FormErrors];
        return next;
      });
    }
  };

  const handleFileSelect = (name: FileField, files: File[]) => {
    setFormData((prev) => ({ ...prev, [name]: files }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleDrag = (
    e: React.DragEvent<HTMLLabelElement>,
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
    e: React.DragEvent<HTMLLabelElement>,
    fieldName: FileField,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [fieldName]: false }));
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(fieldName, Array.from(e.dataTransfer.files));
    }
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!formData.cadre.trim()) nextErrors.cadre = "Cadre is required";
    if (!formData.taskId.trim()) nextErrors.taskId = "Task ID is required";
    if (!formData.specialLabsInvolved)
      nextErrors.specialLabsInvolved = "Special Labs Involved is required";
    if (formData.specialLabsInvolved === "Yes" && !formData.specialLab.trim())
      nextErrors.specialLab = "Special Lab is required";

    if (!formData.industryInvolved)
      nextErrors.industryInvolved = "Industry Involved is required";
    if (
      formData.industryInvolved === "Yes" &&
      !formData.industryPersonAddress.trim()
    ) {
      nextErrors.industryPersonAddress =
        "Name of Person with Industry and Address details is required";
    }

    if (!formData.role) nextErrors.role = "Role is required";
    if (!formData.fundingAgencyType)
      nextErrors.fundingAgencyType = "Funding Agency is required";
    if (!formData.fundingAgencyName.trim())
      nextErrors.fundingAgencyName = "Name of the Funding Agency is required";
    if (!formData.fundingScheme.trim())
      nextErrors.fundingScheme = "Funding Scheme is required";
    if (!formData.proposalTitle.trim())
      nextErrors.proposalTitle = "Proposal Title is required";
    if (!formData.proposalArea.trim())
      nextErrors.proposalArea = "Proposal Area is required";
    if (!formData.requestedFundingAmount.trim()) {
      nextErrors.requestedFundingAmount =
        "Requested Funding Amount is required";
    } else if (Number.isNaN(Number(formData.requestedFundingAmount))) {
      nextErrors.requestedFundingAmount =
        "Requested Funding Amount must be a number";
    }
    if (!formData.projectDuration.trim())
      nextErrors.projectDuration = "Project Duration is required";

    if (!formData.internalFirstType)
      nextErrors.internalFirstType =
        "Investigator/Co-Investigator Internal (First Faculty) is required";
    if (
      formData.internalFirstType === "Faculty" &&
      !formData.firstFaculty.trim()
    )
      nextErrors.firstFaculty = "First Faculty is required";

    if (!formData.internalSecondType)
      nextErrors.internalSecondType =
        "Investigator/Co-Investigator Internal (Second Faculty) is required";
    if (
      formData.internalSecondType === "Faculty" &&
      !formData.secondFaculty.trim()
    )
      nextErrors.secondFaculty = "Second Faculty is required";

    if (!formData.internalThirdType)
      nextErrors.internalThirdType =
        "Investigator/Co-Investigator Internal (Third Faculty) is required";
    if (
      formData.internalThirdType === "Faculty" &&
      !formData.thirdFaculty.trim()
    )
      nextErrors.thirdFaculty = "Third Faculty is required";

    if (!formData.internalFourthType)
      nextErrors.internalFourthType =
        "Investigator/Co-Investigator Internal (Fourth Faculty) is required";
    if (
      formData.internalFourthType === "Faculty" &&
      !formData.fourthFaculty.trim()
    )
      nextErrors.fourthFaculty = "Fourth Faculty is required";

    if (!formData.internalFifthType)
      nextErrors.internalFifthType =
        "Investigator/Co-Investigator Internal (Fifth Faculty) is required";
    if (
      formData.internalFifthType === "Faculty" &&
      !formData.fifthFaculty.trim()
    )
      nextErrors.fifthFaculty = "Fifth Faculty is required";

    if (!formData.externalInvestigator)
      nextErrors.externalInvestigator =
        "Investigator/Co-Investigator External is required";

    if (!formData.collaboration)
      nextErrors.collaboration = "Collaboration is required";

    if (!formData.institutionNameIncluded)
      nextErrors.institutionNameIncluded =
        "Institution Name(BIT) inclusion is required";

    if (!formData.submissionDate)
      nextErrors.submissionDate = "Submission Date is required";

    if (!formData.calledForPresentation)
      nextErrors.calledForPresentation =
        "Presentation / discussion response is required";

    if (
      formData.calledForPresentation === "Yes" &&
      !formData.technicalReviewDate
    )
      nextErrors.technicalReviewDate =
        "Date of Technical Review/ presentation is required";

    if (formData.documentProof1.length === 0)
      nextErrors.documentProof1 = "Document Proof1 is required";

    if (formData.submittedDocumentProof1.length === 0)
      nextErrors.submittedDocumentProof1 =
        "Submitted Document Proof1 is required";

    if (!formData.proposalSelectionStatus)
      nextErrors.proposalSelectionStatus =
        "Proposal Selection Status is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      alert("Journal Publications - Applied submitted successfully!");
      router.push("/faculty/r-and-d/journal-publications-applied");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (error?: string) =>
    `mt-1 block w-full px-3 py-2 border ${error ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`;

  const selectClass = (error?: string) =>
    `mt-1 block w-full px-3 py-2 h-10 border ${error ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Journal Publications - Applied
            </h1>
            <p className="text-sm text-slate-500">Add proposal details</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="cadre"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Cadre <RequiredAst />
                </label>
                <input
                  id="cadre"
                  name="cadre"
                  value={formData.cadre}
                  onChange={handleChange}
                  className={inputClass(errors.cadre)}
                />
                {errors.cadre ? (
                  <p className="mt-1 text-sm text-red-600">{errors.cadre}</p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="taskId"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Task ID <RequiredAst />
                </label>
                <input
                  id="taskId"
                  name="taskId"
                  value={formData.taskId}
                  onChange={handleChange}
                  className={inputClass(errors.taskId)}
                />
                {errors.taskId ? (
                  <p className="mt-1 text-sm text-red-600">{errors.taskId}</p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="specialLabsInvolved"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Special Labs Involved <RequiredAst />
                </label>
                <select
                  id="specialLabsInvolved"
                  name="specialLabsInvolved"
                  value={formData.specialLabsInvolved}
                  onChange={handleChange}
                  className={selectClass(errors.specialLabsInvolved)}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {errors.specialLabsInvolved ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.specialLabsInvolved}
                  </p>
                ) : null}
              </div>

              {formData.specialLabsInvolved === "Yes" ? (
                <div>
                  <label
                    htmlFor="specialLab"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Special Lab <RequiredAst />
                  </label>
                  <input
                    id="specialLab"  
                    name="specialLab"
                    value={formData.specialLab}
                    onChange={handleChange}
                    className={inputClass(errors.specialLab)}
                  />
                  {errors.specialLab ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.specialLab}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="industryInvolved"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Industry Involved <RequiredAst />
                </label>
                <select
                  id="industryInvolved"
                  name="industryInvolved"
                  value={formData.industryInvolved}
                  onChange={handleChange}
                  className={selectClass(errors.industryInvolved)}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {errors.industryInvolved ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.industryInvolved}
                  </p>
                ) : null}
              </div>

              {formData.industryInvolved === "Yes" ? (
                <div className="md:col-span-2">
                  <label
                    htmlFor="industryPersonAddress"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    If Yes, Name of Person with Industry and Address details{" "}
                    <RequiredAst />
                  </label>
                  <textarea
                    id="industryPersonAddress"
                    name="industryPersonAddress"
                    value={formData.industryPersonAddress}
                    onChange={handleChange}
                    rows={3}
                    className={inputClass(errors.industryPersonAddress)}
                  />
                  {errors.industryPersonAddress ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.industryPersonAddress}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Role <RequiredAst />
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={selectClass(errors.role)}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="PI">PI</option>
                  <option value="Co-PI">Co-PI</option>
                  <option value="Co-ordinator">Co-ordinator</option>
                  <option value="Fellowship Awardee">Fellowship Awardee</option>
                  <option value="Grant">Grant</option>
                </select>
                {errors.role ? (
                  <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="fundingAgencyType"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Funding Agency <RequiredAst />
                </label>
                <select
                  id="fundingAgencyType"
                  name="fundingAgencyType"
                  value={formData.fundingAgencyType}
                  onChange={handleChange}
                  className={selectClass(errors.fundingAgencyType)}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Government">Government</option>
                  <option value="Non-Government">Non-Government</option>
                </select>
                {errors.fundingAgencyType ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.fundingAgencyType}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="fundingAgencyName"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Name of the Funding Agency <RequiredAst />
                </label>
                <input
                  id="fundingAgencyName"
                  name="fundingAgencyName"
                  value={formData.fundingAgencyName}
                  onChange={handleChange}
                  className={inputClass(errors.fundingAgencyName)}
                />
                {errors.fundingAgencyName ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.fundingAgencyName}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="fundingScheme"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Funding Scheme <RequiredAst />
                </label>
                <input
                  id="fundingScheme"
                  name="fundingScheme"
                  value={formData.fundingScheme}
                  onChange={handleChange}
                  className={inputClass(errors.fundingScheme)}
                />
                {errors.fundingScheme ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.fundingScheme}
                  </p>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="proposalTitle"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Proposal Title <RequiredAst />
                </label>
                <input
                  id="proposalTitle"
                  name="proposalTitle"
                  value={formData.proposalTitle}
                  onChange={handleChange}
                  className={inputClass(errors.proposalTitle)}
                />
                {errors.proposalTitle ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.proposalTitle}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="proposalArea"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Proposal Area <RequiredAst />
                </label>
                <input
                  id="proposalArea"
                  name="proposalArea"
                  value={formData.proposalArea}
                  onChange={handleChange}
                  className={inputClass(errors.proposalArea)}
                />
                {errors.proposalArea ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.proposalArea}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="requestedFundingAmount"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Requested Funding Amount <RequiredAst />
                </label>
                <input
                  id="requestedFundingAmount"
                  name="requestedFundingAmount"
                  value={formData.requestedFundingAmount}
                  onChange={handleChange}
                  className={inputClass(errors.requestedFundingAmount)}
                  placeholder="Enter amount"
                />
                {errors.requestedFundingAmount ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.requestedFundingAmount}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="projectDuration"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Project Duration <RequiredAst />
                </label>
                <input
                  id="projectDuration"
                  name="projectDuration"
                  value={formData.projectDuration}
                  onChange={handleChange}
                  className={inputClass(errors.projectDuration)}
                  placeholder="e.g., 24 months"
                />
                {errors.projectDuration ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.projectDuration}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="internalFirstType"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Investigator/Co-Investigator Internal (First Faculty){" "}
                  <RequiredAst />
                </label>
                <select
                  id="internalFirstType"
                  name="internalFirstType"
                  value={formData.internalFirstType}
                  onChange={handleChange}
                  className={selectClass(errors.internalFirstType)}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Faculty">Faculty</option>
                  <option value="NA">NA</option>
                </select>
                {errors.internalFirstType ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.internalFirstType}
                  </p>
                ) : null}
              </div>

              {formData.internalFirstType === "Faculty" ? (
                <div>
                  <label
                    htmlFor="firstFaculty"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    First Faculty <RequiredAst />
                  </label>
                  <input
                    id="firstFaculty"
                    name="firstFaculty"
                    value={formData.firstFaculty}
                    onChange={handleChange}
                    className={inputClass(errors.firstFaculty)}
                  />
                  {errors.firstFaculty ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.firstFaculty}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="internalSecondType"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Investigator/Co-Investigator Internal (Second Faculty){" "}
                  <RequiredAst />
                </label>
                <select
                  id="internalSecondType"
                  name="internalSecondType"
                  value={formData.internalSecondType}
                  onChange={handleChange}
                  className={selectClass(errors.internalSecondType)}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Faculty">Faculty</option>
                  <option value="NA">NA</option>
                </select>
                {errors.internalSecondType ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.internalSecondType}
                  </p>
                ) : null}
              </div>

              {formData.internalSecondType === "Faculty" ? (
                <div>
                  <label
                    htmlFor="secondFaculty"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Second Faculty
                  </label>
                  <input
                    id="secondFaculty"
                    name="secondFaculty"
                    value={formData.secondFaculty}
                    onChange={handleChange}
                    className={inputClass(errors.secondFaculty)}
                  />
                  {errors.secondFaculty ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.secondFaculty}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="internalThirdType"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Investigator/Co-Investigator Internal (Third Faculty){" "}
                  <RequiredAst />
                </label>
                <select
                  id="internalThirdType"
                  name="internalThirdType"
                  value={formData.internalThirdType}
                  onChange={handleChange}
                  className={selectClass(errors.internalThirdType)}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Faculty">Faculty</option>
                  <option value="NA">NA</option>
                </select>
                {errors.internalThirdType ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.internalThirdType}
                  </p>
                ) : null}
              </div>

              {formData.internalThirdType === "Faculty" ? (
                <div>
                  <label
                    htmlFor="thirdFaculty"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Third Faculty
                  </label>
                  <input
                    id="thirdFaculty"
                    name="thirdFaculty"
                    value={formData.thirdFaculty}
                    onChange={handleChange}
                    className={inputClass(errors.thirdFaculty)}
                  />
                  {errors.thirdFaculty ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.thirdFaculty}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="internalFourthType"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Investigator/Co-Investigator Internal (Fourth Faculty){" "}
                  <RequiredAst />
                </label>
                <select
                  id="internalFourthType"
                  name="internalFourthType"
                  value={formData.internalFourthType}
                  onChange={handleChange}
                  className={selectClass(errors.internalFourthType)}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Faculty">Faculty</option>
                  <option value="NA">NA</option>
                </select>
                {errors.internalFourthType ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.internalFourthType}
                  </p>
                ) : null}
              </div>

              {formData.internalFourthType === "Faculty" ? (
                <div>
                  <label
                    htmlFor="fourthFaculty"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Fourth Faculty
                  </label>
                  <input
                    id="fourthFaculty"
                    name="fourthFaculty"
                    value={formData.fourthFaculty}
                    onChange={handleChange}
                    className={inputClass(errors.fourthFaculty)}
                  />
                  {errors.fourthFaculty ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.fourthFaculty}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="internalFifthType"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Investigator/Co-Investigator Internal (Fifth Faculty){" "}
                  <RequiredAst />
                </label>
                <select
                  id="internalFifthType"
                  name="internalFifthType"
                  value={formData.internalFifthType}
                  onChange={handleChange}
                  className={selectClass(errors.internalFifthType)}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Faculty">Faculty</option>
                  <option value="NA">NA</option>
                </select>
                {errors.internalFifthType ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.internalFifthType}
                  </p>
                ) : null}
              </div>

              {formData.internalFifthType === "Faculty" ? (
                <div>
                  <label
                    htmlFor="fifthFaculty"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Fifth Faculty
                  </label>
                  <input
                    id="fifthFaculty"
                    name="fifthFaculty"
                    value={formData.fifthFaculty}
                    onChange={handleChange}
                    className={inputClass(errors.fifthFaculty)}
                  />
                  {errors.fifthFaculty ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.fifthFaculty}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="externalInvestigator"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Investigator/Co-Investigator External <RequiredAst />
                </label>
                <select
                  id="externalInvestigator"
                  name="externalInvestigator"
                  value={formData.externalInvestigator}
                  onChange={handleChange}
                  className={selectClass(errors.externalInvestigator)}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Outside India">Outside India</option>
                  <option value="Outside BIT">Outside BIT</option>
                  <option value="NA">NA</option>
                </select>
                {errors.externalInvestigator ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.externalInvestigator}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="collaboration"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Collaboration <RequiredAst />
                </label>
                <select
                  id="collaboration"
                  name="collaboration"
                  value={formData.collaboration}
                  onChange={handleChange}
                  className={selectClass(errors.collaboration)}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Industry">Industry</option>
                  <option value="Other Institute in India">
                    Other Institute in India
                  </option>
                  <option value="Foreign university">Foreign university</option>
                </select>
                {errors.collaboration ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.collaboration}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="institutionNameIncluded"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Is Institution Name(BIT) included in the applicant?{" "}
                  <RequiredAst />
                </label>
                <select
                  id="institutionNameIncluded"
                  name="institutionNameIncluded"
                  value={formData.institutionNameIncluded}
                  onChange={handleChange}
                  className={selectClass(errors.institutionNameIncluded)}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {errors.institutionNameIncluded ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.institutionNameIncluded}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="submissionDate"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Submission Date <RequiredAst />
                </label>
                <input
                  id="submissionDate"
                  name="submissionDate"
                  type="date"
                  value={formData.submissionDate}
                  onChange={handleChange}
                  className={inputClass(errors.submissionDate)}
                />
                {errors.submissionDate ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.submissionDate}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="calledForPresentation"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Have you been called for presentation / discussion?{" "}
                  <RequiredAst />
                </label>
                <select
                  id="calledForPresentation"
                  name="calledForPresentation"
                  value={formData.calledForPresentation}
                  onChange={handleChange}
                  className={selectClass(errors.calledForPresentation)}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {errors.calledForPresentation ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.calledForPresentation}
                  </p>
                ) : null}
              </div>

              {formData.calledForPresentation === "Yes" ? (
                <div>
                  <label
                    htmlFor="technicalReviewDate"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Date of Technical Review/ presentation <RequiredAst />
                  </label>
                  <input
                    id="technicalReviewDate"
                    name="technicalReviewDate"
                    type="date"
                    value={formData.technicalReviewDate}
                    onChange={handleChange}
                    className={inputClass(errors.technicalReviewDate)}
                  />
                  {errors.technicalReviewDate ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.technicalReviewDate}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="proposalSelectionStatus"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Proposal Selection Status <RequiredAst />
                </label>
                <select
                  id="proposalSelectionStatus"
                  name="proposalSelectionStatus"
                  value={formData.proposalSelectionStatus}
                  onChange={handleChange}
                  className={selectClass(errors.proposalSelectionStatus)}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Selected">Selected</option>
                  <option value="Under Evaluation">Under Evaluation</option>
                  <option value="Rejected">Rejected</option>
                </select>
                {errors.proposalSelectionStatus ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.proposalSelectionStatus}
                  </p>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="otherInvestigatorDetails"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Other Investigator Details
                </label>
                <textarea
                  id="otherInvestigatorDetails"
                  name="otherInvestigatorDetails"
                  value={formData.otherInvestigatorDetails}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass(errors.otherInvestigatorDetails)}
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUpload
                  label="Document Proof1"
                  name="documentProof1"
                  files={formData.documentProof1}
                  onFilesSelect={handleFileSelect}
                  error={errors.documentProof1}
                  required
                  dragActive={dragActive.documentProof1}
                  onDrag={handleDrag}
                  onDrop={handleDrop}
                />
                <FileUpload
                  label="Submitted Document Proof1"
                  name="submittedDocumentProof1"
                  files={formData.submittedDocumentProof1}
                  onFilesSelect={handleFileSelect}
                  error={errors.submittedDocumentProof1}
                  required
                  dragActive={dragActive.submittedDocumentProof1}
                  onDrag={handleDrag}
                  onDrop={handleDrop}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-5 py-2.5 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-5 py-2.5 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-60"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
