"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { apiClient } from "@/lib/api";

interface StudentOption {
	id: number;
	student_name: string;
	roll_no?: string | null;
	college_email?: string | null;
	department?: string | null;
}

export default function CreatePatentTrackerPage() {
	const router = useRouter();
	const user = useAuthStore((s) => s.user);

	const [students, setStudents] = useState<StudentOption[]>([]);
	const [studentQuery, setStudentQuery] = useState<string>("");
	const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null);
	const [showStudentSuggestions, setShowStudentSuggestions] = useState(false);

	const [patentTitle, setPatentTitle] = useState("");
	const [patentType, setPatentType] = useState("");
	const [applicants, setApplicants] = useState("");
	const [patentContribution, setPatentContribution] = useState<string>("Applicant");

	// Additional student members (indices 2..10)
	const [memberIds, setMemberIds] = useState<Array<number | null>>(Array(9).fill(null));

	// faculty id (free text - faculty identifier)
	const [facultyId, setFacultyId] = useState<string>("");

	// IQAC verification state (default Initiated)
	const [iqacVerification, setIqacVerification] = useState<string>("Initiated");

	const [hasImageLayout, setHasImageLayout] = useState<string>("No");
	const [imageLayoutFile, setImageLayoutFile] = useState<File | null>(null);

	const [hasDrawings, setHasDrawings] = useState<string>("No");
	const [drawingsFile, setDrawingsFile] = useState<File | null>(null);

	const [formsPrepared, setFormsPrepared] = useState<string>("No");
	const [formsFile, setFormsFile] = useState<File | null>(null);

	const [priorArt, setPriorArt] = useState("");
	const [novelty, setNovelty] = useState("");

	const imageInputRef = useRef<HTMLInputElement | null>(null);
	const drawingsInputRef = useRef<HTMLInputElement | null>(null);
	const formsInputRef = useRef<HTMLInputElement | null>(null);

	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		if (!studentQuery || studentQuery.trim().length === 0) {
			setStudents([]);
			return;
		}

		const timer = window.setTimeout(async () => {
			try {
				const resp = await apiClient.getStudents(studentQuery.trim());
				if (!cancelled) setStudents(resp?.students || []);
			} catch (err) {
				console.error(err);
			}
		}, 200);

		return () => {
			cancelled = true;
			window.clearTimeout(timer);
		};
	}, [studentQuery]);

	// load some students list for member dropdowns on mount
	useEffect(() => {
		let cancelled = false;
		( async () => {
			try {
				const resp = await apiClient.getStudents();
				if (!cancelled) setStudents(resp?.students || []);
			} catch (err) {
				console.error('Failed to load students for dropdowns', err);
			}
		})();

		return () => { cancelled = true };
	}, []);

	const filteredStudents = useMemo(() => {
		const q = studentQuery.trim().toLowerCase();
		if (!q) return [];
		return students
			.filter((s) => {
				const text = [s.student_name, s.roll_no, s.college_email, s.department]
					.filter(Boolean)
					.join(" ")
					.toLowerCase();
				return text.includes(q);
			})
			.slice(0, 50);
	}, [students, studentQuery]);

	const handleStudentSelect = (s: StudentOption) => {
		setSelectedStudent(s);
		setStudentQuery(s.student_name + (s.college_email ? ` (${s.college_email})` : ""));
		setShowStudentSuggestions(false);
	};

	const clearForm = () => {
		setStudentQuery("");
		setSelectedStudent(null);
		setPatentTitle("");
		setPatentType("");
		setApplicants("");
		setHasImageLayout("No");
		setImageLayoutFile(null);
		setHasDrawings("No");
		setDrawingsFile(null);
		setFormsPrepared("No");
		setFormsFile(null);
		setPriorArt("");
		setNovelty("");
		if (imageInputRef.current) imageInputRef.current.value = "";
		if (drawingsInputRef.current) drawingsInputRef.current.value = "";
		if (formsInputRef.current) formsInputRef.current.value = "";
		setMessage(null);
		setError(null);
	};

	const handleSubmit = async (e: React.FormEvent, clearAfter = false) => {
		e.preventDefault();
		setError(null);

		if (!selectedStudent) {
			setError("Please select a student from suggestions.");
			return;
		}

		if (!patentTitle.trim()) {
			setError("Patent title is required.");
			return;
		}

		const formData = new FormData();
		formData.append("student_id", String(selectedStudent.id));
		formData.append("patent_title", patentTitle);
		formData.append("patent_type", patentType);
		formData.append("applicants_involved", applicants);
		formData.append("patent_contribution", patentContribution);
		formData.append("faculty_id", facultyId ?? "");
		formData.append("iqac_verification", iqacVerification ?? "Initiated");

		// append member ids (second..tenth)
		memberIds.forEach((mid, idx) => {
			const key = [`second_student_id`,`third_student_id`,`fourth_student_id`,`fifth_student_id`,`sixth_student_id`,`seventh_student_id`,`eighth_student_id`,`ninth_student_id`,`tenth_student_id`][idx];
			if (mid) formData.append(key, String(mid));
		});
		formData.append("has_image_layout_support", hasImageLayout);
		if (imageLayoutFile) formData.append("experimentationFile", imageLayoutFile);
		formData.append("has_formatted_drawings", hasDrawings);
		if (drawingsFile) formData.append("drawingsFile", drawingsFile);
		formData.append("forms_1_and_2_prepared", formsPrepared);
		if (formsFile) formData.append("formsFile", formsFile);
		formData.append("prior_art", priorArt);
		formData.append("novelty", novelty);

		try {
			setSubmitting(true);
			await apiClient.createPatentTracker(formData);
			setMessage("Patent tracker submitted successfully.");
			if (clearAfter) {
				clearForm();
				return;
			}
			router.push("/student/patent/tracker");
		} catch (err: any) {
			console.error(err);
			setError(err?.response?.data?.error || err?.message || "Submission failed.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="p-6">
			<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold p-2">Create Patent Tracker</h1>
					<p className="text-sm text-slate-500 mt-1">Fill in details and upload related files for patent tracker.</p>
				</div>
				<Link href="/student/patent/tracker" className="btn-outline">Back</Link>
			</div>

			<form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6 mt-6 p-5">
				<div className="card-base p-10 space-y-5">
					{message && <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">{message}</div>}
					{error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="sm:col-span-2 relative">
							<label className="block text-md font-medium text-slate-700 mb-2">Student *</label>
							<input
								type="text"
								value={studentQuery}
								onChange={(e) => { setStudentQuery(e.target.value); setSelectedStudent(null); setShowStudentSuggestions(true); }}
								onFocus={() => setShowStudentSuggestions(true)}
								onBlur={() => setTimeout(() => setShowStudentSuggestions(false), 150)}
								placeholder="Type to search students (selection required)"
								className="input-base w-full"
								autoComplete="off"
							/>
							{showStudentSuggestions && studentQuery.trim().length > 0 && (
								<div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded shadow-lg max-h-56 overflow-auto">
									{filteredStudents.length === 0 ? (
										<div className="p-2 text-xs text-slate-500">No matching students</div>
									) : (
										filteredStudents.map((opt) => (
											<button key={opt.id} type="button" className="w-full text-left px-2 py-1 hover:bg-slate-100" onMouseDown={(e) => e.preventDefault()} onClick={() => handleStudentSelect(opt)}>
												<div className="text-sm font-medium text-slate-700">{opt.student_name}</div>
												<div className="text-xs text-slate-500">{opt.roll_no ? `${opt.roll_no} • ` : ""}{opt.college_email ?? opt.department ?? ""}</div>
											</button>
										))
									)}
								</div>
							)}
							<p className="text-xs text-slate-500">You must select a student from the suggestions to submit.</p>
						</div>

						<div className="sm:col-span-2">
							<label className="block text-sm font-medium text-slate-700 mb-2">Patent Title *</label>
							<input type="text" value={patentTitle} onChange={(e) => setPatentTitle(e.target.value)} placeholder="Patent Title" className="input-base w-full" />
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-700 mb-2">Patent Contribution</label>
							<select value={patentContribution} onChange={(e) => setPatentContribution(e.target.value)} className="input-base w-full">
								<option value="Applicant">Applicant</option>
								<option value="Inventor">Inventor</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-700 mb-2">Patent Type</label>
							<select value={patentType} onChange={(e) => setPatentType(e.target.value)} className="input-base w-full">
								<option value="">Choose an option</option>
								<option value="Product">Product</option>
								<option value="Process">Process</option>
								<option value="Design">Design</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-700 mb-2">Applicants to be involved in the patent application *</label>
							<select value={applicants} onChange={(e) => setApplicants(e.target.value)} className="input-base w-full">
								<option value="">Choose an option</option>
								<option value="BIT students only">BIT-Students-Only</option>
								<option value="BIT student along with faculty">BIT-Student-Along-With-BIT-Faculty</option>
								<option value="BIT student along with external institutions">BIT-Student-Along-With-External</option>
							</select>
						</div>

						{/* If applicants include faculty, show faculty id/text input */}
						{applicants === 'BIT student along with faculty' && (
							<div className="sm:col-span-2">
								<label className="block text-sm font-medium text-slate-700 mb-2">Faculty (ID or name)</label>
								<input type="text" value={facultyId} onChange={(e) => setFacultyId(e.target.value)} placeholder="Faculty ID or name" className="input-base w-full" />
							</div>
						)}

						{/* Additional student member selects (2..10) */}
						{[...Array(9)].map((_, idx) => {
							const labelIndex = idx + 2;
							return (
								<div key={idx} className="sm:col-span-2">
									<label className="block text-sm font-medium text-slate-700 mb-2">{`${labelIndex}th student member, if involved`}</label>
									<select value={memberIds[idx] ?? ''} onChange={(e) => {
										const copy = [...memberIds];
										copy[idx] = e.target.value ? Number(e.target.value) : null;
										setMemberIds(copy);
									}} className="input-base w-full">
										<option value="">Choose an option</option>
										{students.map((s) => (
											<option key={s.id} value={s.id}>{s.student_name}{s.roll_no ? ` • ${s.roll_no}` : ''}</option>
										))}
									</select>
								</div>
							);
						})}

						<div>
							<label className="block text-sm font-medium text-slate-700 mb-2">Is the patent draft supported by image/layout of the experimentation?</label>
							<select value={hasImageLayout} onChange={(e) => setHasImageLayout(e.target.value)} className="input-base w-full">
								<option value="No">No</option>
								<option value="Yes">Yes</option>
							</select>
						</div>

						{hasImageLayout === "Yes" && (
							<div className="sm:col-span-2">
								<label className="block text-sm font-medium text-slate-700">Upload the image and layout of the experimentation *</label>
								<input ref={imageInputRef} type="file" accept="image/*,application/pdf" onChange={(e) => setImageLayoutFile(e.target.files?.[0] ?? null)} className="input-base" />
							</div>
						)}

						<div className="sm:col-span-2">
							<label className="block text-sm font-medium text-slate-700">Prior art(references)</label>
							<textarea value={priorArt} onChange={(e) => setPriorArt(e.target.value)} placeholder="Prior art(references)" className="input-base h-28 w-full" />
						</div>

						<div className="sm:col-span-2">
							<label className="block text-sm font-medium text-slate-700">Novelty</label>
							<textarea value={novelty} onChange={(e) => setNovelty(e.target.value)} placeholder="Novelty" className="input-base h-28 w-full" />
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-700 mb-2">Does the draft involve drawings as per the format of patent draft?</label>
							<select value={hasDrawings} onChange={(e) => setHasDrawings(e.target.value)} className="input-base w-full">
								<option value="No">No</option>
								<option value="Yes">Yes</option>
							</select>
						</div>

						{hasDrawings === "Yes" && (
							<div className="sm:col-span-2">
								<label className="block text-sm font-medium text-slate-700">Upload the drawings *</label>
								<input ref={drawingsInputRef} type="file" accept="application/pdf,image/*" onChange={(e) => setDrawingsFile(e.target.files?.[0] ?? null)} className="input-base" />
							</div>
						)}

						<div>
							<label className="block text-sm font-medium text-slate-700 mb-2">Have form 1 and form 2(specification) of the patent draft been prepared as per the format?</label>
							<select value={formsPrepared} onChange={(e) => setFormsPrepared(e.target.value)} className="input-base w-full">
								<option value="No">No</option>
								<option value="Yes">Yes</option>
							</select>
						</div>

						{formsPrepared === "Yes" && (
							<div className="sm:col-span-2">
								<label className="block text-sm font-medium text-slate-700">Upload the forms *</label>
								<input ref={formsInputRef} type="file" accept="application/pdf" onChange={(e) => setFormsFile(e.target.files?.[0] ?? null)} className="input-base" />
							</div>
						)}
					</div>

					<div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
						<Link href="/student/patent/tracker" className="btn-outline">Cancel</Link>
						<button type="button" onClick={(e) => handleSubmit(e as any, true)} className="btn-secondary" disabled={submitting}>{submitting ? "Submitting..." : "Create & Add Another"}</button>
						<button type="submit" className="btn-primary" disabled={submitting}>{submitting ? "Submitting..." : "Create Patent Tracker"}</button>
					</div>
				</div>
			</form>
		</div>
	);
}
