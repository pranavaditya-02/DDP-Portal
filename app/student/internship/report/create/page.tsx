"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";

interface StudentOption {
  id: number;
  student_name: string;
  roll_no?: string | null;
  college_email?: string | null;
  department?: string | null;
}

interface SpecialLabOption {
  id: number;
  name: string;
}

interface SdgGoalOption {
  id: number;
  goal_name: string;
}

interface InternshipTrackerOption {
  id: number;
  industry_name?: string | null;
  start_date: string;
  end_date: string;
}

const YEAR_OPTIONS = [
  { label: "1st Year", value: "1" },
  { label: "2nd Year", value: "2" },
  { label: "3rd Year", value: "3" },
  { label: "4th Year", value: "4" },
];

const SECTOR_OPTIONS = [
  { label: "Government", value: "Government" },
  { label: "Private", value: "Private" },
];

const REFERRED_BY_OPTIONS = [
  { label: "Alumni", value: "Alumni" },
  { label: "Faculty", value: "Faculty" },
  { label: "Others", value: "Others" },
];

const STIPEND_RECEIVED_OPTIONS = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

const YES_NO_OPTIONS = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

const CLAIM_TYPE_OPTIONS = [
  { label: "Course Exemption", value: "Course Exemption" },
  { label: "Reward Points", value: "Reward Points" },
];

export default function InternshipReportCreatePage() {
  const router = useRouter();

  const [students, setStudents] = useState<StudentOption[]>([]);
  const [studentQuery, setStudentQuery] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [showStudentSuggestions, setShowStudentSuggestions] = useState(false);
  const [trackers, setTrackers] = useState<InternshipTrackerOption[]>([]);
  const [selectedTrackerId, setSelectedTrackerId] = useState<number | null>(null);
  const [trackersLoading, setTrackersLoading] = useState(false);
  const [trackersError, setTrackersError] = useState<string | null>(null);
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [specialLab, setSpecialLab] = useState("");
  const [specialLabs, setSpecialLabs] = useState<SpecialLabOption[]>([]);
  const [sector, setSector] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [industryWebsite, setIndustryWebsite] = useState("");
  const [industryContact, setIndustryContact] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [refereeName, setRefereeName] = useState("");
  const [refereeMobileNumber, setRefereeMobileNumber] = useState("");
  const [stipendReceived, setStipendReceived] = useState("");
  const [stipendAmount, setStipendAmount] = useState("");
  const [isThroughAICTE, setIsThroughAICTE] = useState("");
  const [claimType, setClaimType] = useState("");
  const [sdgGoal, setSdgGoal] = useState("");
  const [sdgGoals, setSdgGoals] = useState<SdgGoalOption[]>([]);
  const [fullDocumentProof, setFullDocumentProof] = useState<File | null>(null);
  const [originalCertificateProof, setOriginalCertificateProof] = useState<File | null>(null);
  const [attestedCertificate, setAttestedCertificate] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [labsResponse, goalsResponse] = await Promise.all([
          apiClient.getSpecialLabs(),
          apiClient.getSdgGoals(),
        ]);

        setSpecialLabs(labsResponse?.specialLabs || []);
        setSdgGoals(goalsResponse?.sdgGoals || []);
      } catch (loadError) {
        console.error('Failed to load report metadata:', loadError);
      }
    };

    loadMetadata();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadStudents = async () => {
      try {
        const response = await apiClient.getStudents(studentQuery.trim());
        if (!cancelled) {
          setStudents(response?.students || []);
        }
      } catch (loadError) {
        console.error('Failed to load students:', loadError);
      }
    };

    const timer = window.setTimeout(() => {
      loadStudents();
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [studentQuery]);

  useEffect(() => {
    if (!selectedStudentId) {
      setTrackers([]);
      setSelectedTrackerId(null);
      setTrackersError(null);
      setTrackersLoading(false);
      return;
    }

    let cancelled = false;
    setTrackersLoading(true);
    setTrackersError(null);
    setTrackers([]);
    setSelectedTrackerId(null);

    const loadTrackers = async () => {
      try {
        const response = await apiClient.getApprovedTrackersByStudent(selectedStudentId);
        if (!cancelled) {
          setTrackers(response?.trackers || []);
        }
      } catch (loadError: any) {
        console.error('Failed to load approved trackers:', loadError);
        if (!cancelled) {
          setTrackersError('Unable to load approved trackers for this student.');
        }
      } finally {
        if (!cancelled) {
          setTrackersLoading(false);
        }
      }
    };

    loadTrackers();

    return () => {
      cancelled = true;
    };
  }, [selectedStudentId]);

  const selectedStudent = useMemo(() => {
    const normalizedQuery = studentQuery.trim().toLowerCase();
    return (
      students.find((item) => item.id === selectedStudentId) ||
      students.find((item) => item.student_name.toLowerCase() === normalizedQuery) ||
      null
    );
  }, [students, selectedStudentId, studentQuery]);

  const filteredStudents = useMemo(() => {
    const normalizedQuery = studentQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return [];
    }

    return students
      .filter((item) => {
        const searchableText = [item.student_name, item.roll_no, item.college_email, item.department]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return searchableText.includes(normalizedQuery);
      })
      .slice(0, 50);
  }, [students, studentQuery]);

  const canSubmit = useMemo(() => {
    const refereeValid = referredBy !== 'Others' || (refereeName.trim().length > 0 && refereeMobileNumber.trim().length > 0);
    const stipendValid = stipendReceived === 'No' || stipendAmount.trim().length > 0;

    return (
      selectedStudent !== null &&
      selectedTrackerId !== null &&
      yearOfStudy &&
      specialLab &&
      sector &&
      address1.trim().length > 0 &&
      city.trim().length > 0 &&
      stateValue.trim().length > 0 &&
      postalCode.trim().length > 0 &&
      country.trim().length > 0 &&
      industryWebsite.trim().length > 0 &&
      industryContact.trim().length > 0 &&
      referredBy &&
      refereeValid &&
      stipendReceived &&
      stipendValid &&
      isThroughAICTE &&
      claimType &&
      sdgGoal &&
      fullDocumentProof &&
      originalCertificateProof &&
      attestedCertificate
    );
  }, [selectedStudent, selectedTrackerId, yearOfStudy, specialLab, sector, address1, city, stateValue, postalCode, country, industryWebsite, industryContact, referredBy, refereeName, refereeMobileNumber, stipendReceived, stipendAmount, isThroughAICTE, claimType, sdgGoal, fullDocumentProof, originalCertificateProof, attestedCertificate]);

  const handleStudentSelect = (student: StudentOption) => {
    setStudentQuery(student.student_name);
    setSelectedStudentId(student.id);
    setSelectedTrackerId(null);
    setShowStudentSuggestions(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!canSubmit) {
      setError('Please fill all required fields and upload all required files.');
      return;
    }

    if (!selectedStudent) {
      setError('Please choose a valid student from the list.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('student_id', String(selectedStudent.id));
      formData.append('tracker_id', String(selectedTrackerId));
      formData.append('special_lab_id', specialLab);
      formData.append('year_of_study', yearOfStudy);
      formData.append('sector', sector);
      formData.append('industry_address_line_1', address1);
      formData.append('industry_address_line_2', address2);
      formData.append('city', city);
      formData.append('state', stateValue);
      formData.append('postal_code', postalCode);
      formData.append('country', country);
      formData.append('industry_website', industryWebsite);
      formData.append('industry_contact_details', industryContact);
      formData.append('referred_by', referredBy);
      formData.append('referee_name', refereeName);
      formData.append('referee_mobile_number', refereeMobileNumber);
      formData.append('stipend_received', stipendReceived);
      formData.append('stipend_amount', stipendAmount || '0');
      formData.append('is_through_aicte', isThroughAICTE);
      formData.append('claim_type', claimType);
      formData.append('sdg_goal_id', sdgGoal);
      if (fullDocumentProof) formData.append('fullDocumentProof', fullDocumentProof);
      if (originalCertificateProof) formData.append('originalCertificateProof', originalCertificateProof);
      if (attestedCertificate) formData.append('attestedCertificate', attestedCertificate);

      const response = await apiClient.createInternshipReport(formData);
      setMessage(response?.message || 'Internship report created successfully.');
      router.push('/student/internship/report');
    } catch (submitError: any) {
      console.error('Internship report submit failed:', submitError);
      setError(submitError?.response?.data?.error || 'Failed to submit internship report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Internship Report</h1>
          <p className="text-sm text-slate-500 mt-1">Fill in the internship report details below.</p>
        </div>
        <Link href="/student/internship/report" className="btn-outline">Back</Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 mt-6 p-5 card-base">
        {message && <div className="rounded border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}
        {error && <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="block lg:col-span-2 space-y-2 relative">
            <label className="block text-sm font-medium text-slate-700">Student *</label>
            <input
              type="text"
              value={studentQuery}
              onChange={(e) => {
                setStudentQuery(e.target.value);
                setSelectedStudentId(null);
                setTrackers([]);
                setSelectedTrackerId(null);
                setShowStudentSuggestions(true);
              }}
              onFocus={() => setShowStudentSuggestions(true)}
              onBlur={() => setTimeout(() => setShowStudentSuggestions(false), 150)}
              placeholder={students.length === 0 ? "Loading students..." : "Type to search student"}
              className="input-base mt-1 w-full"
              autoComplete="off"
              required
            />
            {showStudentSuggestions && studentQuery.trim().length > 0 && (
              <div className="absolute z-20 mt-1 w-full rounded border border-slate-200 bg-white shadow-lg max-h-56 overflow-auto">
                {filteredStudents.length === 0 ? (
                  <div className="p-2 text-xs text-slate-500">No matching students</div>
                ) : (
                  filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-slate-100"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleStudentSelect(student)}
                    >
                      <div className="text-sm font-medium text-slate-800">{student.student_name}</div>
                      {(student.roll_no || student.department) && (
                        <div className="text-xs text-slate-500">
                          {[student.roll_no, student.department].filter(Boolean).join(' • ')}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <label className="block lg:col-span-2">
            <span className="text-sm font-medium text-slate-700">Approved Tracker *</span>
            <select
              value={selectedTrackerId ?? ''}
              onChange={(e) => setSelectedTrackerId(Number(e.target.value) || null)}
              className="input-base mt-1 w-full"
              required
              disabled={!selectedStudentId || trackersLoading}
            >
              <option value="">{trackersLoading ? 'Loading approved trackers...' : 'Choose an approved tracker'}</option>
              {trackers.map((tracker) => (
                <option key={tracker.id} value={tracker.id}>
                  {`${tracker.id} ${tracker.industry_name || 'Tracker'} (${new Date(tracker.start_date).toLocaleDateString()} → ${new Date(tracker.end_date).toLocaleDateString()})`}
                </option>
              ))}
            </select>
            {trackersError && <p className="mt-2 text-xs text-red-600">{trackersError}</p>}
            {!trackersLoading && selectedStudentId && trackers.length === 0 && !trackersError && (
              <p className="mt-2 text-xs text-slate-500">This student has no approved trackers available for report submission.</p>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Year of Study *</span>
            <select
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(e.target.value)}
              className="input-base mt-1 w-full"
              required
            >
              <option value="">Choose an option</option>
              {YEAR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Special Lab *</span>
            <select
              value={specialLab}
              onChange={(e) => setSpecialLab(e.target.value)}
              className="input-base mt-1 w-full"
              required
            >
              <option value="">Choose a special lab</option>
              {specialLabs.map((lab) => (
                <option key={lab.id} value={String(lab.id)}>{lab.name}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Sector *</span>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="input-base mt-1 w-full"
              required
            >
              <option value="">Choose an option</option>
              {SECTOR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="block lg:col-span-2">
            <span className="text-sm font-medium text-slate-700">Industry Address Line 1 *</span>
            <input
              type="text"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              placeholder="Industry Address Line 1"
              className="input-base mt-1 w-full"
              required
            />
          </label>

          <label className="block lg:col-span-2">
            <span className="text-sm font-medium text-slate-700">Industry Address Line 2</span>
            <input
              type="text"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              placeholder="Industry Address Line 2"
              className="input-base mt-1 w-full"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">City *</span>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="input-base mt-1 w-full"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">State *</span>
            <input
              type="text"
              value={stateValue}
              onChange={(e) => setStateValue(e.target.value)}
              placeholder="State"
              className="input-base mt-1 w-full"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Postal Code *</span>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Postal Code"
              className="input-base mt-1 w-full"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Country *</span>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country"
              className="input-base mt-1 w-full"
              required
            />
          </label>

          <label className="block lg:col-span-2">
            <span className="text-sm font-medium text-slate-700">Industry Website *</span>
            <input
              type="url"
              value={industryWebsite}
              onChange={(e) => setIndustryWebsite(e.target.value)}
              placeholder="Industry Website"
              className="input-base mt-1 w-full"
              required
            />
          </label>

          <label className="block lg:col-span-2">
            <span className="text-sm font-medium text-slate-700">Industry Contact Details *</span>
            <input
              type="text"
              value={industryContact}
              onChange={(e) => setIndustryContact(e.target.value)}
              placeholder="Industry Contact Details"
              className="input-base mt-1 w-full"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Referred By *</span>
            <select
              value={referredBy}
              onChange={(e) => setReferredBy(e.target.value)}
              className="input-base mt-1 w-full"
              required
            >
              <option value="">Choose an option</option>
              {REFERRED_BY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          {referredBy === 'Others' && (
            <>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Referee Name *</span>
                <input
                  type="text"
                  value={refereeName}
                  onChange={(e) => setRefereeName(e.target.value)}
                  placeholder="Referee name"
                  className="input-base mt-1 w-full"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Referee Mobile Number *</span>
                <input
                  type="text"
                  value={refereeMobileNumber}
                  onChange={(e) => setRefereeMobileNumber(e.target.value)}
                  placeholder="Mobile number"
                  className="input-base mt-1 w-full"
                  required
                />
              </label>
            </>
          )}

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Stipend Received *</span>
            <select
              value={stipendReceived}
              onChange={(e) => setStipendReceived(e.target.value)}
              className="input-base mt-1 w-full"
              required
            >
              <option value="">Choose an option</option>
              {STIPEND_RECEIVED_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          {stipendReceived === 'Yes' && (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Stipend Amount *</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={stipendAmount}
                onChange={(e) => setStipendAmount(e.target.value)}
                placeholder="0.00"
                className="input-base mt-1 w-full"
                required
              />
            </label>
          )}

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Is it through AICTE? *</span>
            <select
              value={isThroughAICTE}
              onChange={(e) => setIsThroughAICTE(e.target.value)}
              className="input-base mt-1 w-full"
              required
            >
              <option value="">Choose an option</option>
              {YES_NO_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Claim Type *</span>
            <select
              value={claimType}
              onChange={(e) => setClaimType(e.target.value)}
              className="input-base mt-1 w-full"
              required
            >
              <option value="">Choose an option</option>
              {CLAIM_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="block lg:col-span-2">
            <span className="text-sm font-medium text-slate-700">SDG Goal *</span>
            <select
              value={sdgGoal}
              onChange={(e) => setSdgGoal(e.target.value)}
              className="input-base mt-1 w-full"
              required
            >
              <option value="">Choose an SDG goal</option>
              {sdgGoals.map((goal) => (
                <option key={goal.id} value={String(goal.id)}>{goal.goal_name}</option>
              ))}
            </select>
          </label>

          <label className="block lg:col-span-2">
            <span className="text-sm font-medium text-slate-700">Full Document Proof *</span>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setFullDocumentProof(e.target.files?.[0] ?? null)}
              className="input-base mt-1 w-full"
              required
            />
          </label>

          <label className="block lg:col-span-2">
            <span className="text-sm font-medium text-slate-700">Original Certificate Proof *</span>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setOriginalCertificateProof(e.target.files?.[0] ?? null)}
              className="input-base mt-1 w-full"
              required
            />
          </label>

          <label className="block lg:col-span-2">
            <span className="text-sm font-medium text-slate-700">Attested Certificate *</span>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setAttestedCertificate(e.target.files?.[0] ?? null)}
              className="input-base mt-1 w-full"
              required
            />
          </label>

        </div>

        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? 'Submitting...' : 'Submit Internship Report'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/student/internship/report')}
            className="btn-outline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
