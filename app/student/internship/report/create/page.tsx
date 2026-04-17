"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Country, State, City } from "country-state-city";
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
  tracker_number?: number;
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
  const [countryCode, setCountryCode] = useState("");
  const [country, setCountry] = useState("");
  const [states, setStates] = useState<Array<{ name: string; isoCode: string }>>([]);
  const [stateCode, setStateCode] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [cities, setCities] = useState<Array<{ name: string }>>([]);
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
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
  const [fileErrors, setFileErrors] = useState<{ fullDocument?: string; original?: string; attested?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [countries, setCountries] = useState<Array<{ name: string; isoCode: string }>>([]);

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
    setCountries(Country.getAllCountries().map((country) => ({ name: country.name, isoCode: country.isoCode })));
  }, []);

  useEffect(() => {
    if (!countryCode) {
      setStates([]);
      setStateCode("");
      setStateValue("");
      setCities([]);
      setCity("");
      return;
    }

    const nextStates = State.getStatesOfCountry(countryCode).map((state) => ({ name: state.name, isoCode: state.isoCode }));
    setStates(nextStates);
    setStateCode("");
    setStateValue("");
    setCities([]);
    setCity("");
  }, [countryCode]);

  useEffect(() => {
    if (!countryCode || !stateCode) {
      setCities([]);
      setCity("");
      return;
    }

    const nextCities = City.getCitiesOfState(countryCode, stateCode).map((city) => ({ name: city.name }));
    setCities(nextCities);
    setCity("");
  }, [countryCode, stateCode]);

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
        const response = await apiClient.getAvailableTrackersByStudent(selectedStudentId);
        if (!cancelled) {
          setTrackers(response?.trackers || []);
        }
      } catch (loadError: any) {
        console.error('Failed to load available trackers:', loadError);
        if (!cancelled) {
          setTrackersError('Unable to load available trackers for this student.');
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
      country.trim().length > 0 &&
      stateValue.trim().length > 0 &&
      city.trim().length > 0 &&
      address1.trim().length > 0 &&
      postalCode.trim().length > 0 && /^[0-9]+$/.test(postalCode) &&
      industryWebsite.trim().length > 0 &&
      industryContact.trim().length > 0 && /^[0-9]+$/.test(industryContact) &&
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
    setFileErrors({});

    if (!canSubmit) {
      setError('Please fill all required fields and upload all required files. Ensure postal code and industry contact are numeric.');
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
      const serverMsg = submitError?.response?.data?.error;
      // If server indicates a filename/filetype problem, show it inline for file fields
      if (typeof serverMsg === 'string' && (serverMsg.toLowerCase().includes('file name') || serverMsg.toLowerCase().includes('file type') || serverMsg.toLowerCase().includes('upload'))) {
        setFileErrors({ fullDocument: serverMsg, original: serverMsg, attested: serverMsg });
        setError(null);
      } else {
        setError(serverMsg || 'Failed to submit internship report.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const validateFileName = (name: string) => {
    // Require a 4-digit year and no trailing space before extension; examples accepted: "7376251cs389-internship-04052019.pdf" or "201CS111-ITI-08.06.2025.pdf"
    const cleaned = name.trim();
    const hasYear = /(?:19|20)\d{2}/.test(cleaned);
    const noSpaceBeforeExt = !/\s+\.[a-zA-Z0-9]{1,5}$/.test(cleaned);
    return hasYear && noSpaceBeforeExt;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Internship Report</h1>
            <p className="text-sm text-slate-500 mt-1">Fill in the internship report details below.</p>
          </div>
          <Link href="/student/internship/report" className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition">Back</Link>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {message && (
              <div className="fixed inset-x-4 top-6 z-50 flex items-start justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                <div className="flex-1">{message}</div>
                <button aria-label="close" onClick={() => setMessage(null)} className="ml-4 text-emerald-700 hover:text-emerald-900">✕</button>
              </div>
            )}
            {error && (
              <div className="fixed inset-x-4 top-6 z-50 flex items-start justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                <div className="flex-1">{error}</div>
                <button aria-label="close" onClick={() => setError(null)} className="ml-4 text-rose-700 hover:text-rose-900">✕</button>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
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
            <span className="text-sm font-medium text-slate-700">Tracker *</span>
            <select
              value={selectedTrackerId ?? ''}
              onChange={(e) => setSelectedTrackerId(Number(e.target.value) || null)}
              className="input-base mt-1 w-full"
              required
              disabled={!selectedStudentId || trackersLoading}
            >
              <option value="">{trackersLoading ? 'Loading available trackers...' : 'Choose a tracker'}</option>
              {trackers.map((tracker) => (
                <option key={tracker.id} value={tracker.id}>
                  {`#${tracker.tracker_number ?? tracker.id} ${tracker.industry_name || 'Tracker'} (${new Date(tracker.start_date).toLocaleDateString()} → ${new Date(tracker.end_date).toLocaleDateString()})`}
                </option>
              ))}
            </select>
            {trackersError && <p className="mt-2 text-xs text-red-600">{trackersError}</p>}
            {!trackersLoading && selectedStudentId && trackers.length === 0 && !trackersError && (
              <p className="mt-2 text-xs text-slate-500">This student has no available trackers for report submission.</p>
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
            <span className="text-sm font-medium text-slate-700">Country *</span>
            <select
              value={countryCode}
              onChange={(e) => {
                const newCode = e.target.value;
                const selected = countries.find((item) => item.isoCode === newCode);
                setCountryCode(newCode);
                setCountry(selected?.name ?? '');
              }}
              className="input-base mt-1 w-full"
              required
            >
              <option value="">Choose a country</option>
              {countries.map((countryItem) => (
                <option key={countryItem.isoCode} value={countryItem.isoCode}>
                  {countryItem.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">State *</span>
            <select
              value={stateCode}
              onChange={(e) => {
                const newCode = e.target.value;
                const selected = states.find((item) => item.isoCode === newCode);
                setStateCode(newCode);
                setStateValue(selected?.name ?? '');
              }}
              className="input-base mt-1 w-full"
              required
              disabled={!countryCode}
            >
              <option value="">{countryCode ? 'Choose a state' : 'Select country first'}</option>
              {states.map((stateItem) => (
                <option key={stateItem.isoCode} value={stateItem.isoCode}>
                  {stateItem.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">City *</span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="input-base mt-1 w-full"
              required
              disabled={!stateCode}
            >
              <option value="">{stateCode ? 'Choose a city' : 'Select state first'}</option>
              {cities.map((cityItem) => (
                <option key={cityItem.name} value={cityItem.name}>
                  {cityItem.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Postal Code *</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Postal Code (numbers only)"
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
            <p className="mt-2 text-xs text-rose-600">Website must include the full URL format, including https:// (for example, https://example.com).</p>
          </label>

          <label className="block lg:col-span-2">
            <span className="text-sm font-medium text-slate-700">Industry Contact Details *</span>
            <input
              type="tel"
              inputMode="numeric"
              pattern="\d*"
              value={industryContact}
              onChange={(e) => setIndustryContact(e.target.value.replace(/\D/g, ''))}
              placeholder="Contact number (digits only)"
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
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (!file) return setFullDocumentProof(null);
                if (!validateFileName(file.name)) {
                  setFileErrors((s) => ({ ...s, fullDocument: 'File name must be in the expected format, for example 7376251CS492-internship-04072026.pdf or 201CS111-ITI-08.06.2025.pdf' }));
                  setFullDocumentProof(null);
                } else {
                  setFileErrors((s) => ({ ...s, fullDocument: undefined }));
                  setFullDocumentProof(file);
                }
              }}
              className="input-base mt-1 w-full"
              required
            />
            {fileErrors.fullDocument && <p className="mt-2 text-xs text-rose-600">{fileErrors.fullDocument}</p>}
          </label>

          <label className="block lg:col-span-2">
            <span className="text-sm font-medium text-slate-700">Original Certificate Proof *</span>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (!file) return setOriginalCertificateProof(null);
                if (!validateFileName(file.name)) {
                  setFileErrors((s) => ({ ...s, original: 'File name must be in the expected format, for example 7376251CS492-internship-04072026.pdf or 201CS111-ITI-08.06.2025.pdf' }));
                  setOriginalCertificateProof(null);
                } else {
                  setFileErrors((s) => ({ ...s, original: undefined }));
                  setOriginalCertificateProof(file);
                }
              }}
              className="input-base mt-1 w-full"
              required
            />
            {fileErrors.original && <p className="mt-2 text-xs text-rose-600">{fileErrors.original}</p>}
          </label>

          <label className="block lg:col-span-2">
            <span className="text-sm font-medium text-slate-700">Attested Certificate *</span>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (!file) return setAttestedCertificate(null);
                if (!validateFileName(file.name)) {
                  setFileErrors((s) => ({ ...s, attested: 'File name must be in the expected format, for example 7376251CS492-internship-04072026.pdf or 201CS111-ITI-08.06.2025.pdf' }));
                  setAttestedCertificate(null);
                } else {
                  setFileErrors((s) => ({ ...s, attested: undefined }));
                  setAttestedCertificate(file);
                }
              }}
              className="input-base mt-1 w-full"
              required
            />
            {fileErrors.attested && <p className="mt-2 text-xs text-rose-600">{fileErrors.attested}</p>}
            <p className="text-xs text-red-500">
              * File names should follow the expected student format, for example &nbsp;
              <b className="text-blue-700">7376251CS492-internship-04072026.pdf.</b>
            </p>
          </label>

        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => router.push('/student/internship/report')}
            className="inline-flex justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
          >
            {submitting ? 'Submitting...' : 'Submit Internship Report'}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
  );
}
