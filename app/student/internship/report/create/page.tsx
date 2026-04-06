"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const LAB_OPTIONS = ["Lab A", "Lab B", "Lab C"];
const SECTOR_OPTIONS = ["IT", "CSE", "ECE", "MECH", "CIVIL"];
const REFERRED_BY_OPTIONS = ["Faculty", "Industry Mentor", "Campus Training", "Other"];
const STIPEND_OPTIONS = ["No Stipend", "< 5000", "5000 - 10000", "> 10000"];
const YES_NO_OPTIONS = ["Yes", "No"];
const COURSE_EXEMPTION_OPTIONS = ["Yes", "No"];
const SDG_GOALS_OPTIONS = ["No Poverty", "Zero Hunger", "Quality Education", "Gender Equality", "Clean Water"];

export default function InternshipReportCreatePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [student, setStudent] = useState<string>(user?.name ?? "");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [specialLab, setSpecialLab] = useState("");
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
  const [stipendAmount, setStipendAmount] = useState("");
  const [isThroughAICTE, setIsThroughAICTE] = useState("");
  const [courseExemption, setCourseExemption] = useState("");
  const [sdgGoal, setSdgGoal] = useState("");
  const [fullDocumentProof, setFullDocumentProof] = useState<File | null>(null);
  const [originalCertificateProof, setOriginalCertificateProof] = useState<File | null>(null);
  const [attestedCertificate, setAttestedCertificate] = useState<File | null>(null);
  const [iqacVerification, setIqacVerification] = useState("initiated");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      student.trim().length > 0 &&
      yearOfStudy &&
      specialLab &&
      sector &&
      address1.trim().length > 0 &&
      city.trim().length > 0 &&
      stateValue.trim().length > 0 &&
      postalCode.trim().length > 0 &&
      country.trim().length > 0 &&
      industryContact.trim().length > 0 &&
      referredBy &&
      stipendAmount &&
      isThroughAICTE &&
      courseExemption &&
      sdgGoal &&
      fullDocumentProof &&
      originalCertificateProof &&
      attestedCertificate
    );
  }, [student, yearOfStudy, specialLab, sector, address1, city, stateValue, postalCode, country, industryContact, referredBy, stipendAmount, isThroughAICTE, courseExemption, sdgGoal, fullDocumentProof, originalCertificateProof, attestedCertificate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!canSubmit) {
      setError('Please fill all required fields and upload all required files.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('student', student);
      formData.append('yearOfStudy', yearOfStudy);
      formData.append('specialLab', specialLab);
      formData.append('sector', sector);
      formData.append('address1', address1);
      formData.append('address2', address2);
      formData.append('city', city);
      formData.append('state', stateValue);
      formData.append('postalCode', postalCode);
      formData.append('country', country);
      formData.append('industryWebsite', industryWebsite);
      formData.append('industryContact', industryContact);
      formData.append('referredBy', referredBy);
      formData.append('stipendAmount', stipendAmount);
      formData.append('isThroughAICTE', isThroughAICTE);
      formData.append('courseExemption', courseExemption);
      formData.append('sdgGoal', sdgGoal);
      if (fullDocumentProof) formData.append('fullDocumentProof', fullDocumentProof);
      if (originalCertificateProof) formData.append('originalCertificateProof', originalCertificateProof);
      if (attestedCertificate) formData.append('attestedCertificate', attestedCertificate);
      formData.append('iqacVerification', iqacVerification);

      console.log('Internship report submit', Object.fromEntries(formData.entries()));
      setMessage('Internship report form submitted (mock).');
    } catch (submitError: any) {
      console.error('Internship report submit failed:', submitError);
      setError('Failed to submit internship report.');
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
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Student *</span>
            <input
              type="text"
              value={student}
              onChange={(e) => setStudent(e.target.value)}
              placeholder="Click to choose"
              className="input-base mt-1 w-full"
              required
            />
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
                <option key={option} value={option}>{option}</option>
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
              <option value="">Click to choose</option>
              {LAB_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
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
                <option key={option} value={option}>{option}</option>
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
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Stipend Amount *</span>
            <select
              value={stipendAmount}
              onChange={(e) => setStipendAmount(e.target.value)}
              className="input-base mt-1 w-full"
              required
            >
              <option value="">Choose an option</option>
              {STIPEND_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

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
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Claiming for Course Exemption / Reward Points *</span>
            <select
              value={courseExemption}
              onChange={(e) => setCourseExemption(e.target.value)}
              className="input-base mt-1 w-full"
              required
            >
              <option value="">Choose an option</option>
              {COURSE_EXEMPTION_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="block lg:col-span-2">
            <span className="text-sm font-medium text-slate-700">SDG Goals *</span>
            <select
              value={sdgGoal}
              onChange={(e) => setSdgGoal(e.target.value)}
              className="input-base mt-1 w-full"
              required
            >
              <option value="">Choose an option</option>
              {SDG_GOALS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
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

          <label className="block lg:col-span-2">
            <span className="text-sm font-medium text-slate-700">IQAC Verification *</span>
            <select
              value={iqacVerification}
              onChange={(e) => setIqacVerification(e.target.value)}
              className="input-base mt-1 w-full"
              required
            >
              <option value="initiated">Initiated</option>
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
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
