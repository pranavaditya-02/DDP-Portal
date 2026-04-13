"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

interface StudentOption {
	id: number;
	student_name: string;
	roll_no?: string | null;
	college_email?: string | null;
	department?: string | null;
}

const PATENT_STATUS = ["filed", "published", "granted"] as const;

export default function PatentReportCreatePage() {
	const router = useRouter();
	const user = useAuthStore((s) => s.user);

	const [students, setStudents] = useState<StudentOption[]>([]);
	const [studentQuery, setStudentQuery] = useState("");
	const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null);
	const [showStudentSuggestions, setShowStudentSuggestions] = useState(false);

	const [patentStatus, setPatentStatus] = useState<string>("filed");
	const [patentTrackerId, setPatentTrackerId] = useState<number | null>(null);
	const [yearOfStudy, setYearOfStudy] = useState("");

	// common files
	const [yuktiProof, setYuktiProof] = useState<File | null>(null);
	const [fullDocumentProof, setFullDocumentProof] = useState<File | null>(null);

	// published-specific
	const [publicationProof, setPublicationProof] = useState<File | null>(null);
	const [publishedDate, setPublishedDate] = useState<string>("");

	// granted-specific
	const [grantedProof, setGrantedProof] = useState<File | null>(null);

	const [numberOfFaculty, setNumberOfFaculty] = useState<number>(1);
	const [faculty1, setFaculty1] = useState<string>("");

	const [priorArt, setPriorArt] = useState("");
	const [novelty, setNovelty] = useState("");

	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const yuktiRef = useRef<HTMLInputElement | null>(null);
	const fullDocRef = useRef<HTMLInputElement | null>(null);
	const publicationRef = useRef<HTMLInputElement | null>(null);
	const grantedRef = useRef<HTMLInputElement | null>(null);

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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setMessage(null);

		if (!selectedStudent) {
			setError('Please select a student from suggestions.');
			return;
		}

		if (!yuktiProof) {
			setError('Yukti portal registration proof is required.');
			return;
		}

		if (patentStatus === 'published' && !publicationProof) {
			setError('Publication proof is required for published status.');
			return;
		}

		if (patentStatus === 'granted' && !grantedProof) {
			setError('Granted proof is required for granted status.');
			return;
		}

		try {
			setSubmitting(true);
			const formData = new FormData();
			formData.append('student_id', String(selectedStudent.id));
			formData.append('patent_status', patentStatus);
			if (patentTrackerId) formData.append('patent_tracker_id', String(patentTrackerId));
			formData.append('year_of_study', yearOfStudy);
			formData.append('prior_art', priorArt);
			formData.append('novelty', novelty);
			formData.append('number_of_faculty', String(numberOfFaculty));
			formData.append('faculty_1', faculty1);
			if (yuktiProof) formData.append('yukti_proof', yuktiProof);
			if (fullDocumentProof) formData.append('full_document_proof', fullDocumentProof);
			if (publicationProof) formData.append('publication_proof', publicationProof);
			if (publishedDate) formData.append('published_date', publishedDate);
			if (grantedProof) formData.append('granted_proof', grantedProof);

			await apiClient.createPatentReport(formData);
			setMessage('Patent report submitted successfully.');
			router.push('/student/patent/report');
		} catch (err: any) {
			console.error(err);
			setError(err?.response?.data?.error || err?.message || 'Submission failed.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="p-6">
			<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold p-2">Create Patent Report</h1>
					<p className="text-sm text-slate-500 mt-1">Fill in patent report details. Fields change based on patent status.</p>
				</div>
				<Link href="/student/patent/report" className="btn-outline">Back</Link>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6 mt-6 p-5">
				<div className="card-base p-10 space-y-5">
					{message && <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">{message}</div>}
					{error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="sm:col-span-2 relative">
							<label className="block text-sm font-medium text-slate-700">Student *</label>
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
						</div>

						<label className="block">
							<span className="text-sm font-medium text-slate-700">Patent Status *</span>
							<select value={patentStatus} onChange={(e) => setPatentStatus(e.target.value)} className="input-base mt-1 w-full">
								<option value="filed">Filed</option>
								<option value="published">Published</option>
								<option value="granted">Granted</option>
							</select>
						</label>

						<label className="block sm:col-span-2">
							<span className="text-sm font-medium text-slate-700">Yukti Portal Registration Proof *</span>
							<input ref={yuktiRef} type="file" accept="application/pdf,image/*" onChange={(e) => setYuktiProof(e.target.files?.[0] ?? null)} className="input-base mt-1 w-full" />
							<p className="text-xs text-slate-500">Yukti Registration Procedure: Download linked procedure if needed.</p>
						</label>

						{patentStatus === 'filed' && (
							<>
								<label className="block sm:col-span-2">
									<span className="text-sm font-medium text-slate-700">Patent Tracker *</span>
									<input placeholder="Tracker id (optional)" value={patentTrackerId ?? ''} onChange={(e) => setPatentTrackerId(Number(e.target.value) || null)} className="input-base mt-1 w-full" />
								</label>

								<label className="block sm:col-span-2">
									<span className="text-sm font-medium text-slate-700">Full Document Proof *</span>
									<input ref={fullDocRef} type="file" accept="application/pdf" onChange={(e) => setFullDocumentProof(e.target.files?.[0] ?? null)} className="input-base mt-1 w-full" />
								</label>
							</>
						)}

						{patentStatus === 'published' && (
							<>
								<label className="block sm:col-span-2">
									<span className="text-sm font-medium text-slate-700">Publication Proof *</span>
									<input ref={publicationRef} type="file" accept="application/pdf,image/*" onChange={(e) => setPublicationProof(e.target.files?.[0] ?? null)} className="input-base mt-1 w-full" />
								</label>

								<label className="block">
									<span className="text-sm font-medium text-slate-700">Published Date *</span>
									<input type="date" value={publishedDate} onChange={(e) => setPublishedDate(e.target.value)} className="input-base mt-1 w-full" />
								</label>
							</>
						)}

						{patentStatus === 'granted' && (
							<>
								<label className="block sm:col-span-2">
									<span className="text-sm font-medium text-slate-700">Granted Proof *</span>
									<input ref={grantedRef} type="file" accept="application/pdf,image/*" onChange={(e) => setGrantedProof(e.target.files?.[0] ?? null)} className="input-base mt-1 w-full" />
								</label>
							</>
						)}

						<label className="block sm:col-span-2">
							<span className="text-sm font-medium text-slate-700">Prior art(references)</span>
							<textarea value={priorArt} onChange={(e) => setPriorArt(e.target.value)} className="input-base h-28 w-full" />
						</label>

						<label className="block sm:col-span-2">
							<span className="text-sm font-medium text-slate-700">Novelty</span>
							<textarea value={novelty} onChange={(e) => setNovelty(e.target.value)} className="input-base h-28 w-full" />
						</label>

						<label className="block">
							<span className="text-sm font-medium text-slate-700">Number of Faculty Involved *</span>
							<input type="number" min={1} value={numberOfFaculty} onChange={(e) => setNumberOfFaculty(Number(e.target.value) || 1)} className="input-base mt-1 w-full" />
						</label>

						<label className="block">
							<span className="text-sm font-medium text-slate-700">Faculty 1 *</span>
							<input type="text" value={faculty1} onChange={(e) => setFaculty1(e.target.value)} placeholder="Faculty name" className="input-base mt-1 w-full" />
						</label>

					</div>

					<div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
						<Link href="/student/patent/report" className="btn-outline">Cancel</Link>
						<button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Create & Add Another'}</button>
					</div>
				</div>
			</form>
		</div>
	);
}
