'use client';

import React, { ChangeEvent, useEffect, useState } from "react";
import { ChevronRight, Check, X, GraduationCap, BookOpen, Link, UploadCloud, Users } from "lucide-react";
import { SearchableSelect } from "@/components/SearchableSelect";

type Student = { id: number; student_name?: string; name?: string };
type Department = { id: number; dept_name: string };

type FormState = {
  student: string;
  yearOfStudy: string;
  specialLab: string;
  paperTitle: string;
  authorsNames: string;
  totalAuthors: string;
  studentAuthorCount: string;
  facultyAuthorCount: string;
  studentAuthorNames: string[];
  facultyAuthorNames: string[];
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
  indexedDetails: string;
  indexedOtherDetails: string;
  impactFactor: string;
  impactFactorValue: string;
  studentAuthorPosition: string;
  labsInvolved: string;
  projectOutcome: string;
  sponsorshipType: string;
  sponsorshipAmount: string;
  sponsorshipOtherSpecify: string;
  interdisciplinary: string;
  interdisciplinaryDepartment: string;
  otherDeptStudentCount: string;
  sdgGoals: string;
  sdgTitle: string;
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
  indexedDetails: "",
  indexedOtherDetails: "",
  impactFactor: "",
  impactFactorValue: "",
  studentAuthorPosition: "",
  labsInvolved: "",
  projectOutcome: "",
  sponsorshipType: "",
  sponsorshipAmount: "",
  sponsorshipOtherSpecify: "",
  interdisciplinary: "",
  interdisciplinaryDepartment: "",
  otherDeptStudentCount: "",
  sdgGoals: "",
  sdgTitle: "",
  abstractProof: null,
  fullDocumentProof: null,
  originalCertProof: null,
  attestedCertProof: null,
  iqacVerification: "Initiated",
};

const STEPS = [
  { id: 1, label: "Student info" },
  { id: 2, label: "Paper details" },
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

export default function JournalPublicationAppliedCreatePage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [students, setStudents] = useState<Student[]>([]);
  const [labs, setLabs] = useState<{ id: number; specialLabName: string }[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const handleSearchableChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "paperIndexed") {
        next.indexedDetails = "";
        next.indexedOtherDetails = "";
      }

      if (name === "indexedDetails" && value !== "Others") {
        next.indexedOtherDetails = "";
      }

      if (name === "impactFactor" && value !== "Yes") {
        next.impactFactorValue = "";
      }

      if (name === "sponsorshipType") {
        next.sponsorshipAmount = "";
        next.sponsorshipOtherSpecify = "";
      }

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

  const handleCancel = () => {
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

      const response = await fetch("http://localhost:5000/api/journal-publications", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create journal publication");

      setSuccess(true);
      handleCancel();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchJson = async <T,>(url: string): Promise<T> => {
          const response = await fetch(url);
          const raw = await response.text();
          if (!response.ok) throw new Error(`Request failed (${response.status}) for ${url}`);
          try {
            return JSON.parse(raw) as T;
          } catch {
            throw new Error(`Invalid JSON response from ${url}`);
          }
        };

        const [studentsData, labsData, departmentsData] = await Promise.all([
          fetchJson<Student[]>("http://localhost:5000/students"),
          fetchJson<{ id: number; specialLabName: string }[]>("http://localhost:5000/speciallabs/active"),
          fetchJson<Department[]>("http://localhost:5000/departments"),
        ]);

        setStudents(studentsData.map((s) => ({ ...s, student_name: s.student_name ?? s.name ?? "" })));
        setLabs(labsData);
        setDepartments(departmentsData);
      } catch (err) {
        console.error("Failed to load data", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      }
    };

    fetchData();
  }, []);

  const totalAuthorsNum = parseInt(form.totalAuthors) || 0;
  const studentCountNum = parseInt(form.studentAuthorCount) || 0;
  const facultyCountNum = parseInt(form.facultyAuthorCount) || 0;
  const showStudentCountField = totalAuthorsNum > 0;
  const showFacultyCountField = showStudentCountField && form.studentAuthorCount !== "";
  const showAuthorNameFields = showFacultyCountField && (studentCountNum > 0 || facultyCountNum > 0);

  const showIndexedDetails = form.paperIndexed === "Yes";
  const showIndexedOtherInput = showIndexedDetails && form.indexedDetails === "Others";
  const showImpactValue = form.impactFactor === "Yes";
  const showSponsorshipAmount = form.sponsorshipType === "Institute" || form.sponsorshipType === "Others";
  const showSponsorshipOther = form.sponsorshipType === "Others";
  const showInterdisciplinary = form.interdisciplinary === "Yes";

  return (
    <div className="min-h-screen bg-gray-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400 mb-4">
            <span className="font-medium">Student</span>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="font-semibold text-indigo-600">Journal Publication</span>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="font-semibold text-gray-700">Create Applied Publication</span>
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Create Applied Publication</h1>
              <p className="mt-1 text-sm text-slate-500">Complete all required fields and upload proof documents.</p>
            </div>
            <button onClick={handleCancel} type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <X size={16} /> Reset
            </button>
          </div>

          <div className="flex items-center gap-2">
            {STEPS.map((step) => {
              const isDone = step.id < activeStep;
              const isActive = step.id === activeStep;
              return (
                <div key={step.id} className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold ${isDone ? "bg-emerald-500 text-white" : isActive ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white text-slate-500"}`}>
                    {isDone ? <Check size={10} strokeWidth={3} /> : step.id}
                  </div>
                  <span className={`text-xs uppercase ${isActive ? "text-slate-900" : "text-slate-400"}`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-5 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <X size={14} className="mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-5 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <Check size={14} className="mt-0.5 text-emerald-600" />
            <span>Journal publication record created successfully.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-8 sm:py-7 space-y-7">
          <FormSection icon={<GraduationCap size={14} />} title="Student information" onActivate={() => setActiveStep(1)}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <SearchableSelect
                label="Student"
                required
                name="student"
                value={form.student}
                placeholder="Choose student"
                options={students.map((s) => ({ value: String(s.id), label: s.student_name ?? "" }))}
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

          <FormSection icon={<BookOpen size={14} />} title="Paper details" onActivate={() => setActiveStep(2)}>
            <div className="space-y-4">
              <InputField label="Paper Title" required name="paperTitle" value={form.paperTitle} placeholder="Enter paper title" onChange={handleChange} />
              <InputField label="Author(s) Names (as appear in the paper)" required name="authorsNames" value={form.authorsNames} placeholder="Enter authors as they appear in the paper" onChange={handleChange} />

              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 text-slate-400">
                    <Users size={11} />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Author breakdown</span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">Total number of authors<span className="ml-0.5 text-rose-500">*</span></label>
                    <select value={form.totalAuthors} onChange={handleTotalAuthorsChange} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
                      <option value="">Choose</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={String(n)}>{n}</option>
                      ))}
                    </select>
                    <p className="mt-1 text-[10px] text-slate-400">Maximum 5 authors</p>
                  </div>

                  {showStudentCountField && (
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-700">Number of student authors<span className="ml-0.5 text-rose-500">*</span></label>
                      <select value={form.studentAuthorCount} onChange={handleStudentAuthorCountChange} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
                        <option value="">Choose</option>
                        {Array.from({ length: totalAuthorsNum + 1 }, (_, i) => (
                          <option key={i} value={String(i)}>{i}</option>
                        ))}
                      </select>
                      <p className="mt-1 text-[10px] text-slate-400">Out of {totalAuthorsNum} total</p>
                    </div>
                  )}

                  {showFacultyCountField && (
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-700">Number of faculty authors</label>
                      <input readOnly value={form.facultyAuthorCount} className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 cursor-not-allowed" />
                      <p className="mt-1 text-[10px] text-slate-400">Auto-calculated</p>
                    </div>
                  )}
                </div>

                {showFacultyCountField && (
                  <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="font-semibold text-slate-900">{totalAuthorsNum}</span>
                      total authors
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600">{studentCountNum} student{studentCountNum !== 1 ? "s" : ""}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">{facultyCountNum} faculty</span>
                  </div>
                )}

                {showAuthorNameFields && (
                  <div className="space-y-4">
                    {studentCountNum > 0 && (
                      <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 space-y-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-500">Student author names</p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {form.studentAuthorNames.map((name, index) => (
                            <div key={index}>
                              <label className="mb-1.5 block text-xs font-medium text-slate-700">Student author {index + 1}<span className="ml-0.5 text-rose-500">*</span></label>
                              <input value={name} placeholder="Full name as in paper" onChange={(e) => handleStudentAuthorNameChange(index, e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {facultyCountNum > 0 && (
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 space-y-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600">Faculty author names</p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {form.facultyAuthorNames.map((name, index) => (
                            <div key={index}>
                              <label className="mb-1.5 block text-xs font-medium text-slate-700">Faculty author {index + 1}<span className="ml-0.5 text-rose-500">*</span></label>
                              <input value={name} placeholder="Full name as in paper" onChange={(e) => handleFacultyAuthorNameChange(index, e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InputField label="Date of Publication" required type="date" name="dateOfPublication" value={form.dateOfPublication} onChange={handleChange} />
                <InputField label="Volume Number" required name="volumeNumber" value={form.volumeNumber} placeholder="e.g., 12" onChange={handleChange} />
                <InputField label="Issue Number" required name="issueNumber" value={form.issueNumber} placeholder="e.g., 3" onChange={handleChange} />
                <InputField label="ISSN Number" required name="issnNumber" value={form.issnNumber} placeholder="Enter ISSN" onChange={handleChange} />
              </div>
            </div>
          </FormSection>

          <FormSection icon={<Link size={14} />} title="Publication information" onActivate={() => setActiveStep(3)}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField label="Journal Name" required name="journalName" value={form.journalName} placeholder="Enter journal name" onChange={handleChange} />
                <InputField label="Publisher Name" required name="publisherName" value={form.publisherName} placeholder="Enter publisher name" onChange={handleChange} />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <InputField label="DOI Number" required name="doiNumber" value={form.doiNumber} placeholder="e.g., 10.1234/..." onChange={handleChange} />
                <InputField label="Page From" required type="number" name="pageFrom" value={form.pageFrom} placeholder="e.g., 100" onChange={handleChange} />
                <InputField label="Page To" required type="number" name="pageTo" value={form.pageTo} placeholder="e.g., 115" onChange={handleChange} />
                <InputField label="Paper Web URL" required name="webUrl" value={form.webUrl} placeholder="https://..." onChange={handleChange} />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField label="Position of Student as Author in Paper" required name="studentAuthorPosition" value={form.studentAuthorPosition} placeholder="e.g., 1" onChange={handleChange} />
                <InputField label="Labs Involved" required name="labsInvolved" value={form.labsInvolved} placeholder="e.g., Lab 1" onChange={handleChange} />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <SelectField label="Paper Indexed" required name="paperIndexed" value={form.paperIndexed} options={["Choose", "Yes", "No"]} onChange={handleChange} />

                {showIndexedDetails && (
                  <SelectField label="Indexed Details" required name="indexedDetails" value={form.indexedDetails} options={["Choose", ...INDEXED_OPTIONS]} onChange={handleChange} />
                )}

                {showIndexedOtherInput && (
                  <InputField label="Specify Index" required name="indexedOtherDetails" value={form.indexedOtherDetails} placeholder="Enter index name" onChange={handleChange} />
                )}

                <SelectField label="Impact Factor" required name="impactFactor" value={form.impactFactor} options={["Choose", "Yes", "No"]} onChange={handleChange} />
              </div>

              {showImpactValue && (
                <InputField label="Impact Factor Value" required name="impactFactorValue" value={form.impactFactorValue} placeholder="e.g., 4.52" onChange={handleChange} />
              )}

              <InputField label="Project Outcome" required name="projectOutcome" value={form.projectOutcome} placeholder="Enter outcome" onChange={handleChange} />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <SearchableSelect
                  label="SDG Goals"
                  required
                  name="sdgGoals"
                  value={form.sdgGoals}
                  placeholder="Choose SDG"
                  options={Object.entries(SDG_MAPPING).map(([value, label]) => ({ value, label }))}
                  onChange={handleSearchableChange}
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 text-slate-400">
                    <Users size={11} />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Sponsorship details</span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <SelectField label="Sponsorship Type" required name="sponsorshipType" value={form.sponsorshipType} options={["Choose", "Self", "Institute", "Others"]} onChange={handleChange} />

                  {showSponsorshipAmount && (
                    <InputField label={form.sponsorshipType === "Institute" ? "Sponsorship Amount (₹)" : "Amount (₹)"} required type="number" name="sponsorshipAmount" value={form.sponsorshipAmount} placeholder="Enter amount" onChange={handleChange} />
                  )}

                  {showSponsorshipOther && (
                    <InputField label="If Others, please specify" required name="sponsorshipOtherSpecify" value={form.sponsorshipOtherSpecify} placeholder="Specify sponsorship source" onChange={handleChange} />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <SelectField label="Interdisciplinary" required name="interdisciplinary" value={form.interdisciplinary} options={["Choose", "Yes", "No"]} onChange={handleChange} />
              </div>

              {showInterdisciplinary && (
                <div className="rounded-xl border border-violet-100 bg-violet-50/80 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-5 h-5 rounded-md bg-violet-100 text-violet-400">
                      <Users size={11} />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-violet-500">Interdisciplinary details</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-700">Other Department<span className="ml-0.5 text-rose-500">*</span></label>
                      <select name="interdisciplinaryDepartment" value={form.interdisciplinaryDepartment} onChange={handleChange} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
                        <option value="">Choose department</option>
                        {departments.map((department) => (
                          <option key={department.id} value={String(department.id)}>{department.dept_name}</option>
                        ))}
                      </select>
                    </div>
                    <InputField label="Number of Other Department Students" required type="number" name="otherDeptStudentCount" value={form.otherDeptStudentCount} placeholder="e.g., 3" onChange={handleChange} />
                  </div>
                </div>
              )}
            </div>
          </FormSection>

          <FormSection icon={<UploadCloud size={14} />} title="Document uploads" onActivate={() => setActiveStep(4)}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <FileField label="Abstract Document Proof" required name="abstractProof" onChange={handleFileChange} fileName={files.abstractProof?.name} />
                <p className="text-xs text-slate-400">Format: Reg.No – JPA – Date</p>
              </div>
              <div className="space-y-1.5">
                <FileField label="Full Document Proof" required name="fullDocumentProof" onChange={handleFileChange} fileName={files.fullDocumentProof?.name} />
                <p className="text-xs text-slate-400">Format: Reg.No – JPF – Date</p>
              </div>
              <div className="space-y-1.5">
                <FileField label="Original Certificate" name="originalCertProof" onChange={handleFileChange} fileName={files.originalCertProof?.name} />
                <p className="text-xs text-slate-400">Format: Reg.No – JPO – Date</p>
              </div>
              <div className="space-y-1.5">
                <FileField label="Attested Certificate" name="attestedCertProof" onChange={handleFileChange} fileName={files.attestedCertProof?.name} />
                <p className="text-xs text-slate-400">Format: Reg.No – JPX – Date</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
              <SelectField label="IQAC Verification" required name="iqacVerification" value={form.iqacVerification} options={["Initiated", "Verified", "Rejected"]} onChange={handleChange} />
            </div>
          </FormSection>

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-5">
            <button type="button" onClick={handleCancel} disabled={loading} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {loading ? (
                <span className="inline-flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Creating…</span>
              ) : (
                <><Check size={14} />Create Publication</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormSection({ icon, title, children, onActivate }: { icon: React.ReactNode; title: string; children: React.ReactNode; onActivate?: () => void }) {
  return (
    <div className="space-y-4" onClick={onActivate}>
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500">{icon}</div>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>
      {children}
    </div>
  );
}

type BaseFieldProps = { label: string; name: string; required?: boolean };

type InputFieldProps = BaseFieldProps & { type?: string; value: string; placeholder?: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void };

function InputField({ label, name, required, type = "text", value, placeholder, onChange }: InputFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-700">
        {label}{required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
    </div>
  );
}

type SelectFieldProps = BaseFieldProps & { value: string; options: string[]; onChange: (e: ChangeEvent<HTMLSelectElement>) => void };

function SelectField({ label, name, required, value, options, onChange }: SelectFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}{required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      <select name={name} value={value} onChange={onChange} className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 pr-8 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
        {options.map((option) => (
          <option key={option} value={option.startsWith("Choose") ? "" : option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

type FileFieldProps = BaseFieldProps & { onChange: (e: ChangeEvent<HTMLInputElement>) => void; fileName?: string };

function FileField({ label, required, name, onChange, fileName }: FileFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-700">
        {label}{required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      <label className={`group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-5 text-center transition-colors ${fileName ? "border-emerald-300 bg-emerald-50" : "border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50"}`}>
        <div className={`flex items-center justify-center rounded-lg p-2 transition-colors ${fileName ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500"}`}>
          {fileName ? <Check size={16} /> : <UploadCloud size={16} />}
        </div>
        <div>
          <p className={`text-xs font-medium ${fileName ? "text-emerald-700" : "text-slate-600 group-hover:text-indigo-600"}`}>{fileName ? fileName : "Click to upload or drag & drop"}</p>
          {!fileName && <p className="mt-0.5 text-xs text-slate-400">PDF, JPG, PNG</p>}
        </div>
        <input name={name} type="file" className="hidden" onChange={onChange} accept=".pdf,.jpg,.jpeg,.png" />
      </label>
    </div>
  );
}
