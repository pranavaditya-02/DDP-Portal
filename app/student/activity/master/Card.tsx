"use client";

import React, { useEffect, useState } from "react";

export type EventCardProps = {
  id?: number;
  title: string;
  date: string;
  location: string;
  category: string;
  maximumCount?: number;
  appliedCount?: number;
  balanceCount?: number;
  applyByStudent?: boolean;
  eventCode?: string;
  eventOrganizer?: string;
  webLink?: string;
  startDate?: string | null;
  endDate?: string | null;
  durationDays?: number | null;
  eventLevel?: string;
  state?: string;
  country?: string;
  withinBit?: boolean;
  relatedToSpecialLab?: boolean;
  department?: string;
  competitionName?: string;
  totalLevelOfCompetition?: string;
  eligibleForRewards?: boolean;
  winnerRewards?: string;
  createdDate?: string;
  updatedDate?: string;
  tags: string[];
  seatsLeft: number;
  totalSeats: number;
  image: string;
  status?: string;
  isRegistered?: boolean;
  onRegisterSuccess?: (eventKey: number | string) => void;
  onOpenDetails?: (eventKey: number | string) => void;
  onBack?: () => void;
  mode?: "preview" | "details";
};

export const activityMasterEvents: EventCardProps[] = [
  {
    title: "National AI Innovation Hackathon",
    date: "MAR 12-14, 2026",
    location: "IIT Delhi",
    category: "Hackathon",
    tags: ["Artificial Intelligence", "Machine Learning", "Python", "National"],
    seatsLeft: 42,
    totalSeats: 120,
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Full Stack Web Development Bootcamp",
    date: "APR 5-10, 2026",
    location: "BITS Pilani",
    category: "Bootcamp",
    tags: ["React", "Node.js", "Web Development", "Beginner Friendly"],
    seatsLeft: 120,
    totalSeats: 300,
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "IoT Innovation Summit",
    date: "MAR 28, 2026",
    location: "Anna University",
    category: "Technical Symposium",
    tags: ["IoT", "Smart Cities", "Industry 4.0", "State Level"],
    seatsLeft: 5,
    totalSeats: 200,
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Data Science Case Challenge",
    date: "APR 20-21, 2026",
    location: "PSG Tech",
    category: "Competition",
    tags: ["Data Analytics", "Kaggle", "Mentored", "Inter-Collegeg"],
    seatsLeft: 33,
    totalSeats: 100,
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Embedded Systems Design Workshop",
    date: "MAY 2, 2026",
    location: "NIT Trichy",
    category: "Workshop",
    tags: ["Embedded", "Circuits", "Hands-On", "Hardware"],
    seatsLeft: 18,
    totalSeats: 80,
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22731d8c8f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Startup Pitch Sprint",
    date: "APR 17, 2026",
    location: "T-Hub Hyderabad",
    category: "Pitch Event",
    tags: ["Startup", "Pitching", "Mentorship", "Funding"],
    seatsLeft: 70,
    totalSeats: 150,
    image:
      "https://images.unsplash.com/photo-1556761175-129418cb2dfe?auto=format&fit=crop&w=1200&q=80",
  },
];

const progressColor = (ratio: number) => {
  if (ratio <= 0.2) return "bg-rose-500";
  if (ratio <= 0.45) return "bg-amber-500";
  return "bg-emerald-500";
};

const initialRegistrationFormData = {
  fullName: "",
  email: "",
  phone: "",
  rollNumber: "",
  department: "",
  year: "",
  teamName: "",
  paymentMethod: "later",
};

export default function Card({
  id,
  title,
  date,
  location,
  category,
  maximumCount,
  appliedCount,
  balanceCount,
  applyByStudent,
  eventCode,
  eventOrganizer,
  webLink,
  startDate,
  endDate,
  durationDays,
  eventLevel,
  state,
  country,
  withinBit,
  relatedToSpecialLab,
  department,
  competitionName,
  totalLevelOfCompetition,
  eligibleForRewards,
  winnerRewards,
  createdDate,
  updatedDate,
  tags,
  seatsLeft,
  totalSeats,
  image,
  isRegistered = false,
  onRegisterSuccess,
  onOpenDetails,
  onBack,
  mode = "preview",
}: EventCardProps) {
  const safeTotalSeats = Math.max(totalSeats, 1);
  const [currentSeatsLeft, setCurrentSeatsLeft] = useState(Math.max(0, seatsLeft));
  const [hasRegistered, setHasRegistered] = useState(isRegistered);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const safeSeatsLeft = Math.max(0, currentSeatsLeft);
  const seatsRatio = Math.max(0, Math.min(1, safeSeatsLeft / safeTotalSeats));
  const [formData, setFormData] = useState(initialRegistrationFormData);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSoldOut = safeSeatsLeft <= 0 || hasRegistered;

  useEffect(() => {
    setCurrentSeatsLeft(Math.max(0, seatsLeft));
  }, [seatsLeft]);

  useEffect(() => {
    setHasRegistered(isRegistered);
  }, [isRegistered]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
  };

  const isValidPhone = (value: string) => /^[0-9+\-\s]{10,15}$/.test(value.trim());

  const handleCompleteRegistration = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.rollNumber.trim()) {
      setFormError("Please fill all required personal details.");
      return;
    }
    if (!formData.email.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!isValidPhone(formData.phone)) {
      setFormError("Please enter a valid phone number.");
      return;
    }
    if (!formData.teamName.trim()) {
      setFormError("Team name is required.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setHasRegistered(true);
      setCurrentSeatsLeft((prev) => Math.max(0, prev - 1));
      onRegisterSuccess?.(id ?? title);
      setFormData(initialRegistrationFormData);
      setShowRegistrationForm(false);
    }, 300);
  };

  const openDetails = () => {
    onOpenDetails?.(id ?? title);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDetails();
    }
  };

  const formatYesNo = (value?: boolean) => {
    if (value === undefined) return "N/A";
    return value ? "Yes" : "No";
  };

  const formatDetail = (value: unknown) => {
    if (value === undefined || value === null || value === "") {
      return "N/A";
    }
    return String(value);
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return "N/A";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const computedAppliedCount = typeof appliedCount === "number" ? appliedCount : Math.max(0, safeTotalSeats - safeSeatsLeft);
  const computedBalanceCount = typeof balanceCount === "number" ? balanceCount : safeSeatsLeft;
  const computedMaximumCount = typeof maximumCount === "number" ? maximumCount : safeTotalSeats;
  const detailSections = [
    {
      title: "Overview",
      accent: "bg-indigo-50 border-indigo-100",
      rows: [
        { label: "Event Code", value: formatDetail(eventCode) },
        { label: "Event Name", value: formatDetail(title) },
        { label: "Event Organizer", value: formatDetail(eventOrganizer) },
        { label: "Event Category", value: formatDetail(category) },
        { label: "Status", value: formatDetail(status) },
        { label: "Event Level", value: formatDetail(eventLevel) },
      ],
    },
    {
      title: "Schedule & Venue",
      accent: "bg-blue-50 border-blue-100",
      rows: [
        { label: "Start Date", value: formatDateTime(startDate) },
        { label: "End Date", value: formatDateTime(endDate) },
        { label: "Duration (Days)", value: formatDetail(durationDays) },
        { label: "Event Location", value: formatDetail(location) },
        { label: "State", value: formatDetail(state) },
        { label: "Country", value: formatDetail(country) },
      ],
    },
    {
      title: "Participation",
      accent: "bg-emerald-50 border-emerald-100",
      rows: [
        { label: "Maximum Count", value: formatDetail(computedMaximumCount) },
        { label: "Applied Count", value: formatDetail(computedAppliedCount) },
        { label: "Balance Count", value: formatDetail(computedBalanceCount) },
        { label: "Apply By Student", value: formatYesNo(applyByStudent) },
        { label: "Within BIT", value: formatYesNo(withinBit) },
        { label: "Related to Special Lab", value: formatYesNo(relatedToSpecialLab) },
      ],
    },
    {
      title: "Rewards & Audit",
      accent: "bg-amber-50 border-amber-100",
      rows: [
        { label: "Department", value: formatDetail(department) },
        { label: "Competition Name", value: formatDetail(competitionName) },
        { label: "Total Level of Competition", value: formatDetail(totalLevelOfCompetition) },
        { label: "Eligible for Rewards", value: formatYesNo(eligibleForRewards) },
        { label: "Winner Rewards", value: formatDetail(winnerRewards) },
        {
          label: "Web Link",
          value:
            webLink && webLink !== "N/A" ? (
              <a href={webLink} target="_blank" rel="noreferrer" className="text-indigo-700 underline underline-offset-2">
                {webLink}
              </a>
            ) : (
              "N/A"
            ),
        },
        { label: "Created Date", value: formatDateTime(createdDate) },
        { label: "Updated Date", value: formatDateTime(updatedDate) },
      ],
    },
  ];

  if (mode === "details") {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:bg-slate-100"
            aria-label="Go back"
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500">View event details and complete registration</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative h-56 w-full overflow-hidden">
            <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
            <span className="absolute right-4 top-4 rounded-md bg-slate-900/80 px-2 py-1 text-xs font-medium text-white">
              {category}
            </span>
          </div>

          <div className="space-y-5 p-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Event Code</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatDetail(eventCode)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatDetail(status)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Category</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatDetail(category)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Event Level</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatDetail(eventLevel)}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Date</p>
                <p className="text-sm font-medium text-slate-900">{date}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Location</p>
                <p className="text-sm font-medium text-slate-900">{location}</p>
              </div>
            </div>

            {eventLevel && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Level</p>
                <p className="text-sm font-medium text-slate-900">{eventLevel}</p>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Tags</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={`${title}-${tag}`} className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Complete Event Details</h3>
              <div className="grid gap-4 lg:grid-cols-2">
                {detailSections.map((section) => (
                  <div key={section.title} className={`rounded-xl border p-4 ${section.accent}`}>
                    <h4 className="text-sm font-semibold text-slate-900">{section.title}</h4>
                    <div className="mt-3 space-y-2">
                      {section.rows.map((row) => (
                        <div key={`${section.title}-${row.label}`} className="grid grid-cols-1 gap-1 rounded-lg bg-white/80 px-3 py-2 sm:grid-cols-[170px_1fr] sm:gap-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{row.label}</p>
                          <p className="text-sm font-medium text-slate-900 break-words sm:text-right">{row.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between text-sm text-slate-600">
                <span>Seats left: {safeSeatsLeft}</span>
                <span>Total seats: {safeTotalSeats}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200">
                <div
                  className={`h-2 rounded-full ${progressColor(seatsRatio)}`}
                  style={{ width: `${Math.round(seatsRatio * 100)}%` }}
                />
              </div>
            </div>

            <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Registration Information</p>
              <p className="mt-1">Team size: 2-4 members</p>
              <p>Fee: ₹500</p>
              {winnerRewards && <p className="mt-1">Rewards: {winnerRewards}</p>}
            </div>

            <button
              type="button"
              onClick={() => setShowRegistrationForm(true)}
              disabled={isSoldOut}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {hasRegistered ? "Registered" : safeSeatsLeft <= 0 ? "Sold Out" : "Register Now"}
            </button>
          </div>
        </div>

        {showRegistrationForm && !hasRegistered && !isSoldOut && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900">Complete Registration</h3>
            <p className="mb-6 text-sm text-slate-500">Fill all required details to register for this event.</p>

            <form onSubmit={handleCompleteRegistration} className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-slate-900">Personal Details</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="input-base"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="input-base"
                      placeholder="Enter your email address"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="input-base"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Roll Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleInputChange}
                      required
                      className="input-base"
                      placeholder="Enter your roll number"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="input-base"
                      placeholder="Enter your department"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Year</label>
                    <input
                      type="text"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      className="input-base"
                      placeholder="Enter your year"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-slate-900">Team Details</h4>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Team Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleInputChange}
                    required
                    className="input-base"
                    placeholder="Enter your team name"
                  />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paid"
                      checked={formData.paymentMethod === "paid"}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-slate-800">Paid</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-lg border-2 border-amber-400 bg-amber-50 p-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="later"
                      checked={formData.paymentMethod === "later"}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-slate-800">Pay Later</span>
                  </label>
                </div>
              </div>

              {formError && (
                <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {formError}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRegistrationForm(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Submitting..." : "Complete Registration"}
                </button>
              </div>
            </form>
          </div>
        )}

        
      </section>
    );
  }

  return (
    <article
      onClick={openDetails}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
      className="card-interactive overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/15 to-transparent" />
        <span className="absolute right-3 top-3 rounded-md bg-slate-900/80 px-2 py-1 text-xs font-medium text-white">
          {category}
        </span>
        {eventLevel && (
          <span className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-slate-800">
            {eventLevel}
          </span>
        )}
      </div>

      <div className="space-y-3 p-4">
        <p className="text-xs font-semibold tracking-wide text-amber-600">{date}</p>
        <h4 className="line-clamp-2 text-xl font-semibold text-slate-800">{title}</h4>
        <p className="text-sm text-slate-500">📍 {location}</p>
        {winnerRewards && (
          <p className="line-clamp-2 text-sm font-medium text-emerald-700">Rewards: {winnerRewards}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={`${title}-${tag}`} className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
              {tag}
            </span>
          ))}
        </div>

        <div className="pt-2">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
            <span>{safeSeatsLeft} seats left</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100">
            <div
              className={`h-1.5 rounded-full ${progressColor(seatsRatio)}`}
              style={{ width: `${Math.round(seatsRatio * 100)}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openDetails();
          }}
          className="btn-primary w-full"
        >
          View Details
        </button>
        
      </div>
    </article>
  );
}
