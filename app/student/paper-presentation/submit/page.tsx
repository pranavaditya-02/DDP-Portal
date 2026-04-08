"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Upload, X, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";

interface FormData {
  student: string;
  paperTitle: string;
  eventStartDate: string;
  eventEndDate: string;
  isAcademicProjectOutcome: "yes" | "no";
  academicProjectId?: string; // CONNECT_TO: Academic projects table/dropdown
  sdgGoal?: string;
  imageProof: File | null;
  abstractProof: File | null;
  certificateProof: File | null;
  attestedCertificate: File | null;
  status: "participated" | "winner";
  winnerPlace?: string;
  prizeType?: string;
  winnerCertificateProof?: File | null;
  iqacVerification: "initiated" | "processing" | "completed";
  iqacRejectionRemarks: string;
  parentalDepartment: string;
}

interface FormErrors {
  [key: string]: string;
}

interface Department {
  id: number;
  dept_name: string;
}

interface SDGGoal {
  id: number;
  sdg_number: number;
  title: string;
}

interface VerifiedStudent {
  id: number;
  studentId: string;
  studentName: string;
  studentEmail: string;
}

const FileUploadField = ({
  label,
  value,
  onChange,
  onRemove,
  error,
  hint,
  accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  required = false,
}: {
  label: string;
  value: File | null;
  onChange: (file: File) => void;
  onRemove: () => void;
  error?: string;
  hint?: string;
  accept?: string;
  required?: boolean;
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) {
      onChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}

      {value ? (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
              <Upload className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-900">{value.name}</span>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-green-600 hover:text-green-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={() => setDragOver(true)}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition ${
            dragOver
              ? "border-indigo-400 bg-indigo-50"
              : error
                ? "border-red-300 bg-red-50"
                : "border-slate-300 bg-slate-50"
          }`}
        >
          <input
            type="file"
            accept={accept}
            onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-2">
            <Upload className={`w-6 h-6 ${error ? "text-red-400" : "text-slate-400"}`} />
            <p className={`text-sm font-medium ${error ? "text-red-700" : "text-slate-700"}`}>
              Drag and drop or click to upload
            </p>
            <p className="text-xs text-slate-500">PDF, JPG, PNG, DOC, or DOCX (max 10MB)</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

export default function PaperPresentationSubmitPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    student: "",
    paperTitle: "",
    eventStartDate: "",
    eventEndDate: "",
    isAcademicProjectOutcome: "no",
    academicProjectId: "",
    sdgGoal: "",
    imageProof: null,
    abstractProof: null,
    certificateProof: null,
    attestedCertificate: null,
    status: "participated",
    winnerPlace: "",
    prizeType: "",
    winnerCertificateProof: null,
    iqacVerification: "initiated",
    iqacRejectionRemarks: "",
    parentalDepartment: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [verifiedStudents, setVerifiedStudents] = useState<VerifiedStudent[]>([]);
  const [sdgGoals, setSDGGoals] = useState<SDGGoal[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [sdgsLoading, setSDGsLoading] = useState(true);

  // Fetch departments, verified students, and SDG goals on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load departments
        const deptRes = await apiClient.get("/departments");
        setDepartments(deptRes?.departments || []);

        // Load verified students for current user
        const studentRes = await apiClient.get("/verified-students");
        
        // setVerifiedStudents
        const students = studentRes?.students || [];

        // Add hardcoded test student for testing (REMOVE AFTER VERIFICATION)
        const testStudent: VerifiedStudent = {
          id: 999,
          studentId: "TEST001",
          studentName: "Test Student",
          studentEmail: "test@example.com",
        };
        setVerifiedStudents([testStudent, ...students]);

        // Load SDG goals
        const sdgRes = await apiClient.get("/sdgs");
        console.log("SDG Response:", sdgRes);
        const sdgData = sdgRes?.sdgs || [];
        console.log("SDG Data loaded:", sdgData);
        setSDGGoals(sdgData);
      } catch (err) {
        console.error("Failed to load form data:", err);
        // Add test student even if API fails
        const testStudent: VerifiedStudent = {
          id: 999,
          studentId: "TEST001",
          studentName: "Test Student",
          studentEmail: "test@example.com",
        };
        setVerifiedStudents([testStudent]);
      } finally {
        setDepartmentsLoading(false);
        setStudentsLoading(false);
        setSDGsLoading(false);
      }
    };

    loadData();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.student) newErrors.student = "Student selection is required";
    if (!formData.paperTitle.trim()) newErrors.paperTitle = "Paper title is required";
    if (!formData.eventStartDate) newErrors.eventStartDate = "Event start date is required";
    if (!formData.eventEndDate) newErrors.eventEndDate = "Event end date is required";
    if (formData.eventStartDate && formData.eventEndDate) {
      if (new Date(formData.eventEndDate) < new Date(formData.eventStartDate)) {
        newErrors.eventEndDate = "End date must be after start date";
      }
    }
    if (!formData.imageProof) newErrors.imageProof = "Photo/Geotag proof is required";
    if (!formData.abstractProof) newErrors.abstractProof = "Abstract document is required";
    if (!formData.certificateProof) newErrors.certificateProof = "Original certificate is required";
    if (!formData.attestedCertificate) newErrors.attestedCertificate = "Attested certificate is required";
    if (!formData.sdgGoal) newErrors.sdgGoal = "SDG Goal is required";
    if (!formData.parentalDepartment) newErrors.parentalDepartment = "Department is required";
    if (formData.isAcademicProjectOutcome === "yes" && !formData.academicProjectId) {
      newErrors.academicProjectId = "Please select a project";
    }
    if (formData.status === "winner") {
      if (!formData.winnerPlace) newErrors.winnerPlace = "Place is required for winner status";
      if (!formData.prizeType) newErrors.prizeType = "Prize type is required for winner status";
      if (!formData.winnerCertificateProof) newErrors.winnerCertificateProof = "Certificate proof is required for winner status";
    }
    if (formData.iqacVerification === "completed" && !formData.iqacRejectionRemarks.trim()) {
      newErrors.iqacRejectionRemarks = "Remarks are required when status is Rejected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const formDataToSend = new FormData();

      // Get selected student details
      const selectedStudent = verifiedStudents.find((s) => s.id.toString() === formData.student);
      if (!selectedStudent) {
        setErrors({ general: "Invalid student selection" });
        return;
      }

      formDataToSend.append("studentId", selectedStudent.studentId);
      formDataToSend.append("studentName", selectedStudent.studentName);
      formDataToSend.append("paperTitle", formData.paperTitle);
      formDataToSend.append("eventStartDate", formData.eventStartDate);
      formDataToSend.append("eventEndDate", formData.eventEndDate);
      formDataToSend.append("isAcademicProjectOutcome", formData.isAcademicProjectOutcome);
      formDataToSend.append("sdgGoal", formData.sdgGoal || "");
      // CONNECT_TO: Academic project ID - append if required by backend
      if (formData.isAcademicProjectOutcome === "yes" && formData.academicProjectId) {
        formDataToSend.append("academicProjectId", formData.academicProjectId);
      }
      formDataToSend.append("status", formData.status);
      if (formData.status === "winner") {
        formDataToSend.append("winnerPlace", formData.winnerPlace || "");
        formDataToSend.append("prizeType", formData.prizeType || "");
        if (formData.winnerCertificateProof) {
          formDataToSend.append("winnerCertificateProof", formData.winnerCertificateProof);
        }
      }
      formDataToSend.append("iqacVerification", formData.iqacVerification);
      if (formData.iqacVerification === "completed" && formData.iqacRejectionRemarks) {
        formDataToSend.append("iqacRejectionRemarks", formData.iqacRejectionRemarks);
      }
      formDataToSend.append("parentalDepartmentId", formData.parentalDepartment);

      if (formData.imageProof) {
        formDataToSend.append("imageProof", formData.imageProof);
      }
      if (formData.abstractProof) {
        formDataToSend.append("abstractProof", formData.abstractProof);
      }
      if (formData.certificateProof) {
        formDataToSend.append("certificateProof", formData.certificateProof);
      }
      if (formData.attestedCertificate) {
        formDataToSend.append("attestedCertificate", formData.attestedCertificate);
      }

      const response = await apiClient.post("/student-paper-presentations", formDataToSend);

      if (response?.data?.id) {
        router.push("/student/paper-presentation");
      } else {
        setErrors({ general: "Failed to submit form" });
      }
    } catch (err: any) {
      console.error("Form submission error:", err);
      setErrors({
        general: err?.response?.data?.message || "Failed to submit form. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
          <Link
            href="/student/paper-presentation"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Records
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Add Paper Presentation</h1>
          <p className="text-slate-600 mt-2">Submit your new paper presentation record</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {errors.general && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{errors.general}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold">1</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
            </div>

            {/* Student Selection */}
            <div>
              <label className="block font-medium text-slate-700 mb-2">
                Student <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Select from faculty-verified students only
              </p>
              {studentsLoading ? (
                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-500 text-sm">
                  Loading verified students...
                </div>
              ) : verifiedStudents.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    No verified students available. Please ask your faculty to verify your access.
                  </p>
                </div>
              ) : (
                <select
                  value={formData.student}
                  onChange={(e) => handleChange("student", e.target.value)}
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${
                    errors.student ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`}
                  style={{
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 8 10 12 14 8"></polyline></svg>')`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 8px center',
                    backgroundSize: '20px',
                  }}
                >
                  <option value="">-- Select Student --</option>
                  {verifiedStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.studentName} ({student.studentId})
                    </option>
                  ))}
                </select>
              )}
              {errors.student && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.student}
                </p>
              )}
            </div>

            {/* Paper Title */}
            <div>
              <label className="block font-medium text-slate-700 mb-2">
                Paper Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.paperTitle}
                onChange={(e) => handleChange("paperTitle", e.target.value)}
                placeholder="Enter the title of your paper"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.paperTitle ? "border-red-400 bg-red-50" : "border-slate-300"
                }`}
              />
              {errors.paperTitle && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.paperTitle}
                </p>
              )}
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold">2</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Event Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Start Date */}
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  Event Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.eventStartDate}
                  onChange={(e) => handleChange("eventStartDate", e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.eventStartDate ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`}
                />
                {errors.eventStartDate && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.eventStartDate}
                  </p>
                )}
              </div>

              {/* Event End Date */}
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  Event End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.eventEndDate}
                  onChange={(e) => handleChange("eventEndDate", e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.eventEndDate ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`}
                />
                {errors.eventEndDate && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.eventEndDate}
                  </p>
                )}
              </div>
            </div>

            {/* Academic Project Outcome & SDG Goals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Academic Project Outcome - Half Width */}
              <div className="space-y-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-2">
                    Is this the outcome of an academic project? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.isAcademicProjectOutcome}
                    onChange={(e) => handleChange("isAcademicProjectOutcome", e.target.value)}
                    className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                    style={{
                      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 8 10 12 14 8"></polyline></svg>')`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 8px center',
                      backgroundSize: '20px',
                    }}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                {/* Conditional: Academic Project Selection */}
                {formData.isAcademicProjectOutcome === "yes" && (
                  <div>
                    <label className="block font-medium text-slate-700 mb-2">
                      If Yes, specify the project: <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.academicProjectId || ""}
                      onChange={(e) => handleChange("academicProjectId", e.target.value)}
                      className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                      style={{
                        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 8 10 12 14 8"></polyline></svg>')`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 8px center',
                        backgroundSize: '20px',
                      }}
                    >
                      <option value="">-- Select a project --</option>
                      <option value="S5-Mini Project-I">S5-Mini Project-I</option>
                      <option value="S6-Mini Project-II">S6-Mini Project-II</option>
                      <option value="S7-Mini Project-I">S7-Mini Project-I</option>
                      <option value="S8-Mini Project-II">S8-Mini Project-II</option>
                    </select>
                    {errors.academicProjectId && (
                      <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.academicProjectId}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* SDG Goals - Half Width */}
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  SDG Goals <span className="text-red-500">*</span>
                </label>
                {sdgsLoading ? (
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-500 text-sm">
                    Loading SDG goals...
                  </div>
                ) : (
                  <select
                    value={formData.sdgGoal || ""}
                    onChange={(e) => handleChange("sdgGoal", e.target.value)}
                    className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${
                      errors.sdgGoal ? "border-red-400 bg-red-50" : "border-slate-300"
                    }`}
                    style={{
                      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 8 10 12 14 8"></polyline></svg>')`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 8px center',
                      backgroundSize: '20px',
                    }}
                  >
                    <option value="">-- Select SDG Goal --</option>
                    {sdgGoals.map((sdg, index) => (
                      <option key={`${sdg.id}-${index}`} value={String(sdg.id)}>
                        {sdg.sdg_number}. {sdg.title}
                      </option>
                    ))}
                  </select>
                )}
                {errors.sdgGoal && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.sdgGoal}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Paper Details */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold">3</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Status & Classification</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status */}
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  Participation Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                  style={{
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 8 10 12 14 8"></polyline></svg>')`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 8px center',
                    backgroundSize: '20px',
                  }}
                >
                  <option value="participated">Participated</option>
                  <option value="winner">Winner</option>
                </select>
              </div>

              {/* Conditional Winner Fields */}
              {formData.status === "winner" && (
                <>
                  {/* Place Dropdown */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-2">
                      Place <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.winnerPlace || ""}
                      onChange={(e) => handleChange("winnerPlace", e.target.value)}
                      className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${
                        errors.winnerPlace ? "border-red-400 bg-red-50" : "border-slate-300"
                      }`}
                      style={{
                        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 8 10 12 14 8"></polyline></svg>')`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 8px center',
                        backgroundSize: '20px',
                      }}
                    >
                      <option value="">-- Select Place --</option>
                      <option value="I">I</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                    </select>
                    {errors.winnerPlace && (
                      <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.winnerPlace}
                      </p>
                    )}
                  </div>

                  {/* Prize Type Dropdown */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-2">
                      Prize Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.prizeType || ""}
                      onChange={(e) => handleChange("prizeType", e.target.value)}
                      className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${
                        errors.prizeType ? "border-red-400 bg-red-50" : "border-slate-300"
                      }`}
                      style={{
                        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 8 10 12 14 8"></polyline></svg>')`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 8px center',
                        backgroundSize: '20px',
                      }}
                    >
                      <option value="">-- Select Prize Type --</option>
                      <option value="cash">Cash</option>
                      <option value="momento">Momento</option>
                    </select>
                    {errors.prizeType && (
                      <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.prizeType}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Parental Department */}
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                {departmentsLoading ? (
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-500 text-sm">
                    Loading departments...
                  </div>
                ) : (
                  <select
                    value={formData.parentalDepartment}
                    onChange={(e) => handleChange("parentalDepartment", e.target.value)}
                    className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${
                      errors.parentalDepartment ? "border-red-400 bg-red-50" : "border-slate-300"
                    }`}
                    style={{
                      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 8 10 12 14 8"></polyline></svg>')`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 8px center',
                      backgroundSize: '20px',
                    }}
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.dept_name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.parentalDepartment && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.parentalDepartment}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* File Uploads */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold">4</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Proof Documents</h2>
            </div>

            <div className="space-y-6">
              <FileUploadField
                label="Photo/Geotag Proof"
                value={formData.imageProof}
                onChange={(file) => handleChange("imageProof", file)}
                onRemove={() => handleChange("imageProof", null)}
                error={errors.imageProof}
                hint="Format: Reg.No-PPI-Date (e.g., 201CS111-PPI-08.06.2021)"
                required
              />

              <FileUploadField
                label="Abstract Document"
                value={formData.abstractProof}
                onChange={(file) => handleChange("abstractProof", file)}
                onRemove={() => handleChange("abstractProof", null)}
                error={errors.abstractProof}
                hint="Format: Reg.No-PPA-Date (e.g., 201CS111-PPA-08.06.2021)"
                required
              />

              <FileUploadField
                label="Original Certificate"
                value={formData.certificateProof}
                onChange={(file) => handleChange("certificateProof", file)}
                onRemove={() => handleChange("certificateProof", null)}
                error={errors.certificateProof}
                hint="Format: Reg.No-PRO-Date (e.g., 201CS111-PRO-08.06.2024)"
                required
              />

              <FileUploadField
                label="Attested Certificate"
                value={formData.attestedCertificate}
                onChange={(file) => handleChange("attestedCertificate", file)}
                onRemove={() => handleChange("attestedCertificate", null)}
                error={errors.attestedCertificate}
                hint="Format: Reg.No-PRX-Date (e.g., 201CS111-PRX-08.06.2024)"
                required
              />

              {/* Conditional Winner Certificate Proof */}
              {formData.status === "winner" && (
                <FileUploadField
                  label="Original Certificate Proof (Winner)"
                  value={formData.winnerCertificateProof || null}
                  onChange={(file) => handleChange("winnerCertificateProof", file)}
                  onRemove={() => handleChange("winnerCertificateProof", null)}
                  error={errors.winnerCertificateProof}
                  hint="Please specify the Proof name only in the following format: Reg.No - PPW - Date of Event (E.g: 201CS111-PPW-08.06.2021)"
                  required
                />
              )}
            </div>
          </div>

          {/* IQAC Verification */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold">5</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Verification</h2>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-2">
                IQAC Verification Status
              </label>
              <select
                value={formData.iqacVerification}
                onChange={(e) => handleChange("iqacVerification", e.target.value)}
                className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 8 10 12 14 8"></polyline></svg>')`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  backgroundSize: '20px',
                }}
              >
                <option value="initiated">Initiated</option>
                <option value="processing">Approved</option>
                <option value="completed">Rejected</option>
              </select>
              <p className="text-xs text-slate-500 mt-2">Default status is "Initiated"</p>
            </div>

            {/* Conditional Remarks Field for Rejection */}
            {formData.iqacVerification === "completed" && (
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  Remarks <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.iqacRejectionRemarks}
                  onChange={(e) => handleChange("iqacRejectionRemarks", e.target.value)}
                  placeholder="Please enter the reason for rejection..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${
                    errors.iqacRejectionRemarks ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`}
                  rows={4}
                />
                {errors.iqacRejectionRemarks && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.iqacRejectionRemarks}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 sticky bottom-0 bg-white border-t border-slate-200 p-6 -mx-4 md:-mx-6">
            <Link
              href="/student/paper-presentation"
              className="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                "Submit Record"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
