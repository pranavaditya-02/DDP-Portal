"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Upload, X, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";

interface FormData {
  student: string;
  yearOfStudy: "first" | "second" | "third" | "fourth";
  membership: "yes" | "no";
  levelOfMembership?: "state" | "national" | "international";
  stateOfMembership?: "temporary" | "permanent";
  membershipNumber?: string;
  membershipSociety?: string;
  validFrom?: string;
  validTill?: string;
  chargesInRupees?: number;
  activitiesConducted?: "yes" | "no";
  specifyActivity?: string;
  activityStatus?: "competition" | "participation";
  certificateProof: File | null;
  iqacVerification: "initiated" | "processing" | "completed";
  iqacRejectionRemarks: string;
}

interface FormErrors {
  [key: string]: string;
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
          onDrop={handleDrop}
          onDragOver={() => setDragOver(true)}
          onDragLeave={() => setDragOver(false)}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
            dragOver ? "border-indigo-400 bg-indigo-50" : "border-slate-300 hover:border-slate-400"
          }`}
          onClick={() => document.getElementById(`file-input-${label}`)?.click()}
        >
          <div className="flex justify-center mb-2">
            <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
              <Upload className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-700">Drag and drop your file here</p>
          <p className="text-xs text-slate-500 mt-1">or click to browse</p>
          <p className="text-xs text-slate-400 mt-2">Supported: {accept}</p>
          <input
            id={`file-input-${label}`}
            type="file"
            accept={accept}
            onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])}
            className="hidden"
          />
        </div>
      )}
      {error && (
        <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" /> {error}
        </p>
      )}
    </div>
  );
};

export default function TechnicalBodyMembershipSubmitPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    student: "",
    yearOfStudy: "first",
    membership: "no",
    certificateProof: null,
    iqacVerification: "initiated",
    iqacRejectionRemarks: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [verifiedStudents, setVerifiedStudents] = useState<VerifiedStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setStudentsLoading(true);
        const studentRes = await apiClient.get("/verified-students");
        const students = Array.isArray(studentRes) ? studentRes : studentRes?.data || [];
        setVerifiedStudents(students);
      } catch (err: any) {
        console.error("Error loading data:", err);
      } finally {
        setStudentsLoading(false);
      }
    };

    loadData();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.student) newErrors.student = "Student selection is required";
    if (!formData.certificateProof) newErrors.certificateProof = "Certificate proof is required";

    if (formData.membership === "yes") {
      if (!formData.levelOfMembership) newErrors.levelOfMembership = "Level of membership is required";
      if (!formData.stateOfMembership) newErrors.stateOfMembership = "State of membership is required";
      if (!formData.membershipNumber?.trim()) newErrors.membershipNumber = "Membership number is required";
      if (!formData.membershipSociety?.trim()) newErrors.membershipSociety = "Membership society is required";
      if (!formData.validFrom?.trim()) newErrors.validFrom = "Valid from date is required";
      if (formData.stateOfMembership === "temporary" && !formData.validTill?.trim()) newErrors.validTill = "Valid till date is required for temporary membership";
      if (formData.chargesInRupees === undefined || formData.chargesInRupees === null) {
        newErrors.chargesInRupees = "Charges in rupees is required";
      }

      if (formData.activitiesConducted === "yes") {
        if (!formData.specifyActivity?.trim()) newErrors.specifyActivity = "Activity specification is required";
        if (!formData.activityStatus) newErrors.activityStatus = "Activity status is required";
      }
    }

    if (formData.iqacVerification === "completed" && !formData.iqacRejectionRemarks.trim()) {
      newErrors.iqacRejectionRemarks = "Remarks are required when status is Completed";
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

      const selectedStudent = verifiedStudents.find((s) => s.id.toString() === formData.student);
      if (!selectedStudent) {
        setErrors({ general: "Invalid student selection" });
        return;
      }

      formDataToSend.append("studentId", selectedStudent.studentId);
      formDataToSend.append("studentName", selectedStudent.studentName);
      formDataToSend.append("yearOfStudy", formData.yearOfStudy);
      formDataToSend.append("membership", formData.membership);

      if (formData.membership === "yes") {
        formDataToSend.append("levelOfMembership", formData.levelOfMembership || "");
        formDataToSend.append("stateOfMembership", formData.stateOfMembership || "");
        formDataToSend.append("membershipNumber", formData.membershipNumber || "");
        formDataToSend.append("membershipSociety", formData.membershipSociety || "");
        formDataToSend.append("validFrom", formData.validFrom || "");
        formDataToSend.append("validTill", formData.validTill || "");
        formDataToSend.append("chargesInRupees", String(formData.chargesInRupees || 0));
        formDataToSend.append("activitiesConducted", formData.activitiesConducted || "no");

        if (formData.activitiesConducted === "yes") {
          formDataToSend.append("specifyActivity", formData.specifyActivity || "");
          formDataToSend.append("activityStatus", formData.activityStatus || "");
        }
      }

      formDataToSend.append("iqacVerification", formData.iqacVerification);
      if (formData.iqacVerification === "completed" && formData.iqacRejectionRemarks) {
        formDataToSend.append("iqacRejectionRemarks", formData.iqacRejectionRemarks);
      }

      if (formData.certificateProof) {
        formDataToSend.append("certificateProof", formData.certificateProof);
      }

      const response = await apiClient.post("/student-technical-body-memberships", formDataToSend);

      if (response?.id || response?.success) {
        router.push("/student/technical-body-membership");
      } else {
        setErrors({ general: "Failed to submit form" });
      }
    } catch (err: any) {
      console.error("Form submission error:", err);
      setErrors({
        general: err?.response?.data?.message || err?.message || "Failed to submit form. Please try again.",
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
            href="/student/technical-body-membership"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4 text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Records
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Add Technical Body Membership</h1>
          <p className="text-slate-600 mt-2">Submit your technical body membership record</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{errors.general}</p>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-sm">1</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student */}
              <div className="md:col-span-2">
                <label className="block font-medium text-slate-700 mb-2">
                  Student <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-500 mb-3">Select from faculty-verified students only</p>
                {studentsLoading ? (
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-500 text-sm">
                    Loading verified students...
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

              {/* Year of Study */}
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  Year of Study <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.yearOfStudy}
                  onChange={(e) => handleChange("yearOfStudy", e.target.value)}
                  className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                  style={{
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 8 10 12 14 8"></polyline></svg>')`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 8px center',
                    backgroundSize: '20px',
                  }}
                >
                  <option value="">-- Select Year --</option>
                  <option value="first">First</option>
                  <option value="second">Second</option>
                  <option value="third">Third</option>
                  <option value="fourth">Fourth</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Membership Details */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-sm">2</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Membership Information</h2>
            </div>

            {/* Membership */}
            <div>
              <label className="block font-medium text-slate-700 mb-2">
                Membership <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                {["no", "yes"].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="membership"
                      value={option}
                      checked={formData.membership === option}
                      onChange={(e) => handleChange("membership", e.target.value)}
                      className="w-4 h-4 accent-indigo-600"
                    />
                    <span className="text-sm font-medium text-slate-700 capitalize">{option === "yes" ? "Yes" : "No"}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Conditional Membership Fields */}
            {formData.membership === "yes" && (
              <div className="pt-4 border-t border-slate-200 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Level of Membership */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-2">
                      Level of Membership <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.levelOfMembership || ""}
                      onChange={(e) => handleChange("levelOfMembership", e.target.value)}
                      className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${
                        errors.levelOfMembership ? "border-red-400 bg-red-50" : "border-slate-300"
                      }`}
                      style={{
                        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 8 10 12 14 8"></polyline></svg>')`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 8px center',
                        backgroundSize: '20px',
                      }}
                    >
                      <option value="">-- Select Level --</option>
                      <option value="state">State</option>
                      <option value="national">National</option>
                      <option value="international">International</option>
                    </select>
                    {errors.levelOfMembership && (
                      <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.levelOfMembership}
                      </p>
                    )}
                  </div>

                  {/* State of Membership */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-2">
                      State of Membership <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.stateOfMembership || ""}
                      onChange={(e) => handleChange("stateOfMembership", e.target.value)}
                      className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${
                        errors.stateOfMembership ? "border-red-400 bg-red-50" : "border-slate-300"
                      }`}
                      style={{
                        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 8 10 12 14 8"></polyline></svg>')`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 8px center',
                        backgroundSize: '20px',
                      }}
                    >
                      <option value="">-- Select State --</option>
                      <option value="temporary">Temporary</option>
                      <option value="permanent">Lifetime (Permanent)</option>
                    </select>
                    {errors.stateOfMembership && (
                      <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.stateOfMembership}
                      </p>
                    )}
                  </div>

                  {/* Membership Number */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-2">
                      Membership Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.membershipNumber || ""}
                      onChange={(e) => handleChange("membershipNumber", e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.membershipNumber ? "border-red-400 bg-red-50" : "border-slate-300"
                      }`}
                      placeholder="Enter membership number"
                    />
                    {errors.membershipNumber && (
                      <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.membershipNumber}
                      </p>
                    )}
                  </div>

                  {/* Membership Society */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-2">
                      Membership Society <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.membershipSociety || ""}
                      onChange={(e) => handleChange("membershipSociety", e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.membershipSociety ? "border-red-400 bg-red-50" : "border-slate-300"
                      }`}
                      placeholder="Enter membership society"
                    />
                    {errors.membershipSociety && (
                      <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.membershipSociety}
                      </p>
                    )}
                  </div>

                  {/* Valid From Date */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-2">
                      Valid From <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.validFrom || ""}
                      onChange={(e) => handleChange("validFrom", e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.validFrom ? "border-red-400 bg-red-50" : "border-slate-300"
                      }`}
                    />
                    {errors.validFrom && (
                      <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.validFrom}
                      </p>
                    )}
                  </div>

                  {/* Valid Till Date */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-2">
                      Valid Till {formData.stateOfMembership === "temporary" && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="date"
                      value={formData.validTill || ""}
                      onChange={(e) => handleChange("validTill", e.target.value)}
                      disabled={formData.stateOfMembership === "permanent"}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                        formData.stateOfMembership === "permanent"
                          ? "bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200"
                          : errors.validTill
                          ? "border-red-400 bg-red-50"
                          : "border-slate-300"
                      }`}
                    />
                    {formData.stateOfMembership === "permanent" && (
                      <p className="text-slate-500 text-xs mt-2">Not applicable for permanent membership</p>
                    )}
                    {errors.validTill && (
                      <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.validTill}
                      </p>
                    )}
                  </div>

                  {/* Charges in Rupees */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-2">
                      Charges (in Rupees) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.chargesInRupees || ""}
                      onChange={(e) => handleChange("chargesInRupees", e.target.value ? Number(e.target.value) : null)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.chargesInRupees ? "border-red-400 bg-red-50" : "border-slate-300"
                      }`}
                      placeholder="Enter charges"
                      min="0"
                    />
                    {errors.chargesInRupees && (
                      <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.chargesInRupees}
                      </p>
                    )}
                  </div>
                </div>

                {/* Activities Conducted */}
                <div className="pt-4 border-t border-slate-200">
                  <label className="block font-medium text-slate-700 mb-2">
                    Activities Conducted by Technical Society <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    {["no", "yes"].map((option) => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="activitiesConducted"
                          value={option}
                          checked={formData.activitiesConducted === option}
                          onChange={(e) => handleChange("activitiesConducted", e.target.value)}
                          className="w-4 h-4 accent-indigo-600"
                        />
                        <span className="text-sm font-medium text-slate-700 capitalize">{option === "yes" ? "Yes" : "No"}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Conditional Activity Fields */}
                {formData.activitiesConducted === "yes" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Specify Activity */}
                    <div className="md:col-span-2">
                      <label className="block font-medium text-slate-700 mb-2">
                        Specify the Activity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.specifyActivity || ""}
                        onChange={(e) => handleChange("specifyActivity", e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          errors.specifyActivity ? "border-red-400 bg-red-50" : "border-slate-300"
                        }`}
                        placeholder="Describe the activity"
                      />
                      {errors.specifyActivity && (
                        <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> {errors.specifyActivity}
                        </p>
                      )}
                    </div>

                    {/* Activity Status */}
                    <div>
                      <label className="block font-medium text-slate-700 mb-2">
                        Activity Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.activityStatus || ""}
                        onChange={(e) => handleChange("activityStatus", e.target.value)}
                        className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${
                          errors.activityStatus ? "border-red-400 bg-red-50" : "border-slate-300"
                        }`}
                        style={{
                          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 8 10 12 14 8"></polyline></svg>')`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 8px center',
                          backgroundSize: '20px',
                        }}
                      >
                        <option value="">-- Select Status --</option>
                        <option value="competition">Competition</option>
                        <option value="participation">Participation</option>
                      </select>
                      {errors.activityStatus && (
                        <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> {errors.activityStatus}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Verification & Documents */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-sm">3</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Verification & Documents</h2>
            </div>

            {/* Certificate Document Proof */}
            <FileUploadField
              label="Certificate Document Proof"
              value={formData.certificateProof}
              onChange={(file) => handleChange("certificateProof", file)}
              onRemove={() => handleChange("certificateProof", null)}
              error={errors.certificateProof}
              hint="Upload certificate document"
              required
            />

            {/* IQAC Verification */}
            <div>
              <label className="block font-medium text-slate-700 mb-2">
                IQAC Verification Status <span className="text-red-500">*</span>
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
                <option value="">-- Select Status --</option>
                <option value="initiated">Initiated</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* IQAC Remarks - Conditional */}
            {formData.iqacVerification === "completed" && (
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  Verification Remarks <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.iqacRejectionRemarks}
                  onChange={(e) => handleChange("iqacRejectionRemarks", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${
                    errors.iqacRejectionRemarks ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`}
                  rows={3}
                  placeholder="Enter verification remarks or rejection reason"
                />
                {errors.iqacRejectionRemarks && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.iqacRejectionRemarks}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="flex gap-3 sticky bottom-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 transition"
            >
              {loading ? "Submitting..." : "Submit Record"}
            </button>
            <Link
              href="/student/technical-body-membership"
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
