"use client";

import { ChangeEvent, useState, useEffect } from "react";
import {
  ChevronRight,
  Database,
  Search,
  UploadCloud,
  Plus,
  SlidersHorizontal,
  MoreHorizontal,
  Check,
  X,
  Link,
  BookOpen,
  GraduationCap,
  Users,
} from "lucide-react";
import { SearchableSelect } from "@/components/SearchableSelect";

// ─── Types ────────────────────────────────────────────────────────────────────

type BookChapterRecord = {
  id: number;
  student_id: number;
  student_name: string;
  chapter_title: string;
  authors_names: string;
  author_or_coauthor_name: string;
  book_title: string;
  publisher_name: string;
  date_of_publication: string;
  volume_number: string;
  edition: string;
  isbn_number: string;
  doi_number: string;
  page_from: number;
  page_to: number;
  web_url: string;
  chapter_indexed: string;
  indexed_details?: string;
  indexed_other_details?: string;
  impact_factor: string;
  impact_factor_value?: string;
  student_author_position?: string;
  labs_involved?: string;
  sponsorship_type: string;
  interdisciplinary: number;
  interdisciplinary_dept_id?: number;
  interdisciplinary_dept_name?: string;
  other_dept_student_count?: number;
  sdg_goals: string;
  sdg_title?: string;
  project_outcome: string;
  total_authors?: number;
  student_author_count?: number;
  faculty_author_count?: number;
  student_author_names?: string[];
  faculty_author_names?: string[];
  abstract_proof_url?: string;
  full_document_proof_url?: string;
  original_cert_proof_url?: string;
  attested_cert_proof_url?: string;
  iqac_status: string;
  created_at: string;
  updated_at: string;
  lab_name?: string;
};

type FormState = {
  student: string;
  yearOfStudy: string;
  specialLab: string;
  chapterTitle: string;
  authorsNames: string;
  authorOrCoauthorName: string; // NEW: "Author" | "Co-Author"
  // ── Author breakdown ──
  totalAuthors: string;
  studentAuthorCount: string;
  facultyAuthorCount: string;
  studentAuthorNames: string[];
  facultyAuthorNames: string[];
  // ─────────────────────
  dateOfPublication: string;
  volumeNumber: string;
  edition: string;
  isbnNumber: string;
  doiNumber: string;
  pageFrom: string;
  pageTo: string;
  bookTitle: string;
  publisherName: string;
  webUrl: string;
  chapterIndexed: string;
  indexedDetails: string;     // NEW: Scopus | SCI/SCI(E) | WoS | Others
  indexedOtherDetails: string; // NEW: free-text when "Others"
  impactFactor: string;
  impactFactorValue: string;
  studentAuthorPosition: string;
  labsInvolved: string;
  projectOutcome: string;
  sponsorshipType: string;
  interdisciplinary: string;
  interdisciplinaryDepartment: string; // NEW: department dropdown
  otherDeptStudentCount: string;        // NEW: number of other dept students
  sdgGoals: string;
  abstractProof: File | null;
  fullDocumentProof: File | null;
  originalCertProof: File | null;
  attestedCertProof: File | null;
  iqacVerification: string;
};

const INITIAL_FORM: FormState = {
  student: "",
  yearOfStudy: "",
  specialLab: "",
  chapterTitle: "",
  authorsNames: "",
  authorOrCoauthorName: "",
  totalAuthors: "",
  studentAuthorCount: "",
  facultyAuthorCount: "",
  studentAuthorNames: [],
  facultyAuthorNames: [],
  dateOfPublication: "",
  volumeNumber: "",
  edition: "",
  isbnNumber: "",
  doiNumber: "",
  pageFrom: "",
  pageTo: "",
  bookTitle: "",
  publisherName: "",
  webUrl: "",
  chapterIndexed: "",
  indexedDetails: "",
  indexedOtherDetails: "",
  impactFactor: "",
  impactFactorValue: "",
  studentAuthorPosition: "",
  labsInvolved: "",
  projectOutcome: "",
  sponsorshipType: "",
  interdisciplinary: "",
  interdisciplinaryDepartment: "",
  otherDeptStudentCount: "",
  sdgGoals: "",
  abstractProof: null,
  fullDocumentProof: null,
  originalCertProof: null,
  attestedCertProof: null,
  iqacVerification: "Initiated",
};

type Student = { id: number; student_name: string };
type Department = { id: number; dept_name: string };

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Student info" },
  { id: 2, label: "Chapter details" },
  { id: 3, label: "Publication" },
  { id: 4, label: "Documents" },
];

const INDEXED_OPTIONS = ["Scopus", "SCI/SCI(E)", "WoS", "Others"];

const SDG_MAPPING: Record<string, string> = {
  "1": "SDG 1: No Poverty",
  "2": "SDG 2: Zero Hunger",
  "3": "SDG 3: Good Health and Well-being",
  "4": "SDG 4: Quality Education",
  "5": "SDG 5: Gender Equality",
  "6": "SDG 6: Clean Water and Sanitation",
  "7": "SDG 7: Affordable and Clean Energy",
  "8": "SDG 8: Decent Work and Economic Growth",
  "9": "SDG 9: Industry, Innovation and Infrastructure",
  "10": "SDG 10: Reduced Inequalities",
  "11": "SDG 11: Sustainable Cities and Communities",
  "12": "SDG 12: Responsible Consumption and Production",
  "13": "SDG 13: Climate Action",
  "14": "SDG 14: Life Below Water",
  "15": "SDG 15: Life on Land",
  "16": "SDG 16: Peace, Justice and Strong Institutions",
  "17": "SDG 17: Partnerships for the Goals",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { cls: string; dot: string }> = {
  Verified: { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
  Rejected: { cls: "bg-red-50 text-red-700 border border-red-200", dot: "bg-red-500" },
  Initiated: { cls: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-400" },
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const fmtDateLong = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BookChapterPublicationPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [records, setRecords] = useState<BookChapterRecord[]>([]);
  const [files, setFiles] = useState<{
    abstractProof: File | null;
    fullDocumentProof: File | null;
    originalCertProof: File | null;
    attestedCertProof: File | null;
  }>({
    abstractProof: null,
    fullDocumentProof: null,
    originalCertProof: null,
    attestedCertProof: null,
  });
  const [lightbox, setLightbox] = useState<{ url: string; label: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<BookChapterRecord | null>(null);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [students, setStudents] = useState<Student[]>([]);
  const [labs, setLabs] = useState<{ id: number; specialLabName: string }[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSearchableChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const next = { ...prev, [name]: value };

      // Reset indexed sub-fields when chapterIndexed changes
      if (name === "chapterIndexed") {
        next.indexedDetails = "";
        next.indexedOtherDetails = "";
      }

      // Reset "Others" free-text when indexedDetails changes away from "Others"
      if (name === "indexedDetails" && value !== "Others") {
        next.indexedOtherDetails = "";
      }

      // Reset interdisciplinary sub-fields when interdisciplinary changes
      if (name === "interdisciplinary") {
        next.interdisciplinaryDepartment = "";
        next.otherDeptStudentCount = "";
      }

      return next;
    });

    setError(null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      setFiles((prev) => ({ ...prev, [name]: fileList[0] }));
      setError(null);
    }
  };

  // ── Author breakdown handlers ────────────────────────────────────────────────

  const handleTotalAuthorsChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setForm((prev) => ({
      ...prev,
      totalAuthors: val,
      studentAuthorCount: "",
      facultyAuthorCount: "",
      studentAuthorNames: [],
      facultyAuthorNames: [],
    }));
    setError(null);
  };

  const handleStudentAuthorCountChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const studentCount = e.target.value;
    const total = parseInt(form.totalAuthors) || 0;
    const students = parseInt(studentCount) || 0;
    const faculty = total - students;
    setForm((prev) => ({
      ...prev,
      studentAuthorCount: studentCount,
      facultyAuthorCount: String(faculty),
      studentAuthorNames: Array(students).fill(""),
      facultyAuthorNames: Array(faculty).fill(""),
    }));
    setError(null);
  };

  const handleStudentAuthorNameChange = (index: number, value: string) => {
    setForm((prev) => {
      const updated = [...prev.studentAuthorNames];
      updated[index] = value;
      return { ...prev, studentAuthorNames: updated };
    });
  };

  const handleFacultyAuthorNameChange = (index: number, value: string) => {
    setForm((prev) => {
      const updated = [...prev.facultyAuthorNames];
      updated[index] = value;
      return { ...prev, facultyAuthorNames: updated };
    });
  };

  // ── Fetch detailed record ────────────────────────────────────────────────────

  const handleOpenDetail = async (recordId: number) => {
    setDetailLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/book-chapter-publications/${recordId}`);
      if (!response.ok) throw new Error("Failed to load record details");
      const data = await response.json();
      setSelected(data);
    } catch (err) {
      console.error("Error fetching record details:", err);
      setError("Failed to load record details");
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Cancel / Submit ──────────────────────────────────────────────────────────

  const handleCancel = () => {
    setShowCreateForm(false);
    setForm(INITIAL_FORM);
    setFiles({
      abstractProof: null,
      fullDocumentProof: null,
      originalCertProof: null,
      attestedCertProof: null,
    });
    setError(null);
    setSuccess(false);
    setActiveStep(1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!files.abstractProof || !files.fullDocumentProof) {
        setError("Abstract and Full Document proofs are required");
        setLoading(false);
        return;
      }

      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value && typeof value === "string") {
          formData.append(key, value);
        }
      });

      formData.append("studentAuthorNames", JSON.stringify(form.studentAuthorNames));
      formData.append("facultyAuthorNames", JSON.stringify(form.facultyAuthorNames));

      if (files.abstractProof) formData.append("abstractProof", files.abstractProof);
      if (files.fullDocumentProof) formData.append("fullDocumentProof", files.fullDocumentProof);
      if (files.originalCertProof) formData.append("originalCertProof", files.originalCertProof);
      if (files.attestedCertProof) formData.append("attestedCertProof", files.attestedCertProof);

      const response = await fetch("http://localhost:5000/api/book-chapter-publications", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create book chapter publication");

      setSuccess(true);
      setForm(INITIAL_FORM);
      setFiles({
        abstractProof: null,
        fullDocumentProof: null,
        originalCertProof: null,
        attestedCertProof: null,
      });
      setTimeout(() => {
        setShowCreateForm(false);
        setSuccess(false);
        setActiveStep(1);
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
        const [recordRes, studentRes, labRes, deptRes] = await Promise.all([
          fetch("http://localhost:5000/api/book-chapter-publications"),
          fetch("http://localhost:5000/students"),
          fetch("http://localhost:5000/speciallabs/active"),
          fetch("http://localhost:5000/departments"),
        ]);

        // Check each response before parsing
        const checkJson = async (res: Response, label: string) => {
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch {
            console.error(`❌ ${label} returned non-JSON:`, text.slice(0, 200));
            return [];
          }
        };

        setRecords(await checkJson(recordRes, "book-chapter-publications"));
        setStudents(await checkJson(studentRes, "students"));
        setLabs(await checkJson(labRes, "speciallabs/active"));
        setDepartments(await checkJson(deptRes, "departments"));

      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setRecordsLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── List view ──────────────────────────────────────────────────────────────

  if (!showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50/70 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-4">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="font-medium text-gray-500">Resources</span>
            <ChevronRight size={13} className="text-gray-300" />
            <span className="font-semibold text-indigo-600">Book Chapter Publications</span>
          </nav>

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Book Chapter Publications</h1>
              <p className="mt-0.5 text-xs text-gray-500">Manage and track book chapter publication records</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-gray-200 bg-white p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
              >
                <MoreHorizontal size={16} />
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                <Plus size={15} />
                Create Record
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 min-w-[220px]">
                <Search size={13} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search publications, students…"
                  className="w-full bg-transparent text-xs text-gray-700 placeholder:text-gray-400 outline-none"
                />
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal size={13} />
                Filter
              </button>
            </div>

            {recordsLoading ? (
              <div className="flex min-h-[340px] flex-col items-center justify-center gap-2 px-4 py-12">
                <div className="w-5 h-5 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
                <p className="text-xs text-gray-400">Loading records…</p>
              </div>

            ) : records.length === 0 ? (
              <div className="flex min-h-[340px] flex-col items-center justify-center gap-3 px-4 py-12 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100">
                  <Database size={22} className="text-gray-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">No book chapter publications found</p>
                  <p className="mt-0.5 text-xs text-gray-400">Get started by creating your first book chapter publication entry.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="mt-1 flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
                >
                  <Plus size={13} />
                  Create Book Chapter Publication
                </button>
              </div>

            ) : (
              <>
                {/* ── TABLE ── */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/80">
                        {[
                          "Student / Chapter",
                          "Book",
                          "Volume",
                          "Edition",
                          "DOI",
                          "Indexed",
                          "Impact Factor",
                          "Published Date",
                          "IQAC",
                          "",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {records.map((record) => {
                        const s = STATUS_MAP[record.iqac_status] ?? STATUS_MAP.Initiated;
                        return (
                          <tr
                            key={record.id}
                            onClick={() => handleOpenDetail(record.id)}
                            className="group hover:bg-indigo-50/40 cursor-pointer transition-colors"
                          >
                            <td className="px-4 py-3.5 max-w-[200px]">
                              <p className="font-semibold text-gray-800 leading-tight truncate">{record.chapter_title}</p>
                              <p className="text-gray-400 mt-0.5 truncate">{record.student_name}</p>
                              <p className="text-gray-300 mt-0.5 text-[10px]">Record #{record.id}</p>
                            </td>
                            <td className="px-4 py-3.5 max-w-[150px]">
                              <p className="text-gray-600 truncate text-[11px]">{record.book_title}</p>
                            </td>
                            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{record.volume_number}</td>
                            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{record.edition}</td>
                            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{record.doi_number}</td>
                            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                              {record.chapter_indexed === "Yes" ? (
                                <span className="text-emerald-700 font-semibold text-[11px]">Yes</span>
                              ) : (
                                <span className="text-gray-400 text-[11px]">No</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{record.impact_factor}</td>
                            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{fmtDate(record.date_of_publication)}</td>
                            <td className="px-4 py-3.5">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.cls}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                {record.iqac_status}
                              </span>
                            </td>
                            <td className="px-3 py-3.5 text-right">
                              <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-400 transition-colors inline-block" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ── DETAIL MODAL ── */}
                {selected && (
                  <>
                    <div
                      onClick={() => setSelected(null)}
                      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150"
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">

                        {/* Modal header */}
                        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
                          <div className="min-w-0 pr-4">
                            <p className="text-base font-bold text-gray-900 leading-snug">{selected.chapter_title}</p>
                            <p className="text-sm text-gray-400 mt-0.5">{selected.student_name} · Record #{selected.id}</p>
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {(() => {
                                const s = STATUS_MAP[selected.iqac_status] ?? STATUS_MAP.Initiated;
                                return (
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.cls}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                    {selected.iqac_status}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                          <button
                            onClick={() => setSelected(null)}
                            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        {/* Modal body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                          {detailLoading ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-12">
                              <div className="w-5 h-5 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
                              <p className="text-xs text-gray-400">Loading details…</p>
                            </div>
                          ) : (
                            <>
                          <ModalSection title="Student & Chapter Info">
                            <div className="grid grid-cols-2 gap-3">
                              <InfoCell label="Student Name" value={selected.student_name} />
                              <InfoCell label="Chapter Title" value={selected.chapter_title} />
                              <InfoCell label="Authors" value={selected.authors_names} />
                              <InfoCell label="SDG Goal" value={SDG_MAPPING[selected.sdg_goals] ?? `SDG ${selected.sdg_goals}`} />
                            </div>
                          </ModalSection>

                          <ModalSection title="Publication Details">
                            <div className="grid grid-cols-2 gap-3">
                              <InfoCell label="Book Title" value={selected.book_title} />
                              <InfoCell label="Publisher" value={selected.publisher_name} />
                              <InfoCell label="Volume" value={selected.volume_number} />
                              <InfoCell label="Edition" value={selected.edition} />
                              <InfoCell label="ISBN" value={selected.isbn_number} />
                              <InfoCell label="DOI" value={selected.doi_number} />
                              <InfoCell label="Page From" value={selected.page_from.toString()} />
                              <InfoCell label="Page To" value={selected.page_to.toString()} />
                            </div>
                          </ModalSection>
                          <ModalSection title="Author Breakdown">
                            <div className="grid grid-cols-2 gap-3">
                              <InfoCell label="Author Role" value={selected.author_or_coauthor_name ?? "-"} />
                              <InfoCell label="Total Authors" value={selected.total_authors?.toString() ?? "-"} />
                              <InfoCell label="Student Authors" value={selected.student_author_count?.toString() ?? "-"} />
                              <InfoCell label="Faculty Authors" value={selected.faculty_author_count?.toString() ?? "-"} />
                            </div>
                            {selected.student_author_names && selected.student_author_names.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs font-semibold text-gray-700 mb-2">Student Author Names:</p>
                                <p className="text-xs text-gray-600">{selected.student_author_names.join(", ")}</p>
                              </div>
                            )}
                            {selected.faculty_author_names && selected.faculty_author_names.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-semibold text-gray-700 mb-2">Faculty Author Names:</p>
                                <p className="text-xs text-gray-600">{selected.faculty_author_names.join(", ")}</p>
                              </div>
                            )}
                          </ModalSection>

                          <ModalSection title="Contribution Details">
                            <div className="grid grid-cols-2 gap-3">
                              <InfoCell label="Student Author Position" value={selected.student_author_position ?? "-"} />
                              <InfoCell label="Labs Involved" value={selected.labs_involved ?? "-"} />
                            </div>
                          </ModalSection>

                          <ModalSection title="Publication Date & Timeline">
                            <div className="grid grid-cols-2 gap-3">
                              <InfoCell label="Date of Publication" value={fmtDateLong(selected.date_of_publication)} />
                              <InfoCell label="Created At" value={fmtDateTime(selected.created_at)} />
                              <InfoCell label="Updated At" value={fmtDateTime(selected.updated_at)} />
                            </div>
                          </ModalSection>

                          <ModalSection title="Links & Files">
                            <div className="space-y-3">
                              <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                                <p className="text-[10px] text-gray-400 mb-0.5">Chapter URL</p>
                                <a
                                  href={selected.web_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-medium text-indigo-600 hover:underline break-all"
                                >
                                  {selected.web_url}
                                </a>
                              </div>
                            </div>
                          </ModalSection>

                          <ModalSection title="Chapter Properties">
                            <div className="grid grid-cols-2 gap-3">
                              <InfoCell label="Chapter Indexed" value={selected.chapter_indexed} />
                              {selected.chapter_indexed === "Yes" && selected.indexed_details && (
                                <InfoCell label="Indexed In" value={selected.indexed_details} />
                              )}
                              {selected.indexed_details === "Others" && selected.indexed_other_details && (
                                <InfoCell label="Other Index Details" value={selected.indexed_other_details} />
                              )}
                              <InfoCell label="Impact Factor" value={selected.impact_factor} />
                              {selected.impact_factor === "Yes" && selected.impact_factor_value && (
                                <InfoCell label="Impact Factor Value" value={selected.impact_factor_value} />
                              )}
                              <InfoCell label="Project Outcome" value={selected.project_outcome} />
                              <InfoCell label="Sponsorship Type" value={selected.sponsorship_type} />
                              <InfoCell label="Interdisciplinary" value={selected.interdisciplinary ? "Yes" : "No"} />
                              {selected.interdisciplinary && selected.interdisciplinary_dept_name && (
                                <InfoCell label="Interdisciplinary Dept" value={selected.interdisciplinary_dept_name} />
                              )}
                              {selected.interdisciplinary && selected.other_dept_student_count && (
                                <InfoCell label="Other Dept Students" value={selected.other_dept_student_count?.toString() ?? "-"} />
                              )}
                            </div>
                          </ModalSection>

                          <ModalSection title="Proof Documents">
                            <div className="grid grid-cols-2 gap-4">
                              {[
                                { label: "Abstract Document", url: selected.abstract_proof_url },
                                { label: "Full Document", url: selected.full_document_proof_url },
                                { label: "Original Certificate", url: selected.original_cert_proof_url },
                                { label: "Attested Certificate", url: selected.attested_cert_proof_url },
                              ].map(({ label, url }) => (
                                <button
                                  key={label}
                                  type="button"
                                  onClick={() => {
                                    if (url) {
                                      if (/\.(png|jpe?g|webp|gif|bmp|svg)(\?.*)?$/i.test(url)) {
                                        setLightbox({ url, label });
                                      } else {
                                        window.open(url, "_blank", "noopener,noreferrer");
                                      }
                                    }
                                  }}
                                  className={`group block rounded-xl overflow-hidden border transition-all text-left w-full ${url
                                    ? "border-gray-200 hover:border-indigo-300 hover:shadow-md cursor-pointer"
                                    : "border-gray-100 opacity-50 cursor-not-allowed"
                                    }`}
                                  disabled={!url}
                                >
                                  <div className="relative bg-gray-100 h-40 overflow-hidden flex items-center justify-center">
                                    {url && /\.(png|jpe?g|webp|gif|bmp|svg)(\?.*)?$/i.test(url) ? (
                                      <>
                                        <img
                                          src={url}
                                          alt={label}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <Search size={20} className="text-white drop-shadow" />
                                        </div>
                                      </>
                                    ) : (
                                      <div className="flex items-center justify-center w-full h-full">
                                        <p className="text-xs text-gray-400">{url ? "PDF / Document" : "Not uploaded"}</p>
                                      </div>
                                    )}
                                  </div>
                                  <div className="px-3 py-2.5 bg-white">
                                    <p className="text-xs font-medium text-gray-600 truncate">{label}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </ModalSection>
                            </>
                          )}
                        </div>

                        {lightbox && (
                          <div
                            onClick={() => setLightbox(null)}
                            className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-6"
                          >
                            <div
                              className="relative max-w-[90vw] max-h-[85vh]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => setLightbox(null)}
                                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-colors"
                              >
                                <X size={16} />
                              </button>
                              <img
                                src={lightbox.url}
                                alt={lightbox.label}
                                className="block max-w-[90vw] max-h-[85vh] object-contain rounded-xl"
                              />
                              <div className="absolute bottom-0 left-0 right-0 px-4 py-2.5 bg-black/55 rounded-b-xl">
                                <p className="text-sm font-medium text-white">{lightbox.label}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Modal footer */}
                        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex justify-end">
                          <button
                            onClick={() => setSelected(null)}
                            className="px-5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Derived author counts for rendering ────────────────────────────────────

  const totalAuthorsNum = parseInt(form.totalAuthors) || 0;
  const studentCountNum = parseInt(form.studentAuthorCount) || 0;
  const facultyCountNum = parseInt(form.facultyAuthorCount) || 0;
  const showStudentCountField = totalAuthorsNum > 0;
  const showFacultyCountField = showStudentCountField && form.studentAuthorCount !== "";
  const showAuthorNameFields = showFacultyCountField && (studentCountNum > 0 || facultyCountNum > 0);

  // ── Conditional field visibility ───────────────────────────────────────────
  const showIndexedDetails = form.chapterIndexed === "Yes";
  const showIndexedOtherInput = showIndexedDetails && form.indexedDetails === "Others";
  const showInterdisciplinaryFields = form.interdisciplinary === "Yes";

  // ── Create form view ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {/* Form header */}
        <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400 mb-4">
            <span className="font-medium">Resources</span>
            <ChevronRight size={12} className="text-gray-300" />
            <button
              type="button"
              onClick={handleCancel}
              className="font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              Book Chapter Publications
            </button>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="font-semibold text-gray-700">Create Record</span>
          </nav>

          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Create Book Chapter Publication</h1>
              <p className="mt-0.5 text-xs text-gray-500">Fill all required fields and upload valid proof documents.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600">
                Draft
              </span>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
              >
                <X size={13} />
                Close
              </button>
            </div>
          </div>

          {/* Progress steps */}
          <div className="flex items-center gap-0">
            {STEPS.map((step, i) => {
              const isDone = step.id < activeStep;
              const isActive = step.id === activeStep;
              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors ${isDone
                        ? "bg-emerald-500 text-white"
                        : isActive
                          ? "bg-indigo-600 text-white"
                          : "border border-gray-200 bg-white text-gray-400"
                        }`}
                    >
                      {isDone ? <Check size={11} strokeWidth={2.5} /> : step.id}
                    </div>
                    <span className={`hidden sm:block text-xs transition-colors ${isActive ? "font-medium text-gray-800" : "text-gray-400"}`}>
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`mx-3 h-px flex-1 transition-colors ${isDone ? "bg-emerald-400" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mx-6 mt-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <X size={14} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-xs font-medium text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="mx-6 mt-5 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
            <p className="text-xs font-medium text-emerald-700">Book chapter publication record created successfully!</p>
          </div>
        )}

        {/* Form body */}
        <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-8 sm:py-7 space-y-7">

          {/* ── Section 1 – Student ── */}
          <FormSection icon={<GraduationCap size={14} />} title="Student information" onActivate={() => setActiveStep(1)}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <SearchableSelect
                label="Student"
                required
                name="student"
                value={form.student}
                placeholder="Choose student"
                options={students.map((s) => ({ value: String(s.id), label: s.student_name }))}
                onChange={handleSearchableChange}
              />
              <SelectField
                label="Year of Study"
                required
                name="yearOfStudy"
                value={form.yearOfStudy}
                options={["Choose year", "First", "Second", "Third", "Fourth"]}
                onChange={handleChange}
              />

              <SearchableSelect
                label="Special Lab"
                required
                name="specialLab"
                value={form.specialLab}
                placeholder="Choose lab"
                options={labs.map((l) => ({ value: String(l.id), label: l.specialLabName }))}
                onChange={handleSearchableChange}
              />
            </div>
          </FormSection>

          {/* ── Section 2 – Chapter Details ── */}
          <FormSection icon={<BookOpen size={14} />} title="Chapter details" onActivate={() => setActiveStep(2)}>
            <div className="space-y-4">
              <InputField
                label="Chapter Title"
                required
                name="chapterTitle"
                value={form.chapterTitle}
                placeholder="Enter chapter title"
                onChange={handleChange}
              />

              {/* Authors Names + Author/Co-Author on same row */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <InputField
                    label="Author(s) Names (as appear in the book)"
                    required
                    name="authorsNames"
                    value={form.authorsNames}
                    placeholder="Enter authors as they appear in the book"
                    onChange={handleChange}
                  />
                </div>
                {/* ── NEW: Author / Co-Author ── */}
                <InputField
                  label="Author / Co-Author Name"
                  required
                  name="authorOrCoauthorName"
                  value={form.authorOrCoauthorName}
                  placeholder="e.g., Dr. Abdul (Co-Author)"
                  onChange={handleChange}
                />
              </div>

              {/* ── Author Breakdown Block ── */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-4">
                {/* Section header */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-5 h-5 rounded-md bg-gray-100 text-gray-400">
                    <Users size={11} />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                    Author breakdown
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Row 1: total + student count + faculty count (read-only) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Total authors */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700">
                      Total number of authors<span className="ml-0.5 text-red-500">*</span>
                    </label>
                    <select
                      value={form.totalAuthors}
                      onChange={handleTotalAuthorsChange}
                      className="w-full appearance-none rounded-lg border border-gray-200 bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_10px_center] px-3 py-2 pr-8 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="">Choose</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={String(n)}>{n}</option>
                      ))}
                    </select>
                    <p className="mt-1 text-[10px] text-gray-400">Maximum 5 authors</p>
                  </div>

                  {/* Student author count — appears after total is chosen */}
                  {showStudentCountField && (
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">
                        Number of student authors<span className="ml-0.5 text-red-500">*</span>
                      </label>
                      <select
                        value={form.studentAuthorCount}
                        onChange={handleStudentAuthorCountChange}
                        className="w-full appearance-none rounded-lg border border-gray-200 bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_10px_center] px-3 py-2 pr-8 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="">Choose</option>
                        {Array.from({ length: totalAuthorsNum + 1 }, (_, i) => (
                          <option key={i} value={String(i)}>{i}</option>
                        ))}
                      </select>
                      <p className="mt-1 text-[10px] text-gray-400">Out of {totalAuthorsNum} total</p>
                    </div>
                  )}

                  {/* Faculty count — auto-computed, read-only */}
                  {showFacultyCountField && (
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">
                        Number of faculty authors
                      </label>
                      <input
                        readOnly
                        value={form.facultyAuthorCount}
                        className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500 cursor-default outline-none"
                      />
                      <p className="mt-1 text-[10px] text-gray-400">Auto-calculated</p>
                    </div>
                  )}
                </div>

                {/* Summary strip */}
                {showFacultyCountField && (
                  <div className="flex items-center gap-5 rounded-lg border border-gray-100 bg-white px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-gray-800">{totalAuthorsNum}</span>
                      <span className="text-xs text-gray-400">total authors</span>
                    </div>
                    <div className="w-px h-4 bg-gray-200" />
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                        {studentCountNum} student{studentCountNum !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="w-px h-4 bg-gray-200" />
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                        {facultyCountNum} faculty
                      </span>
                    </div>
                  </div>
                )}

                {/* Dynamic name input fields */}
                {showAuthorNameFields && (
                  <div className="space-y-3">

                    {/* Student author name fields */}
                    {studentCountNum > 0 && (
                      <div className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-3 space-y-3">
                        <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-widest">
                          Student author names
                        </p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {form.studentAuthorNames.map((name, i) => (
                            <div key={i}>
                              <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                Student author {i + 1}
                                <span className="ml-0.5 text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={name}
                                placeholder="Full name as in book"
                                onChange={(e) => handleStudentAuthorNameChange(i, e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Faculty author name fields */}
                    {facultyCountNum > 0 && (
                      <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-3 space-y-3">
                        <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest">
                          Faculty author names
                        </p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {form.facultyAuthorNames.map((name, i) => (
                            <div key={i}>
                              <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                Faculty author {i + 1}
                                <span className="ml-0.5 text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={name}
                                placeholder="Full name as in book"
                                onChange={(e) => handleFacultyAuthorNameChange(i, e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
              {/* ── End Author Breakdown Block ── */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <InputField
                  label="Date of Publication"
                  required
                  type="date"
                  name="dateOfPublication"
                  value={form.dateOfPublication}
                  onChange={handleChange}
                />
                <InputField
                  label="Volume Number"
                  required
                  name="volumeNumber"
                  value={form.volumeNumber}
                  placeholder="e.g., 12"
                  onChange={handleChange}
                />
                <InputField
                  label="Edition"
                  required
                  name="edition"
                  value={form.edition}
                  placeholder="e.g., 2nd Edition"
                  onChange={handleChange}
                />
                <InputField
                  label="ISBN Number"
                  required
                  name="isbnNumber"
                  value={form.isbnNumber}
                  placeholder="Enter ISBN"
                  onChange={handleChange}
                />
              </div>
            </div>
          </FormSection>

          {/* ── Section 3 – Publication Info ── */}
          <FormSection icon={<Link size={14} />} title="Publication information" onActivate={() => setActiveStep(3)}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField
                  label="Book Title"
                  required
                  name="bookTitle"
                  value={form.bookTitle}
                  placeholder="Enter book title"
                  onChange={handleChange}
                />
                <InputField
                  label="Publisher Name"
                  required
                  name="publisherName"
                  value={form.publisherName}
                  placeholder="Enter publisher name"
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <InputField
                  label="DOI Number"
                  required
                  name="doiNumber"
                  value={form.doiNumber}
                  placeholder="e.g., 10.1234/..."
                  onChange={handleChange}
                />
                <InputField
                  label="Page From"
                  required
                  type="number"
                  name="pageFrom"
                  value={form.pageFrom}
                  placeholder="e.g., 100"
                  onChange={handleChange}
                />
                <InputField
                  label="Page To"
                  required
                  type="number"
                  name="pageTo"
                  value={form.pageTo}
                  placeholder="e.g., 115"
                  onChange={handleChange}
                />
                <InputField
                  label="Chapter Web URL"
                  required
                  name="webUrl"
                  value={form.webUrl}
                  placeholder="https://..."
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField
                  label="Position of Student as Author in Book"
                  required
                  name="studentAuthorPosition"
                  value={form.studentAuthorPosition}
                  placeholder="e.g., 1"
                  onChange={handleChange}
                />
                <InputField
                  label="Labs Involved"
                  required
                  name="labsInvolved"
                  value={form.labsInvolved}
                  placeholder="e.g., Lab 1"
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {/* ── Chapter Indexed ── */}
                <SelectField
                  label="Chapter Indexed"
                  required
                  name="chapterIndexed"
                  value={form.chapterIndexed}
                  options={["Choose", "Yes", "No"]}
                  onChange={handleChange}
                />

                {/* ── NEW: Indexed Details — only if chapterIndexed === "Yes" ── */}
                {showIndexedDetails && (
                  <SelectField
                    label="Indexed Details"
                    required
                    name="indexedDetails"
                    value={form.indexedDetails}
                    options={["Choose", ...INDEXED_OPTIONS]}
                    onChange={handleChange}
                  />
                )}

                {/* ── NEW: Others free-text — only if indexedDetails === "Others" ── */}
                {showIndexedOtherInput && (
                  <InputField
                    label="Specify Index"
                    required
                    name="indexedOtherDetails"
                    value={form.indexedOtherDetails}
                    placeholder="Enter index name"
                    onChange={handleChange}
                  />
                )}

                <SelectField
                  label="Impact Factor"
                  required
                  name="impactFactor"
                  value={form.impactFactor}
                  options={["Choose", "Yes", "No"]}
                  onChange={handleChange}
                />
                {form.impactFactor === "Yes" && (
                  <InputField
                    label="Impact Factor Value"
                    required
                    name="impactFactorValue"
                    value={form.impactFactorValue}
                    placeholder="Impact value"
                    onChange={handleChange}
                  />
                )}
                <SelectField
                  label="Project Outcome"
                  required
                  name="projectOutcome"
                  value={form.projectOutcome}
                  options={["Choose", "Yes", "No"]}
                  onChange={handleChange}
                />
              </div>

              {/* Second row to keep layout clean when indexed sub-fields are hidden */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <SearchableSelect
                  label="SDG Goals"
                  required
                  name="sdgGoals"
                  value={form.sdgGoals}
                  placeholder="Choose SDG"
                  options={[
                    { value: "1", label: "SDG 1: No Poverty" },
                    { value: "2", label: "SDG 2: Zero Hunger" },
                    { value: "3", label: "SDG 3: Good Health and Well-being" },
                    { value: "4", label: "SDG 4: Quality Education" },
                    { value: "5", label: "SDG 5: Gender Equality" },
                    { value: "6", label: "SDG 6: Clean Water and Sanitation" },
                    { value: "7", label: "SDG 7: Affordable and Clean Energy" },
                    { value: "8", label: "SDG 8: Decent Work and Economic Growth" },
                    { value: "9", label: "SDG 9: Industry, Innovation and Infrastructure" },
                    { value: "10", label: "SDG 10: Reduced Inequalities" },
                    { value: "11", label: "SDG 11: Sustainable Cities and Communities" },
                    { value: "12", label: "SDG 12: Responsible Consumption and Production" },
                    { value: "13", label: "SDG 13: Climate Action" },
                    { value: "14", label: "SDG 14: Life Below Water" },
                    { value: "15", label: "SDG 15: Life on Land" },
                    { value: "16", label: "SDG 16: Peace, Justice and Strong Institutions" },
                    { value: "17", label: "SDG 17: Partnerships for the Goals" },
                  ]}
                  onChange={handleSearchableChange}
                />
                <SelectField
                  label="Sponsorship Type"
                  required
                  name="sponsorshipType"
                  value={form.sponsorshipType}
                  options={["Choose", "Self", "Institution", "Government"]}
                  onChange={handleChange}
                />
                {/* ── Interdisciplinary ── */}
                <SelectField
                  label="Interdisciplinary"
                  required
                  name="interdisciplinary"
                  value={form.interdisciplinary}
                  options={["Choose", "Yes", "No"]}
                  onChange={handleChange}
                />
              </div>

              {/* ── NEW: Interdisciplinary sub-fields — only if interdisciplinary === "Yes" ── */}
              {showInterdisciplinaryFields && (
                <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-5 h-5 rounded-md bg-violet-100 text-violet-400">
                      <Users size={11} />
                    </div>
                    <span className="text-[10px] font-semibold text-violet-500 uppercase tracking-widest">
                      Interdisciplinary details
                    </span>
                    <div className="flex-1 h-px bg-violet-100" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Department dropdown */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">
                        Other Department<span className="ml-0.5 text-red-500">*</span>
                      </label>
                      <select
                        name="interdisciplinaryDepartment"
                        value={form.interdisciplinaryDepartment}
                        onChange={handleChange}
                        className="w-full appearance-none rounded-lg border border-gray-200 bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_10px_center] px-3 py-2 pr-8 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="">Choose department</option>
                        {departments.map((d) => (
                          <option key={d.id} value={String(d.id)}>{d.dept_name}</option>
                        ))}
                      </select>
                    </div>
                    {/* Number of other dept students */}
                    <InputField
                      label="Number of other Department Students"
                      required
                      type="number"
                      name="otherDeptStudentCount"
                      value={form.otherDeptStudentCount}
                      placeholder="e.g., 3"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

            </div>
          </FormSection>

          {/* ── Section 4 – Documents ── */}
          <FormSection icon={<UploadCloud size={14} />} title="Document uploads" onActivate={() => setActiveStep(4)}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <FileField
                  label="Abstract Document Proof"
                  required
                  name="abstractProof"
                  onChange={handleFileChange}
                  fileName={files.abstractProof?.name}
                />
                <p className="text-xs text-red-500 font-medium">Format: Reg.No – BCP – Date</p>
              </div>
              <div className="space-y-1.5">
                <FileField
                  label="Full Document Proof"
                  required
                  name="fullDocumentProof"
                  onChange={handleFileChange}
                  fileName={files.fullDocumentProof?.name}
                />
                <p className="text-xs text-red-500 font-medium">Format: Reg.No – BCF – Date</p>
              </div>
              <div className="space-y-1.5">
                <FileField
                  label="Original Certificate"
                  name="originalCertProof"
                  onChange={handleFileChange}
                  fileName={files.originalCertProof?.name}
                />
                <p className="text-xs text-gray-400 font-medium">Format: Reg.No – BCO – Date</p>
              </div>
              <div className="space-y-1.5">
                <FileField
                  label="Attested Certificate"
                  name="attestedCertProof"
                  onChange={handleFileChange}
                  fileName={files.attestedCertProof?.name}
                />
                <p className="text-xs text-gray-400 font-medium">Format: Reg.No – BCX – Date</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectField
                label="IQAC Verification"
                required
                name="iqacVerification"
                value={form.iqacVerification}
                options={["Initiated", "Verified", "Rejected"]}
                onChange={handleChange}
              />
            </div>
          </FormSection>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              Create &amp; Add Another
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Check size={14} />
                  Create Record
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

// ─── Modal section wrapper ────────────────────────────────────────────────────

function ModalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  );
}

// ─── Info cell ────────────────────────────────────────────────────────────────

function InfoCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
      <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
      <div className="text-xs font-semibold text-gray-800">{value}</div>
    </div>
  );
}

// ─── Form section wrapper ─────────────────────────────────────────────────────

function FormSection({
  icon,
  title,
  children,
  onActivate,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  onActivate?: () => void;
}) {
  return (
    <div className="space-y-4" onClick={onActivate}>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-6 h-6 rounded-md border border-gray-200 bg-gray-50 text-gray-500">
          {icon}
        </div>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      {children}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type BaseFieldProps = { label: string; name: string; required?: boolean };

type InputFieldProps = BaseFieldProps & {
  type?: string;
  value: string;
  placeholder?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

function InputField({ label, name, required, type = "text", value, placeholder, onChange }: InputFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}

type SelectFieldProps = BaseFieldProps & {
  value: string;
  options: string[];
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
};

function SelectField({ label, name, required, value, options, onChange }: SelectFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full appearance-none rounded-lg border border-gray-200 bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_10px_center] px-3.5 py-2.5 pr-8 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      >
        {options.map((option) => (
          <option key={option} value={option.startsWith("Choose") ? "" : option}>
            {option}
          </option>
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
      <label className="mb-1.5 block text-xs font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <label
        className={`group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-5 text-center transition-colors ${fileName ? "border-emerald-300 bg-emerald-50" : "border-gray-300 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50"
          }`}
      >
        <div
          className={`flex items-center justify-center rounded-lg p-2 transition-colors ${fileName
            ? "bg-emerald-100 text-emerald-600"
            : "bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-500"
            }`}
        >
          {fileName ? <Check size={16} /> : <UploadCloud size={16} />}
        </div>
        <div>
          <p className={`text-xs font-medium ${fileName ? "text-emerald-700" : "text-gray-600 group-hover:text-indigo-600"}`}>
            {fileName ? fileName : "Click to upload or drag & drop"}
          </p>
          {!fileName && <p className="mt-0.5 text-xs text-gray-400">PDF, JPG, PNG</p>}
        </div>
        <input name={name} type="file" className="hidden" onChange={onChange} accept=".pdf,.jpg,.jpeg,.png" />
      </label>
    </div>
  );
}