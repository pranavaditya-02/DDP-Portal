"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, CalendarPlus, LayoutGrid, CheckCircle2, Save } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { apiClient, type CreateEventPayload } from "@/lib/api"
import { useRoles } from "@/hooks/useRoles"

type FormState = {
  applyByStudent: boolean
  eventCode: string
  eventName: string
  aboutThisEvent: string
  eventOrganizer: string
  webLink: string
  eventCategory: string
  status: string
  startDate: string
  endDate: string
  maximumCount: number
  eventLocation: string
  eventLevel: string
  state: string
  country: string
  withinBit: boolean
  relatedToSpecialLab: boolean
  department: string
  competitionName: string
  totalLevelOfCompetition: string
  eligibleForRewards: boolean
  winnerRewards: number
}

const initialForm: FormState = {
  applyByStudent: false,
  eventCode: "",
  eventName: "",
  aboutThisEvent: "",
  eventOrganizer: "",
  webLink: "",
  eventCategory: "",
  status: "Active",
  startDate: "",
  endDate: "",
  maximumCount: 0,
  eventLocation: "",
  eventLevel: "",
  state: "",
  country: "",
  withinBit: true,
  relatedToSpecialLab: false,
  department: "",
  competitionName: "",
  totalLevelOfCompetition: "",
  eligibleForRewards: false,
  winnerRewards: 200,
}

const eventCategories = [
  "Webinar/Seminar",
  "Events-Attended",
  "Workshop",
  "Training program",
  "Paper Presentation",
  "Competition",
  "Project Presentation/Idea Submission",
]

const eventLevels = ["Department", "Institution", "State", "National", "International"]
const statuses = ["Active", "Inactive", "Closed", "Completed"]

// Test data for auto-fill during development/testing
const testFormData: FormState = {
  applyByStudent: true,
  eventCode: `TST-EVT-${Date.now()}`,
  eventName: "Annual Tech Summit 2026",
  aboutThisEvent: "A multi-day practical summit with expert-led sessions, hands-on workshops, and project showcase opportunities for students.",
  eventOrganizer: "Technology Department",
  webLink: "https://techsummit.example.com",
  eventCategory: "Workshop",
  status: "Active",
  startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  maximumCount: 150,
  eventLocation: "Main Auditorium, Building A",
  eventLevel: "Institution",
  state: "Tamil Nadu",
  country: "India",
  withinBit: true,
  relatedToSpecialLab: true,
  department: "Information Technology",
  competitionName: "Code Innovation Challenge",
  totalLevelOfCompetition: "Inter-departmental",
  eligibleForRewards: true,
  winnerRewards: 200,
}

const normalizeEmpty = (value: string) => {
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

const diffDays = (startDate: string, endDate: string): number | null => {
  if (!startDate || !endDate) return null
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
  const dayMs = 24 * 60 * 60 * 1000
  const days = Math.floor((end.getTime() - start.getTime()) / dayMs) + 1
  return days > 0 ? days : 0
}

export default function CreateEventPage() {
  const { isAdmin } = useRoles()
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventCodeParam = searchParams.get('eventCode')
  const isEditMode = !!eventCodeParam

  const [form, setForm] = useState<FormState>(initialForm)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)
  const [loading, setLoading] = useState(isEditMode)

  const durationDays = useMemo(() => diffDays(form.startDate, form.endDate), [form.startDate, form.endDate])

  // Load draft or existing event on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        if (isEditMode && eventCodeParam) {
          // Load existing event for editing
          try {
            const { events } = await apiClient.getEvents()
            const event = events.find(e => e.eventCode === eventCodeParam)
            if (event) {
              setForm({
                applyByStudent: event.applyByStudent,
                eventCode: event.eventCode,
                eventName: event.eventName,
                aboutThisEvent: "",
                eventOrganizer: event.eventOrganizer || "",
                webLink: event.webLink || "",
                eventCategory: event.eventCategory || "",
                status: event.status,
                startDate: event.startDate ? event.startDate.split('T')[0] : "",
                endDate: event.endDate ? event.endDate.split('T')[0] : "",
                maximumCount: event.maximumCount,
                eventLocation: event.eventLocation || "",
                eventLevel: event.eventLevel || "",
                state: event.state || "",
                country: event.country || "",
                withinBit: event.withinBit,
                relatedToSpecialLab: event.relatedToSpecialLab,
                department: event.department || "",
                competitionName: event.competitionName || "",
                totalLevelOfCompetition: event.totalLevelOfCompetition || "",
                eligibleForRewards: event.eligibleForRewards,
                winnerRewards: typeof event.winnerRewards === 'number' ? event.winnerRewards : Number(event.winnerRewards) || 0,
              })
            }
          } catch (err) {
            console.error('Failed to load existing event:', err)
          }
        } else {
          // Load draft from localStorage
          const savedDraft = localStorage.getItem('event_form_draft')
          if (savedDraft) {
            try {
              setForm(JSON.parse(savedDraft))
            } catch (e) {
              console.error('Failed to parse draft:', e)
            }
          }
        }
      } catch (err) {
        console.error('Error loading form data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isEditMode, eventCodeParam])

  // Auto-save draft to localStorage every 10 seconds if form has changes
  useEffect(() => {
    const interval = setInterval(() => {
      const draftData = JSON.stringify(form)
      localStorage.setItem('event_form_draft', draftData)
      setDraftSaved(true)
      setTimeout(() => setDraftSaved(false), 2000)
    }, 10000)

    return () => clearInterval(interval)
  }, [form])

  const onChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const saveDraft = () => {
    const draftData = JSON.stringify(form)
    localStorage.setItem('event_form_draft', draftData)
    setDraftSaved(true)
    setTimeout(() => setDraftSaved(false), 3000)
  }

  const clearDraft = () => {
    localStorage.removeItem('event_form_draft')
    setForm(initialForm)
  }

  const autoFillTestData = () => {
    setForm(testFormData)
    setDraftSaved(false)
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setSuccess("")

    if (!isAdmin()) {
      setError("Only admin users can create events.")
      return
    }

    if (!form.eventCode.trim() || !form.eventName.trim()) {
      setError("Event code and event name are required.")
      return
    }

    if (form.endDate && form.startDate && new Date(form.endDate) < new Date(form.startDate)) {
      setError("End date cannot be earlier than start date.")
      return
    }

    const payload: CreateEventPayload = {
      maximumCount: form.maximumCount,
      appliedCount: 0,
      balanceCount: form.maximumCount,
      applyByStudent: form.applyByStudent,
      eventCode: form.eventCode.trim(),
      eventName: form.eventName.trim(),
      eventOrganizer: normalizeEmpty(form.eventOrganizer),
      webLink: normalizeEmpty(form.webLink),
      eventCategory: normalizeEmpty(form.eventCategory),
      status: form.status,
      startDate: normalizeEmpty(form.startDate),
      endDate: normalizeEmpty(form.endDate),
      durationDays,
      eventLocation: normalizeEmpty(form.eventLocation),
      eventLevel: normalizeEmpty(form.eventLevel),
      state: normalizeEmpty(form.state),
      country: normalizeEmpty(form.country),
      withinBit: form.withinBit,
      relatedToSpecialLab: form.relatedToSpecialLab,
      department: normalizeEmpty(form.department),
      competitionName: normalizeEmpty(form.competitionName),
      totalLevelOfCompetition: normalizeEmpty(form.totalLevelOfCompetition),
      eligibleForRewards: form.eligibleForRewards,
      winnerRewards: normalizeEmpty(String(form.winnerRewards)),
    }

    try {
      setSubmitting(true)
      await apiClient.createEvent(payload)
      setSuccess("Event created successfully.")
      clearDraft()
      setForm(initialForm)
      setTimeout(() => {
        router.push('/students/activity-master')
      }, 2000)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create event.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[900px] mx-auto">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin()) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[900px] mx-auto">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-rose-900">Access denied</h1>
          <p className="mt-2 text-sm text-rose-800">Only admin users can access the Create Event form.</p>
          <div className="mt-5">
            <Link href="/students/activity-master" className="btn-outline inline-flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Back to Activity Master
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1100px] mx-auto">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 mb-4">
          <CalendarPlus className="w-3.5 h-3.5" />
          {isEditMode ? "Edit Event" : "Admin event intake"}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{isEditMode ? "Edit Event" : "Create Event"}</h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          {isEditMode ? "Update the event details below." : "Create a new event master record. It becomes available for registration from Activity Master."}
        </p>

        {draftSaved && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm text-emerald-700">Draft saved locally</span>
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-slate-700">Apply by Student *</span>
              <select
                value={form.applyByStudent ? "yes" : "no"}
                onChange={(e) => onChange("applyByStudent", e.target.value === "yes")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-slate-700">Event Code *</span>
              <input
                value={form.eventCode}
                onChange={(e) => onChange("eventCode", e.target.value)}
                placeholder="Event Code"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                required
              />
            </label>

            <label className="space-y-1.5 text-sm md:col-span-2">
              <span className="font-medium text-slate-700">Event Name *</span>
              <input
                value={form.eventName}
                onChange={(e) => onChange("eventName", e.target.value)}
                placeholder="Event Name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                required
              />
            </label>

            <label className="space-y-1.5 text-sm md:col-span-2">
              <span className="font-medium text-slate-700">About This Event</span>
              <textarea
                value={form.aboutThisEvent}
                onChange={(e) => onChange("aboutThisEvent", e.target.value)}
                placeholder="Write a short overview of the event for students..."
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-slate-700">Event Organizer</span>
              <input
                value={form.eventOrganizer}
                onChange={(e) => onChange("eventOrganizer", e.target.value)}
                placeholder="Event Organizer"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-slate-700">Web Link</span>
              <input
                type="url"
                value={form.webLink}
                onChange={(e) => onChange("webLink", e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-slate-700">Event Category</span>
              <select
                value={form.eventCategory}
                onChange={(e) => onChange("eventCategory", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Choose an option</option>
                {eventCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-slate-700">Status *</span>
              <select
                value={form.status}
                onChange={(e) => onChange("status", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              >
                {statuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-slate-700">Start Date</span>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => onChange("startDate", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-slate-700">End Date</span>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => onChange("endDate", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-slate-700">Maximum Count</span>
              <input
                type="number"
                min={0}
                value={form.maximumCount}
                onChange={(e) => onChange("maximumCount", Number(e.target.value || 0))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-slate-700">Duration (days)</span>
              <input
                value={durationDays ?? ""}
                readOnly
                placeholder="Auto-calculated"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600"
              />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-slate-700">Event Location</span>
              <input
                value={form.eventLocation}
                onChange={(e) => onChange("eventLocation", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-slate-700">Event Level</span>
              <select
                value={form.eventLevel}
                onChange={(e) => onChange("eventLevel", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Choose an option</option>
                {eventLevels.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-slate-700">State</span>
              <input
                value={form.state}
                onChange={(e) => onChange("state", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-slate-700">Country</span>
              <input
                value={form.country}
                onChange={(e) => onChange("country", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-slate-700">Department</span>
              <input
                value={form.department}
                onChange={(e) => onChange("department", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-slate-700">Competition Name</span>
              <input
                value={form.competitionName}
                onChange={(e) => onChange("competitionName", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-slate-700">Total Level of Competition</span>
              <input
                value={form.totalLevelOfCompetition}
                onChange={(e) => onChange("totalLevelOfCompetition", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-slate-700">Winner Rewards</span>
              <input
                type="number"
                min={0}
                value={form.winnerRewards}
                onChange={(e) => onChange("winnerRewards", Number(e.target.value || 0))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                disabled={!form.eligibleForRewards}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <label className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm flex items-center justify-between gap-3">
              <span className="font-medium text-slate-700">Within BIT</span>
              <input
                type="checkbox"
                checked={form.withinBit}
                onChange={(e) => onChange("withinBit", e.target.checked)}
                className="h-4 w-4"
              />
            </label>
            <label className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm flex items-center justify-between gap-3">
              <span className="font-medium text-slate-700">Related to Special Lab</span>
              <input
                type="checkbox"
                checked={form.relatedToSpecialLab}
                onChange={(e) => onChange("relatedToSpecialLab", e.target.checked)}
                className="h-4 w-4"
              />
            </label>
            <label className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm flex items-center justify-between gap-3">
              <span className="font-medium text-slate-700">Eligible for Rewards</span>
              <input
                type="checkbox"
                checked={form.eligibleForRewards}
                onChange={(e) => onChange("eligibleForRewards", e.target.checked)}
                className="h-4 w-4"
              />
            </label>
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Event" : "Create Event")}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              type="button" 
              onClick={saveDraft}
              className="btn-outline inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            {!isEditMode && (
              <button 
                type="button" 
                onClick={clearDraft}
                className="btn-outline text-rose-600 hover:border-rose-300 hover:bg-rose-50"
              >
                Clear Form
              </button>
            )}
            {!isEditMode && (
              <button 
                type="button" 
                onClick={autoFillTestData}
                className="btn-outline text-blue-600 hover:border-blue-300 hover:bg-blue-50"
              >
                Auto-Fill (Testing)
              </button>
            )}
            
          </div>
        </form>
      </div>
    </div>
  )
}
