"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
	BookOpen,
	Check,
	ChevronRight,
	Clock,
	Database,
	ExternalLink,
	Link as LinkIcon,
	MoreHorizontal,
	Plus,
	Search,
	SlidersHorizontal,
	UploadCloud,
	X,
} from "lucide-react";

type OnlineCourseSubmission = {
	id: number;
	task_id: string;
	special_labs_involved: "yes" | "no";
	special_lab: string | null;
	mode_of_course: "Online" | "Offline" | "Hybrid";
	course_type: string;
	other_course_type: string | null;
	type_of_organizer: "Private" | "Government";
	course_name: string;
	organization_name: string;
	organization_address: string;
	level_of_event: "State" | "National" | "International";
	duration_unit: "Hours" | "Weeks" | "Days";
	number_of_hours: number | null;
	number_of_weeks: number | null;
	number_of_days: number | null;
	start_date: string;
	end_date: string;
	course_category:
		| "Proctored-Exam"
		| "Self-paced with final assessment"
		| "Self-paced without final assessment";
	date_of_examination: string | null;
	grade_obtained: string | null;
	is_approved_fdp: "yes" | "no";
	type_of_sponsorship: "Self" | "BIT" | "Funding Agency";
	funding_agency_name: string | null;
	claimed_for: "FAP" | "Competency" | "Not-Applicable";
	marksheet_proof_url: string | null;
	fdp_proof_url: string | null;
	apex_proof_url: string | null;
	certificate_proof_url: string;
	iqac_verification: "Initiated" | "Approved" | "Declined";
	created_at: string;
	updated_at: string;
};

type SpecialLab = {
	id: number;
	special_lab_code: string;
	name: string;
	is_active: boolean;
};

type FormState = {
	taskID: string;
	specialLabsInvolved: "yes" | "no";
	specialLab: string;
	modeOfCourse: "" | "Online" | "Offline" | "Hybrid";
	courseType: string;
	otherCourseType: string;
	typeOfOrganizer: "" | "Private" | "Government";
	courseName: string;
	organizationName: string;
	organizationAddress: string;
	levelOfEvent: "" | "State" | "National" | "International";
	duration: "" | "Hours" | "Weeks" | "Days";
	numberOfHours: string;
	numberOfWeeks: string;
	numberOfDays: string;
	startDate: string;
	endDate: string;
	courseCategory:
		| ""
		| "Proctored-Exam"
		| "Self-paced with final assessment"
		| "Self-paced without final assessment";
	dateOfExamination: string;
	gradeObtained: string;
	isApprovedFDP: "yes" | "no";
	typeOfSponsorship: "" | "Self" | "BIT" | "Funding Agency";
	fundingAgencyName: string;
	claimedFor: "" | "FAP" | "Competency" | "Not-Applicable";
	iqacVerification: "Initiated" | "Approved" | "Declined";
};

const INITIAL_FORM: FormState = {
	taskID: "",
	specialLabsInvolved: "no",
	specialLab: "",
	modeOfCourse: "",
	courseType: "",
	otherCourseType: "",
	typeOfOrganizer: "",
	courseName: "",
	organizationName: "",
	organizationAddress: "",
	levelOfEvent: "",
	duration: "",
	numberOfHours: "",
	numberOfWeeks: "",
	numberOfDays: "",
	startDate: "",
	endDate: "",
	courseCategory: "",
	dateOfExamination: "",
	gradeObtained: "",
	isApprovedFDP: "no",
	typeOfSponsorship: "",
	fundingAgencyName: "",
	claimedFor: "",
	iqacVerification: "Initiated",
};

const STEPS = [
	{ id: 1, label: "Basic info" },
	{ id: 2, label: "Course details" },
	{ id: 3, label: "Assessment" },
	{ id: 4, label: "Documents" },
];

const TYPE_COLORS: Record<string, string> = {
	SWAYAM: "bg-violet-50 text-violet-700 border border-violet-200",
	NPTEL: "bg-blue-50 text-blue-700 border border-blue-200",
	COURSERA: "bg-orange-50 text-orange-700 border border-orange-200",
	UDEMY: "bg-teal-50 text-teal-700 border border-teal-200",
};

const STATUS_MAP: Record<OnlineCourseSubmission["iqac_verification"], { cls: string; dot: string }> = {
	Approved: { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
	Declined: { cls: "bg-red-50 text-red-700 border border-red-200", dot: "bg-red-500" },
	Initiated: { cls: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-400" },
};

const fmtDate = (d?: string | null) => {
	if (!d) return "-";
	const parsed = new Date(d);
	if (Number.isNaN(parsed.getTime())) return "-";
	return parsed.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const fmtDateLong = (d?: string | null) => {
	if (!d) return "-";
	const parsed = new Date(d);
	if (Number.isNaN(parsed.getTime())) return "-";
	return parsed.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
};

const fmtDateTime = (d?: string | null) => {
	if (!d) return "-";
	const parsed = new Date(d);
	if (Number.isNaN(parsed.getTime())) return "-";
	return parsed.toLocaleString("en-IN", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const toPositiveIntOrNull = (value: string) => {
	if (!value.trim()) return null;
	const n = Number(value);
	if (!Number.isFinite(n) || n <= 0) return null;
	return Math.floor(n);
};

const matchesSearch = (record: OnlineCourseSubmission, searchTerm: string) => {
	const query = searchTerm.trim().toLowerCase();
	if (!query) return true;
	return [
		record.task_id,
		record.course_name,
		record.course_type,
		record.organization_name,
		record.level_of_event,
		record.type_of_sponsorship,
		record.claimed_for,
		record.iqac_verification,
		String(record.id),
	]
		.filter(Boolean)
		.some((value) => String(value).toLowerCase().includes(query));
};

export default function CreateOnlineCoursePage() {
	const [form, setForm] = useState<FormState>(INITIAL_FORM);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [records, setRecords] = useState<OnlineCourseSubmission[]>([]);
	const [specialLabs, setSpecialLabs] = useState<SpecialLab[]>([]);
	const [recordsLoading, setRecordsLoading] = useState(true);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [activeStep, setActiveStep] = useState(1);
	const [selected, setSelected] = useState<OnlineCourseSubmission | null>(null);
	const [submitMode, setSubmitMode] = useState<"close" | "stay">("close");
	const [files, setFiles] = useState<{
		markSheetProof: File | null;
		fdpProof: File | null;
		apexProof: File | null;
		certificateProof: File | null;
	}>({
		markSheetProof: null,
		fdpProof: null,
		apexProof: null,
		certificateProof: null,
	});

	const showSpecialLab = form.specialLabsInvolved === "yes";
	const showOtherCourseType = form.courseType.trim().toLowerCase() === "other";
	const showExamFields =
		form.courseCategory === "Proctored-Exam" ||
		form.courseCategory === "Self-paced with final assessment";
	const showFdpProof = form.isApprovedFDP === "yes";
	const showApexProof = form.typeOfSponsorship === "BIT";
	const showFundingAgencyName = form.typeOfSponsorship === "Funding Agency";
	const filteredRecords = useMemo(
		() => records.filter((record) => matchesSearch(record, searchTerm)),
		[records, searchTerm],
	);

	const loadRecords = async () => {
		const response = await fetch("http://localhost:5000/api/online-course", { cache: "no-store" });
		const text = await response.text();
		const payload = text ? JSON.parse(text) : {};
		if (!response.ok) {
			throw new Error(payload?.error || `Failed to load records (${response.status})`);
		}
		return (payload?.submissions || []) as OnlineCourseSubmission[];
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [submissionRes, specialLabsRes] = await Promise.all([
					loadRecords(),
					fetch("http://localhost:5000/api/internship-report/special-labs", { cache: "no-store" }),
				]);

				const labsText = await specialLabsRes.text();
				const labsPayload = labsText ? JSON.parse(labsText) : {};
				if (!specialLabsRes.ok) {
					throw new Error(labsPayload?.error || `Failed to load special labs (${specialLabsRes.status})`);
				}

				setRecords(submissionRes);
				setSpecialLabs(Array.isArray(labsPayload?.specialLabs) ? labsPayload.specialLabs : []);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load data");
			} finally {
				setRecordsLoading(false);
			}
		};

		fetchData();
	}, []);

	const handleChange = (
		e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;

		if (name === "specialLabsInvolved") {
			setForm((prev) => ({
				...prev,
				specialLabsInvolved: value as "yes" | "no",
				specialLab: value === "yes" ? prev.specialLab : "",
			}));
			setError(null);
			return;
		}

		if (name === "duration") {
			setForm((prev) => ({
				...prev,
				duration: value as FormState["duration"],
				numberOfHours: value === "Hours" ? prev.numberOfHours : "",
				numberOfWeeks: value === "Weeks" ? prev.numberOfWeeks : "",
				numberOfDays: value === "Days" ? prev.numberOfDays : "",
			}));
			setError(null);
			return;
		}

		if (name === "typeOfSponsorship") {
			setForm((prev) => ({
				...prev,
				typeOfSponsorship: value as FormState["typeOfSponsorship"],
				fundingAgencyName: value === "Funding Agency" ? prev.fundingAgencyName : "",
			}));
			setFiles((prev) => ({
				...prev,
				apexProof: value === "BIT" ? prev.apexProof : null,
			}));
			setError(null);
			return;
		}

		if (name === "courseCategory") {
			const nextCategory = value as FormState["courseCategory"];
			const shouldShowExamFields =
				nextCategory === "Proctored-Exam" ||
				nextCategory === "Self-paced with final assessment";
			setForm((prev) => ({
				...prev,
				courseCategory: nextCategory,
				dateOfExamination: shouldShowExamFields ? prev.dateOfExamination : "",
				gradeObtained: shouldShowExamFields ? prev.gradeObtained : "",
			}));
			setFiles((prev) => ({
				...prev,
				markSheetProof: shouldShowExamFields ? prev.markSheetProof : null,
			}));
			setError(null);
			return;
		}

		if (name === "isApprovedFDP") {
			setForm((prev) => ({
				...prev,
				isApprovedFDP: value as "yes" | "no",
			}));
			setFiles((prev) => ({
				...prev,
				fdpProof: value === "yes" ? prev.fdpProof : null,
			}));
			setError(null);
			return;
		}

		setForm((prev) => ({ ...prev, [name]: value }));
		setError(null);
	};

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, files: fileList } = e.target;
		if (!fileList || !fileList[0]) return;
		setFiles((prev) => ({ ...prev, [name]: fileList[0] }));
		setError(null);
	};

	const handleCancel = () => {
		setShowCreateForm(false);
		setForm(INITIAL_FORM);
		setFiles({ markSheetProof: null, fdpProof: null, apexProof: null, certificateProof: null });
		setError(null);
		setSuccess(false);
		setActiveStep(1);
	};

	const validate = () => {
		if (!form.taskID.trim()) return "Task ID is required";
		if (!form.modeOfCourse) return "Mode of course is required";
		if (!form.courseType.trim()) return "Course type is required";
		if (showOtherCourseType && !form.otherCourseType.trim()) return "Please specify other course type";
		if (!form.typeOfOrganizer) return "Type of organizer is required";
		if (!form.courseName.trim()) return "Course name is required";
		if (!form.organizationName.trim()) return "Organization name is required";
		if (!form.organizationAddress.trim()) return "Organization address is required";
		if (!form.levelOfEvent) return "Level of event is required";
		if (!form.duration) return "Duration is required";
		if (form.duration === "Hours" && !toPositiveIntOrNull(form.numberOfHours)) return "Number of hours is required";
		if (form.duration === "Weeks" && !toPositiveIntOrNull(form.numberOfWeeks)) return "Number of weeks is required";
		if (form.duration === "Days" && !toPositiveIntOrNull(form.numberOfDays)) return "Number of days is required";
		if (!form.startDate) return "Start date is required";
		if (!form.endDate) return "End date is required";
		if (new Date(form.startDate) > new Date(form.endDate)) return "Start date cannot be after end date";
		if (!form.courseCategory) return "Course category is required";
		if (showExamFields) {
			if (!form.dateOfExamination) return "Date of examination is required";
			if (!form.gradeObtained.trim()) return "Grade obtained is required";
			if (!files.markSheetProof) return "Mark sheet proof is required";
		}
		if (showSpecialLab && !form.specialLab.trim()) return "Special lab is required";
		if (!form.typeOfSponsorship) return "Type of sponsorship is required";
		if (showApexProof && !files.apexProof) return "Apex proof is required when sponsorship is BIT";
		if (showFundingAgencyName && !form.fundingAgencyName.trim()) {
			return "Funding agency name is required";
		}
		if (!form.claimedFor) return "Claimed for is required";
		if (showFdpProof && !files.fdpProof) return "FDP proof is required when FDP is approved";
		if (!files.certificateProof) return "Certificate proof is required";
		return null;
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const validationError = validate();
			if (validationError) {
				setError(validationError);
				setLoading(false);
				return;
			}

			const formData = new FormData();
			formData.append("taskID", form.taskID.trim());
			formData.append("specialLabsInvolved", form.specialLabsInvolved);
			if (form.specialLabsInvolved === "yes") {
				formData.append("specialLab", form.specialLab.trim());
			}
			formData.append("modeOfCourse", form.modeOfCourse);
			formData.append("courseType", form.courseType.trim());
			if (showOtherCourseType) {
				formData.append("otherCourseType", form.otherCourseType.trim());
			}
			formData.append("typeOfOrganizer", form.typeOfOrganizer);
			formData.append("courseName", form.courseName.trim());
			formData.append("organizationName", form.organizationName.trim());
			formData.append("organizationAddress", form.organizationAddress.trim());
			formData.append("levelOfEvent", form.levelOfEvent);
			formData.append("duration", form.duration);
			if (form.duration === "Hours") formData.append("numberOfHours", String(toPositiveIntOrNull(form.numberOfHours)));
			if (form.duration === "Weeks") formData.append("numberOfWeeks", String(toPositiveIntOrNull(form.numberOfWeeks)));
			if (form.duration === "Days") formData.append("numberOfDays", String(toPositiveIntOrNull(form.numberOfDays)));
			formData.append("startDate", form.startDate);
			formData.append("endDate", form.endDate);
			formData.append("courseCategory", form.courseCategory);
			if (showExamFields) {
				formData.append("dateOfExamination", form.dateOfExamination);
				formData.append("gradeObtained", form.gradeObtained.trim());
				formData.append("markSheetProof", files.markSheetProof as File);
			}
			formData.append("isApprovedFDP", form.isApprovedFDP);
			if (showFdpProof) {
				formData.append("fdpProof", files.fdpProof as File);
			}
			formData.append("typeOfSponsorship", form.typeOfSponsorship);
			if (showApexProof) {
				formData.append("apexProof", files.apexProof as File);
			}
			if (showFundingAgencyName) {
				formData.append("fundingAgencyName", form.fundingAgencyName.trim());
			}
			formData.append("claimedFor", form.claimedFor);
			formData.append("certificateProof", files.certificateProof as File);
			formData.append("iqacVerification", form.iqacVerification);

			const response = await fetch("http://localhost:5000/api/online-course", {
				method: "POST",
				body: formData,
			});
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data?.error || "Failed to create online course submission");
			}

			const refreshed = await loadRecords();
			setRecords(refreshed);
			setSuccess(true);
			setForm(INITIAL_FORM);
			setFiles({ markSheetProof: null, fdpProof: null, apexProof: null, certificateProof: null });

			if (submitMode === "close") {
				setTimeout(() => {
					setShowCreateForm(false);
					setSuccess(false);
					setActiveStep(1);
				}, 1000);
			} else {
				setActiveStep(1);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	if (!showCreateForm) {
		return (
			<div className="min-h-screen bg-gray-50/70 p-4 sm:p-6 lg:p-8">
				<div className="mx-auto max-w-7xl space-y-4">
					<nav className="flex items-center gap-1.5 text-xs text-gray-400">
						<span className="font-medium text-gray-500">Resources</span>
						<ChevronRight size={13} className="text-gray-300" />
						<span className="font-semibold text-indigo-600">Online Course</span>
					</nav>

					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<h1 className="text-xl font-semibold text-gray-900 tracking-tight">Online Course Submissions</h1>
							<p className="mt-0.5 text-xs text-gray-500">Manage and track online course records</p>
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
						<div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
							<div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 min-w-[220px]">
								<Search size={13} className="text-gray-400 shrink-0" />
								<input
									type="text"
									placeholder="Search by course, task, status..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
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
								<p className="text-xs text-gray-400">Loading records...</p>
							</div>
						) : filteredRecords.length === 0 ? (
							<div className="flex min-h-[340px] flex-col items-center justify-center gap-3 px-4 py-12 text-center">
								<div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100">
									<Database size={22} className="text-gray-300" />
								</div>
								<div>
									<p className="text-sm font-medium text-gray-600">No online course records found</p>
									<p className="mt-0.5 text-xs text-gray-400">
										{searchTerm.trim()
											? "Try a different search term."
											: "Get started by creating your first online course submission."}
									</p>
								</div>
								<button
									type="button"
									onClick={() => setShowCreateForm(true)}
									className="mt-1 flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
								>
									<Plus size={13} />
									Create Online Course
								</button>
							</div>
						) : (
							<>
								<div className="overflow-x-auto">
									<table className="w-full text-xs">
										<thead>
											<tr className="border-b border-gray-100 bg-gray-50/80">
												{[
													"Task / Course",
													"Mode",
													"Category",
													"Organizer",
													"Duration",
													"Sponsorship",
													"Claimed For",
													"Start",
													"End",
													"Status",
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
											{filteredRecords.map((record) => {
												const s = STATUS_MAP[record.iqac_verification];
												return (
													<tr
														key={record.id}
														onClick={() => setSelected(record)}
														className="group hover:bg-indigo-50/40 cursor-pointer transition-colors"
													>
														<td className="px-4 py-3.5 max-w-[220px]">
															<p className="font-semibold text-gray-800 leading-tight truncate">{record.course_name}</p>
															<p className="text-gray-400 mt-0.5 truncate">Task: {record.task_id}</p>
															<p className="text-gray-300 mt-0.5 text-[10px]">#{record.id}</p>
														</td>
														<td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{record.mode_of_course}</td>
														<td className="px-4 py-3.5 max-w-[210px]">
															<span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap bg-slate-100 text-slate-700 border border-slate-200">
																{record.course_category}
															</span>
														</td>
														<td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{record.type_of_organizer}</td>
														<td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
															{record.duration_unit === "Hours"
																? `${record.number_of_hours ?? "-"}h`
																: record.duration_unit === "Weeks"
																	? `${record.number_of_weeks ?? "-"}w`
																	: `${record.number_of_days ?? "-"}d`}
														</td>
														<td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{record.type_of_sponsorship}</td>
														<td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{record.claimed_for}</td>
														<td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{fmtDate(record.start_date)}</td>
														<td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{fmtDate(record.end_date)}</td>
														<td className="px-4 py-3.5">
															<span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.cls}`}>
																<span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
																{record.iqac_verification}
															</span>
														</td>
														<td className="px-3 py-3.5 text-right">
															<ChevronRight
																size={14}
																className="text-gray-300 group-hover:text-indigo-400 transition-colors inline-block"
															/>
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>

								{selected && (
									<>
										<div
											onClick={() => setSelected(null)}
											className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150"
										/>
										<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
											<div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
												<div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
													<div className="min-w-0 pr-4">
														<p className="text-base font-bold text-gray-900 leading-snug">{selected.course_name}</p>
														<p className="text-sm text-gray-400 mt-0.5">Task {selected.task_id} · Record #{selected.id}</p>
														<div className="flex flex-wrap gap-1.5 mt-2.5">
															<span
																className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_MAP[selected.iqac_verification].cls}`}
															>
																<span
																	className={`w-1.5 h-1.5 rounded-full ${STATUS_MAP[selected.iqac_verification].dot}`}
																/>
																{selected.iqac_verification}
															</span>
															<span
																className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${TYPE_COLORS[selected.course_type.toUpperCase()] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}
															>
																{selected.course_type}
															</span>
														</div>
													</div>
													<button
														onClick={() => setSelected(null)}
														className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
													>
														<X size={16} />
													</button>
												</div>

												<div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
													<ModalSection title="Course & Organizer">
														<div className="grid grid-cols-2 gap-3">
															<InfoCell label="Mode" value={selected.mode_of_course} />
															<InfoCell label="Course Type" value={selected.course_type} />
															<InfoCell label="Organizer Type" value={selected.type_of_organizer} />
															<InfoCell label="Organization" value={selected.organization_name} />
															<InfoCell label="Organization Address" value={selected.organization_address} />
															<InfoCell label="Level" value={selected.level_of_event} />
															<InfoCell label="Special Lab Involved" value={selected.special_labs_involved.toUpperCase()} />
															<InfoCell label="Special Lab" value={selected.special_lab ?? "-"} />
														</div>
													</ModalSection>

													<ModalSection title="Timeline & Assessment">
														<div className="grid grid-cols-2 gap-3">
															<InfoCell label="Start Date" value={fmtDateLong(selected.start_date)} />
															<InfoCell label="End Date" value={fmtDateLong(selected.end_date)} />
															<InfoCell label="Exam Date" value={fmtDateLong(selected.date_of_examination)} />
															<InfoCell label="Grade" value={selected.grade_obtained ?? "-"} />
															<InfoCell label="Course Category" value={selected.course_category} />
															<InfoCell
																label="Duration"
																value={
																	selected.duration_unit === "Hours"
																		? `${selected.number_of_hours ?? "-"} Hours`
																		: selected.duration_unit === "Weeks"
																			? `${selected.number_of_weeks ?? "-"} Weeks`
																			: `${selected.number_of_days ?? "-"} Days`
																}
															/>
														</div>
													</ModalSection>

													<ModalSection title="Sponsorship & Verification">
														<div className="grid grid-cols-2 gap-3">
															<InfoCell label="FDP Approved" value={selected.is_approved_fdp.toUpperCase()} />
															<InfoCell label="Sponsorship" value={selected.type_of_sponsorship} />
															<InfoCell label="Funding Agency" value={selected.funding_agency_name ?? "-"} />
															<InfoCell label="Claimed For" value={selected.claimed_for} />
															<InfoCell label="IQAC" value={selected.iqac_verification} />
															<InfoCell label="Created At" value={fmtDateTime(selected.created_at)} />
														</div>
													</ModalSection>

													<ModalSection title="Proof Files">
														<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
															<ProofLinkCard label="Certificate Proof" url={selected.certificate_proof_url} />
															<ProofLinkCard label="Mark Sheet Proof" url={selected.marksheet_proof_url} />
															<ProofLinkCard label="FDP Proof" url={selected.fdp_proof_url} />
															<ProofLinkCard label="Apex Proof" url={selected.apex_proof_url} />
														</div>
													</ModalSection>
												</div>

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

	return (
		<div className="min-h-screen bg-gray-50/70 p-4 sm:p-6 lg:p-8">
			<div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
				<div className="border-b border-gray-100 px-6 py-5 sm:px-8">
					<nav className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400 mb-4">
						<span className="font-medium">Resources</span>
						<ChevronRight size={12} className="text-gray-300" />
						<button
							type="button"
							onClick={handleCancel}
							className="font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
						>
							Online Course
						</button>
						<ChevronRight size={12} className="text-gray-300" />
						<span className="font-semibold text-gray-700">Create Record</span>
					</nav>

					<div className="flex items-start justify-between gap-4 mb-5">
						<div>
							<h1 className="text-lg font-semibold text-gray-900 tracking-tight">Create Online Course</h1>
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

				{error && (
					<div className="mx-6 mt-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
						<X size={14} className="mt-0.5 shrink-0 text-red-500" />
						<p className="text-xs font-medium text-red-700">{error}</p>
					</div>
				)}
				{success && (
					<div className="mx-6 mt-5 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
						<Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
						<p className="text-xs font-medium text-emerald-700">Online course submission created successfully.</p>
					</div>
				)}

				<form onSubmit={handleSubmit} className="px-6 py-6 sm:px-8 sm:py-7 space-y-7">
					<FormSection icon={<BookOpen size={14} />} title="Basic information" onActivate={() => setActiveStep(1)}>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<InputField
								label="Task ID"
								required
								name="taskID"
								value={form.taskID}
								placeholder="Enter task ID"
								onChange={handleChange}
							/>

							<div>
								<label className="mb-1.5 block text-xs font-medium text-gray-700">Special labs involved</label>
								<div className="flex gap-5 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
									<label className="flex items-center gap-1.5 text-sm text-gray-700">
										<input
											type="radio"
											name="specialLabsInvolved"
											value="yes"
											checked={form.specialLabsInvolved === "yes"}
											onChange={handleChange}
										/>
										Yes
									</label>
									<label className="flex items-center gap-1.5 text-sm text-gray-700">
										<input
											type="radio"
											name="specialLabsInvolved"
											value="no"
											checked={form.specialLabsInvolved === "no"}
											onChange={handleChange}
										/>
										No
									</label>
								</div>
							</div>

							{showSpecialLab && (
								<SelectField
									label="Special lab"
									required
									name="specialLab"
									value={form.specialLab}
									options={specialLabs.map((l) => l.name)}
									placeholder="Choose special lab"
									onChange={handleChange}
								/>
							)}

							<SelectField
								label="Mode of course"
								required
								name="modeOfCourse"
								value={form.modeOfCourse}
								options={["Online", "Offline", "Hybrid"]}
								placeholder="Choose mode"
								onChange={handleChange}
							/>
						</div>
					</FormSection>

					<FormSection icon={<BookOpen size={14} />} title="Course details" onActivate={() => setActiveStep(2)}>
						<div className="space-y-4">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<InputField
									label="Course type"
									required
									name="courseType"
									value={form.courseType}
									placeholder="e.g. SWAYAM, NPTEL, COURSERA, Other"
									onChange={handleChange}
								/>
								<InputField
									label="Course name"
									required
									name="courseName"
									value={form.courseName}
									placeholder="Enter course name"
									onChange={handleChange}
								/>
							</div>

							{showOtherCourseType && (
								<InputField
									label="Other course type"
									required
									name="otherCourseType"
									value={form.otherCourseType}
									placeholder="Specify other course type"
									onChange={handleChange}
								/>
							)}

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<SelectField
									label="Type of organizer"
									required
									name="typeOfOrganizer"
									value={form.typeOfOrganizer}
									options={["Private", "Government"]}
									placeholder="Choose organizer"
									onChange={handleChange}
								/>
								<SelectField
									label="Level of event"
									required
									name="levelOfEvent"
									value={form.levelOfEvent}
									options={["State", "National", "International"]}
									placeholder="Choose level"
									onChange={handleChange}
								/>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<InputField
									label="Organization name"
									required
									name="organizationName"
									value={form.organizationName}
									placeholder="Enter organization name"
									onChange={handleChange}
								/>
								<SelectField
									label="Duration unit"
									required
									name="duration"
									value={form.duration}
									options={["Hours", "Weeks", "Days"]}
									placeholder="Choose duration"
									onChange={handleChange}
								/>
							</div>

							<div>
								<label className="mb-1.5 block text-xs font-medium text-gray-700">
									Organization address <span className="ml-0.5 text-red-500">*</span>
								</label>
								<textarea
									name="organizationAddress"
									value={form.organizationAddress}
									onChange={handleChange}
									rows={3}
									className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
									placeholder="Enter organization address"
								/>
							</div>

							{form.duration === "Hours" && (
								<InputField
									label="Number of hours"
									required
									type="number"
									name="numberOfHours"
									value={form.numberOfHours}
									min="1"
									onChange={handleChange}
								/>
							)}
							{form.duration === "Weeks" && (
								<InputField
									label="Number of weeks"
									required
									type="number"
									name="numberOfWeeks"
									value={form.numberOfWeeks}
									min="1"
									onChange={handleChange}
								/>
							)}
							{form.duration === "Days" && (
								<InputField
									label="Number of days"
									required
									type="number"
									name="numberOfDays"
									value={form.numberOfDays}
									min="1"
									onChange={handleChange}
								/>
							)}

							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<InputField label="Start date" required type="date" name="startDate" value={form.startDate} onChange={handleChange} />
								<InputField label="End date" required type="date" name="endDate" value={form.endDate} onChange={handleChange} />
							</div>
						</div>
					</FormSection>

					<FormSection icon={<Clock size={14} />} title="Assessment" onActivate={() => setActiveStep(3)}>
						<div className="space-y-4">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<SelectField
									label="Course category"
									required
									name="courseCategory"
									value={form.courseCategory}
									options={[
										"Proctored-Exam",
										"Self-paced with final assessment",
										"Self-paced without final assessment",
									]}
									placeholder="Choose category"
									onChange={handleChange}
								/>
								<SelectField
									label="Claimed for"
									required
									name="claimedFor"
									value={form.claimedFor}
									options={["FAP", "Competency", "Not-Applicable"]}
									placeholder="Choose claim"
									onChange={handleChange}
								/>
							</div>

							{showExamFields && (
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2 animate-in fade-in slide-in-from-top-1 duration-150">
									<InputField
										label="Date of examination"
										required
										type="date"
										name="dateOfExamination"
										value={form.dateOfExamination}
										onChange={handleChange}
									/>
									<InputField
										label="Grade obtained"
										required
										name="gradeObtained"
										value={form.gradeObtained}
										placeholder="Enter grade"
										onChange={handleChange}
									/>
								</div>
							)}
						</div>
					</FormSection>

					<FormSection icon={<UploadCloud size={14} />} title="Documents & verification" onActivate={() => setActiveStep(4)}>
						<div className="space-y-4">
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<SelectField
									label="FDP approved"
									required
									name="isApprovedFDP"
									value={form.isApprovedFDP}
									options={["yes", "no"]}
									onChange={handleChange}
								/>
								<SelectField
									label="Type of sponsorship"
									required
									name="typeOfSponsorship"
									value={form.typeOfSponsorship}
									options={["Self", "BIT", "Funding Agency"]}
									placeholder="Choose sponsorship"
									onChange={handleChange}
								/>
							</div>

							{showFundingAgencyName && (
								<InputField
									label="Funding agency name"
									required
									name="fundingAgencyName"
									value={form.fundingAgencyName}
									placeholder="Enter funding agency"
									onChange={handleChange}
								/>
							)}

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FileField
									label="Certificate proof"
									required
									name="certificateProof"
									onChange={handleFileChange}
									fileName={files.certificateProof?.name}
								/>

								{showExamFields && (
									<FileField
										label="Mark sheet proof"
										required
										name="markSheetProof"
										onChange={handleFileChange}
										fileName={files.markSheetProof?.name}
									/>
								)}

								{showFdpProof && (
									<FileField
										label="FDP proof"
										required
										name="fdpProof"
										onChange={handleFileChange}
										fileName={files.fdpProof?.name}
									/>
								)}

								{showApexProof && (
									<FileField
										label="Apex proof"
										required
										name="apexProof"
										onChange={handleFileChange}
										fileName={files.apexProof?.name}
									/>
								)}
							</div>

							<div>
								<label className="mb-2 block text-xs font-medium text-gray-700">
									IQAC verification <span className="text-red-500">*</span>
								</label>
								<IqacToggle
									value={form.iqacVerification}
									onChange={(val) => setForm((prev) => ({ ...prev, iqacVerification: val }))}
								/>
							</div>
						</div>
					</FormSection>

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
							type="submit"
							onClick={() => setSubmitMode("stay")}
							disabled={loading}
							className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition-colors disabled:opacity-50"
						>
							Create &amp; Add Another
						</button>
						<button
							type="submit"
							onClick={() => setSubmitMode("close")}
							disabled={loading}
							className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
						>
							{loading ? (
								<>
									<span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
									Creating...
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

function ModalSection({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div>
			<p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">{title}</p>
			{children}
		</div>
	);
}

function InfoCell({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
			<p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
			<div className="text-xs font-semibold text-gray-800 break-words">{value}</div>
		</div>
	);
}

function ProofLinkCard({ label, url }: { label: string; url?: string | null }) {
	return (
		<div className="rounded-xl border border-gray-200 bg-white px-3.5 py-3">
			<p className="text-xs text-gray-500 mb-1">{label}</p>
			{url ? (
				<a
					href={url}
					target="_blank"
					rel="noreferrer"
					className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline break-all"
				>
					Open File
					<ExternalLink size={12} />
				</a>
			) : (
				<p className="text-xs text-gray-400">Not available</p>
			)}
		</div>
	);
}

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

const IQAC_OPTIONS = [
	{
		value: "Initiated",
		label: "Initiated",
		icon: <Clock size={12} />,
		active: "bg-indigo-50 text-indigo-700 border-indigo-300",
		inactive: "border-gray-200 text-gray-500 hover:bg-gray-50",
	},
	{
		value: "Approved",
		label: "Approved",
		icon: <Check size={12} />,
		active: "bg-emerald-50 text-emerald-700 border-emerald-300",
		inactive: "border-gray-200 text-gray-500 hover:bg-gray-50",
	},
	{
		value: "Declined",
		label: "Declined",
		icon: <X size={12} />,
		active: "bg-red-50 text-red-700 border-red-300",
		inactive: "border-gray-200 text-gray-500 hover:bg-gray-50",
	},
] as const;

function IqacToggle({
	value,
	onChange,
}: {
	value: FormState["iqacVerification"];
	onChange: (v: FormState["iqacVerification"]) => void;
}) {
	return (
		<div className="flex gap-2">
			{IQAC_OPTIONS.map((opt) => (
				<button
					key={opt.value}
					type="button"
					onClick={() => onChange(opt.value)}
					className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-colors ${value === opt.value ? opt.active : opt.inactive}`}
				>
					{opt.icon}
					{opt.label}
				</button>
			))}
		</div>
	);
}

type BaseFieldProps = {
	label: string;
	name: string;
	required?: boolean;
};

type InputFieldProps = BaseFieldProps & {
	type?: string;
	value: string;
	placeholder?: string;
	step?: string;
	min?: string;
	max?: string;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

function InputField({
	label,
	name,
	required,
	type = "text",
	value,
	placeholder,
	step,
	min,
	max,
	onChange,
}: InputFieldProps) {
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
				step={step}
				min={min}
				max={max}
				className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
			/>
		</div>
	);
}

type SelectFieldProps = BaseFieldProps & {
	value: string;
	options: string[];
	placeholder?: string;
	onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
};

function SelectField({
	label,
	name,
	required,
	value,
	options,
	placeholder,
	onChange,
}: SelectFieldProps) {
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
				<option value="">{placeholder || "Choose an option"}</option>
				{options.map((option) => (
					<option key={option} value={option}>
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
						fileName ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-500"
					}`}
				>
					{fileName ? <Check size={16} /> : <UploadCloud size={16} />}
				</div>
				<div>
					<p className={`text-xs font-medium ${fileName ? "text-emerald-700" : "text-gray-600 group-hover:text-indigo-600"}`}>
						{fileName ? fileName : "Click to upload or drag & drop"}
					</p>
					{!fileName && <p className="mt-0.5 text-xs text-gray-400">PDF, JPG, PNG, DOC, DOCX</p>}
				</div>
				<input name={name} type="file" className="hidden" onChange={onChange} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
			</label>
		</div>
	);
}

