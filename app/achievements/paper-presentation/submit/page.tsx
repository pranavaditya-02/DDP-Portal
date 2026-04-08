"use client";

import { useState, ChangeEvent, DragEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

interface FormErrors {
  [key: string]: string;
}

interface FileField {
  file: File | null;
  name: string;
  error: string;
}

interface FormData {
  student: string;
  paperTitle: string;
  eventStartDate: string;
  eventEndDate: string;
  academicProject: string;
  status: string;
  iqacVerification: string;
  parentalDepartment: string;
  
  imageProof: FileField;
  abstractProof: FileField;
  certificateProof: FileField;
  attestedCert: FileField;
}

const INITIAL_FORM_DATA: FormData = {
  student: "",
  paperTitle: "",
  eventStartDate: "",
  eventEndDate: "",
  academicProject: "",
  status: "",
  iqacVerification: "initiated",
  parentalDepartment: "",
  
  imageProof: { file: null, name: "", error: "" },
  abstractProof: { file: null, name: "", error: "" },
  certificateProof: { file: null, name: "", error: "" },
  attestedCert: { file: null, name: "", error: "" },
};

export default function PaperPresentationSubmitPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState<{ id: number; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: number | string; name: string }[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load students and departments on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // TODO: Replace with API calls to fetch students and departments
        // For now, using mock data - this should fetch from API endpoints:
        // - GET /api/students (for faculty-verified students)
        // - GET /api/departments (for all departments)
        
        setStudents([
          { id: 1, name: "Select a student" },
          { id: 2, name: "John Doe (201CS001)" },
          { id: 3, name: "Jane Smith (201CS002)" },
          { id: 4, name: "Mike Johnson (201CS003)" },
        ]);

        setDepartments([
          { id: 1, name: "Select Department" },
          { id: 2, name: "Computer Science" },
          { id: 3, name: "Mechanical Engineering" },
          { id: 4, name: "Electronics" },
          { id: 5, name: "Civil Engineering" },
        ]);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.student || formData.student === "") {
      newErrors.student = "Please select a student";
    }

    if (!formData.paperTitle.trim()) {
      newErrors.paperTitle = "Paper title is required";
    }

    if (!formData.eventStartDate) {
      newErrors.eventStartDate = "Event start date is required";
    }

    if (!formData.eventEndDate) {
      newErrors.eventEndDate = "Event end date is required";
    }

    if (formData.eventStartDate && formData.eventEndDate) {
      if (new Date(formData.eventStartDate) > new Date(formData.eventEndDate)) {
        newErrors.eventEndDate = "End date must be after start date";
      }
    }

    if (!formData.academicProject) {
      newErrors.academicProject = "Please select if this is an academic project";
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    if (!formData.parentalDepartment) {
      newErrors.parentalDepartment = "Parental department is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    fieldName: keyof Pick<FormData, "imageProof" | "abstractProof" | "certificateProof" | "attestedCert">
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "application/msword", "application/vnd.ms-excel"];

      if (file.size > maxSize) {
        setFormData((prev) => ({
          ...prev,
          [fieldName]: { ...prev[fieldName], error: "File size must be less than 10MB" },
        }));
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        setFormData((prev) => ({
          ...prev,
          [fieldName]: { ...prev[fieldName], error: "Please upload a valid file type (PDF, JPG, PNG, DOCX, XLSX)" },
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [fieldName]: { file, name: prev[fieldName].name, error: "" },
      }));
    }
  };

  const handleFileNameChange = (
    e: ChangeEvent<HTMLInputElement>,
    fieldName: keyof Pick<FormData, "imageProof" | "abstractProof" | "certificateProof" | "attestedCert">
  ) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], name: value },
    }));
  };

  const handleDrop = (
    e: DragEvent<HTMLDivElement>,
    fieldName: keyof Pick<FormData, "imageProof" | "abstractProof" | "certificateProof" | "attestedCert">
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const input = document.createElement("input");
      input.type = "file";
      Object.defineProperty(input, "files", {
        value: e.dataTransfer.files,
      });
      handleFileChange({ target: input } as any, fieldName);
    }
  };

  const removeFile = (fieldName: keyof Pick<FormData, "imageProof" | "abstractProof" | "certificateProof" | "attestedCert">) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: { file: null, name: "", error: "" },
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      formDataToSend.append("student_id", formData.student);
      formDataToSend.append("student_name", students.find(s => s.id.toString() === formData.student)?.name || "");
      formDataToSend.append("paper_title", formData.paperTitle);
      formDataToSend.append("event_start_date", formData.eventStartDate);
      formDataToSend.append("event_end_date", formData.eventEndDate);
      formDataToSend.append("academic_project_type", formData.academicProject);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("iqac_verification", formData.iqacVerification);
      formDataToSend.append("parental_department", formData.parentalDepartment);

      // Add proof files and names
      if (formData.imageProof.file) {
        formDataToSend.append("image_proof", formData.imageProof.file);
        formDataToSend.append("image_proof_name", formData.imageProof.name);
      }

      if (formData.abstractProof.file) {
        formDataToSend.append("abstract_proof", formData.abstractProof.file);
        formDataToSend.append("abstract_proof_name", formData.abstractProof.name);
      }

      if (formData.certificateProof.file) {
        formDataToSend.append("certificate_proof", formData.certificateProof.file);
        formDataToSend.append("certificate_proof_name", formData.certificateProof.name);
      }

      if (formData.attestedCert.file) {
        formDataToSend.append("attested_cert", formData.attestedCert.file);
        formDataToSend.append("attested_cert_name", formData.attestedCert.name);
      }

      const response = await fetch("http://localhost:5000/api/paper-presentations", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to submit paper presentation");
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        router.push("/achievements/paper-presentation");
      }, 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ submit: error instanceof Error ? error.message : "Failed to submit form" });
    } finally {
      setIsLoading(false);
    }
  };

  const FileUploadField = ({
    label,
    fieldName,
    format,
    required = true,
  }: {
    label: string;
    fieldName: keyof Pick<FormData, "imageProof" | "abstractProof" | "certificateProof" | "attestedCert">;
    format: string;
    required?: boolean;
  }) => {
    const field = formData[fieldName];

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-900">
          {label}
          {required && <RequiredAst />}
          <span className="text-xs text-slate-500 ml-2">Format: {format}</span>
        </label>

        <input
          type="text"
          placeholder={format}
          value={field.name}
          onChange={(e) => handleFileNameChange(e, fieldName)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm ${
            errors[`${fieldName}Name`] ? "border-red-500" : "border-slate-200"
          }`}
        />

        {errors[`${fieldName}Name`] && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle size={16} />
            {errors[`${fieldName}Name`]}
          </p>
        )}

        <div
          onDrop={(e) => handleDrop(e, fieldName)}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition"
        >
          <input
            type="file"
            onChange={(e) => handleFileChange(e, fieldName)}
            className="hidden"
            id={`file-input-${fieldName}`}
          />
          <label htmlFor={`file-input-${fieldName}`} className="cursor-pointer">
            {field.file ? (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-slate-700">{field.file.name}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <UploadCloud size={32} className="text-slate-400" />
                <p className="text-sm text-slate-600">Drag and drop your file here or click to browse</p>
              </div>
            )}
          </label>
        </div>

        {field.error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle size={16} />
            {field.error}
          </p>
        )}

        {field.file && (
          <button
            type="button"
            onClick={() => removeFile(fieldName)}
            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <X size={16} />
            Remove file
          </button>
        )}
      </div>
    );
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <div className="mb-4 text-5xl">✅</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Success!</h2>
          <p className="text-slate-600 mb-4">Your paper presentation has been submitted successfully.</p>
          <p className="text-sm text-slate-500">Redirecting to the list page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-200 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-slate-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Add Paper Presentation</h1>
            <p className="text-slate-600 mt-1">Submit your paper presentation details</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">
                  Student <RequiredAst />
                </label>
                <select
                  name="student"
                  value={formData.student}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
                    errors.student ? "border-red-500" : "border-slate-200"
                  }`}
                >
                  <option value="">Select a student</option>
                  {students.slice(1).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {errors.student && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={16} />
                    {errors.student}
                  </p>
                )}
              </div>

              {/* Paper Title */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">
                  Paper Title <RequiredAst />
                </label>
                <input
                  type="text"
                  name="paperTitle"
                  value={formData.paperTitle}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
                    errors.paperTitle ? "border-red-500" : "border-slate-200"
                  }`}
                  placeholder="Enter paper title"
                />
                {errors.paperTitle && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={16} />
                    {errors.paperTitle}
                  </p>
                )}
              </div>

              {/* Event Start Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">
                  Event Start Date <RequiredAst />
                </label>
                <input
                  type="date"
                  name="eventStartDate"
                  value={formData.eventStartDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
                    errors.eventStartDate ? "border-red-500" : "border-slate-200"
                  }`}
                />
                {errors.eventStartDate && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={16} />
                    {errors.eventStartDate}
                  </p>
                )}
              </div>

              {/* Event End Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">
                  Event End Date <RequiredAst />
                </label>
                <input
                  type="date"
                  name="eventEndDate"
                  value={formData.eventEndDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
                    errors.eventEndDate ? "border-red-500" : "border-slate-200"
                  }`}
                />
                {errors.eventEndDate && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={16} />
                    {errors.eventEndDate}
                  </p>
                )}
              </div>

              {/* Academic Project */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">
                  Academic Project Outcome <RequiredAst />
                </label>
                <select
                  name="academicProject"
                  value={formData.academicProject}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
                    errors.academicProject ? "border-red-500" : "border-slate-200"
                  }`}
                >
                  <option value="">Select an option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                {errors.academicProject && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={16} />
                    {errors.academicProject}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">
                  Status <RequiredAst />
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
                    errors.status ? "border-red-500" : "border-slate-200"
                  }`}
                >
                  <option value="">Select status</option>
                  <option value="participated">Participated</option>
                  <option value="winner">Winner</option>
                </select>
                {errors.status && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={16} />
                    {errors.status}
                  </p>
                )}
              </div>

              {/* Parental Department */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">
                  Parental Department <RequiredAst />
                </label>
                <select
                  name="parentalDepartment"
                  value={formData.parentalDepartment}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
                    errors.parentalDepartment ? "border-red-500" : "border-slate-200"
                  }`}
                >
                  <option value="">Select department</option>
                  {departments.slice(1).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {errors.parentalDepartment && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={16} />
                    {errors.parentalDepartment}
                  </p>
                )}
              </div>

              {/* IQAC Verification */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">
                  IQAC Verification
                </label>
                <select
                  name="iqacVerification"
                  value={formData.iqacVerification}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                >
                  <option value="initiated">Initiated</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* File Uploads */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Supporting Documents</h2>

            <FileUploadField
              label="Upload Image/Photo/Geotag"
              fieldName="imageProof"
              format="Reg.No - PPI - Date of Event (e.g: 201CS111-PPI-08.06.2021)"
              required
            />

            <FileUploadField
              label="Abstract Document Proof"
              fieldName="abstractProof"
              format="Reg.No - PPA - Date of Event (e.g: 201CS111-PPA-08.06.2021)"
              required
            />

            <FileUploadField
              label="Original Certificate Proof"
              fieldName="certificateProof"
              format="Reg.No - PRO - Date of Event (e.g: 201CS111-PRO-08.06.2024)"
              required
            />

            <FileUploadField
              label="Attested Certificate"
              fieldName="attestedCert"
              format="Reg.No - PRX - Date of Event (e.g: 201CS111-PRX-08.06.2024)"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Submit Paper Presentation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
