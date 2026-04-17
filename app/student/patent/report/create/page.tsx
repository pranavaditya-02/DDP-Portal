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
	const [level, setLevel] = useState("");

	// filed-specific additional fields
	const [positionOfStudent, setPositionOfStudent] = useState<string>("");
	const [isAcademicProject, setIsAcademicProject] = useState<string>("");
	const [registrationDate, setRegistrationDate] = useState<string>("");
	const [cbrReceipt, setCbrReceipt] = useState<File | null>(null);
	const [applicationNumber, setApplicationNumber] = useState<string>("");
	const [sdgGoals, setSdgGoals] = useState<string>("");
	const [iqacVerification, setIqacVerification] = useState<string>("Initiated");
	const [isEarlyPublicationFiled, setIsEarlyPublicationFiled] = useState<string>("");
	const [isExaminationFiled, setIsExaminationFiled] = useState<string>("");
	const [patentLicenseDetails, setPatentLicenseDetails] = useState<string>("");
	const [fundingAgency, setFundingAgency] = useState<string>("");
	const [fundsReceived, setFundsReceived] = useState<string>("");
	const [fundAmount, setFundAmount] = useState<string>("");
	const [interdisciplinary, setInterdisciplinary] = useState<string>("");
	const [department, setDepartment] = useState<string>("");
	const [otherDepartmentStudents, setOtherDepartmentStudents] = useState<string>("");

	// common files
	const [yuktiProof, setYuktiProof] = useState<File | null>(null);
	const [fullDocumentProof, setFullDocumentProof] = useState<File | null>(null);

	// published-specific
	const [publicationProof, setPublicationProof] = useState<File | null>(null);
	const [publishedDate, setPublishedDate] = useState<string>("");

	// granted-specific
	const [grantedProof, setGrantedProof] = useState<File | null>(null);

	const [numberOfFaculty, setNumberOfFaculty] = useState<number>(0);
	const [faculty1, setFaculty1] = useState<string>("");
	const [faculty2, setFaculty2] = useState<string>("");
	const [faculty3, setFaculty3] = useState<string>("");
	const [faculty4, setFaculty4] = useState<string>("");

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

		if (patentStatus === 'filed' && !fullDocumentProof) {
			setError('Full document proof is required for filed status.');
			return;
		}

		if (patentStatus === 'filed' && !cbrReceipt) {
			setError('CBR Receipt is required for filed status.');
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
			formData.append('number_of_faculty', String(numberOfFaculty));
			if (yuktiProof) formData.append('yukti_proof', yuktiProof);
			if (fullDocumentProof) formData.append('full_document_proof', fullDocumentProof);
			if (cbrReceipt) formData.append('cbr_receipt', cbrReceipt);
			if (positionOfStudent) formData.append('position_of_student', positionOfStudent);
			if (isAcademicProject) formData.append('is_academic_project', isAcademicProject);
			if (registrationDate) formData.append('registration_date', registrationDate);
			if (applicationNumber) formData.append('application_number', applicationNumber);
			if (sdgGoals) formData.append('sdg_goals', sdgGoals);
			if (iqacVerification) formData.append('iqac_verification', iqacVerification);
			
			if (publicationProof) formData.append('publication_proof', publicationProof);
			if (publishedDate) formData.append('published_date', publishedDate);
			if (grantedProof) formData.append('granted_proof', grantedProof);

			// append faculty names
			if (faculty1) formData.append('faculty_1', faculty1);
			if (numberOfFaculty >= 2 && faculty2) formData.append('faculty_2', faculty2);
			if (numberOfFaculty >= 3 && faculty3) formData.append('faculty_3', faculty3);
			if (numberOfFaculty >= 4 && faculty4) formData.append('faculty_4', faculty4);

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
							<p>
								<button
									type="button"
									onClick={() => {
										if (!yuktiProof) {
											// no file selected
											setError('No linked procedure file selected to download.');
											return;
										}
										const url = URL.createObjectURL(yuktiProof);
										const a = document.createElement('a');
										a.href = url;
										a.download = yuktiProof.name || 'yukti-procedure';
										document.body.appendChild(a);
										a.click();
										a.remove();
										URL.revokeObjectURL(url);
									}}
									className="text-xs text-slate-500 underline hover:text-slate-700"
								>
									Yukti Registration Procedure: Download linked procedure if needed.
								</button>
							</p>
						</label>
						<label className="block">
							<span className="text-sm font-medium text-slate-700">Position of Student in Patent *</span>
							<select value={positionOfStudent} onChange={(e) => setPositionOfStudent(e.target.value)} className="input-base mt-1 w-full">
								<option value="">Choose an option</option>
								<option value="1">1</option>
								<option value="2">2</option>
								<option value="3">3</option>
								<option value="4">4</option>
								<option value="5">5</option>
								<option value="6">6</option>
								<option value="7">7</option>
								<option value="8">8</option>
								<option value="9">9</option>
								<option value="10">10</option>
							</select>
						</label>

						<label className="block">
							<span className="text-sm font-medium text-slate-700">Are you claiming this as the outcome of an academic project *</span>
							<select value={isAcademicProject} onChange={(e) => setIsAcademicProject(e.target.value)} className="input-base mt-1 w-full">
								<option value="">Choose an option</option>
								<option value="yes">Yes</option>
								<option value="no">No</option>
							</select>
						</label>

						{patentStatus === 'filed' && (
							<>
								<label className="block sm:col-span-2">
									<span className="text-sm font-medium text-slate-700">Patent Tracker *</span>
									<input placeholder="Tracker" value={patentTrackerId ?? ''} onChange={(e) => setPatentTrackerId(Number(e.target.value) || null)} className="input-base mt-1 w-full" />
								</label>

								<label>
									<span className="text-sm font-medium text-slate-700">level *</span>
									<select value={level} onChange={(e) => setLevel(e.target.value)} className="input-base mt-1 w-full">
										<option value="">Choose an option</option>
										<option value="1">national</option>
										<option value="2">international</option>
									</select>
								</label>

								<label className="block">
									<span className="text-sm font-medium text-slate-700">Is the request for early publication been filed(Form 9)? *</span>
									<select value={isEarlyPublicationFiled} onChange={(e) => setIsEarlyPublicationFiled(e.target.value)} className="input-base mt-1 w-full">
										<option value="">Choose an option</option>
										<option value="yes">Yes</option>
										<option value="no">No</option>
									</select>
								</label>

								<label className="block">
									<span className="text-sm font-medium text-slate-700">Is the request for examination been filed(Form 18)? *</span>
									<select value={isExaminationFiled} onChange={(e) => setIsExaminationFiled(e.target.value)} className="input-base mt-1 w-full">
										<option value="">Choose an option</option>
										<option value="yes">Yes</option>
										<option value="no">No</option>
									</select>
								</label>

								<label className="block">
									<span className="text-sm font-medium text-slate-700">Patent License Details*</span>
									<textarea value={patentLicenseDetails} onChange={(e) => setPatentLicenseDetails(e.target.value)} className="input-base h-28 w-full mt-1" />
								</label>

								<label className="block">
									<span className="text-sm font-medium text-slate-700">Funding Agency *</span>
									<input placeholder="Funding Agency" value={fundingAgency} onChange={(e) => setFundingAgency(e.target.value)} className="input-base mt-1 w-full" />
								</label>

								<label className="block">
									<span className="text-sm font-medium text-slate-700">Funds received from management *</span>
									<select value={fundsReceived} onChange={(e) => setFundsReceived(e.target.value)} className="input-base mt-1 w-full">
										<option value="">Choose an option</option>
										<option value="yes">Yes</option>
										<option value="no">No</option>
									</select>
								</label>
								{fundsReceived === 'yes' && (
									<label className="block">
										<span className="text-sm font-medium text-slate-700">Fund Amount *</span>
										<input placeholder="Fund Amount" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} className="input-base mt-1 w-full" />
									</label>
								)}
								<label className="block">
									<span className="text-sm font-medium text-slate-700">interseciplinary *</span>
									<select value={interdisciplinary} onChange={(e) => setInterdisciplinary(e.target.value)} className="input-base mt-1 w-full">
										<option value="">Choose an option</option>
										<option value="yes">Yes</option>
										<option value="no">No</option>
									</select>
								</label>
								{interdisciplinary === 'yes' && (
									<>
										<label className="block">
											<span className="text-sm font-medium text-slate-700">department *</span>
											<select value={department} onChange={(e) => setDepartment(e.target.value)} className="input-base mt-1 w-full">
												<option value="">Choose an option</option>
												<option value="cs">Computer Science</option>
												<option value="ee">Electrical Engineering</option>
											</select>
										</label>

										<label className="block">
											<span className="text-sm font-medium text-slate-700">Number of Other Department Students *</span>
											<input placeholder="Number of Other Department Students" value={otherDepartmentStudents} onChange={(e) => setOtherDepartmentStudents(e.target.value)} className="input-base mt-1 w-full" />
										</label>
									</>
								)}

								<label className="block sm:col-span-2">
									<span className="text-sm font-medium text-slate-700">Full Document Proof *</span>
									<input ref={fullDocRef} type="file" accept="application/pdf" onChange={(e) => setFullDocumentProof(e.target.files?.[0] ?? null)} className="input-base mt-1 w-full" />
								</label>
							</>
						)}


						{patentStatus === 'published' && (
							<>
							<label className="block">
								<span className="text-sm font-medium text-slate-700">Approved Filed Bip ID *</span>
								<input placeholder="Approved Filed Bip ID" value={patentTrackerId ?? ''} onChange={(e) => setPatentTrackerId(Number(e.target.value) || null)} className="input-base mt-1 w-full" />
							</label>

							<label className="block">
								<span className="text-sm font-medium text-slate-700">publication proof *</span>
								<input ref={publicationRef} type="file" accept="application/pdf,image/*" onChange={(e) => setPublicationProof(e.target.files?.[0] ?? null)} className="input-base mt-1 w-full" />
							</label>

							<label className="block">
								<span className="text-sm font-medium text-slate-700">Published Registration Date *</span>
								<input type="date" value={registrationDate} onChange={(e) => setRegistrationDate(e.target.value)} className="input-base mt-1 w-full" />
							</label>
							</>
						)}

						{patentStatus === 'granted' && (
							<>

							<label className="block">
								<span className="text-sm font-medium text-slate-700">Approved Filed Bip ID *</span>
								<input placeholder="Approved Filed Bip ID" value={patentTrackerId ?? ''} onChange={(e) => setPatentTrackerId(Number(e.target.value) || null)} className="input-base mt-1 w-full" />
							</label>

							<label className="block">
								<span className="text-sm font-medium text-slate-700">Granted proof *</span>
								<input ref={grantedRef} type="file" accept="application/pdf,image/*" onChange={(e) => setGrantedProof(e.target.files?.[0] ?? null)} className="input-base mt-1 w-full" />
							</label>

							</>
						)}

							<div className="sm:col-span-2">
								<label className="block text-sm font-medium text-slate-700">Number of Faculty Involved *</label>
								<div className="flex items-center gap-3 mt-2">
									<button type="button" onClick={() => setNumberOfFaculty((n) => Math.max(0, n - 1))} className="btn-outline px-3 py-1">-</button>
									<div className="px-3 py-1 border rounded bg-slate-800 text-white">{numberOfFaculty}</div>
									<button type="button" onClick={() => setNumberOfFaculty((n) => Math.min(4, n + 1))} className="btn-outline px-3 py-1">+</button>
								</div>
								<div className="mt-4 space-y-3">
									{numberOfFaculty >= 1 && (
										<label className="block">
											<span className="text-sm font-medium text-slate-700">Faculty 1 *</span>
											<input type="text" value={faculty1} onChange={(e) => setFaculty1(e.target.value)} placeholder="Faculty name" className="input-base mt-1 w-full" />
										</label>
									)}
									{numberOfFaculty >= 2 && (
										<label className="block">
											<span className="text-sm font-medium text-slate-700">Faculty 2 *</span>
											<input type="text" value={faculty2} onChange={(e) => setFaculty2(e.target.value)} placeholder="Faculty name" className="input-base mt-1 w-full" />
										</label>
									)}
									{numberOfFaculty >= 3 && (
										<label className="block">
											<span className="text-sm font-medium text-slate-700">Faculty 3 *</span>
											<input type="text" value={faculty3} onChange={(e) => setFaculty3(e.target.value)} placeholder="Faculty name" className="input-base mt-1 w-full" />
										</label>
									)}
									{numberOfFaculty >= 4 && (
										<label className="block">
											<span className="text-sm font-medium text-slate-700">Faculty 4 *</span>
											<input type="text" value={faculty4} onChange={(e) => setFaculty4(e.target.value)} placeholder="Faculty name" className="input-base mt-1 w-full" />
										</label>
									)}
								</div>
							</div>

						<label className="block">
							<span className="text-sm font-medium text-slate-700">Registration Date *</span>
							<input type="date" value={registrationDate} onChange={(e) => setRegistrationDate(e.target.value)} className="input-base mt-1 w-full" />
						</label>

						<label className="block sm:col-span-2">
							<span className="text-sm font-medium text-slate-700">CBR Receipt *</span>
							<input type="file" accept="application/pdf,image/*" onChange={(e) => setCbrReceipt(e.target.files?.[0] ?? null)} className="input-base mt-1 w-full" />
						</label>

						<label className="block">
							<span className="text-sm font-medium text-slate-700">Application / Registration Number *</span>
							<input placeholder="Application / Registration Number" value={applicationNumber} onChange={(e) => setApplicationNumber(e.target.value)} className="input-base mt-1 w-full" />
						</label>

						<label className="block">
							<span className="text-sm font-medium text-slate-700">SDG Goals *</span>
							<select value={sdgGoals} onChange={(e) => setSdgGoals(e.target.value)} className="input-base mt-1 w-full">
								<option value="">Choose an option</option>
								<option value="sdg1">SDG 1</option>
								<option value="sdg2">SDG 2</option>
								<option value="sdg3">SDG 3</option>
							</select>
						</label>






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
