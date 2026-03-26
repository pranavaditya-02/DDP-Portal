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
  User,
  Building2,
  Award,
  CheckSquare,
  Briefcase,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

const MEMBERSHIP_CATEGORY_OPTIONS = [
  { value: "", label: "Choose an option" },
  { value: "Institute Membership", label: "Institute Membership" },
  { value: "Faculty Membership", label: "Faculty Membership" },
] as const;

const SPECIAL_LABS_OPTIONS = [
  { value: "", label: "Choose an option" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;

const MEMBERSHIP_TYPE_OPTIONS = [
  { value: "", label: "Choose an option" },
  { value: "Annual", label: "Annual" },
  { value: "Lifetime", label: "Lifetime" },
] as const;

const CATEGORY_OPTIONS = [
  { value: "", label: "Choose an option" },
  { value: "National", label: "National" },
  { value: "International", label: "International" },
] as const;

const VALIDITY_TYPE_OPTIONS = [
  { value: "", label: "Choose an option" },
  { value: "Self", label: "Self" },
  { value: "BIT", label: "BIT" },
  { value: "Others", label: "Others" },
] as const;

const OWI_VERIFICATION_OPTIONS = ["Initiated", "Approved", "Rejected"] as const;

type MultiFileField = "apexDocumentProof" | "documentProof";

type FormData = {
  membershipCategory: string;
  faculty: string;
  taskId: string;
  specialLabsInvolved: string;
  specialLab: string;
  nameOfProfessionalBody: string;
  membershipType: string;
  membershipId: string;
  nameOfGradeLevelPosition: string;
  category: string;
  validityType: string;
  apexDocumentProof: File[];
  amount: string;
  ifOthers: string;
  amountIfOthers: string;
  documentProof: File[];
  owiVerification: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;
type DragActiveStates = Partial<Record<MultiFileField, boolean>>;

export default function ProfessionalMembershipSubmitPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const fileInputRefs = useRef<
    Partial<Record<MultiFileField, HTMLInputElement | null>>
  >({});

  const [formData, setFormData] = useState<FormData>({
    membershipCategory: "",
    faculty: "",
    taskId: "",
    specialLabsInvolved: "",
    specialLab: "",
    nameOfProfessionalBody: "",
    membershipType: "",
    membershipId: "",
    nameOfGradeLevelPosition: "",
    category: "",
    validityType: "",
    apexDocumentProof: [],
    amount: "",
    ifOthers: "",
    amountIfOthers: "",
    documentProof: [],
    owiVerification: "Initiated",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [dragActive, setDragActive] = useState<DragActiveStates>({});
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

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    fieldName: MultiFileField,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: [...prev[fieldName], ...Array.from(e.target.files ?? [])],
      }));

      if (errors[fieldName]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[fieldName];
          return next;
        });
      }
    }
    e.target.value = "";
  };

  const openFileDialog = (fieldName: MultiFileField) => {
    fileInputRefs.current[fieldName]?.click();
  };

  const clearFile = (fieldName: MultiFileField, index?: number) => {
    setFormData((prev) => {
      if (typeof index === "number") {
        const newFiles = [...prev[fieldName]];
        newFiles.splice(index, 1);
        return { ...prev, [fieldName]: newFiles };
      }

      return { ...prev, [fieldName]: [] };
    });
  };

  const handleDrag = (
    e: DragEvent<HTMLDivElement>,
    fieldName: MultiFileField,
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
    e: DragEvent<HTMLDivElement>,
    fieldName: MultiFileField,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [fieldName]: false }));
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: [...prev[fieldName], ...Array.from(e.dataTransfer.files)],
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

  const renderFileUpload = (
    fieldName: MultiFileField,
    label: string,
    isRequired = false,
    helperText = "",
  ) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {isRequired ? <RequiredAst /> : null}
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
        onClick={() => openFileDialog(fieldName)}
      >
        <div className="space-y-1 text-center">
          <UploadCloud
            className={`mx-auto h-12 w-12 ${dragActive[fieldName] ? "text-indigo-600" : "text-slate-400"}`}
          />
          <div className="flex text-sm text-slate-600">
            <label
              htmlFor={fieldName}
              className="cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
            >
              <span>Upload files</span>
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-slate-500">
            PDF, DOC, DOCX, JPG, PNG up to 10MB
          </p>
          {helperText ? (
            <p className="text-xs text-slate-400 mt-1">{helperText}</p>
          ) : null}
        </div>
      </div>
      <input
        ref={(el) => {
          fileInputRefs.current[fieldName] = el;
        }}
        id={fieldName}
        name={fieldName}
        type="file"
        className="hidden"
        multiple
        onChange={(e) => handleFileChange(e, fieldName)}
      />
      {formData[fieldName] && formData[fieldName].length > 0 ? (
        <div className="mt-2 space-y-2">
          {formData[fieldName].map((file, index) => (
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
                  clearFile(fieldName, index);
                }}
                className="ml-auto text-red-500 hover:text-red-700 p-1"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      {errors[fieldName] ? (
        <p className="mt-1 text-sm text-red-600">{errors[fieldName]}</p>
      ) : null}
    </div>
  );

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!formData.membershipCategory)
      nextErrors.membershipCategory = "Membership Category is required";
    if (!formData.faculty.trim()) nextErrors.faculty = "Faculty is required";
    if (!formData.taskId.trim()) nextErrors.taskId = "Task ID is required";
    if (!formData.specialLabsInvolved)
      nextErrors.specialLabsInvolved = "Special Labs Involved is required";
    if (formData.specialLabsInvolved === "yes" && !formData.specialLab.trim())
      nextErrors.specialLab = "Special Lab Name is required";
    if (!formData.nameOfProfessionalBody.trim())
      nextErrors.nameOfProfessionalBody =
        "Name of the Professional Body is required";
    if (!formData.membershipType)
      nextErrors.membershipType = "Membership Type is required";
    if (!formData.membershipId.trim())
      nextErrors.membershipId = "Membership ID is required";
    if (!formData.nameOfGradeLevelPosition.trim())
      nextErrors.nameOfGradeLevelPosition =
        "Name of the Grade/Level/Position is required";
    if (!formData.category) nextErrors.category = "Category is required";
    if (!formData.validityType)
      nextErrors.validityType = "Validity Type is required";

    if (formData.validityType === "BIT") {
      if (
        !formData.apexDocumentProof ||
        formData.apexDocumentProof.length === 0
      ) {
        nextErrors.apexDocumentProof = "Apex Document Proof is required";
      }
      if (!formData.amount.trim()) {
        nextErrors.amount = "Amount, in Rs. is required";
      } else if (Number.isNaN(Number(formData.amount))) {
        nextErrors.amount = "Amount must be a number";
      }
    } else if (formData.validityType === "Others") {
      if (!formData.ifOthers.trim()) {
        nextErrors.ifOthers = "Please specify the others";
      }
      if (!formData.amountIfOthers.trim()) {
        nextErrors.amountIfOthers = "Amount, in Rs. is required";
      } else if (Number.isNaN(Number(formData.amountIfOthers))) {
        nextErrors.amountIfOthers = "Amount must be a number";
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
      if (!API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured");
      }

      const submitData = new FormData();
      (Object.keys(formData) as Array<keyof FormData>).forEach((key) => {
        if (key !== "apexDocumentProof" && key !== "documentProof") {
          submitData.append(key, formData[key] as string);
        }
      });

      if (formData.apexDocumentProof.length > 0) {
        formData.apexDocumentProof.forEach((file) => {
          submitData.append("apexDocumentProof", file);
        });
      }

      if (formData.documentProof.length > 0) {
        formData.documentProof.forEach((file) => {
          submitData.append("documentProof", file);
        });
      }

      const response = await fetch(
        `${API_URL}/api/owi/professionalMembership`,
        {
          method: "POST",
          body: submitData,
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.details || "Unknown error",
        );
      }

      alert("Professional Membership submitted successfully!");
      router.push("/faculty/outside-world/professional-membership");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to submit form: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Professional Membership Details
            </h1>
            <p className="text-sm text-slate-500">
              Add Professional Membership details
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
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
                    htmlFor="membershipCategory"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Membership Category <RequiredAst />
                  </label>
                  <select
                    name="membershipCategory"
                    id="membershipCategory"
                    value={formData.membershipCategory}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 h-10 border ${errors.membershipCategory ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                  >
                    {MEMBERSHIP_CATEGORY_OPTIONS.map((option) => (
                      <option
                        key={option.label}
                        value={option.value}
                        disabled={option.value === ""}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.membershipCategory ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.membershipCategory}
                    </p>
                  ) : null}
                </div>

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
                  {errors.faculty ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.faculty}
                    </p>
                  ) : null}
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
                    name="specialLabsInvolved"
                    id="specialLabsInvolved"
                    value={formData.specialLabsInvolved}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 h-10 border ${errors.specialLabsInvolved ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                  >
                    {SPECIAL_LABS_OPTIONS.map((option) => (
                      <option
                        key={option.label}
                        value={option.value}
                        disabled={option.value === ""}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.specialLabsInvolved ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.specialLabsInvolved}
                    </p>
                  ) : null}
                </div>
              </div>

              {formData.specialLabsInvolved === "yes" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="specialLab"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Special Lab Name <RequiredAst />
                    </label>
                    <input
                      type="text"
                      name="specialLab"
                      id="specialLab"
                      value={formData.specialLab}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border ${errors.specialLab ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="Enter special lab name"
                    />
                    {errors.specialLab ? (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.specialLab}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                Membership Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="nameOfProfessionalBody"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Name of the Professional Body <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="nameOfProfessionalBody"
                    id="nameOfProfessionalBody"
                    value={formData.nameOfProfessionalBody}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.nameOfProfessionalBody ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter professional body name"
                  />
                  {errors.nameOfProfessionalBody ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.nameOfProfessionalBody}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="membershipType"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Membership Type <RequiredAst />
                  </label>
                  <select
                    name="membershipType"
                    id="membershipType"
                    value={formData.membershipType}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 h-10 border ${errors.membershipType ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                  >
                    {MEMBERSHIP_TYPE_OPTIONS.map((option) => (
                      <option
                        key={option.label}
                        value={option.value}
                        disabled={option.value === ""}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.membershipType ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.membershipType}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="membershipId"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Membership ID <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="membershipId"
                    id="membershipId"
                    value={formData.membershipId}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.membershipId ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter membership ID"
                  />
                  {errors.membershipId ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.membershipId}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="nameOfGradeLevelPosition"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Name of the Grade/Level/Position <RequiredAst />
                  </label>
                  <input
                    type="text"
                    name="nameOfGradeLevelPosition"
                    id="nameOfGradeLevelPosition"
                    value={formData.nameOfGradeLevelPosition}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.nameOfGradeLevelPosition ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter grade/level/position"
                  />
                  {errors.nameOfGradeLevelPosition ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.nameOfGradeLevelPosition}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Category <RequiredAst />
                  </label>
                  <select
                    name="category"
                    id="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 h-10 border ${errors.category ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option
                        key={option.label}
                        value={option.value}
                        disabled={option.value === ""}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.category ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.category}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="validityType"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Validity Type <RequiredAst />
                  </label>
                  <select
                    name="validityType"
                    id="validityType"
                    value={formData.validityType}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 h-10 border ${errors.validityType ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                  >
                    {VALIDITY_TYPE_OPTIONS.map((option) => (
                      <option
                        key={option.label}
                        value={option.value}
                        disabled={option.value === ""}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.validityType ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.validityType}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {formData.validityType === "BIT" ||
            formData.validityType === "Others" ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  {formData.validityType === "BIT"
                    ? "BIT Sponsored Details"
                    : "Other Details"}
                </h3>

                {formData.validityType === "BIT" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderFileUpload(
                      "apexDocumentProof",
                      "Apex Document Proof",
                      true,
                      "Upload the apex document proof",
                    )}
                    <div>
                      <label
                        htmlFor="amount"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Amount, in Rs. <RequiredAst />
                      </label>
                      <input
                        type="number"
                        name="amount"
                        id="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        min="0"
                        className={`mt-1 block w-full px-3 py-2 border ${errors.amount ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        placeholder="Enter amount in Rs."
                      />
                      {errors.amount ? (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.amount}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {formData.validityType === "Others" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="ifOthers"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        If Others, Please Specify <RequiredAst />
                      </label>
                      <input
                        type="text"
                        name="ifOthers"
                        id="ifOthers"
                        value={formData.ifOthers}
                        onChange={handleChange}
                        className={`mt-1 block w-full px-3 py-2 border ${errors.ifOthers ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        placeholder="Please specify"
                      />
                      {errors.ifOthers ? (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.ifOthers}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <label
                        htmlFor="amountIfOthers"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Amount, in Rs. <RequiredAst />
                      </label>
                      <input
                        type="number"
                        name="amountIfOthers"
                        id="amountIfOthers"
                        value={formData.amountIfOthers}
                        onChange={handleChange}
                        min="0"
                        className={`mt-1 block w-full px-3 py-2 border ${errors.amountIfOthers ? "border-red-500" : "border-slate-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        placeholder="Enter amount in Rs."
                      />
                      {errors.amountIfOthers ? (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.amountIfOthers}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Award className="h-5 w-5 mr-2 text-blue-600" />
                Documents
              </h3>
              <div className="gap-6">
                {renderFileUpload(
                  "documentProof",
                  "Document Proof (Certificate Proof & Apex Proof if applicable)",
                  false,
                  "Upload certificate proof & apex proof (if applicable)",
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <CheckSquare className="h-5 w-5 mr-2 text-blue-600" />
                OWI Verification
              </h3>
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
                  className="mt-1 block w-full px-3 py-2 h-10 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                >
                  {OWI_VERIFICATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
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
