"use client";

import {
  useEffect,
  useRef,
  useState,
  ChangeEvent,
  DragEvent,
  FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  FileText,
  X,
  Building2,
  User,
  Briefcase,
  Award,
  DollarSign,
  GraduationCap,
  CheckSquare,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

type OwiVerification = "" | "Initiated" | "Approved" | "Rejected";

type FormData = {
  faculty: string;
  sigNumber: string;
  taskId: string;
  nameOfLaboratory: string;
  collaborativeIndustry: string;
  domainAreaOfIndustry: string;
  laboratoryArea: string;
  totalAmountIncurred: string;
  bitContribution: string;
  financialSupportFromIndustry: string;
  equipmentSponsored: string;
  equipmentEnhancement: string;
  layoutDesignEnhancement: string;
  curriculumMapping: string;
  expectedOutcomes: string;
  proofDocument: File[];
  owiVerification: OwiVerification;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const OWI_VERIFICATION_OPTIONS: Array<{
  value: OwiVerification;
  label: string;
}> = [
  { value: "", label: "Choose an option" },
  { value: "Initiated", label: "Initiated" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

export default function LaboratoryByIndustrySubmitPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    faculty: "",
    sigNumber: "",
    taskId: "",
    nameOfLaboratory: "",
    collaborativeIndustry: "",
    domainAreaOfIndustry: "",
    laboratoryArea: "",
    totalAmountIncurred: "",
    bitContribution: "",
    financialSupportFromIndustry: "",
    equipmentSponsored: "",
    equipmentEnhancement: "",
    layoutDesignEnhancement: "",
    curriculumMapping: "",
    expectedOutcomes: "",
    proofDocument: [],
    owiVerification: "",
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

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof FormErrors];
        return next;
      });
    }
  };

  const pushFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray: File[] = [];
    for (let index = 0; index < files.length; index += 1) {
      fileArray.push(files[index]);
    }

    setFormData((prev) => ({
      ...prev,
      proofDocument: [...prev.proofDocument, ...fileArray],
    }));

    setErrors((prev) => {
      const next = { ...prev };
      delete next.proofDocument;
      return next;
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    pushFiles(e.target.files);
    e.target.value = "";
  };

  const clearFile = (index?: number) => {
    setFormData((prev) => {
      if (typeof index === "number") {
        const files = [...prev.proofDocument];
        files.splice(index, 1);
        return { ...prev, proofDocument: files };
      }

      return { ...prev, proofDocument: [] };
    });
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
    pushFiles(e.dataTransfer.files);
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!formData.faculty.trim()) nextErrors.faculty = "Faculty is required";
    if (!formData.sigNumber.trim())
      nextErrors.sigNumber = "SIG Number is required";
    if (!formData.taskId.trim()) nextErrors.taskId = "Task ID is required";
    if (!formData.nameOfLaboratory.trim())
      nextErrors.nameOfLaboratory = "Name of the Laboratory is required";
    if (!formData.collaborativeIndustry.trim())
      nextErrors.collaborativeIndustry = "Collaborative Industry is required";
    if (!formData.domainAreaOfIndustry.trim())
      nextErrors.domainAreaOfIndustry =
        "Domain area of the industry is required";

    if (!formData.laboratoryArea.trim()) {
      nextErrors.laboratoryArea = "Laboratory Area in Sq.m is required";
    } else if (
      Number.isNaN(Number(formData.laboratoryArea)) ||
      Number(formData.laboratoryArea) <= 0
    ) {
      nextErrors.laboratoryArea = "Please enter a valid number";
    }

    if (!formData.totalAmountIncurred.trim()) {
      nextErrors.totalAmountIncurred = "Total Amount Incurred is required";
    } else if (
      Number.isNaN(Number(formData.totalAmountIncurred)) ||
      Number(formData.totalAmountIncurred) < 0
    ) {
      nextErrors.totalAmountIncurred = "Please enter a valid number";
    }

    if (!formData.bitContribution.trim()) {
      nextErrors.bitContribution = "BIT Contribution is required";
    } else if (
      Number.isNaN(Number(formData.bitContribution)) ||
      Number(formData.bitContribution) < 0
    ) {
      nextErrors.bitContribution = "Please enter a valid number";
    }

    if (
      formData.financialSupportFromIndustry &&
      Number.isNaN(Number(formData.financialSupportFromIndustry))
    ) {
      nextErrors.financialSupportFromIndustry = "Please enter a valid number";
    }

    if (!formData.equipmentSponsored.trim())
      nextErrors.equipmentSponsored =
        "Equipment sponsored information is required";
    if (!formData.equipmentEnhancement.trim())
      nextErrors.equipmentEnhancement =
        "Equipment enhancement information is required";
    if (!formData.layoutDesignEnhancement.trim())
      nextErrors.layoutDesignEnhancement =
        "Layout design / enhancement information is required";
    if (!formData.curriculumMapping.trim())
      nextErrors.curriculumMapping = "Curriculum Mapping is required";
    if (!formData.expectedOutcomes.trim())
      nextErrors.expectedOutcomes = "Expected Outcomes is required";

    if (!formData.proofDocument || formData.proofDocument.length === 0) {
      nextErrors.proofDocument =
        "Proof document is required (Bills & Invoices, Sample training/equipment sponsored, Photographs, Approval Letter from the Institute)";
    }

    if (!formData.owiVerification) {
      nextErrors.owiVerification = "OWI Verification status is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

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

      formData.proofDocument.forEach((file) => {
        submitData.append("proofDocument", file);
      });

      const response = await fetch(`${API_URL}/api/owi/laboratoryByIndustry`, {
        method: "POST",
        body: submitData,
        credentials: "include",
      });

      if (!response.ok) {
        let message = "Unknown error";
        try {
          const body = await response.json();
          message = body.error || body.details || message;
        } catch {
          message = `${response.status} ${response.statusText}`;
        }
        throw new Error(message);
      }

      alert("Laboratory by Industry details submitted successfully!");
      router.push("/faculty/outside-world/laboratory-by-industry");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to submit form: ${msg}`);
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
              Laboratory by Industry
            </h1>
            <p className="text-sm text-slate-500">
              Add laboratory setup details by Industry collaboration
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Faculty Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="faculty"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Faculty <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="faculty"
                    id="faculty"
                    value={formData.faculty}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.faculty ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter faculty name"
                  />
                  {errors.faculty && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.faculty}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="sigNumber"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    SIG Number <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="sigNumber"
                    id="sigNumber"
                    value={formData.sigNumber}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.sigNumber ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter SIG Number"
                  />
                  {errors.sigNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.sigNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="taskId"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Task ID <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="taskId"
                    id="taskId"
                    value={formData.taskId}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.taskId ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter Task ID"
                  />
                  {errors.taskId && (
                    <p className="mt-1 text-sm text-red-600">{errors.taskId}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Laboratory Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="nameOfLaboratory"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Name of the Laboratory <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="nameOfLaboratory"
                    id="nameOfLaboratory"
                    value={formData.nameOfLaboratory}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.nameOfLaboratory ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter laboratory name"
                  />
                  {errors.nameOfLaboratory && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.nameOfLaboratory}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="collaborativeIndustry"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Collaborative Industry <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="collaborativeIndustry"
                    id="collaborativeIndustry"
                    value={formData.collaborativeIndustry}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.collaborativeIndustry ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter industry name"
                  />
                  {errors.collaborativeIndustry && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.collaborativeIndustry}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="domainAreaOfIndustry"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Domain area of the industry <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="domainAreaOfIndustry"
                    id="domainAreaOfIndustry"
                    value={formData.domainAreaOfIndustry}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.domainAreaOfIndustry ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="e.g., AI/ML, Data Science, IoT"
                  />
                  {errors.domainAreaOfIndustry && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.domainAreaOfIndustry}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="laboratoryArea"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Laboratory Area in Sq.m <RequiredAst />
                  </label>
                  <input
                    type="number"
                    name="laboratoryArea"
                    id="laboratoryArea"
                    value={formData.laboratoryArea}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`mt-1 block w-full px-3 py-2 border ${errors.laboratoryArea ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="e.g., 100"
                  />
                  {errors.laboratoryArea && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.laboratoryArea}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                Financial Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="totalAmountIncurred"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Total Amount Incurred (in Rs.) <RequiredAst />
                  </label>
                  <input
                    type="number"
                    name="totalAmountIncurred"
                    id="totalAmountIncurred"
                    value={formData.totalAmountIncurred}
                    onChange={handleChange}
                    min="0"
                    className={`mt-1 block w-full px-3 py-2 border ${errors.totalAmountIncurred ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="e.g., 500000"
                  />
                  {errors.totalAmountIncurred && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.totalAmountIncurred}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="bitContribution"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    BIT Contribution (in Rs.) <RequiredAst />
                  </label>
                  <input
                    type="number"
                    name="bitContribution"
                    id="bitContribution"
                    value={formData.bitContribution}
                    onChange={handleChange}
                    min="0"
                    className={`mt-1 block w-full px-3 py-2 border ${errors.bitContribution ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="e.g., 250000"
                  />
                  {errors.bitContribution && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.bitContribution}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="financialSupportFromIndustry"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Financial support from Industry (in Rs.)
                  </label>
                  <input
                    type="number"
                    name="financialSupportFromIndustry"
                    id="financialSupportFromIndustry"
                    value={formData.financialSupportFromIndustry}
                    onChange={handleChange}
                    min="0"
                    className={`mt-1 block w-full px-3 py-2 border ${errors.financialSupportFromIndustry ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="e.g., 250000"
                  />
                  {errors.financialSupportFromIndustry && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.financialSupportFromIndustry}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                Equipment & Infrastructure
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="equipmentSponsored"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Any equipment sponsored <RequiredAst />
                  </label>
                  <textarea
                    name="equipmentSponsored"
                    id="equipmentSponsored"
                    value={formData.equipmentSponsored}
                    onChange={handleChange}
                    rows={3}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.equipmentSponsored ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="List any equipment sponsored by the industry"
                  />
                  {errors.equipmentSponsored && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.equipmentSponsored}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="equipmentEnhancement"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Any equipment enhancement <RequiredAst />
                  </label>
                  <textarea
                    name="equipmentEnhancement"
                    id="equipmentEnhancement"
                    value={formData.equipmentEnhancement}
                    onChange={handleChange}
                    rows={3}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.equipmentEnhancement ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Describe any equipment enhancements"
                  />
                  {errors.equipmentEnhancement && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.equipmentEnhancement}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="layoutDesignEnhancement"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Layout design / enhancement <RequiredAst />
                </label>
                <textarea
                  name="layoutDesignEnhancement"
                  id="layoutDesignEnhancement"
                  value={formData.layoutDesignEnhancement}
                  onChange={handleChange}
                  rows={3}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.layoutDesignEnhancement ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Describe the layout design or enhancements made"
                />
                {errors.layoutDesignEnhancement && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.layoutDesignEnhancement}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
                Curriculum & Outcomes
              </h3>
              <div>
                <label
                  htmlFor="curriculumMapping"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Curriculum Mapping (mention the course code & Name) for newly
                  set laboratories <RequiredAst />
                </label>
                <textarea
                  name="curriculumMapping"
                  id="curriculumMapping"
                  value={formData.curriculumMapping}
                  onChange={handleChange}
                  rows={3}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.curriculumMapping ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="e.g., CS301 - Data Structures Lab, CS401 - Machine Learning Lab"
                />
                {errors.curriculumMapping && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.curriculumMapping}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="expectedOutcomes"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Expected Outcomes <RequiredAst />
                </label>
                <textarea
                  name="expectedOutcomes"
                  id="expectedOutcomes"
                  value={formData.expectedOutcomes}
                  onChange={handleChange}
                  rows={3}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.expectedOutcomes ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Describe the expected outcomes of the laboratory"
                />
                {errors.expectedOutcomes && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.expectedOutcomes}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Award className="h-5 w-5 mr-2 text-blue-600" />
                Documents
              </h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Proof : (Bills & Invoices, Sample training/equipment
                  sponsored, Photographs, Approval Letter from the Institute){" "}
                  <RequiredAst />
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`mt-1 flex flex-col items-center justify-center w-full h-32 px-6 pt-5 pb-6 border-2 ${
                    errors.proofDocument
                      ? "border-red-500"
                      : dragActive
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-300"
                  } border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors bg-white`}
                >
                  <div className="space-y-1 text-center">
                    <UploadCloud
                      className={`mx-auto h-12 w-12 ${dragActive ? "text-indigo-600" : "text-slate-400"}`}
                    />
                    <div className="flex text-sm text-slate-600">
                      <span className="cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                        Upload files
                      </span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500">
                      PDF, DOC, DOCX, JPG, PNG up to 10MB
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  id="proof-upload"
                  name="proofDocument"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {formData.proofDocument.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {formData.proofDocument.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-200"
                      >
                        <FileText
                          size={16}
                          className="mr-2 flex-shrink-0 text-indigo-600"
                        />
                        <span className="font-medium mr-2 truncate flex-1">
                          {file.name}
                        </span>
                        <span className="text-xs text-slate-400 mr-2">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearFile(index);
                          }}
                          className="ml-auto text-red-500 hover:text-red-700 p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {errors.proofDocument && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.proofDocument}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <CheckSquare className="h-5 w-5 mr-2 text-blue-600" />
                OWI Verification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="owiVerification"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    OWI Verification Status <RequiredAst />
                  </label>
                  <select
                    name="owiVerification"
                    id="owiVerification"
                    value={formData.owiVerification}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 h-10 border ${errors.owiVerification ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                  >
                    {OWI_VERIFICATION_OPTIONS.map((option) => (
                      <option
                        key={option.label}
                        value={option.value}
                        disabled={option.value === ""}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.owiVerification && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.owiVerification}
                    </p>
                  )}
                </div>
              </div>
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
                {isSubmitting ? "Saving..." : "Save Record"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
