"use client";

import React, { useEffect, useState } from "react";
import Card, { activityMasterEvents, type EventCardProps } from "./Card";
import { apiClient, type CreateEventPayload, type EventMasterRecord } from "@/lib/api";

const topTabs = [
  { key: "all", label: "All Events" },
  { key: "registered", label: "My Registered" },
  { key: "completed", label: "Completed" },
] as const;

type TabKey = (typeof topTabs)[number]["key"];

const initialFormData = {
  maximumCount: "",
  appliedCount: "",
  balanceCount: "",
  applyByStudent: "yes",
  eventCode: "",
  eventName: "",
  eventOrganizer: "",
  webLink: "",
  eventCategory: "",
  status: "Active",
  startDate: "",
  endDate: "",
  durationDays: "",
  eventLocation: "",
  eventLevel: "",
  state: "",
  country: "",
  withinBit: "no",
  relatedToSpecialLab: "no",
  department: "",
  competitionName: "",
  totalLevelOfCompetition: "",
  eligibleForRewards: "no",
  winnerRewards: "",
  createdDate: "",
  updatedDate: "",
};

const formFields = [
  { name: "maximumCount", label: "Maximum Count", type: "number" },
  { name: "appliedCount", label: "Applied Count", type: "number" },
  { name: "balanceCount", label: "Balance Count", type: "number" },
  {
    name: "applyByStudent",
    label: "Apply By Student",
    type: "select",
    options: ["yes", "no"],
  },
  { name: "eventCode", label: "Event Code", type: "text" },
  { name: "eventName", label: "Event Name", type: "text" },
  { name: "eventOrganizer", label: "Event Organizer", type: "text" },
  { name: "webLink", label: "Web Link", type: "url" },
  { name: "eventCategory", label: "Event Category", type: "text" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: ["Active", "Inactive", "Draft", "Closed"],
  },
  { name: "startDate", label: "Start Date", type: "date" },
  { name: "endDate", label: "End Date", type: "date" },
  { name: "durationDays", label: "Duration (days)", type: "number" },
  { name: "eventLocation", label: "Event Location", type: "text" },
  { name: "eventLevel", label: "Event Level", type: "text" },
  { name: "state", label: "State", type: "text" },
  { name: "country", label: "Country", type: "text" },
  {
    name: "withinBit",
    label: "With-In BIT",
    type: "select",
    options: ["yes", "no"],
  },
  {
    name: "relatedToSpecialLab",
    label: "Related to Special Lab",
    type: "select",
    options: ["yes", "no"],
  },
  { name: "department", label: "Department", type: "text" },
  { name: "competitionName", label: "Competition Name", type: "text" },
  {
    name: "totalLevelOfCompetition",
    label: "Total Level Of Competition",
    type: "text",
  },
  {
    name: "eligibleForRewards",
    label: "Eligible for Rewards",
    type: "select",
    options: ["yes", "no"],
  },
  { name: "winnerRewards", label: "Winner Rewards", type: "text" },
  { name: "createdDate", label: "Created Date", type: "datetime-local" },
  { name: "updatedDate", label: "Updated Date", type: "datetime-local" },
] as const;

type EventFormData = typeof initialFormData;

const parseNumber = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const toBoolean = (value: string): boolean => value === "yes";

const pickRandom = <T,>(values: readonly T[]): T => values[Math.floor(Math.random() * values.length)];

const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);

const toDateTimeLocalValue = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const calculateBalanceCount = (maximumCount: string, appliedCount: string): string => {
  const max = parseNumber(maximumCount || "0");
  const applied = parseNumber(appliedCount || "0");
  if (!Number.isFinite(max) || !Number.isFinite(applied)) {
    return "";
  }
  return String(Math.max(0, max - applied));
};

const calculateDurationDays = (startDate: string, endDate: string): string => {
  if (!startDate || !endDate) {
    return "";
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return "";
  }

  const dayMs = 24 * 60 * 60 * 1000;
  return String(Math.round((end.getTime() - start.getTime()) / dayMs));
};

const generateFakeEventFormData = (): EventFormData => {
  const themes = ["AI Innovation", "Robotics", "Cyber Security", "Data Science", "Cloud Engineering"] as const;
  const categories = ["Technical Symposium", "Hackathon", "Workshop", "Competition"] as const;
  const levels = ["State Level", "National Level", "Institution Level"] as const;
  const cities = ["Chennai", "Bengaluru", "Hyderabad", "Coimbatore"] as const;
  const departments = ["Computer Science", "Information Technology", "Electronics", "Mechanical"] as const;
  const organizers = [
    "Department of Computer Science",
    "Innovation Cell",
    "Technical Forum",
    "Placement and Training Cell",
  ] as const;
  const states = ["Tamil Nadu", "Karnataka", "Telangana"] as const;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + Math.floor(Math.random() * 10) + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + Math.floor(Math.random() * 4) + 1);
  const theme = pickRandom(themes);
  const year = start.getFullYear();
  const serial = String(Math.floor(Math.random() * 900) + 100);
  const maximumCount = String(150 + Math.floor(Math.random() * 150));
  const appliedCount = String(20 + Math.floor(Math.random() * 70));
  const eventLevel = pickRandom(levels);
  const eventCategory = pickRandom(categories);
  const department = pickRandom(departments);
  const city = pickRandom(cities);
  const state = pickRandom(states);

  return {
    maximumCount,
    appliedCount,
    balanceCount: calculateBalanceCount(maximumCount, appliedCount),
    applyByStudent: "yes",
    eventCode: `${theme.slice(0, 2).toUpperCase()}-${year}-${serial}`,
    eventName: `${theme} Summit ${year}`,
    eventOrganizer: pickRandom(organizers),
    webLink: `https://events.example.com/${theme.toLowerCase().replace(/\s+/g, "-")}-${serial}`,
    eventCategory,
    status: "Active",
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
    durationDays: calculateDurationDays(toDateInputValue(start), toDateInputValue(end)),
    eventLocation: city,
    eventLevel,
    state,
    country: "India",
    withinBit: "no",
    relatedToSpecialLab: "no",
    department,
    competitionName: `${theme} Challenge`,
    totalLevelOfCompetition: eventLevel,
    eligibleForRewards: "yes",
    winnerRewards: "₹50,000 + Internship Opportunity",
    createdDate: toDateTimeLocalValue(now),
    updatedDate: toDateTimeLocalValue(now),
  };
};

const formatEventDate = (startDate: string | null, endDate: string | null): string => {
  if (!startDate && !endDate) {
    return "DATE TBA";
  }

  const toShort = (value: string | null): string => {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const start = toShort(startDate);
  const end = toShort(endDate);

  if (start && end) {
    return `${start} - ${end}`;
  }

  return start || end || "DATE TBA";
};

const mapEventToCardProps = (event: EventMasterRecord) => {
  const totalSeats = event.maximumCount > 0 ? event.maximumCount : Math.max(event.appliedCount + event.balanceCount, 1);
  const seatsLeft = Math.max(0, event.balanceCount);
  const tags = [event.eventLevel, event.eventCategory, event.department, event.competitionName].filter(
    (tag): tag is string => Boolean(tag && tag.trim())
  );

  return {
    id: event.id,
    title: event.eventName,
    date: formatEventDate(event.startDate, event.endDate),
    location: event.eventLocation || event.state || event.country || "Location TBA",
    category: event.eventCategory || event.eventLevel || "General",
    maximumCount: event.maximumCount,
    appliedCount: event.appliedCount,
    balanceCount: event.balanceCount,
    applyByStudent: event.applyByStudent,
    eventCode: event.eventCode,
    eventOrganizer: event.eventOrganizer || undefined,
    webLink: event.webLink || undefined,
    startDate: event.startDate,
    endDate: event.endDate,
    durationDays: event.durationDays,
    eventLevel: event.eventLevel || undefined,
    state: event.state || undefined,
    country: event.country || undefined,
    withinBit: event.withinBit,
    relatedToSpecialLab: event.relatedToSpecialLab,
    department: event.department || undefined,
    competitionName: event.competitionName || undefined,
    totalLevelOfCompetition: event.totalLevelOfCompetition || undefined,
    eligibleForRewards: event.eligibleForRewards,
    winnerRewards: event.winnerRewards || undefined,
    createdDate: event.createdDate,
    updatedDate: event.updatedDate,
    tags: tags.length > 0 ? tags.slice(0, 4) : [event.status],
    seatsLeft,
    totalSeats,
    status: event.status,
    isRegistered: event.appliedCount > 0,
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
  };
};

const getIsCompleted = (event: { status?: string; date: string }) => {
  const normalizedStatus = event.status?.toLowerCase();
  if (normalizedStatus && ["closed", "inactive", "completed"].includes(normalizedStatus)) {
    return true;
  }

  const dateRange = event.date.split(" - ");
  const endDateString = dateRange.length === 2 ? dateRange[1] : dateRange[0];
  const endDate = new Date(endDateString);

  if (Number.isNaN(endDate.getTime())) {
    return false;
  }

  return endDate.getTime() < Date.now();
};



export default function Page() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<EventFormData>(initialFormData);
  const [events, setEvents] = useState<EventCardProps[]>(activityMasterEvents);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedEventKey, setSelectedEventKey] = useState<number | string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const response = await apiClient.getEvents();
      const mapped = response.events.map(mapEventToCardProps);
      setEvents(mapped.length > 0 ? mapped : activityMasterEvents);
    } catch (error) {
      setFetchError("Could not load events from backend. Showing fallback data.");
      setEvents(activityMasterEvents);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "maximumCount" || name === "appliedCount") {
        next.balanceCount = calculateBalanceCount(next.maximumCount, next.appliedCount);
      }
      if (name === "startDate" || name === "endDate") {
        next.durationDays = calculateDurationDays(next.startDate, next.endDate);
      }
      if (name === "eligibleForRewards" && value === "no") {
        next.winnerRewards = "";
      }
      return next;
    });
  };

  const createPayloadFromForm = (data: EventFormData): CreateEventPayload | null => {
    const maximumCount = parseNumber(data.maximumCount);
    const appliedCount = data.appliedCount ? parseNumber(data.appliedCount) : 0;
    const balanceCount = data.balanceCount ? parseNumber(data.balanceCount) : maximumCount - appliedCount;

    if (!data.eventCode.trim() || !data.eventName.trim()) {
      setSaveError("Event code and event name are required.");
      return null;
    }
    if (!Number.isFinite(maximumCount) || maximumCount <= 0) {
      setSaveError("Maximum count must be greater than 0.");
      return null;
    }
    if (!Number.isFinite(appliedCount) || appliedCount < 0) {
      setSaveError("Applied count must be 0 or more.");
      return null;
    }
    if (!Number.isFinite(balanceCount) || balanceCount < 0) {
      setSaveError("Balance count must be 0 or more.");
      return null;
    }
    if (appliedCount + balanceCount > maximumCount) {
      setSaveError("Applied count + balance count cannot exceed maximum count.");
      return null;
    }
    if (data.startDate && data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
      setSaveError("End date cannot be before start date.");
      return null;
    }

    return {
      maximumCount,
      appliedCount,
      balanceCount,
      applyByStudent: toBoolean(data.applyByStudent),
      eventCode: data.eventCode,
      eventName: data.eventName,
      eventOrganizer: data.eventOrganizer || null,
      webLink: data.webLink || null,
      eventCategory: data.eventCategory || null,
      status: data.status,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      durationDays: data.durationDays ? parseNumber(data.durationDays) : null,
      eventLocation: data.eventLocation || null,
      eventLevel: data.eventLevel || null,
      state: data.state || null,
      country: data.country || null,
      withinBit: toBoolean(data.withinBit),
      relatedToSpecialLab: toBoolean(data.relatedToSpecialLab),
      department: data.department || null,
      competitionName: data.competitionName || null,
      totalLevelOfCompetition: data.totalLevelOfCompetition || null,
      eligibleForRewards: toBoolean(data.eligibleForRewards),
      winnerRewards: data.winnerRewards || null,
    };
  };

  const addEventCardLocally = (payload: CreateEventPayload, sourceForm: EventFormData) => {
    const fallbackCreatedDate = sourceForm.createdDate || new Date().toISOString();
    const fallbackUpdatedDate = sourceForm.updatedDate || fallbackCreatedDate;
    const createdCard: EventCardProps = {
      id: Date.now(),
      title: payload.eventName,
      date: formatEventDate(payload.startDate ?? null, payload.endDate ?? null),
      location: payload.eventLocation || payload.state || payload.country || "Location TBA",
      category: payload.eventCategory || payload.eventLevel || "General",
      maximumCount: payload.maximumCount,
      appliedCount: payload.appliedCount,
      balanceCount: payload.balanceCount,
      applyByStudent: payload.applyByStudent,
      eventCode: payload.eventCode,
      eventOrganizer: payload.eventOrganizer || undefined,
      webLink: payload.webLink || undefined,
      startDate: payload.startDate ?? null,
      endDate: payload.endDate ?? null,
      durationDays: payload.durationDays ?? null,
      eventLevel: payload.eventLevel || undefined,
      state: payload.state || undefined,
      country: payload.country || undefined,
      withinBit: payload.withinBit,
      relatedToSpecialLab: payload.relatedToSpecialLab,
      department: payload.department || undefined,
      competitionName: payload.competitionName || undefined,
      totalLevelOfCompetition: payload.totalLevelOfCompetition || undefined,
      eligibleForRewards: payload.eligibleForRewards,
      winnerRewards: payload.winnerRewards || undefined,
      createdDate: fallbackCreatedDate,
      updatedDate: fallbackUpdatedDate,
      tags: [payload.eventLevel, payload.eventCategory, payload.department, payload.competitionName].filter(
        (tag): tag is string => Boolean(tag && tag.trim())
      ),
      seatsLeft: payload.balanceCount,
      totalSeats: payload.maximumCount,
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
      status: payload.status,
      isRegistered: payload.appliedCount > 0,
    };

    if (createdCard.tags.length === 0) {
      createdCard.tags = [payload.status];
    }

    setEvents((prev) => [createdCard, ...prev]);
  };

  const submitCreateEvent = async (data: EventFormData) => {
    setSaveError(null);
    const payload = createPayloadFromForm(data);
    if (!payload) {
      return;
    }

    setIsSaving(true);
    addEventCardLocally(payload, data);
    setIsCreateModalOpen(false);
    setFormData(initialFormData);

    try {
      await apiClient.createEvent(payload);
    } catch (error) {
      setFetchError("Event added in UI. Backend sync failed for this event.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submitCreateEvent(formData);
  };

  const handleAutoGenerateAndSubmit = async () => {
    const fakeData = generateFakeEventFormData();
    setFormData(fakeData);
    await submitCreateEvent(fakeData);
  };

  const handleRegisterSuccess = (eventKey: number | string) => {
    setEvents((prev) =>
      prev.map((event) => {
        const currentKey = event.id ?? event.title;
        if (currentKey !== eventKey) {
          return event;
        }

        return {
          ...event,
          isRegistered: true,
          seatsLeft: Math.max(0, event.seatsLeft - 1),
        };
      })
    );
  };

  const filteredEvents = events.filter((event) => {
    if (activeTab === "all") {
      return true;
    }
    if (activeTab === "registered") {
      return Boolean(event.isRegistered);
    }

    return getIsCompleted(event);
  });

  const selectedEvent = selectedEventKey
    ? events.find((event) => (event.id ?? event.title) === selectedEventKey) ?? null
    : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="space-y-6 sm:space-y-8">
        {!selectedEvent && (
          <>
            <header className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Events</h1>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSaveError(null);
                  setIsCreateModalOpen(true);
                }}
                className="btn-primary"
              >
                Create Event
              </button>
            </header>

            <nav className="overflow-x-auto border-b border-slate-200">
              <ul className="flex w-max items-center gap-6 pb-2">
                {topTabs.map((tab) => (
                  <li key={tab.label}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`inline-flex items-center gap-1 border-b-2 px-0.5 pb-2 text-sm font-medium transition ${
                        activeTab === tab.key
                          ? "border-indigo-600 text-indigo-700"
                          : "border-transparent text-slate-500 hover:text-indigo-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </>
        )}

        {selectedEvent ? (
          <Card
            {...selectedEvent}
            mode="details"
            onBack={() => setSelectedEventKey(null)}
            onRegisterSuccess={handleRegisterSuccess}
          />
        ) : (
          <section className="space-y-4">

            {fetchError && (
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {fetchError}
              </p>
            )}

            {isLoading && <p className="text-sm text-slate-500">Loading events...</p>}

            {!isLoading && filteredEvents.length === 0 ? (
              <p className="rounded-md border border-slate-200 bg-white px-3 py-4 text-sm text-slate-600">
                No events found for this tab.
              </p>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredEvents.map((event, index) => (
                  <Card
                    key={`${event.id ?? event.title}-${index}`}
                    {...event}
                    onRegisterSuccess={handleRegisterSuccess}
                    onOpenDetails={(eventKey) => setSelectedEventKey(eventKey)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Create Event</h2>
                  <p className="text-sm text-slate-500">Fill in event master details</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSaveError(null);
                    setIsCreateModalOpen(false);
                  }}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-6 p-6">
                {saveError && (
                  <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {saveError}
                  </p>
                )}
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {formFields.map((field) => (
                    <div key={field.name}>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {field.label}
                      </label>
                      {field.type === "select" ? (
                        <select
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          className="input-base"
                        >
                          {field.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          readOnly={field.name === "balanceCount" || field.name === "durationDays"}
                          className={`input-base ${
                            field.name === "balanceCount" || field.name === "durationDays" ? "bg-slate-100" : "bg-white"
                          }`}
                          placeholder={`Enter ${field.label}`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    onClick={handleAutoGenerateAndSubmit}
                    disabled={isSaving}
                    className="btn-outline disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Auto Generate & Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSaveError(null);
                      setIsCreateModalOpen(false);
                    }}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary"
                  >
                    {isSaving ? "Saving..." : "Save Event"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
