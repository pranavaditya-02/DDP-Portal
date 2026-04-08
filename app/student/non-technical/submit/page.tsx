"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Upload, X, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";

interface FormData {
  student: string;
  yearOfStudy: "first" | "second" | "third" | "fourth" | "";
  eventAttended: "club" | "ncc_nss_yrc" | "sports" | "others" | "";
  clubId?: string;
  clubEvents?: string;
  otherEventSpecify?: string;
  eventStartDate: string;
  eventEndDate: string;
  eventDuration: string;
  eventLocation: string;
  eventOrganiser: "BIT" | "industry" | "foreign_institute" | "other" | "";
  organisorNameOther?: string;
  eventLevel: "international" | "national" | "district" | "regional" | "zonal" | "";
  country?: string;
  state?: string;
  withinBIT: "yes" | "no" | "";
  homeDepartment?: "yes" | "no";
  roleInEvent: "organised" | "participated" | "";
  roleSpecifyOrganised?: string;
  roleSpecifyParticipated?: string;
  status: "winner" | "runner" | "participated" | "";
  prizeType?: "cash" | "momento";
  prizeAmount?: string;
  socialActivityInvolved: "yes" | "no" | "";
  socialActivityName?: string;
  timeSpentHours: string;
  interdisciplinary: "yes" | "no" | "";
  interdisciplinaryDept?: string;
  otherDeptStudentCount?: string;
  certificateProof: File | null;
  iqacVerification: "initiated" | "processing" | "completed" | "";
}

interface FormErrors {
  [key: string]: string;
}

interface Department {
  id: number;
  dept_name: string;
}

interface Club {
  id: number;
  club_name: string;
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
          className={`border-2 border-dashed rounded-lg p-6 text-center transition cursor-pointer ${
            dragOver ? "border-indigo-500 bg-indigo-50" : "border-slate-300 hover:border-slate-400"
          }`}
        >
          <input
            type="file"
            onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])}
            accept={accept}
            className="hidden"
            id={`file-${label}`}
          />
          <label htmlFor={`file-${label}`} className="cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-6 h-6 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Click to upload or drag and drop</span>
              <span className="text-xs text-slate-500">PNG, JPG, PDF up to 10MB</span>
            </div>
          </label>
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

export default function NonTechnicalSubmitPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    student: "",
    yearOfStudy: "",
    eventAttended: "",
    eventStartDate: "",
    eventEndDate: "",
    eventDuration: "",
    eventLocation: "",
    eventOrganiser: "",
    eventLevel: "",
    withinBIT: "",
    roleInEvent: "",
    status: "",
    socialActivityInvolved: "",
    timeSpentHours: "",
    interdisciplinary: "",
    certificateProof: null,
    iqacVerification: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [verifiedStudents, setVerifiedStudents] = useState<VerifiedStudent[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [clubsLoading, setClubsLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [deptRes, clubRes, studentRes] = await Promise.all([
          apiClient.get("/departments"),
          apiClient.get("/clubs"),
          apiClient.get("/verified-students"),
        ]);

        setDepartments(deptRes?.departments || []);
        setClubs(clubRes?.clubs || []);
        const students = Array.isArray(studentRes) ? studentRes : studentRes?.students || [];
        setVerifiedStudents(students);
      } catch (err) {
        console.error("Failed to load form data:", err);
      } finally {
        setDepartmentsLoading(false);
        setClubsLoading(false);
        setStudentsLoading(false);
      }
    };

    loadData();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.student) newErrors.student = "Student selection is required";
    if (!formData.yearOfStudy) newErrors.yearOfStudy = "Year of study is required";
    if (!formData.eventAttended) newErrors.eventAttended = "Event attended is required";
    if (formData.eventAttended === "club" && !formData.clubId) newErrors.clubId = "Club selection is required";
    if (formData.eventAttended === "club" && !formData.clubEvents?.trim()) newErrors.clubEvents = "Club events are required";
    if (formData.eventAttended === "others" && !formData.otherEventSpecify?.trim()) newErrors.otherEventSpecify = "Please specify the event";
    if (!formData.eventStartDate) newErrors.eventStartDate = "Event start date is required";
    if (!formData.eventEndDate) newErrors.eventEndDate = "Event end date is required";
    if (formData.eventStartDate && formData.eventEndDate && new Date(formData.eventEndDate) < new Date(formData.eventStartDate)) {
      newErrors.eventEndDate = "End date must be after start date";
    }
    if (!formData.eventDuration) newErrors.eventDuration = "Event duration is required";
    if (!formData.eventLocation?.trim()) newErrors.eventLocation = "Event location is required";
    if (!formData.eventOrganiser) newErrors.eventOrganiser = "Event organiser is required";
    if (formData.eventOrganiser === "other" && !formData.organisorNameOther?.trim()) newErrors.organisorNameOther = "Please specify organiser name";
    if (!formData.eventLevel) newErrors.eventLevel = "Event level is required";
    if (formData.eventLevel === "international" && !formData.country?.trim()) newErrors.country = "Country is required";
    if (formData.eventLevel === "national" && !formData.state?.trim()) newErrors.state = "State is required";
    if (!formData.withinBIT) newErrors.withinBIT = "Within BIT selection is required";
    if (!formData.roleInEvent) newErrors.roleInEvent = "Role in event is required";
    if (formData.roleInEvent === "organised" && !formData.roleSpecifyOrganised?.trim()) newErrors.roleSpecifyOrganised = "Please specify organised event names";
    if (formData.roleInEvent === "participated" && !formData.roleSpecifyParticipated?.trim()) newErrors.roleSpecifyParticipated = "Please specify participated event names";
    if (!formData.status) newErrors.status = "Status is required";
    if (formData.status === "winner" && !formData.prizeType) newErrors.prizeType = "Prize type is required";
    if (formData.status === "winner" && formData.prizeType === "cash" && !formData.prizeAmount) newErrors.prizeAmount = "Prize amount is required";
    if (!formData.socialActivityInvolved) newErrors.socialActivityInvolved = "Social activity involved is required";
    if (formData.socialActivityInvolved === "yes" && !formData.socialActivityName?.trim()) newErrors.socialActivityName = "Social activity name is required";
    if (!formData.timeSpentHours) newErrors.timeSpentHours = "Time spent in hours is required";
    if (!formData.interdisciplinary) newErrors.interdisciplinary = "Interdisciplinary is required";
    if (formData.interdisciplinary === "yes" && !formData.interdisciplinaryDept) newErrors.interdisciplinaryDept = "Department selection is required";
    if (formData.interdisciplinary === "yes" && !formData.otherDeptStudentCount) newErrors.otherDeptStudentCount = "Number of other department students is required";
    if (!formData.certificateProof) newErrors.certificateProof = "Certificate proof is required";
    if (!formData.iqacVerification) newErrors.iqacVerification = "IQAC verification is required";

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
      formDataToSend.append("eventAttended", formData.eventAttended);
      if (formData.eventAttended === "club") {
        formDataToSend.append("clubId", formData.clubId || "");
        formDataToSend.append("clubEvents", formData.clubEvents || "");
      }
      if (formData.eventAttended === "others") {
        formDataToSend.append("otherEventSpecify", formData.otherEventSpecify || "");
      }
      formDataToSend.append("eventStartDate", formData.eventStartDate);
      formDataToSend.append("eventEndDate", formData.eventEndDate);
      formDataToSend.append("eventDuration", formData.eventDuration);
      formDataToSend.append("eventLocation", formData.eventLocation);
      formDataToSend.append("eventOrganiser", formData.eventOrganiser);
      if (formData.eventOrganiser === "other") {
        formDataToSend.append("organisorNameOther", formData.organisorNameOther || "");
      }
      formDataToSend.append("eventLevel", formData.eventLevel);
      if (formData.eventLevel === "international") {
        formDataToSend.append("country", formData.country || "");
      }
      if (formData.eventLevel === "national") {
        formDataToSend.append("state", formData.state || "");
      }
      formDataToSend.append("withinBIT", formData.withinBIT);
      if (formData.withinBIT === "yes") {
        formDataToSend.append("homeDepartment", formData.homeDepartment || "no");
      }
      formDataToSend.append("roleInEvent", formData.roleInEvent);
      if (formData.roleInEvent === "organised") {
        formDataToSend.append("roleSpecifyOrganised", formData.roleSpecifyOrganised || "");
      }
      if (formData.roleInEvent === "participated") {
        formDataToSend.append("roleSpecifyParticipated", formData.roleSpecifyParticipated || "");
      }
      formDataToSend.append("status", formData.status);
      if (formData.status === "winner") {
        formDataToSend.append("prizeType", formData.prizeType || "");
        if (formData.prizeType === "cash") {
          formDataToSend.append("prizeAmount", formData.prizeAmount || "");
        }
      }
      formDataToSend.append("socialActivityInvolved", formData.socialActivityInvolved);
      if (formData.socialActivityInvolved === "yes") {
        formDataToSend.append("socialActivityName", formData.socialActivityName || "");
      }
      formDataToSend.append("timeSpentHours", formData.timeSpentHours);
      formDataToSend.append("interdisciplinary", formData.interdisciplinary);
      if (formData.interdisciplinary === "yes") {
        formDataToSend.append("interdisciplinaryDept", formData.interdisciplinaryDept || "");
        formDataToSend.append("otherDeptStudentCount", formData.otherDeptStudentCount || "");
      }
      formDataToSend.append("iqacVerification", formData.iqacVerification);
      if (formData.certificateProof) {
        formDataToSend.append("certificateProof", formData.certificateProof);
      }

      const response = await apiClient.post("/student-non-technical", formDataToSend);

      if (response?.id || response?.success) {
        router.push("/student/non-technical");
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
            href="/student/non-technical"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Records
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Add Non-Technical Event</h1>
          <p className="text-slate-600 mt-2">Submit your new non-technical event record</p>
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

          {/* Student & Year Details */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold">1</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Basic Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Selection */}
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  Student <span className="text-red-500">*</span>
                </label>
                {studentsLoading ? (
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-500 text-sm">
                    Loading...
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
                {errors.student && <p className="text-red-600 text-sm mt-2">{errors.student}</p>}
              </div>

              {/* Year of Study */}
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  Year of Study <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.yearOfStudy}
                  onChange={(e) => handleChange("yearOfStudy", e.target.value)}
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${
                    errors.yearOfStudy ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`}
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
                {errors.yearOfStudy && <p className="text-red-600 text-sm mt-2">{errors.yearOfStudy}</p>}
              </div>
            </div>
          </div>

          {/* Event Attended Details */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold">2</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Event Details</h2>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-2">
                Event Attended <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.eventAttended}
                onChange={(e) => handleChange("eventAttended", e.target.value)}
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${
                  errors.eventAttended ? "border-red-400 bg-red-50" : "border-slate-300"
                }`}
                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 8 10 12 14 8"></polyline></svg>')`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  backgroundSize: '20px',
                }}
              >
                <option value="">-- Select Event Type --</option>
                <option value="club">Club</option>
                <option value="ncc_nss_yrc">NCC/NSS/YRC</option>
                <option value="sports">Sports</option>
                <option value="others">Others</option>
              </select>
              {errors.eventAttended && <p className="text-red-600 text-sm mt-2">{errors.eventAttended}</p>}
            </div>

            {/* Conditional: Club Fields */}
            {formData.eventAttended === "club" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                <div>
                  <label className="block font-medium text-slate-700 mb-2">
                    Club <span className="text-red-500">*</span>
                  </label>
                  {clubsLoading ? (
                    <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-500 text-sm">
                      Loading...
                    </div>
                  ) : (
                    <select
                      value={formData.clubId || ""}
                      onChange={(e) => handleChange("clubId", e.target.value)}
                      className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${
                        errors.clubId ? "border-red-400 bg-red-50" : "border-slate-300"
                      }`}
                      style={{
                        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 8 10 12 14 8"></polyline></svg>')`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 8px center',
                        backgroundSize: '20px',
                      }}
                    >
                      <option value="">-- Select Club --</option>
                      {clubs.map((club) => (
                        <option key={club.id} value={club.id}>
                          {club.club_name}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.clubId && <p className="text-red-600 text-sm mt-2">{errors.clubId}</p>}
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-2">
                    Club Events <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.clubEvents || ""}
                    onChange={(e) => handleChange("clubEvents", e.target.value)}
                    placeholder="Enter event details"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.clubEvents ? "border-red-400 bg-red-50" : "border-slate-300"
                    }`}
                  />
                  {errors.clubEvents && <p className="text-red-600 text-sm mt-2">{errors.clubEvents}</p>}
                </div>
              </div>
            )}

            {/* Conditional: Other Event Specification */}
            {formData.eventAttended === "others" && (
              <div className="pt-4 border-t border-slate-200">
                <label className="block font-medium text-slate-700 mb-2">
                  If Others, Please Specify <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.otherEventSpecify || ""}
                  onChange={(e) => handleChange("otherEventSpecify", e.target.value)}
                  placeholder="Please specify the event"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.otherEventSpecify ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`}
                />
                {errors.otherEventSpecify && <p className="text-red-600 text-sm mt-2">{errors.otherEventSpecify}</p>}
              </div>
            )}

            {/* Date and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200">
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
                {errors.eventStartDate && <p className="text-red-600 text-sm mt-2">{errors.eventStartDate}</p>}
              </div>
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
                {errors.eventEndDate && <p className="text-red-600 text-sm mt-2">{errors.eventEndDate}</p>}
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  Event Duration (days) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.eventDuration}
                  onChange={(e) => handleChange("eventDuration", e.target.value)}
                  placeholder="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.eventDuration ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`}
                />
                {errors.eventDuration && <p className="text-red-600 text-sm mt-2">{errors.eventDuration}</p>}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block font-medium text-slate-700 mb-2">
                Event Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.eventLocation}
                onChange={(e) => handleChange("eventLocation", e.target.value)}
                placeholder="Enter event location"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.eventLocation ? "border-red-400 bg-red-50" : "border-slate-300"
                }`}
              />
              {errors.eventLocation && <p className="text-red-600 text-sm mt-2">{errors.eventLocation}</p>}
            </div>
          </div>

          {/* Event Organiser & Level */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold">3</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Organiser & Event Level</h2>
            </div>

            {/* Event Organiser */}
            <div>
              <label className="block font-medium text-slate-700 mb-2">
                Event Organiser <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.eventOrganiser}
                onChange={(e) => handleChange("eventOrganiser", e.target.value)}
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${
                  errors.eventOrganiser ? "border-red-400 bg-red-50" : "border-slate-300"
                }`}
                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 8 10 12 14 8"></polyline></svg>')`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  backgroundSize: '20px',
                }}
              >
                <option value="">-- Select Organiser --</option>
                <option value="BIT">BIT</option>
                <option value="industry">Industry</option>
                <option value="foreign_institute">Foreign Institute</option>
                <option value="other">Other</option>
              </select>
              {errors.eventOrganiser && <p className="text-red-600 text-sm mt-2">{errors.eventOrganiser}</p>}
            </div>

            {/* Conditional: Other Organiser Name */}
            {formData.eventOrganiser === "other" && (
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  Organiser Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.organisorNameOther || ""}
                  onChange={(e) => handleChange("organisorNameOther", e.target.value)}
                  placeholder="Enter organiser name"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.organisorNameOther ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`}
                />
                {errors.organisorNameOther && <p className="text-red-600 text-sm mt-2">{errors.organisorNameOther}</p>}
              </div>
            )}

            {/* Event Level */}
            <div>
              <label className="block font-medium text-slate-700 mb-2">
                Event Level <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.eventLevel}
                onChange={(e) => handleChange("eventLevel", e.target.value)}
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${
                  errors.eventLevel ? "border-red-400 bg-red-50" : "border-slate-300"
                }`}
                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 8 10 12 14 8"></polyline></svg>')`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  backgroundSize: '20px',
                }}
              >
                <option value="">-- Select Level --</option>
                <option value="international">International</option>
                <option value="national">National</option>
                <option value="district">District</option>
                <option value="regional">Regional</option>
                <option value="zonal">Zonal</option>
              </select>
              {errors.eventLevel && <p className="text-red-600 text-sm mt-2">{errors.eventLevel}</p>}
            </div>

            {/* Conditional: Country for International */}
            {formData.eventLevel === "international" && (
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.country || ""}
                  onChange={(e) => handleChange("country", e.target.value)}
                  placeholder="Enter country"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.country ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`}
                />
                {errors.country && <p className="text-red-600 text-sm mt-2">{errors.country}</p>}
              </div>
            )}

            {/* Conditional: State for National */}
            {formData.eventLevel === "national" && (
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.state || ""}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="Enter state"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.state ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`}
                />
                {errors.state && <p className="text-red-600 text-sm mt-2">{errors.state}</p>}
              </div>
            )}
          </div>

          {/* Within BIT & Role */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold">4</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Within BIT & Role</h2>
            </div>

            {/* Within BIT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  Within BIT <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.withinBIT}
                  onChange={(e) => handleChange("withinBIT", e.target.value)}
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${
                    errors.withinBIT ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`}
                  style={{
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 8 10 12 14 8"></polyline></svg>')`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 8px center',
                    backgroundSize: '20px',
                  }}
                >
                  <option value="">-- Select --</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                {errors.withinBIT && <p className="text-red-600 text-sm mt-2">{errors.withinBIT}</p>}
              </div>

              {/* Conditional: Home Department */}
              {formData.withinBIT === "yes" && (
                <div>
                  <label className="block font-medium text-slate-700 mb-2">
                    Home Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.homeDepartment || ""}
                    onChange={(e) => handleChange("homeDepartment", e.target.value)}
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
              )}
            </div>

            {/* Role in Event */}
            <div>
              <label className="block font-medium text-slate-700 mb-2">
                Role in Event <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.roleInEvent}
                onChange={(e) => handleChange("roleInEvent", e.target.value)}
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${
                  errors.roleInEvent ? "border-red-400 bg-red-50" : "border-slate-300"
                }`}
                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 8 10 12 14 8"></polyline></svg>')`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  backgroundSize: '20px',
                }}
              >
                <option value="">-- Select Role --</option>
                <option value="organised">Organised</option>
                <option value="participated">Participated</option>
              </select>
              {errors.roleInEvent && <p className="text-red-600 text-sm mt-2">{errors.roleInEvent}</p>}
            </div>

            {/* Conditional: Role Specification for Organised */}
            {formData.roleInEvent === "organised" && (
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  If Organised, Please Specify Event Names <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.roleSpecifyOrganised || ""}
                  onChange={(e) => handleChange("roleSpecifyOrganised", e.target.value)}
                  placeholder="Enter event names"
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.roleSpecifyOrganised ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`}
                />
                {errors.roleSpecifyOrganised && <p className="text-red-600 text-sm mt-2">{errors.roleSpecifyOrganised}</p>}
              </div>
            )}

            {/* Conditional: Role Specification for Participated */}
            {formData.roleInEvent === "participated" && (
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  If Participated, Please Specify Event Names <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.roleSpecifyParticipated || ""}
                  onChange={(e) => handleChange("roleSpecifyParticipated", e.target.value)}
                  placeholder="Enter event names"
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.roleSpecifyParticipated ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`}
                />
                {errors.roleSpecifyParticipated && <p className="text-red-600 text-sm mt-2">{errors.roleSpecifyParticipated}</p>}
              </div>
            )}
          </div>

          {/* Status & Awards */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold">5</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Status & Awards</h2>
            </div>

            {/* Status */}
            <div>
              <label className="block font-medium text-slate-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${
                  errors.status ? "border-red-400 bg-red-50" : "border-slate-300"
                }`}
                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 8 10 12 14 8"></polyline></svg>')`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  backgroundSize: '20px',
                }}
              >
                <option value="">-- Select Status --</option>
                <option value="winner">Winner</option>
                <option value="runner">Runner</option>
                <option value="participated">Participated</option>
              </select>
              {errors.status && <p className="text-red-600 text-sm mt-2">{errors.status}</p>}
            </div>

            {/* Conditional: Prize Type & Amount for Winner */}
            {formData.status === "winner" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
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
                  {errors.prizeType && <p className="text-red-600 text-sm mt-2">{errors.prizeType}</p>}
                </div>

                {/* Conditional: Prize Amount for Cash */}
                {formData.prizeType === "cash" && (
                  <div>
                    <label className="block font-medium text-slate-700 mb-2">
                      Prize Amount (Rs.) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.prizeAmount || ""}
                      onChange={(e) => handleChange("prizeAmount", e.target.value)}
                      placeholder="0"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.prizeAmount ? "border-red-400 bg-red-50" : "border-slate-300"
                      }`}
                    />
                    {errors.prizeAmount && <p className="text-red-600 text-sm mt-2">{errors.prizeAmount}</p>}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Social Activity & Time */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold">6</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Social Activity & Time</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Social Activity Involved */}
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  Social Activity Involved <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.socialActivityInvolved}
                  onChange={(e) => handleChange("socialActivityInvolved", e.target.value)}
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${
                    errors.socialActivityInvolved ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`}
                  style={{
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 8 10 12 14 8"></polyline></svg>')`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 8px center',
                    backgroundSize: '20px',
                  }}
                >
                  <option value="">-- Select --</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                {errors.socialActivityInvolved && <p className="text-red-600 text-sm mt-2">{errors.socialActivityInvolved}</p>}
              </div>

              {/* Time Spent in Hours */}
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  Time Spent (hours) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.timeSpentHours}
                  onChange={(e) => handleChange("timeSpentHours", e.target.value)}
                  placeholder="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.timeSpentHours ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`}
                />
                {errors.timeSpentHours && <p className="text-red-600 text-sm mt-2">{errors.timeSpentHours}</p>}
              </div>
            </div>

            {/* Conditional: Social Activity Name */}
            {formData.socialActivityInvolved === "yes" && (
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  Social Activity Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.socialActivityName || ""}
                  onChange={(e) => handleChange("socialActivityName", e.target.value)}
                  placeholder="Enter social activity name"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.socialActivityName ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`}
                />
                {errors.socialActivityName && <p className="text-red-600 text-sm mt-2">{errors.socialActivityName}</p>}
              </div>
            )}
          </div>

          {/* Interdisciplinary */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold">7</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Interdisciplinary</h2>
            </div>

            {/* Interdisciplinary */}
            <div>
              <label className="block font-medium text-slate-700 mb-2">
                Interdisciplinary <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.interdisciplinary}
                onChange={(e) => handleChange("interdisciplinary", e.target.value)}
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${
                  errors.interdisciplinary ? "border-red-400 bg-red-50" : "border-slate-300"
                }`}
                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 8 10 12 14 8"></polyline></svg>')`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  backgroundSize: '20px',
                }}
              >
                <option value="">-- Select --</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              {errors.interdisciplinary && <p className="text-red-600 text-sm mt-2">{errors.interdisciplinary}</p>}
            </div>

            {/* Conditional: Department & Student Count for Interdisciplinary */}
            {formData.interdisciplinary === "yes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                <div>
                  <label className="block font-medium text-slate-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  {departmentsLoading ? (
                    <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-500 text-sm">
                      Loading...
                    </div>
                  ) : (
                    <select
                      value={formData.interdisciplinaryDept || ""}
                      onChange={(e) => handleChange("interdisciplinaryDept", e.target.value)}
                      className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${
                        errors.interdisciplinaryDept ? "border-red-400 bg-red-50" : "border-slate-300"
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
                  {errors.interdisciplinaryDept && <p className="text-red-600 text-sm mt-2">{errors.interdisciplinaryDept}</p>}
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-2">
                    Number of Other Department Students <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.otherDeptStudentCount || ""}
                    onChange={(e) => handleChange("otherDeptStudentCount", e.target.value)}
                    placeholder="0"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.otherDeptStudentCount ? "border-red-400 bg-red-50" : "border-slate-300"
                    }`}
                  />
                  {errors.otherDeptStudentCount && <p className="text-red-600 text-sm mt-2">{errors.otherDeptStudentCount}</p>}
                </div>
              </div>
            )}
          </div>

          {/* File Upload & IQAC */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold">8</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Documents & Verification</h2>
            </div>

            {/* Certificate Proof */}
            <FileUploadField
              label="Certificate Document Proof"
              value={formData.certificateProof}
              onChange={(file) => handleChange("certificateProof", file)}
              onRemove={() => handleChange("certificateProof", null)}
              error={errors.certificateProof}
              hint="Format: Reg.No-NT-DD.MM.YYYY (e.g., 201CS111-NT-08.06.2021)"
              required
            />

            {/* IQAC Verification */}
            <div>
              <label className="block font-medium text-slate-700 mb-2">
                IQAC Verification <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.iqacVerification}
                onChange={(e) => handleChange("iqacVerification", e.target.value)}
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${
                  errors.iqacVerification ? "border-red-400 bg-red-50" : "border-slate-300"
                }`}
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
              {errors.iqacVerification && <p className="text-red-600 text-sm mt-2">{errors.iqacVerification}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Link
              href="/student/non-technical"
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition font-medium"
            >
              {loading ? "Submitting..." : "Submit Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
