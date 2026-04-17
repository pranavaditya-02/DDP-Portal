"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Upload,
  Calendar,
  ChevronDown,
  X,
  AlertCircle,
  Plus,
  Database,
  Search,
  SlidersHorizontal,
  MoreHorizontal,
  ChevronRight,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { SearchableSelect } from "@/components/SearchableSelect";

const API = "http://localhost:5000";

/* ─── tiny helpers ─── */
const RequiredStar = () => <span className="text-rose-500 ml-0.5">*</span>;

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
      <AlertCircle size={11} /> {msg}
    </p>
  ) : null;

const Label = ({ children, htmlFor }: { children: ReactNode; htmlFor: string }) => (
  <label
    htmlFor={htmlFor}
    className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1.5"
  >
    {children}
  </label>
);

const inputCls = (err?: string) =>
  `w-full rounded-xl border px-4 py-3 text-sm text-slate-700 bg-white outline-none transition
   placeholder:text-slate-300 focus:ring-3 focus:ring-amber-100
   ${err ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-amber-400"}`;

const selectCls = (err?: string) =>
  `w-full rounded-xl border px-4 py-3 text-sm text-slate-700 bg-white outline-none transition appearance-none cursor-pointer
   focus:ring-3 focus:ring-amber-100
   ${err ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-amber-400"}`;

/* ─── File upload ─── */
type FileUploadProps = {
  id: string;
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
};

const FileUpload = ({ id, value, onChange, error }: FileUploadProps) => {
  const ref = useRef<HTMLInputElement | null>(null);
  return (
    <div>
      <div
        onClick={() => ref.current?.click()}
        className={`flex items-center gap-3 rounded-xl border-2 border-dashed px-4 py-4 cursor-pointer transition
          ${error ? "border-rose-300 bg-rose-50/40" : "border-slate-200 bg-slate-50 hover:border-amber-300 hover:bg-amber-50/30"}`}
      >
        <Upload size={16} className="text-slate-400 shrink-0" />
        {value ? (
          <span className="text-sm text-slate-700 truncate flex-1">{value.name}</span>
        ) : (
          <span className="text-sm text-slate-400">Drop file or click to choose</span>
        )}
        {value && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="ml-auto text-slate-400 hover:text-rose-500"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <input
        ref={ref}
        id={id}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      <p className="mt-1 text-[10px] text-slate-400">Accepted: PDF, JPG, PNG — max 5 MB</p>
    </div>
  );
};

/* ─── Types ─── */
type FormValues = {
  studentId: string;
  studentName: string;
  titleOfEvent: string;
  levelOfEvent: string;
  individualOrBatch: string;
  academicProject: string;
  specifyProject: string;
  fromDate: string;
  toDate: string;
  typeOfSponsorship: string;
  sdgGoals: string;
  imageProof: File | null;
  abstractProof: File | null;
  status: string;
  originalCertProof: File | null;
  attestedCertProof: File | null;
  iqacVerification: string;
  numberOfParticipants: string;
  sponsorshipAmount: string;
};

type FormKey = keyof FormValues;
type FormErrors = Partial<Record<FormKey, string>>;

type CompetitionRecord = {
  id: number;
  student_id: number;
  sdg_id: number;
  student_name: string;
  sdg_number?: number;
  title_of_event: string;
  level_of_event: string;
  individual_or_batch: string;
  number_of_participants: number | null;
  academic_project: string;
  specify_project: string | null;
  from_date: string;
  to_date: string;
  status: string;
  iqac_verification: string;
  type_of_sponsorship: string;
  sponsorship_amount: string | null;
  sdg_title?: string;
  image_proof_url?: string;
  abstract_proof_url?: string;
  original_cert_proof_url?: string;
  attested_cert_proof_url?: string;
  created_at: string;
};

const INITIAL: FormValues = {
  studentId: "",
  studentName: "",
  titleOfEvent: "",
  levelOfEvent: "",
  individualOrBatch: "Individual",
  academicProject: "Yes",
  specifyProject: "",
  fromDate: "",
  toDate: "",
  typeOfSponsorship: "",
  sdgGoals: "",
  imageProof: null,
  abstractProof: null,
  status: "",
  originalCertProof: null,
  attestedCertProof: null,
  iqacVerification: "Initiated",
  numberOfParticipants: "",
  sponsorshipAmount: "",
};

const IQAC_STATUS_MAP: Record<string, { cls: string; dot: string }> = {
  Verified: { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
  Rejected: { cls: "bg-red-50 text-red-700 border border-red-200", dot: "bg-red-500" },
  Initiated: { cls: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-400" },
};

const RESULT_STATUS_MAP: Record<string, string> = {
  Winner: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  Participant: "bg-slate-50 text-slate-700 border border-slate-200",
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

const REQUIRED_FIELDS: FormKey[] = [
  "studentId", "titleOfEvent", "levelOfEvent", "individualOrBatch", "academicProject",
  "fromDate", "toDate", "typeOfSponsorship", "sdgGoals",
  "imageProof", "abstractProof", "status", "originalCertProof", "attestedCertProof",
];

/* ─── Main component ─── */
export default function CreateCompetitionReport() {
  const [form, setForm] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [records, setRecords] = useState<CompetitionRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<CompetitionRecord | null>(null);
  const [lightbox, setLightbox] = useState<{ url: string; label: string } | null>(null);

  const [students, setStudents] = useState<{ id: number; student_name: string }[]>([]);
  const [sdgList, setSdgList] = useState<{ id: number; sdg_number: number; title: string }[]>([]);

  /* helpers */
  const set = <K extends FormKey>(key: K, val: FormValues[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleSearchableChange = (name: string, value: string) => {
    if (name === "student") {
      const s = students.find((s) => String(s.id) === value);
      set("studentId", value);
      set("studentName", s?.student_name ?? "");
      return;
    }
    set(name as FormKey, value as FormValues[FormKey]);
  };

  /* ── fetch records ── */
  const loadRecords = async () => {
    setRecordsLoading(true);
    try {
      const res = await fetch(`${API}/api/competition/competition-reports`);
      if (!res.ok) throw new Error("Failed to load");
      const data: CompetitionRecord[] = await res.json();
      setRecords(data);
    } catch {
      setRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => { loadRecords(); }, []);

  useEffect(() => {
    fetch(`${API}/api/internship-report/sdg-goals`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSdgList(data);
          return;
        }

        if (Array.isArray((data as { sdgGoals?: unknown }).sdgGoals)) {
          setSdgList((data as { sdgGoals: typeof sdgList }) .sdgGoals);
          return;
        }

        setSdgList([]);
      })
      .catch(() => setSdgList([]));
  }, []);

  useEffect(() => {
    fetch(`${API}/students`)
      .then((r) => r.json())
      .then(setStudents)
      .catch(() => setStudents([]));
  }, []);

  /* clear conditional fields */
  useEffect(() => {
    if (form.individualOrBatch !== "Batch") set("numberOfParticipants", "");
  }, [form.individualOrBatch]);

  useEffect(() => {
    if (form.typeOfSponsorship !== "Management") set("sponsorshipAmount", "");
  }, [form.typeOfSponsorship]);

  /* ── validation ── */
  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    REQUIRED_FIELDS.forEach((key) => {
      const v = form[key];
      if (!v || (typeof v === "string" && !v.trim())) {
        errs[key] = "This field is required";
      }
    });
    if (form.academicProject === "Yes" && !form.specifyProject)
      errs.specifyProject = "This field is required";
    if (form.individualOrBatch === "Batch" && !form.numberOfParticipants)
      errs.numberOfParticipants = "This field is required";
    if (form.typeOfSponsorship === "Management" && !form.sponsorshipAmount)
      errs.sponsorshipAmount = "This field is required";
    return errs;
  };

  /* ── submit → POST multipart/form-data ── */
  const buildFormData = (): FormData => {
    const fd = new FormData();
    fd.append("student",              form.studentId);
    fd.append("titleOfEvent",         form.titleOfEvent);
    fd.append("levelOfEvent",         form.levelOfEvent);
    fd.append("individualOrBatch",    form.individualOrBatch);
    fd.append("academicProject",      form.academicProject);
    fd.append("fromDate",             form.fromDate);
    fd.append("toDate",               form.toDate);
    fd.append("typeOfSponsorship",    form.typeOfSponsorship);
    fd.append("sdgGoals",             form.sdgGoals);
    fd.append("status",               form.status);
    fd.append("iqacVerification",     form.iqacVerification);

    if (form.individualOrBatch === "Batch" && form.numberOfParticipants)
      fd.append("numberOfParticipants", form.numberOfParticipants);
    if (form.academicProject === "Yes" && form.specifyProject)
      fd.append("specifyProject", form.specifyProject);
    if (form.typeOfSponsorship === "Management" && form.sponsorshipAmount)
      fd.append("sponsorshipAmount", form.sponsorshipAmount);

    // files — must match multer field names
    if (form.imageProof)        fd.append("imageProof",        form.imageProof);
    if (form.abstractProof)     fd.append("abstractProof",     form.abstractProof);
    if (form.originalCertProof) fd.append("originalCertProof", form.originalCertProof);
    if (form.attestedCertProof) fd.append("attestedCertProof", form.attestedCertProof);

    return fd;
  };

  const handleSubmit = async (andAddAnother = false) => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      const firstKey = REQUIRED_FIELDS.find((k) => errs[k]);
      if (firstKey) document.getElementById(firstKey)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${API}/api/competition/competition-reports`, {
        method: "POST",
        body: buildFormData(),
        // ⚠️  Do NOT set Content-Type — let the browser set the boundary automatically
      });

      const json = await res.json();

      if (!res.ok) {
        setSubmitError(json.error ?? "Submission failed. Please try again.");
        return;
      }

      // success
      await loadRecords(); // refresh list from server
      setForm(INITIAL);
      setErrors({});

      if (!andAddAnother) {
        setShowCreateForm(false);
      }
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL);
    setErrors({});
    setSubmitError(null);
    setShowCreateForm(false);
  };

  const filteredRecords = records.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      r.title_of_event.toLowerCase().includes(q) ||
      r.student_name.toLowerCase().includes(q) ||
      r.level_of_event.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
    );
  });

  const isImageUrl = (url: string) => /\.(png|jpe?g|webp|gif|bmp|svg)(\?.*)?$/i.test(url);

  const handleProofOpen = (url?: string, label?: string) => {
    if (!url || !label) return;
    if (isImageUrl(url)) {
      setLightbox({ url, label });
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  /* ════════════════════════ LIST VIEW ════════════════════════ */
  if (!showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50/70 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-4">

          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="font-medium text-gray-500">Resources</span>
            <ChevronRight size={13} className="text-gray-300" />
            <span className="font-semibold text-indigo-600">Competition Report</span>
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Competition Reports</h1>
              <p className="mt-0.5 text-xs text-gray-500">View all submitted reports and create new entries</p>
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
                <Plus size={15} /> Create Report
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 min-w-[220px]">
                <Search size={13} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reports, students..."
                  className="w-full bg-transparent text-xs text-gray-700 placeholder:text-gray-400 outline-none"
                />
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal size={13} /> Filter
              </button>
            </div>

            {recordsLoading ? (
              <div className="flex min-h-[340px] items-center justify-center">
                <Loader2 size={20} className="animate-spin text-indigo-400" />
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="flex min-h-[340px] flex-col items-center justify-center gap-3 px-4 py-12 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100">
                  <Database size={22} className="text-gray-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">No competition reports found</p>
                  <p className="mt-0.5 text-xs text-gray-400">Create your first competition report to get started.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="mt-1 flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
                >
                  <Plus size={13} /> Create Competition Report
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80">
                      {[
                        "Student / Event",
                        "Level",
                        "Mode",
                        "Project",
                        "SDG",
                        "Sponsorship",
                        "From",
                        "To",
                        "Status",
                        "IQAC",
                      ].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRecords.map((record) => {
                      const iqac = IQAC_STATUS_MAP[record.iqac_verification] ?? IQAC_STATUS_MAP.Initiated;
                      return (
                        <tr
                          key={record.id}
                          onClick={() => setSelectedRecord(record)}
                          className="group hover:bg-indigo-50/40 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3.5 max-w-[220px]">
                            <p className="text-gray-800 font-semibold leading-tight truncate">{record.title_of_event}</p>
                            <p className="text-gray-400 mt-0.5 truncate">{record.student_name}</p>
                            <p className="text-gray-300 mt-0.5 text-[10px]">Record #{record.id} · Student #{record.student_id}</p>
                          </td>
                          <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{record.level_of_event}</td>
                          <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{record.individual_or_batch}</td>
                          <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{record.academic_project}{record.specify_project ? ` (${record.specify_project})` : ""}</td>
                          <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{record.sdg_number ? `SDG ${record.sdg_number}` : `SDG #${record.sdg_id}`}</td>
                          <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                            {record.type_of_sponsorship}
                            {record.sponsorship_amount ? (
                              <span className="block text-[10px] text-gray-400">Rs. {record.sponsorship_amount}</span>
                            ) : null}
                          </td>
                          <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{fmtDate(record.from_date)}</td>
                          <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{fmtDate(record.to_date)}</td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap ${RESULT_STATUS_MAP[record.status] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${iqac.cls}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${iqac.dot}`} />
                              {record.iqac_verification}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Detail modal ── */}
          {selectedRecord && (
            <>
              <div onClick={() => setSelectedRecord(null)} className="fixed inset-0 z-40 bg-black/40" />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                    <div>
                      <p className="text-base font-bold text-gray-900">{selectedRecord.title_of_event}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{selectedRecord.student_name}</p>
                    </div>
                    <button onClick={() => setSelectedRecord(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Record ID", value: selectedRecord.id },
                        { label: "Student ID", value: selectedRecord.student_id },
                        { label: "Student Name", value: selectedRecord.student_name },
                        { label: "Title of Event", value: selectedRecord.title_of_event },
                        { label: "Level of Event", value: selectedRecord.level_of_event },
                        { label: "Individual or Batch", value: selectedRecord.individual_or_batch },
                        { label: "No. of Participants", value: selectedRecord.number_of_participants ?? "-" },
                        { label: "Academic Project", value: selectedRecord.academic_project },
                        { label: "Specify Project", value: selectedRecord.specify_project ?? "-" },
                        { label: "From Date", value: fmtDateLong(selectedRecord.from_date) },
                        { label: "To Date", value: fmtDateLong(selectedRecord.to_date) },
                        { label: "Type of Sponsorship", value: selectedRecord.type_of_sponsorship },
                        { label: "Sponsorship Amount", value: selectedRecord.sponsorship_amount ?? "-" },
                        {
                          label: "SDG",
                          value: selectedRecord.sdg_title
                            ? `#${selectedRecord.sdg_number ?? selectedRecord.sdg_id} - ${selectedRecord.sdg_title}`
                            : `#${selectedRecord.sdg_id}`,
                        },
                        { label: "Status", value: selectedRecord.status },
                        { label: "IQAC Verification", value: selectedRecord.iqac_verification },
                        { label: "Created At", value: fmtDateTime(selectedRecord.created_at) },
                      ].map(({ label, value }) => (
                        <div key={label} className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                          <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
                          <p className="text-xs font-semibold text-gray-800">{value}</p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Proof Documents</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Image Proof",        url: selectedRecord.image_proof_url },
                          { label: "Abstract Proof",     url: selectedRecord.abstract_proof_url },
                          { label: "Original Certificate", url: selectedRecord.original_cert_proof_url },
                          { label: "Attested Certificate", url: selectedRecord.attested_cert_proof_url },
                        ].map(({ label, url }) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => handleProofOpen(url, label)}
                            className={`rounded-xl border px-3 py-2.5 text-xs font-medium flex items-center justify-between
                              ${url ? "border-gray-200 hover:border-indigo-300 text-gray-700" : "border-gray-100 text-gray-400 cursor-not-allowed"}`}
                            disabled={!url}
                          >
                            <span className="truncate">{label}</span>
                            {url ? (
                              isImageUrl(url) ? <Search size={12} className="shrink-0" /> : <ExternalLink size={12} className="shrink-0" />
                            ) : (
                              <span className="text-[10px]">Not uploaded</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
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

                  <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => setSelectedRecord(null)}
                      className="px-5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ════════════════════════ CREATE FORM ════════════════════════ */
  const SelectWrapper = ({ children }: { children: ReactNode }) => (
    <div className="relative">
      {children}
      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400 mb-4">
          <span className="font-medium">Resources</span>
          <ChevronRight size={12} className="text-gray-300" />
          <button
            type="button"
            onClick={handleReset}
            className="font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            Competition Report
          </button>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="font-semibold text-gray-700">Create Report</span>
        </nav>

        {/* server-side error banner */}
        {submitError && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle size={15} className="shrink-0" />
            {submitError}
            <button className="ml-auto" onClick={() => setSubmitError(null)}><X size={14} /></button>
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-8">

          {/* Student */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <SearchableSelect
                label="Student"
                required
                name="student"
                value={form.studentId}
                placeholder="Choose student"
                options={students.map((s) => ({ value: String(s.id), label: s.student_name }))}
                onChange={handleSearchableChange}
              />
              <FieldError msg={errors.studentId} />
            </div>
          </div>

          {/* Title of Event */}
          <div>
            <Label htmlFor="titleOfEvent">Title of Event <RequiredStar /></Label>
            <input
              id="titleOfEvent"
              type="text"
              placeholder="Title of Event"
              value={form.titleOfEvent}
              onChange={(e) => set("titleOfEvent", e.target.value)}
              className={inputCls(errors.titleOfEvent)}
            />
            <FieldError msg={errors.titleOfEvent} />
          </div>

          {/* Level of Event */}
          <div>
            <Label htmlFor="levelOfEvent">Level of Event <RequiredStar /></Label>
            <SelectWrapper>
              <select id="levelOfEvent" value={form.levelOfEvent} onChange={(e) => set("levelOfEvent", e.target.value)} className={selectCls(errors.levelOfEvent)}>
                <option value="">Choose an option</option>
                <option>Round 1</option>
                <option>Round 2</option>
                <option>Round 3</option>
                <option>Round 4</option>
                <option>Winner</option>
              </select>
            </SelectWrapper>
            <FieldError msg={errors.levelOfEvent} />
          </div>

          {/* Individual or Batch */}
          <div>
            <Label htmlFor="individualOrBatch">Whether Product Developed By Individual Or Batch <RequiredStar /></Label>
            <SelectWrapper>
              <select id="individualOrBatch" value={form.individualOrBatch} onChange={(e) => set("individualOrBatch", e.target.value)} className={selectCls(errors.individualOrBatch)}>
                <option>Individual</option>
                <option>Batch</option>
              </select>
            </SelectWrapper>
            <FieldError msg={errors.individualOrBatch} />
          </div>

          {form.individualOrBatch === "Batch" && (
            <div>
              <Label htmlFor="numberOfParticipants">Number of Participants <RequiredStar /></Label>
              <input
                id="numberOfParticipants"
                type="number"
                min="2"
                placeholder="Enter number of participants"
                value={form.numberOfParticipants}
                onChange={(e) => set("numberOfParticipants", e.target.value)}
                className={inputCls(errors.numberOfParticipants)}
              />
              <FieldError msg={errors.numberOfParticipants} />
            </div>
          )}

          {/* Academic Project */}
          <div>
            <Label htmlFor="academicProject">Are you claiming this as the outcome of an academic project <RequiredStar /></Label>
            <SelectWrapper>
              <select id="academicProject" value={form.academicProject} onChange={(e) => set("academicProject", e.target.value)} className={selectCls(errors.academicProject)}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </SelectWrapper>
            <FieldError msg={errors.academicProject} />
          </div>

          {form.academicProject === "Yes" && (
            <div>
              <Label htmlFor="specifyProject">If Yes, specify the project <RequiredStar /></Label>
              <SelectWrapper>
                <select id="specifyProject" value={form.specifyProject} onChange={(e) => set("specifyProject", e.target.value)} className={selectCls(errors.specifyProject)}>
                  <option value="">Choose an option</option>
                  <option>Final Year Project</option>
                  <option>Mini Project</option>
                  <option>Research Project</option>
                  <option>Internship Project</option>
                </select>
              </SelectWrapper>
              <FieldError msg={errors.specifyProject} />
            </div>
          )}

          {/* Dates */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="fromDate">From Date <RequiredStar /></Label>
              <div className="relative">
                <Calendar size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="fromDate" type="date" value={form.fromDate} onChange={(e) => set("fromDate", e.target.value)} className={`${inputCls(errors.fromDate)} pl-10`} />
              </div>
              <FieldError msg={errors.fromDate} />
            </div>
            <div>
              <Label htmlFor="toDate">To Date <RequiredStar /></Label>
              <div className="relative">
                <Calendar size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="toDate" type="date" value={form.toDate} onChange={(e) => set("toDate", e.target.value)} className={`${inputCls(errors.toDate)} pl-10`} />
              </div>
              <FieldError msg={errors.toDate} />
            </div>
          </div>

          {/* Sponsorship */}
          <div>
            <Label htmlFor="typeOfSponsorship">Type of Sponsorship <RequiredStar /></Label>
            <SelectWrapper>
              <select id="typeOfSponsorship" value={form.typeOfSponsorship} onChange={(e) => set("typeOfSponsorship", e.target.value)} className={selectCls(errors.typeOfSponsorship)}>
                <option value="">Choose an option</option>
                <option>Self</option>
                <option>Management</option>
              </select>
            </SelectWrapper>
            <FieldError msg={errors.typeOfSponsorship} />
          </div>

          {form.typeOfSponsorship === "Management" && (
            <div>
              <Label htmlFor="sponsorshipAmount">Amount in Rs <RequiredStar /></Label>
              <input
                id="sponsorshipAmount"
                type="number"
                min="0"
                placeholder="Enter amount"
                value={form.sponsorshipAmount}
                onChange={(e) => set("sponsorshipAmount", e.target.value)}
                className={inputCls(errors.sponsorshipAmount)}
              />
              <FieldError msg={errors.sponsorshipAmount} />
            </div>
          )}

          {/* SDG Goals */}
          <div>
            <SearchableSelect
              label="SDG Goals"
              required
              name="sdgGoals"
              value={form.sdgGoals}
              placeholder="Choose SDG Goal"
              options={sdgList.map((sdg) => ({
                value: sdg.title,
                label: `SDG ${sdg.sdg_number}: ${sdg.title}`,
              }))}
              onChange={(name, value) => set(name as FormKey, value)}
            />
            <FieldError msg={errors.sdgGoals} />
          </div>

          {/* File uploads */}
          <div>
            <Label htmlFor="imageProof">Upload Image / Photo / Geotag <RequiredStar /></Label>
            <FileUpload id="imageProof" value={form.imageProof} onChange={(v) => set("imageProof", v)} error={errors.imageProof} />
            <FieldError msg={errors.imageProof} />
          </div>

          <div>
            <Label htmlFor="abstractProof">Abstract Document Proof <RequiredStar /></Label>
            <FileUpload id="abstractProof" value={form.abstractProof} onChange={(v) => set("abstractProof", v)} error={errors.abstractProof} />
            <FieldError msg={errors.abstractProof} />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status <RequiredStar /></Label>
            <SelectWrapper>
              <select id="status" value={form.status} onChange={(e) => set("status", e.target.value)} className={selectCls(errors.status)}>
                <option value="">Choose an option</option>
                <option>Winner</option>
                <option>Participant</option>
              </select>
            </SelectWrapper>
            <FieldError msg={errors.status} />
          </div>

          <div>
            <Label htmlFor="originalCertProof">Original Certificate Proof <RequiredStar /></Label>
            <FileUpload id="originalCertProof" value={form.originalCertProof} onChange={(v) => set("originalCertProof", v)} error={errors.originalCertProof} />
            <FieldError msg={errors.originalCertProof} />
          </div>

          <div>
            <Label htmlFor="attestedCertProof">Attested Certificate Document Proof <RequiredStar /></Label>
            <FileUpload id="attestedCertProof" value={form.attestedCertProof} onChange={(v) => set("attestedCertProof", v)} error={errors.attestedCertProof} />
            <FieldError msg={errors.attestedCertProof} />
          </div>

          <hr className="border-slate-100" />

          {/* IQAC — read-only */}
          <div>
            <Label htmlFor="iqacVerification">IQAC Verification</Label>
            <SelectWrapper>
              <select
                id="iqacVerification"
                value={form.iqacVerification}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400 outline-none appearance-none cursor-not-allowed"
              >
                <option>Initiated</option>
                <option>Under Review</option>
                <option>Verified</option>
              </select>
            </SelectWrapper>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleReset}
              disabled={submitting}
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-6 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition disabled:opacity-50"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              Create &amp; Add Another
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#12233d] px-8 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition shadow-sm disabled:opacity-50"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              Create Competition Report
            </button>
          </div>
        </section>

        <p className="text-center text-xs text-slate-400 pb-4">
          ICT Information Portal • All fields marked <span className="text-rose-400">*</span> are required
        </p>
      </div>
    </div>
  );
}