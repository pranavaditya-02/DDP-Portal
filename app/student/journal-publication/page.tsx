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

type JournalRecord = {
  id: number;
  student_id: number;
  student_name: string;
  paper_title: string;
  authors_names: string;
  journal_name: string;
  publisher_name: string;
  date_of_publication: string;
  volume_number: string;
  issue_number: string;
  issn_number: string;
  doi_number: string;
  page_from: number;
  page_to: number;
  web_url: string;
  paper_indexed: string;
  impact_factor: string;
  student_author_position?: string;
  labs_involved?: string;
  sponsorship_type: string;
  interdisciplinary: number;
  sdg_goals: string;
  sdg_title?: string;
  project_outcome: string;
  abstract_proof_url?: string;
  full_document_proof_url?: string;
  original_cert_proof_url?: string;
  attested_cert_proof_url?: string;
  iqac_status: string;
  created_at: string;
};

type FormState = {
  student: string;
  yearOfStudy: string;
  specialLab: string;
  paperTitle: string;
  authorsNames: string;
  // ── Author breakdown ──
  totalAuthors: string;
  studentAuthorCount: string;
  facultyAuthorCount: string;
  studentAuthorNames: string[];
  facultyAuthorNames: string[];
  // ─────────────────────
  dateOfPublication: string;
  volumeNumber: string;
  issueNumber: string;
  issnNumber: string;
  doiNumber: string;
  pageFrom: string;
  pageTo: string;
  journalName: string;
  publisherName: string;
  webUrl: string;
  paperIndexed: string;
  impactFactor: string;
  studentAuthorPosition: string;
  labsInvolved: string;
  projectOutcome: string;
  sponsorshipType: string;
  interdisciplinary: string;
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
  paperTitle: "",
  authorsNames: "",
  totalAuthors: "",
  studentAuthorCount: "",
  facultyAuthorCount: "",
  studentAuthorNames: [],
  facultyAuthorNames: [],
  dateOfPublication: "",
  volumeNumber: "",
  issueNumber: "",
  issnNumber: "",
  doiNumber: "",
  pageFrom: "",
  pageTo: "",
  journalName: "",
  publisherName: "",
  webUrl: "",
  paperIndexed: "",
  impactFactor: "",
  studentAuthorPosition: "",
  labsInvolved: "",
  projectOutcome: "",
  sponsorshipType: "",
  interdisciplinary: "",
  sdgGoals: "",
  abstractProof: null,
  fullDocumentProof: null,
  originalCertProof: null,
  attestedCertProof: null,
  iqacVerification: "Initiated",
};

type Student = { id: number; name: string };
type Department = { id: number; dept_name: string };

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Student info" },
  { id: 2, label: "Paper details" },
  { id: 3, label: "Publication" },
  { id: 4, label: "Documents" },
];

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

export default function JournalPublicationPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [records, setRecords] = useState<JournalRecord[]>([]);
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
  const [selected, setSelected] = useState<JournalRecord | null>(null);
  const [recordsLoading, setRecordsLoading] = useState(true);
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
    setForm((prev) => ({ ...prev, [name]: value }));
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

      // Append all plain string fields
      Object.entries(form).forEach(([key, value]) => {
        if (value && typeof value === "string") {
          formData.append(key, value);
        }
      });

      // Append author name arrays as JSON strings
      formData.append("studentAuthorNames", JSON.stringify(form.studentAuthorNames));
      formData.append("facultyAuthorNames", JSON.stringify(form.facultyAuthorNames));

      if (files.abstractProof) formData.append("abstractProof", files.abstractProof);
      if (files.fullDocumentProof) formData.append("fullDocumentProof", files.fullDocumentProof);
      if (files.originalCertProof) formData.append("originalCertProof", files.originalCertProof);
      if (files.attestedCertProof) formData.append("attestedCertProof", files.attestedCertProof);

      const response = await fetch("http://localhost:5000/api/journal-publications", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create journal publication");

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
          fetch("http://localhost:5000/api/journal-publications"),
          fetch("http://localhost:5000/students"),
          fetch("http://localhost:5000/speciallabs/active"),
          fetch("http://localhost:5000/departments"),
        ]);
        setRecords(await recordRes.json());
        setStudents(await studentRes.json());
        setLabs(await labRes.json());
        setDepartments(await deptRes.json());
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
            <span className="font-semibold text-indigo-600">Journal Publications</span>
          </nav>

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Journal Publications</h1>
              <p className="mt-0.5 text-xs text-gray-500">Manage and track journal publication records</p>
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
                  <p className="text-sm font-medium text-gray-600">No journal publications found</p>
                  <p className="mt-0.5 text-xs text-gray-400">Get started by creating your first journal publication entry.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="mt-1 flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
                >
                  <Plus size={13} />
                  Create Journal Publication
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
                          "Student / Paper",
                          "Journal",
                          "Volume",
                          "Issue",
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
                            onClick={() => setSelected(record)}
                            className="group hover:bg-indigo-50/40 cursor-pointer transition-colors"
                          >
                            <td className="px-4 py-3.5 max-w-[200px]">
                              <p className="font-semibold text-gray-800 leading-tight truncate">{record.paper_title}</p>
                              <p className="text-gray-400 mt-0.5 truncate">{record.student_name}</p>
                              <p className="text-gray-300 mt-0.5 text-[10px]">Record #{record.id}</p>
                            </td>
                            <td className="px-4 py-3.5 max-w-[150px]">
                              <p className="text-gray-600 truncate text-[11px]">{record.journal_name}</p>
                            </td>
                            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{record.volume_number}</td>
                            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{record.issue_number}</td>
                            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{record.doi_number}</td>
                            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                              {record.paper_indexed === "Yes" ? (
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
                            <p className="text-base font-bold text-gray-900 leading-snug">{selected.paper_title}</p>
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

                          <ModalSection title="Student & Paper Info">
                            <div className="grid grid-cols-2 gap-3">
                              <InfoCell label="Student Name" value={selected.student_name} />
                              <InfoCell label="Paper Title" value={selected.paper_title} />
                              <InfoCell label="Authors" value={selected.authors_names} />
                              <InfoCell label="SDG Goal" value={selected.sdg_title ?? `#${selected.sdg_goals}`} />
                            </div>
                          </ModalSection>

                          <ModalSection title="Publication Details">
                            <div className="grid grid-cols-2 gap-3">
                              <InfoCell label="Journal Name" value={selected.journal_name} />
                              <InfoCell label="Publisher" value={selected.publisher_name} />
                              <InfoCell label="Volume" value={selected.volume_number} />
                              <InfoCell label="Issue" value={selected.issue_number} />
                              <InfoCell label="ISSN" value={selected.issn_number} />
                              <InfoCell label="DOI" value={selected.doi_number} />
                              <InfoCell label="Page From" value={selected.page_from.toString()} />
                              <InfoCell label="Page To" value={selected.page_to.toString()} />
                            </div>
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
                            </div>
                          </ModalSection>

                          <ModalSection title="Links & Files">
                            <div className="space-y-3">
                              <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                                <p className="text-[10px] text-gray-400 mb-0.5">Paper URL</p>
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

                          <ModalSection title="Paper Properties">
                            <div className="grid grid-cols-2 gap-3">
                              <InfoCell label="Paper Indexed" value={selected.paper_indexed} />
                              <InfoCell label="Impact Factor" value={selected.impact_factor} />
                              <InfoCell label="Project Outcome" value={selected.project_outcome} />
                              <InfoCell label="Sponsorship Type" value={selected.sponsorship_type} />
                              <InfoCell label="Interdisciplinary" value={selected.interdisciplinary ? "Yes" : "No"} />
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
                                  className={`group block rounded-xl overflow-hidden border transition-all text-left w-full ${
                                    url
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
              Journal Publications
            </button>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="font-semibold text-gray-700">Create Record</span>
          </nav>

          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Create Journal Publication</h1>
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
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                        isDone
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
            <p className="text-xs font-medium text-emerald-700">Journal publication record created successfully!</p>
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
                options={students.map((s) => ({ value: String(s.id), label: s.name }))}
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

          {/* ── Section 2 – Paper Details ── */}
          <FormSection icon={<BookOpen size={14} />} title="Paper details" onActivate={() => setActiveStep(2)}>
            <div className="space-y-4">
              <InputField
                label="Paper Title"
                required
                name="paperTitle"
                value={form.paperTitle}
                placeholder="Enter paper title"
                onChange={handleChange}
              />
              <InputField
                label="Author(s) Names (as appear in the paper)"
                required
                name="authorsNames"
                value={form.authorsNames}
                placeholder="Enter authors as they appear in the paper"
                onChange={handleChange}
              />

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
                                placeholder="Full name as in paper"
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
                                placeholder="Full name as in paper"
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
                  label="Issue Number"
                  required
                  name="issueNumber"
                  value={form.issueNumber}
                  placeholder="e.g., 3"
                  onChange={handleChange}
                />
                <InputField
                  label="ISSN Number"
                  required
                  name="issnNumber"
                  value={form.issnNumber}
                  placeholder="Enter ISSN"
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
                  label="Journal Name"
                  required
                  name="journalName"
                  value={form.journalName}
                  placeholder="Enter journal name"
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
                  label="Paper Web URL"
                  required
                  name="webUrl"
                  value={form.webUrl}
                  placeholder="https://..."
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField
                  label="Position of Student as Author in Paper"
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
                  placeholder="Eg.1"
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <SelectField
                  label="Paper Indexed"
                  required
                  name="paperIndexed"
                  value={form.paperIndexed}
                  options={["Choose", "Yes", "No"]}
                  onChange={handleChange}
                />
                <SelectField
                  label="Impact Factor"
                  required
                  name="impactFactor"
                  value={form.impactFactor}
                  options={["Choose", "Yes", "No"]}
                  onChange={handleChange}
                />
                <SelectField
                  label="Project Outcome"
                  required
                  name="projectOutcome"
                  value={form.projectOutcome}
                  options={["Choose", "Yes", "No"]}
                  onChange={handleChange}
                />
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
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectField
                  label="Sponsorship Type"
                  required
                  name="sponsorshipType"
                  value={form.sponsorshipType}
                  options={["Choose", "Self", "Institution", "Government", "Industry"]}
                  onChange={handleChange}
                />
                <SelectField
                  label="Interdisciplinary"
                  required
                  name="interdisciplinary"
                  value={form.interdisciplinary}
                  options={["Choose", "Yes", "No"]}
                  onChange={handleChange}
                />
              </div>

              
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
                <p className="text-xs text-red-500 font-medium">Format: Reg.No – JPA – Date</p>
              </div>
              <div className="space-y-1.5">
                <FileField
                  label="Full Document Proof"
                  required
                  name="fullDocumentProof"
                  onChange={handleFileChange}
                  fileName={files.fullDocumentProof?.name}
                />
                <p className="text-xs text-red-500 font-medium">Format: Reg.No – JPF – Date</p>
              </div>
              <div className="space-y-1.5">
                <FileField
                  label="Original Certificate"
                  name="originalCertProof"
                  onChange={handleFileChange}
                  fileName={files.originalCertProof?.name}
                />
                <p className="text-xs text-gray-400 font-medium">Format: Reg.No – JPO – Date</p>
              </div>
              <div className="space-y-1.5">
                <FileField
                  label="Attested Certificate"
                  name="attestedCertProof"
                  onChange={handleFileChange}
                  fileName={files.attestedCertProof?.name}
                />
                <p className="text-xs text-gray-400 font-medium">Format: Reg.No – JPX – Date</p>
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
      <label className="mb-1.5 block text-xs font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full appearance-none rounded-lg border border-gray-200 bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_10px_center] px-3 py-2 pr-8 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
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
        className={`group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-5 text-center transition-colors ${
          fileName ? "border-emerald-300 bg-emerald-50" : "border-gray-300 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50"
        }`}
      >
        <div
          className={`flex items-center justify-center rounded-lg p-2 transition-colors ${
            fileName
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