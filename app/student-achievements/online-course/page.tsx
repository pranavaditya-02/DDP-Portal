"use client";

import { ChangeEvent, useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Database,
  Filter,
  MoreHorizontal,
  Search,
  UploadCloud,
} from "lucide-react";
import { SearchableSelect } from "@/components/SearchableSelect";

type FormState = {
  student: string;
  yearOfStudy: string;
  specialLab: string;
  onlineCourse: string;
  courseType: string;
  marksAvailable: string;
  startDate: string;
  endDate: string;
  examDate: string;
  durationWeeks: string;
  partOfAcademic: string;
  semester: string;
  sponsorshipType: string;
  interdisciplinary: string;
  department: string;
  certificateUrl: string;
  iqacVerification: string;
  marksObtained: string;
};

const INITIAL_FORM: FormState = {
  student: "",
  yearOfStudy: "",
  specialLab: "",
  onlineCourse: "",
  courseType: "",
  marksAvailable: "",
  startDate: "",
  endDate: "",
  examDate: "",
  durationWeeks: "",
  partOfAcademic: "",
  semester: "",
  sponsorshipType: "",
  interdisciplinary: "",
  department: "",
  certificateUrl: "",
  iqacVerification: "Initiated",
  marksObtained: "",
};

type Department = { id: number; dept_name: string };
type Student = { id: number; name: string };

const STUDENTS: Student[] = [
  { id: 1, name: "Jaison David" },
  { id: 2, name: "Aakash" },
  { id: 3, name: "Sudhir" },
  { id: 4, name: "Arun" },
];

export default function CreateOnlineCoursePage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const [labs, setLabs] = useState<{ id: number; specialLabName: string }[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [files, setFiles] = useState<{
    originalProof: File | null;
    attendedProof: File | null;
  }>({
    originalProof: null,
    attendedProof: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSearchableChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null); // Clear error when user makes changes
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      setFiles((prev) => ({
        ...prev,
        [name]: fileList[0],
      }));
      setError(null);
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setForm(INITIAL_FORM);
    setFiles({ originalProof: null, attendedProof: null });
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate files
      if (!files.originalProof || !files.attendedProof) {
        setError("Both certificate files are required");
        setLoading(false);
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();

      // Append form fields
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Append files
      formData.append("originalProof", files.originalProof);
      formData.append("attendedProof", files.attendedProof);

      // Send request to backend
      const response = await fetch("http://localhost:5000/api/student-online-courses", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create online course");
      }

      // Success
      setSuccess(true);
      setForm(INITIAL_FORM);
      setFiles({ originalProof: null, attendedProof: null });

      // Show success message for 3 seconds then reset
      setTimeout(() => {
        setShowCreateForm(false);
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, labRes, deptRes] = await Promise.all([
          fetch("http://localhost:5000/courses/active"),
          fetch("http://localhost:5000/speciallabs/active"),
          fetch("http://localhost:5000/departments"),
        ]);

        const coursesData = await courseRes.json();
        const labsData = await labRes.json();
        const departmentsData = await deptRes.json();

        setCourses(coursesData);
        setLabs(labsData);
        setDepartments(departmentsData);
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };

    fetchData();
  }, []);

  if (!showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-5">

          {/* Breadcrumb */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-400 sm:text-sm">
            <span className="text-gray-500">Resources</span>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="text-indigo-500 font-semibold">Online Course</span>
          </div>

          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Online Course</h1>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition"
              >
                <MoreHorizontal size={18} />
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
              >
                Create Online Course
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="max-w-sm rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 shadow-sm flex items-center gap-2">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none"
            />
          </div>

          {/* Table card */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Table toolbar */}
            <div className="flex items-center justify-end gap-2 border-b border-gray-100 px-4 py-3">
              <button type="button" className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition">
                <Filter size={13} />
                Filter
                <ChevronDown size={12} />
              </button>
            </div>

            {/* Empty state */}
            <div className="flex min-h-[320px] flex-col items-center justify-center px-4 py-12 text-center">
              <div className="rounded-2xl bg-gray-50 p-5 mb-4">
                <Database size={38} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">
                No Online Course matched the given criteria.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Get started by creating your first online course record.
              </p>
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="mt-5 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-100 transition"
              >
                Create Online Course
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Create form ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {/* Form header */}
        <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-400 sm:text-sm">
            <span>Resources</span>
            <ChevronRight size={13} className="text-gray-300" />
            <span
              className="cursor-pointer hover:text-indigo-500 transition"
              onClick={handleCancel}
            >
              Online Course
            </span>
            <ChevronRight size={13} className="text-gray-300" />
            <span className="text-gray-700 font-semibold">Create Online Course</span>
          </div>
          <h1 className="mt-3 text-xl font-bold text-gray-900 sm:text-2xl tracking-tight">
            Create Online Course
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Fill all required details and upload valid proof documents.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mx-6 mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">✓ Online course record created successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-7 bg-gradient-to-b from-white to-gray-50/60 px-6 py-7 sm:px-8 sm:py-8">

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-sm text-indigo-700">
            Select records faster using searchable dropdowns for student, lab, course, and department.
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <SearchableSelect
              label="Student"
              required
              name="student"
              value={form.student}
              placeholder="Choose student"
              options={STUDENTS.map((student) => ({
                value: String(student.id),
                label: `${student.name} (ID: ${student.id})`,
              }))}
              onChange={handleSearchableChange}
            />
            <SelectField label="Year of Study" required name="yearOfStudy" value={form.yearOfStudy}
              options={["Choose year", "First", "Second", "Third", "Fourth"]}
              onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <SearchableSelect
              label="Special Lab"
              required
              name="specialLab"
              value={form.specialLab}
              placeholder="Choose lab"
              options={labs.map((lab) => ({
                value: String(lab.id),
                label: lab.specialLabName,
              }))}
              onChange={handleSearchableChange}
            />
            <SearchableSelect
              label="Online Course"
              required
              name="onlineCourse"
              value={form.onlineCourse}
              placeholder="Choose course"
              options={courses.map((course) => ({
                value: String(course.id),
                label: course.name,
              }))}
              onChange={handleSearchableChange}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <SelectField label="Course Type" required name="courseType" value={form.courseType}
              options={["Choose course type", "Swayam-NPTEL", "Coursera", "Others (MBA)", "Others (Project-Outcome)"]}
              onChange={handleChange} />
            <SelectField label="Marks Available in Certificate" required name="marksAvailable" value={form.marksAvailable}
              options={["Choose an option", "Yes", "No"]}
              onChange={handleChange} />
          </div>

          {form.marksAvailable === "Yes" && (
            <InputField
              label="Marks Obtained"
              required
              name="marksObtained"
              value={form.marksObtained}
              placeholder="Enter marks obtained in certificate"
              onChange={handleChange}
            />
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <InputField label="Start Date" required type="date" name="startDate" value={form.startDate} onChange={handleChange} />
            <InputField label="End Date" required type="date" name="endDate" value={form.endDate} onChange={handleChange} />
            <InputField label="Exam Date" required type="date" name="examDate" value={form.examDate} onChange={handleChange} />
          </div>

          <InputField
            label="Course Duration in Weeks" required
            name="durationWeeks" value={form.durationWeeks}
            placeholder="Enter course duration in weeks"
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <SelectField label="Whether Studying as a Part of Academic?" required name="partOfAcademic" value={form.partOfAcademic}
              options={["Choose an option", "Yes", "No"]} onChange={handleChange} />
            <SelectField label="Type of Sponsorship" required name="sponsorshipType" value={form.sponsorshipType}
              options={["Choose an option", "Self", "Institution", "Government", "Industry"]} onChange={handleChange} />
            <SelectField label="Interdisciplinary" required name="interdisciplinary" value={form.interdisciplinary}
              options={["Choose an option", "Yes", "No"]} onChange={handleChange} />
          </div>

          {/* Conditional Semester Field - Shows when partOfAcademic is Yes */}
          {form.partOfAcademic === "Yes" && (
            <SelectField
              label="Select Semester"
              required
              name="semester"
              value={form.semester}
              options={["Choose semester", "1", "2", "3", "4", "5", "6", "7", "8"]}
              onChange={handleChange}
            />
          )}

          {/* Conditional Department Field - Fetched from Backend */}
          {form.interdisciplinary === "Yes" && (
            <SearchableSelect
              label="Select Department"
              required
              name="department"
              value={form.department}
              placeholder="Choose department"
              options={departments.map((dept) => ({
                value: String(dept.id),
                label: dept.dept_name,
              }))}
              onChange={handleSearchableChange}
            />
          )}

          <FileField
            label="Original Certificate Proof"
            required
            name="originalProof"
            onChange={handleFileChange}
            fileName={files.originalProof?.name}
          />
          <ProofHint />

          <FileField
            label="Attended Certificate"
            required
            name="attendedProof"
            onChange={handleFileChange}
            fileName={files.attendedProof?.name}
          />
          <ProofHint />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <InputField label="Certificate URL / Website" required type="url"
              name="certificateUrl" value={form.certificateUrl}
              placeholder="https://example.com/certificate" onChange={handleChange} />
            <SelectField label="IQAC Verification" required name="iqacVerification" value={form.iqacVerification}
              options={["Initiated", "Verified", "Rejected"]} onChange={handleChange} />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-100 transition disabled:opacity-50"
            >
              Create &amp; Add Another
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Online Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

type BaseFieldProps = { label: string; name: string; required?: boolean };

type InputFieldProps = BaseFieldProps & {
  type?: string; value: string; placeholder?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

function InputField({ label, name, required, type = "text", value, placeholder, onChange }: InputFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label}{required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100" />
    </div>
  );
}

type SelectFieldProps = BaseFieldProps & {
  value: string; options: string[];
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
};

function SelectField({ label, name, required, value, options, onChange }: SelectFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label}{required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <select name={name} value={value} onChange={onChange}
        className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100 appearance-none">
        {options.map((option) => (
          <option key={option} value={option.startsWith("Choose") ? "" : option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

type FileFieldProps = BaseFieldProps & {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  fileName?: string;
};

function FileField({ label, required, name, onChange, fileName }: FileFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label}{required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <label className="group flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-sm text-gray-500 transition hover:border-indigo-400 hover:bg-indigo-50">
        <UploadCloud size={17} className="text-gray-400 group-hover:text-indigo-500" />
        <div className="text-center">
          <span className="group-hover:text-indigo-600">Choose file or drag and drop</span>
          {fileName && <p className="mt-1 text-xs text-green-600 font-medium">✓ {fileName}</p>}
        </div>
        <input
          name={name}
          type="file"
          className="hidden"
          onChange={onChange}
          accept=".pdf,.jpg,.jpeg,.png"
        />
      </label>
    </div>
  );
}

function ProofHint() {
  return (
    <p className="-mt-3 text-xs font-medium text-red-500">
      Please specify proof name format as: Reg.No - ODC - Date of Event.
    </p>
  );
}