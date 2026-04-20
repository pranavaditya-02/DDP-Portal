"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import Link from "next/link";

const authorTypeOptions = [
  "BIT Faculty",
  "BIT Student",
  "Institute -National",
  "Institute - International",
  "Industry",
  "NA",
] as const;

const natureOptions = ["Journal", "Through Conference/Proceedings"] as const;
const publicationTypeOptions = ["International", "National"] as const;
const indexingOptions = ["SCOPUS", "SCI/SCIE/WOS", "UGC CARE", "OTHERS"] as const;
const rankingOptions = ["Q1", "Q2", "Q3", "Q4", "NA"] as const;
const authorPositionOptions = ["First", "Second", "Third", "Fourth", "Corresponding", "NA"] as const;
const annexureOptions = ["Yes", "No"] as const;

const RequiredAst = () => <span className="text-red-500 ml-0.5">*</span>;

const inputClass = (error?: string) =>
  `w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
    error ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
  }`;

const selectClass = (error?: string) =>
  `w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
    error ? "border-red-400" : "border-slate-200"
  }`;

const textareaClass = (error?: string) =>
  `w-full min-h-[120px] rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
    error ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
  }`;

type FacultySuggestion = { id: string; name: string | null };

type SdgGoal = { id: number; goal_index: number; goal_name: string };

export default function CreatePublishedJournalPublicationPage() {
  const router = useRouter();
  const [facultyQuery, setFacultyQuery] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<FacultySuggestion | null>(null);
  const [facultySuggestions, setFacultySuggestions] = useState<FacultySuggestion[]>([]);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [facultiesError, setFacultiesError] = useState("");

  const [sdgGoals, setSdgGoals] = useState<SdgGoal[]>([]);
  const [selectedSdgGoalIds, setSelectedSdgGoalIds] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    taskId: "",
    natureOfPublication: "Journal",
    conferenceName: "",
    articleTitle: "",
    journalName: "Journal Name Pending",
    publisherName: "",
    publicationType: "",
    impactFactor: "",
    journalHIndex: "",
    scientificJournalRankings: "",
    indexing: "",
    otherIndexing: "",
    author_1: "",
    author_1_faculty_id: "",
    author_1_student_id: "",
    author_1_name: "",
    author_1_designation_dept_address: "",
    author_2: "",
    author_2_faculty_id: "",
    author_2_student_id: "",
    author_2_name: "",
    author_2_designation_dept_address: "",
    author_3: "",
    author_3_faculty_id: "",
    author_3_student_id: "",
    author_3_name: "",
    author_3_designation_dept_address: "",
    author_4: "",
    author_4_faculty_id: "",
    author_4_student_id: "",
    author_4_name: "",
    author_4_designation_dept_address: "",
    author_5: "",
    author_5_faculty_id: "",
    author_5_student_id: "",
    author_5_name: "",
    author_5_designation_dept_address: "",
    author_6: "",
    author_6_faculty_id: "",
    author_6_student_id: "",
    author_6_name: "",
    author_6_designation_dept_address: "",
    annaUniversityAnnexure: "",
    articleWebLink: "",
    doi: "",
    volumeArtNo: "",
    issueNo: "",
    pageNumberFromTo: "",
    issn: "",
    claimedBy: "",
    authorPosition: "",
    documentProof: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSdgGoals = async () => {
      try {
        const response = await apiClient.getSdgGoals();
        setSdgGoals(response?.sdgGoals || []);
      } catch (err) {
        console.error("Failed to load SDG goals", err);
      }
    };
    fetchSdgGoals();
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!facultyQuery.trim()) {
      setFacultySuggestions([]);
      setFacultyLoading(false);
      return;
    }

    setFacultyLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await apiClient.getFaculties(facultyQuery.trim());
        if (!cancelled) {
          setFacultySuggestions(Array.isArray(response.faculties) ? response.faculties : []);
          setFacultiesError("");
        }
      } catch (err) {
        if (!cancelled) {
          setFacultySuggestions([]);
          setFacultiesError("Unable to fetch faculty suggestions.");
        }
      } finally {
        if (!cancelled) setFacultyLoading(false);
      }
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [facultyQuery]);

  const handleInputChange = (field: keyof typeof formData, value: string | File | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleFacultyChange = (value: string) => {
    setFacultyQuery(value);
    setSelectedFaculty(null);
    setErrors((prev) => ({ ...prev, faculty: "" }));
  };

  const handleFacultySelect = (faculty: FacultySuggestion) => {
    setSelectedFaculty(faculty);
    setFacultyQuery(faculty.name || faculty.id);
    setErrors((prev) => ({ ...prev, faculty: "" }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    handleInputChange("documentProof", file);
    setFileName(file?.name ?? "");
  };

  const toggleSdgGoal = (goalId: number) => {
    setSelectedSdgGoalIds((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId],
    );
    setErrors((prev) => ({ ...prev, sdgGoals: "" }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!selectedFaculty && !facultyQuery.trim()) nextErrors.faculty = "Faculty name is required.";
    if (!formData.taskId.trim() || Number(formData.taskId) <= 0) nextErrors.taskId = "Task ID is required and must be a positive number.";
    if (!formData.natureOfPublication.trim()) nextErrors.natureOfPublication = "Nature of publication is required.";
    if (formData.natureOfPublication === "Through Conference/Proceedings" && !formData.conferenceName.trim()) {
      nextErrors.conferenceName = "Conference name is required for conference publications.";
    }
    if (!formData.articleTitle.trim()) nextErrors.articleTitle = "Article title is required.";
    if (!formData.publisherName.trim()) nextErrors.publisherName = "Publisher name is required.";
    if (!formData.publicationType.trim()) nextErrors.publicationType = "Publication type is required.";
    if (!formData.scientificJournalRankings.trim()) nextErrors.scientificJournalRankings = "Scientific journal ranking is required.";
    if (!formData.indexing.trim()) nextErrors.indexing = "Indexing is required.";
    if (formData.indexing === "OTHERS" && !formData.otherIndexing.trim()) {
      nextErrors.otherIndexing = "Please specify the other indexing.";
    }
    if (selectedSdgGoalIds.length === 0) nextErrors.sdgGoals = "Please select at least one SDG.";
    if (!formData.documentProof) nextErrors.documentProof = "Document proof is required.";
    if (formData.documentProof && formData.documentProof.type !== "application/pdf") {
      nextErrors.documentProof = "Proof document must be a PDF file.";
    }
    if (!formData.authorPosition.trim()) nextErrors.authorPosition = "Author position is required.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitError("");
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("faculty_name", selectedFaculty?.name || facultyQuery.trim());
    payload.append("task_id", String(Number(formData.taskId)));
    payload.append("nature_of_publication", formData.natureOfPublication);
    payload.append("conference_name", formData.conferenceName.trim());
    payload.append("article_title", formData.articleTitle.trim());
    payload.append("journal_name", formData.journalName.trim() || "Journal Name Pending");
    payload.append("publisher_name", formData.publisherName.trim());
    payload.append("publication_type", formData.publicationType);
    payload.append("impact_factor", formData.impactFactor.trim());
    payload.append("journal_h_index", formData.journalHIndex.trim());
    payload.append("scientific_journal_rankings", formData.scientificJournalRankings);
    payload.append("indexing", formData.indexing);
    payload.append("indexing_others_specify", formData.otherIndexing.trim());
    payload.append("author_1", formData.author_1);
    payload.append("author_1_faculty_id", formData.author_1_faculty_id.trim());
    payload.append("author_1_student_id", formData.author_1_student_id.trim());
    payload.append("author_1_name", formData.author_1_name.trim());
    payload.append("author_1_designation_dept_address", formData.author_1_designation_dept_address.trim());
    payload.append("author_2", formData.author_2);
    payload.append("author_2_faculty_id", formData.author_2_faculty_id.trim());
    payload.append("author_2_student_id", formData.author_2_student_id.trim());
    payload.append("author_2_name", formData.author_2_name.trim());
    payload.append("author_2_designation_dept_address", formData.author_2_designation_dept_address.trim());
    payload.append("author_3", formData.author_3);
    payload.append("author_3_faculty_id", formData.author_3_faculty_id.trim());
    payload.append("author_3_student_id", formData.author_3_student_id.trim());
    payload.append("author_3_name", formData.author_3_name.trim());
    payload.append("author_3_designation_dept_address", formData.author_3_designation_dept_address.trim());
    payload.append("author_4", formData.author_4);
    payload.append("author_4_faculty_id", formData.author_4_faculty_id.trim());
    payload.append("author_4_student_id", formData.author_4_student_id.trim());
    payload.append("author_4_name", formData.author_4_name.trim());
    payload.append("author_4_designation_dept_address", formData.author_4_designation_dept_address.trim());
    payload.append("author_5", formData.author_5);
    payload.append("author_5_faculty_id", formData.author_5_faculty_id.trim());
    payload.append("author_5_student_id", formData.author_5_student_id.trim());
    payload.append("author_5_name", formData.author_5_name.trim());
    payload.append("author_5_designation_dept_address", formData.author_5_designation_dept_address.trim());
    payload.append("author_6", formData.author_6);
    payload.append("author_6_faculty_id", formData.author_6_faculty_id.trim());
    payload.append("author_6_student_id", formData.author_6_student_id.trim());
    payload.append("author_6_name", formData.author_6_name.trim());
    payload.append("author_6_designation_dept_address", formData.author_6_designation_dept_address.trim());
    payload.append("anna_university_annexure", formData.annaUniversityAnnexure);
    payload.append("article_web_link", formData.articleWebLink.trim());
    payload.append("doi", formData.doi.trim());
    payload.append("volume_art_no", formData.volumeArtNo.trim());
    payload.append("issue_no", formData.issueNo.trim());
    payload.append("page_number_from_to", formData.pageNumberFromTo.trim());
    payload.append("issn", formData.issn.trim());
    payload.append("claimed_by", formData.claimedBy.trim());
    payload.append("author_position", formData.authorPosition);
    selectedSdgGoalIds.forEach((id) => payload.append("sdg_goal_ids[]", String(id)));
    if (formData.documentProof) payload.append("documentProof", formData.documentProof);

    try {
      await apiClient.createJournalPublicationPublished(payload);
      router.push("/faculty/r-and-d/journal-publications/published");
    } catch (error: any) {
      setSubmitError(error?.message || "Unable to save the record. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900">Create Published Journal Publication</h1>
        <p className="mt-2 text-sm text-slate-500">
          Fill published journal publication details and upload the proof document.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <label htmlFor="faculty" className="block text-sm font-medium text-slate-700 mb-2">
                Faculty Name <RequiredAst />
              </label>
              <div className="relative">
                <input
                  id="faculty"
                  value={facultyQuery}
                  onChange={(event) => handleFacultyChange(event.target.value)}
                  type="text"
                  className={inputClass(errors.faculty)}
                  placeholder="Type faculty name"
                  autoComplete="off"
                />
                {facultySuggestions.length > 0 && facultyQuery.trim() && (
                  <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
                    {facultyLoading ? (
                      <div className="px-3 py-3 text-sm text-slate-500">Loading faculty suggestions...</div>
                    ) : (
                      facultySuggestions.map((faculty) => (
                        <button
                          key={faculty.id}
                          type="button"
                          onClick={() => handleFacultySelect(faculty)}
                          className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                        >
                          {faculty.name || faculty.id}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {facultiesError ? <p className="mt-2 text-sm text-rose-600">{facultiesError}</p> : null}
              {errors.faculty ? <p className="mt-2 text-sm text-red-600">{errors.faculty}</p> : null}
            </div>

            <div>
              <label htmlFor="taskId" className="block text-sm font-medium text-slate-700 mb-2">
                Task ID <RequiredAst />
              </label>
              <input
                id="taskId"
                type="number"
                min="1"
                value={formData.taskId}
                onChange={(event) => handleInputChange("taskId", event.target.value)}
                className={inputClass(errors.taskId)}
                placeholder="Enter task ID"
              />
              {errors.taskId ? <p className="mt-2 text-sm text-red-600">{errors.taskId}</p> : null}
            </div>

            <div>
              <label htmlFor="natureOfPublication" className="block text-sm font-medium text-slate-700 mb-2">
                Nature of Publication <RequiredAst />
              </label>
              <select
                id="natureOfPublication"
                value={formData.natureOfPublication}
                onChange={(event) => handleInputChange("natureOfPublication", event.target.value)}
                className={selectClass(errors.natureOfPublication)}
              >
                {natureOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.natureOfPublication ? <p className="mt-2 text-sm text-red-600">{errors.natureOfPublication}</p> : null}
            </div>

            <div>
              <label htmlFor="conferenceName" className="block text-sm font-medium text-slate-700 mb-2">
                Conference Name
              </label>
              <input
                id="conferenceName"
                value={formData.conferenceName}
                onChange={(event) => handleInputChange("conferenceName", event.target.value)}
                type="text"
                className={inputClass(errors.conferenceName)}
                placeholder="Conference name if applicable"
                disabled={formData.natureOfPublication !== "Through Conference/Proceedings"}
              />
              {errors.conferenceName ? <p className="mt-2 text-sm text-red-600">{errors.conferenceName}</p> : null}
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="articleTitle" className="block text-sm font-medium text-slate-700 mb-2">
                Title of the Published Article <RequiredAst />
              </label>
              <textarea
                id="articleTitle"
                value={formData.articleTitle}
                onChange={(event) => handleInputChange("articleTitle", event.target.value)}
                className={textareaClass(errors.articleTitle)}
                placeholder="Enter published article title"
              />
              {errors.articleTitle ? <p className="mt-2 text-sm text-red-600">{errors.articleTitle}</p> : null}
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="journalName" className="block text-sm font-medium text-slate-700 mb-2">
                Name of the Journal
              </label>
              <input
                id="journalName"
                value={formData.journalName}
                type="text"
                className={inputClass()}
                placeholder="Journal name field coming later"
                disabled
              />
              <p className="mt-2 text-sm text-slate-500">Journal name selection will be completed later.</p>
            </div>

            <div>
              <label htmlFor="publisherName" className="block text-sm font-medium text-slate-700 mb-2">
                Publisher Name <RequiredAst />
              </label>
              <input
                id="publisherName"
                value={formData.publisherName}
                onChange={(event) => handleInputChange("publisherName", event.target.value)}
                type="text"
                className={inputClass(errors.publisherName)}
                placeholder="Enter publisher name"
              />
              {errors.publisherName ? <p className="mt-2 text-sm text-red-600">{errors.publisherName}</p> : null}
            </div>

            <div>
              <label htmlFor="publicationType" className="block text-sm font-medium text-slate-700 mb-2">
                Type of Publication <RequiredAst />
              </label>
              <select
                id="publicationType"
                value={formData.publicationType}
                onChange={(event) => handleInputChange("publicationType", event.target.value)}
                className={selectClass(errors.publicationType)}
              >
                <option value="">Select publication type</option>
                {publicationTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.publicationType ? <p className="mt-2 text-sm text-red-600">{errors.publicationType}</p> : null}
            </div>

            <div>
              <label htmlFor="impactFactor" className="block text-sm font-medium text-slate-700 mb-2">
                Impact Factor
              </label>
              <input
                id="impactFactor"
                type="number"
                step="0.001"
                min="0"
                value={formData.impactFactor}
                onChange={(event) => handleInputChange("impactFactor", event.target.value)}
                className={inputClass()}
                placeholder="Effect on publication"
              />
            </div>

            <div>
              <label htmlFor="journalHIndex" className="block text-sm font-medium text-slate-700 mb-2">
                Journal H-index
              </label>
              <input
                id="journalHIndex"
                type="number"
                min="0"
                value={formData.journalHIndex}
                onChange={(event) => handleInputChange("journalHIndex", event.target.value)}
                className={inputClass()}
                placeholder="Enter journal H-index"
              />
            </div>

            <div>
              <label htmlFor="scientificJournalRankings" className="block text-sm font-medium text-slate-700 mb-2">
                Scientific Journal Rankings <RequiredAst />
              </label>
              <select
                id="scientificJournalRankings"
                value={formData.scientificJournalRankings}
                onChange={(event) => handleInputChange("scientificJournalRankings", event.target.value)}
                className={selectClass(errors.scientificJournalRankings)}
              >
                <option value="">Select ranking</option>
                {rankingOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.scientificJournalRankings ? <p className="mt-2 text-sm text-red-600">{errors.scientificJournalRankings}</p> : null}
            </div>

            <div>
              <label htmlFor="indexing" className="block text-sm font-medium text-slate-700 mb-2">
                Indexing <RequiredAst />
              </label>
              <select
                id="indexing"
                value={formData.indexing}
                onChange={(event) => handleInputChange("indexing", event.target.value)}
                className={selectClass(errors.indexing)}
              >
                <option value="">Select indexing</option>
                {indexingOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.indexing ? <p className="mt-2 text-sm text-red-600">{errors.indexing}</p> : null}
            </div>

            {formData.indexing === "OTHERS" && (
              <div className="lg:col-span-2">
                <label htmlFor="otherIndexing" className="block text-sm font-medium text-slate-700 mb-2">
                  If Others, Please Specify <RequiredAst />
                </label>
                <input
                  id="otherIndexing"
                  value={formData.otherIndexing}
                  onChange={(event) => handleInputChange("otherIndexing", event.target.value)}
                  type="text"
                  className={inputClass(errors.otherIndexing)}
                  placeholder="Specify other indexing"
                />
                {errors.otherIndexing ? <p className="mt-2 text-sm text-red-600">{errors.otherIndexing}</p> : null}
              </div>
            )}

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mapped SDGs <RequiredAst />
              </label>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sdgGoals.map((goal) => (
                  <label
                    key={goal.id}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      value={goal.id}
                      checked={selectedSdgGoalIds.includes(goal.id)}
                      onChange={() => toggleSdgGoal(goal.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-700">{`${goal.goal_index} – ${goal.goal_name}`}</span>
                  </label>
                ))}
              </div>
              {errors.sdgGoals ? <p className="mt-2 text-sm text-red-600">{errors.sdgGoals}</p> : null}
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="articleWebLink" className="block text-sm font-medium text-slate-700 mb-2">
                Article Web Link
              </label>
              <input
                id="articleWebLink"
                value={formData.articleWebLink}
                onChange={(event) => handleInputChange("articleWebLink", event.target.value)}
                type="url"
                className={inputClass()}
                placeholder="Enter article web link"
              />
            </div>

            <div>
              <label htmlFor="doi" className="block text-sm font-medium text-slate-700 mb-2">
                DOI
              </label>
              <input
                id="doi"
                value={formData.doi}
                onChange={(event) => handleInputChange("doi", event.target.value)}
                type="text"
                className={inputClass()}
              />
            </div>

            <div>
              <label htmlFor="volumeArtNo" className="block text-sm font-medium text-slate-700 mb-2">
                Volume / Art No.
              </label>
              <input
                id="volumeArtNo"
                value={formData.volumeArtNo}
                onChange={(event) => handleInputChange("volumeArtNo", event.target.value)}
                type="text"
                className={inputClass()}
              />
            </div>

            <div>
              <label htmlFor="issueNo" className="block text-sm font-medium text-slate-700 mb-2">
                Issue No.
              </label>
              <input
                id="issueNo"
                value={formData.issueNo}
                onChange={(event) => handleInputChange("issueNo", event.target.value)}
                type="text"
                className={inputClass()}
              />
            </div>

            <div>
              <label htmlFor="pageNumberFromTo" className="block text-sm font-medium text-slate-700 mb-2">
                Page Number From - To
              </label>
              <input
                id="pageNumberFromTo"
                value={formData.pageNumberFromTo}
                onChange={(event) => handleInputChange("pageNumberFromTo", event.target.value)}
                type="text"
                className={inputClass()}
                placeholder="e.g. 123-130"
              />
            </div>

            <div>
              <label htmlFor="issn" className="block text-sm font-medium text-slate-700 mb-2">
                ISSN
              </label>
              <input
                id="issn"
                value={formData.issn}
                onChange={(event) => handleInputChange("issn", event.target.value)}
                type="text"
                className={inputClass()}
              />
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="claimedBy" className="block text-sm font-medium text-slate-700 mb-2">
                Claimed By
              </label>
              <input
                id="claimedBy"
                value={formData.claimedBy}
                onChange={(event) => handleInputChange("claimedBy", event.target.value)}
                type="text"
                className={inputClass()}
                placeholder="Faculty name & ID"
              />
            </div>

            <div>
              <label htmlFor="authorPosition" className="block text-sm font-medium text-slate-700 mb-2">
                Author Position <RequiredAst />
              </label>
              <select
                id="authorPosition"
                value={formData.authorPosition}
                onChange={(event) => handleInputChange("authorPosition", event.target.value)}
                className={selectClass(errors.authorPosition)}
              >
                <option value="">Select author position</option>
                {authorPositionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.authorPosition ? <p className="mt-2 text-sm text-red-600">{errors.authorPosition}</p> : null}
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="annaUniversityAnnexure" className="block text-sm font-medium text-slate-700 mb-2">
                Currently Listed in Anna University Annexure
              </label>
              <select
                id="annaUniversityAnnexure"
                value={formData.annaUniversityAnnexure}
                onChange={(event) => handleInputChange("annaUniversityAnnexure", event.target.value)}
                className={selectClass()}
              >
                <option value="">Select option</option>
                {annexureOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="documentProof" className="block text-sm font-medium text-slate-700 mb-2">
                Upload Document Proof <RequiredAst />
              </label>
              <input
                id="documentProof"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
              />
              {fileName ? <p className="mt-2 text-sm text-slate-500">Selected file: {fileName}</p> : null}
              {errors.documentProof ? <p className="mt-2 text-sm text-red-600">{errors.documentProof}</p> : null}
            </div>
          </div>

          {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/faculty/r-and-d/journal-publications/published"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Published List
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save Published Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
