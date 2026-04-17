"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Calendar, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3, LayoutGrid, MapPin, Save, Shield, Star, User } from "lucide-react"
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
  imgLink: string
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
  imgLink: "",
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
const statuses = ["Active","Not-Active"]
const STEPS = [
  { title: "Identity", icon: User },
  { title: "Schedule", icon: Calendar },
  { title: "Location", icon: MapPin },
  { title: "Competition", icon: Star },
  { title: "Review", icon: Shield },
] as const

// Test data for auto-fill during development/testing
const testFormData: FormState = {
  applyByStudent: true,
  eventCode: `TST-EVT-${Date.now()}`,
  eventName: "Annual Tech Summit 2026",
  aboutThisEvent: "A multi-day practical summit with expert-led sessions, hands-on workshops, and project showcase opportunities for students.",
  eventOrganizer: "Technology Department",
  webLink: "https://techsummit.example.com",
  imgLink: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
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
  const [currentStep, setCurrentStep] = useState(0)

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
                imgLink: event.imgLink || "",
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

  const submitEvent = async () => {
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
      applyByStudent: form.applyByStudent,
      eventCode: form.eventCode.trim(),
      eventName: form.eventName.trim(),
      eventOrganizer: normalizeEmpty(form.eventOrganizer),
      webLink: normalizeEmpty(form.webLink),
      imgLink: normalizeEmpty(form.imgLink),
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

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await submitEvent()
  }

  const validateStep = (stepIndex: number) => {
    if (stepIndex === 0 && (!form.eventCode.trim() || !form.eventName.trim())) {
      setError("Event code and event name are required.")
      return false
    }
    if (stepIndex === 1 && form.endDate && form.startDate && new Date(form.endDate) < new Date(form.startDate)) {
      setError("End date cannot be earlier than start date.")
      return false
    }
    setError("")
    return true
  }

  const handleNext = () => {
    if (!validateStep(currentStep)) return
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
    window.scrollTo(0, 0)
  }

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
    window.scrollTo(0, 0)
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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 rounded-full p-2 text-slate-600 transition hover:bg-slate-200"
              type="button"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{isEditMode ? "Edit Event" : "Add Event Details"}</h1>
              <p className="text-sm text-slate-500">Activity Master Event Wizard</p>
            </div>
          </div>
        </div>

        <div className="mb-8 hidden px-4 lg:block">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 top-5 -z-10 h-0.5 w-full -translate-y-1/2 bg-slate-200" />
            <div
              className="absolute left-0 top-5 -z-10 h-0.5 -translate-y-1/2 bg-indigo-600 transition-all duration-300"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            />
            {STEPS.map((step, idx) => {
              const isCompleted = idx < currentStep
              const isCurrent = idx === currentStep
              const Icon = step.icon
              return (
                <button
                  key={step.title}
                  type="button"
                  className="group flex cursor-pointer flex-col items-center"
                  onClick={() => {
                    if (idx < currentStep || validateStep(currentStep)) {
                      setCurrentStep(idx)
                    }
                  }}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-sm transition-all duration-300 ${
                      isCompleted
                        ? "border-green-500 bg-green-500 text-white shadow-green-100"
                        : isCurrent
                          ? "scale-110 border-indigo-600 bg-white text-indigo-600 ring-4 ring-indigo-50"
                          : "border-slate-300 bg-white text-slate-400"
                    }`}
                  >
                    {isCompleted ? <Check size={18} /> : <Icon size={16} />}
                  </div>
                  <span
                    className={`mt-2 text-[10px] font-bold uppercase tracking-tight transition-colors duration-300 ${
                      isCurrent ? "text-indigo-600" : isCompleted ? "text-green-600" : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:hidden">
          <div className="flex items-center">
            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
              {currentStep + 1}
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-tight text-slate-900">{STEPS[currentStep].title}</h2>
              <p className="text-[10px] font-medium text-slate-500">Step {currentStep + 1} of {STEPS.length}</p>
            </div>
          </div>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          <form onSubmit={onSubmit} className="min-h-[450px] p-6 md:p-10">
            {currentStep === 0 && (
              <section className="space-y-6">
                <div className="mb-6 border-b border-slate-100 pb-2">
                  <div className="mb-1 flex items-center text-indigo-600">
                    <LayoutGrid size={20} className="mr-2" />
                    <h3 className="text-lg font-semibold text-slate-800">Event Identity</h3>
                  </div>
                  <p className="ml-7 text-sm text-slate-500">Core details about the event and organizer.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="md:col-span-2">
                    <span className="mb-1 block text-sm font-medium text-slate-700">Event Name <span className="text-red-500">*</span></span>
                    <input
                      value={form.eventName}
                      onChange={(e) => onChange("eventName", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </label>

                  <label>
                    <span className="mb-1 block text-sm font-medium text-slate-700">Event Code <span className="text-red-500">*</span></span>
                    <input
                      value={form.eventCode}
                      onChange={(e) => onChange("eventCode", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </label>

                  <label>
                    <span className="mb-1 block text-sm font-medium text-slate-700">Apply by Student</span>
                    <select
                      value={form.applyByStudent ? "yes" : "no"}
                      onChange={(e) => onChange("applyByStudent", e.target.value === "yes")}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </label>

                  <label>
                    <span className="mb-1 block text-sm font-medium text-slate-700">Event Category</span>
                    <select
                      value={form.eventCategory}
                      onChange={(e) => onChange("eventCategory", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Choose an option</option>
                      {eventCategories.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="mb-1 block text-sm font-medium text-slate-700">Event Level</span>
                    <select
                      value={form.eventLevel}
                      onChange={(e) => onChange("eventLevel", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Choose an option</option>
                      {eventLevels.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="mb-1 block text-sm font-medium text-slate-700">Status</span>
                    <select
                      value={form.status}
                      onChange={(e) => onChange("status", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {statuses.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="md:col-span-2">
                    <span className="mb-1 block text-sm font-medium text-slate-700">About This Event</span>
                    <textarea
                      value={form.aboutThisEvent}
                      onChange={(e) => onChange("aboutThisEvent", e.target.value)}
                      rows={4}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>

                  <label>
                    <span className="mb-1 block text-sm font-medium text-slate-700">Event Organizer</span>
                    <input
                      value={form.eventOrganizer}
                      onChange={(e) => onChange("eventOrganizer", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>

                  <label>
                    <span className="mb-1 block text-sm font-medium text-slate-700">Web Link</span>
                    <input
                      type="url"
                      value={form.webLink}
                      onChange={(e) => onChange("webLink", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>

                  <label>
                    <span className="mb-1 block text-sm font-medium text-slate-700">Image Link (img_link)</span>
                    <input
                      type="url"
                      value={form.imgLink}
                      onChange={(e) => onChange("imgLink", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </section>
            )}

            {currentStep === 1 && (
              <section className="space-y-6">
                <div className="mb-6 border-b border-slate-100 pb-2">
                  <div className="mb-1 flex items-center text-indigo-600">
                    <Clock3 size={20} className="mr-2" />
                    <h3 className="text-lg font-semibold text-slate-800">Schedule & Capacity</h3>
                  </div>
                  <p className="ml-7 text-sm text-slate-500">Set timeline, duration, and participant count.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label>
                    <span className="mb-1 block text-sm font-medium text-slate-700">Start Date</span>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => onChange("startDate", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>

                  <label>
                    <span className="mb-1 block text-sm font-medium text-slate-700">End Date</span>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => onChange("endDate", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>

                  <div>
                    <span className="mb-1 block text-sm font-medium text-slate-700">Duration (days)</span>
                    <div className="flex h-[42px] items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3">
                      <span className="text-sm font-medium text-slate-900">{durationDays ?? "-"}</span>
                      <span className="text-xs text-slate-500">days</span>
                      <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-lime-100 px-2 py-0.5 text-[11px] font-medium text-lime-800">
                        <Check className="h-3 w-3" />
                        auto
                      </span>
                    </div>
                  </div>

                  <label>
                    <span className="mb-1 block text-sm font-medium text-slate-700">Maximum Count</span>
                    <input
                      type="number"
                      min={0}
                      value={form.maximumCount}
                      onChange={(e) => onChange("maximumCount", Number(e.target.value || 0))}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </section>
            )}

            {currentStep === 2 && (
              <section className="space-y-6">
                <div className="mb-6 border-b border-slate-100 pb-2">
                  <div className="mb-1 flex items-center text-indigo-600">
                    <MapPin size={20} className="mr-2" />
                    <h3 className="text-lg font-semibold text-slate-800">Location</h3>
                  </div>
                  <p className="ml-7 text-sm text-slate-500">Venue details and location metadata.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="md:col-span-2">
                    <span className="mb-1 block text-sm font-medium text-slate-700">Event Location</span>
                    <input
                      value={form.eventLocation}
                      onChange={(e) => onChange("eventLocation", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>

                  <label>
                    <span className="mb-1 block text-sm font-medium text-slate-700">Department</span>
                    <input
                      value={form.department}
                      onChange={(e) => onChange("department", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>

                  <label>
                    <span className="mb-1 block text-sm font-medium text-slate-700">State</span>
                    <input
                      value={form.state}
                      onChange={(e) => onChange("state", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="md:col-span-2">
                    <span className="mb-1 block text-sm font-medium text-slate-700">Country</span>
                    <input
                      value={form.country}
                      onChange={(e) => onChange("country", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <span>
                      <span className="block text-sm text-slate-800">Within BIT</span>
                      <span className="text-[11px] text-slate-500">Event is held inside BIT campus</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={form.withinBit}
                      onChange={(e) => onChange("withinBit", e.target.checked)}
                      className="h-4 w-4"
                    />
                  </label>
                  <label className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <span>
                      <span className="block text-sm text-slate-800">Related to Special Lab</span>
                      <span className="text-[11px] text-slate-500">Requires access to a special lab facility</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={form.relatedToSpecialLab}
                      onChange={(e) => onChange("relatedToSpecialLab", e.target.checked)}
                      className="h-4 w-4"
                    />
                  </label>
                </div>
              </section>
            )}

            {currentStep === 3 && (
              <section className="space-y-6">
                <div className="mb-6 border-b border-slate-100 pb-2">
                  <div className="mb-1 flex items-center text-indigo-600">
                    <Star size={20} className="mr-2" />
                    <h3 className="text-lg font-semibold text-slate-800">Competition</h3>
                  </div>
                  <p className="ml-7 text-sm text-slate-500">Competition and rewards settings.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label>
                    <span className="mb-1 block text-sm font-medium text-slate-700">Competition Name</span>
                    <input
                      value={form.competitionName}
                      onChange={(e) => onChange("competitionName", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>

                  <label>
                    <span className="mb-1 block text-sm font-medium text-slate-700">Level of Competition</span>
                    <input
                      value={form.totalLevelOfCompetition}
                      onChange={(e) => onChange("totalLevelOfCompetition", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>
                </div>

                <label className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <span>
                    <span className="block text-sm text-slate-800">Eligible for Rewards</span>
                    <span className="text-[11px] text-slate-500">Winners receive prize money for this event</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={form.eligibleForRewards}
                    onChange={(e) => onChange("eligibleForRewards", e.target.checked)}
                    className="h-4 w-4"
                  />
                </label>

                {form.eligibleForRewards && (
                  <div>
                    <span className="mb-2 block text-sm font-medium text-slate-700">Winner Rewards (INR)</span>
                    <div className="flex items-center justify-between rounded-md border border-sky-300 bg-sky-100 px-3 py-2.5">
                      <span className="text-xs font-medium text-sky-900">Prize pool</span>
                      <input
                        type="number"
                        min={0}
                        value={form.winnerRewards}
                        onChange={(e) => onChange("winnerRewards", Number(e.target.value || 0))}
                        className="w-28 border-0 bg-transparent p-0 text-right text-xl font-medium text-sky-900 outline-none"
                      />
                    </div>
                  </div>
                )}
              </section>
            )}

            {currentStep === 4 && (
              <section className="space-y-6">
                <div className="mb-6 border-b border-slate-100 pb-2">
                  <div className="mb-1 flex items-center text-indigo-600">
                    <Shield size={20} className="mr-2" />
                    <h3 className="text-lg font-semibold text-slate-800">Review & Submit</h3>
                  </div>
                  <p className="ml-7 text-sm text-slate-500">Verify all event details before finalizing.</p>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold uppercase tracking-wide text-slate-700">Event Summary</div>
                  <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
                    <div><p className="text-xs uppercase tracking-wide text-slate-500">Event Name</p><p className="text-sm text-slate-900">{form.eventName || "Not provided"}</p></div>
                    <div><p className="text-xs uppercase tracking-wide text-slate-500">Event Code</p><p className="text-sm text-slate-900">{form.eventCode || "Not provided"}</p></div>
                    <div><p className="text-xs uppercase tracking-wide text-slate-500">Category</p><p className="text-sm text-slate-900">{form.eventCategory || "Not provided"}</p></div>
                    <div><p className="text-xs uppercase tracking-wide text-slate-500">Level</p><p className="text-sm text-slate-900">{form.eventLevel || "Not provided"}</p></div>
                    <div><p className="text-xs uppercase tracking-wide text-slate-500">Start Date</p><p className="text-sm text-slate-900">{form.startDate || "Not provided"}</p></div>
                    <div><p className="text-xs uppercase tracking-wide text-slate-500">End Date</p><p className="text-sm text-slate-900">{form.endDate || "Not provided"}</p></div>
                    <div><p className="text-xs uppercase tracking-wide text-slate-500">Location</p><p className="text-sm text-slate-900">{form.eventLocation || "Not provided"}</p></div>
                    <div><p className="text-xs uppercase tracking-wide text-slate-500">Max Count</p><p className="text-sm text-slate-900">{form.maximumCount || 0}</p></div>
                    <div className="md:col-span-2"><p className="text-xs uppercase tracking-wide text-slate-500">Image Link</p><p className="text-sm text-slate-900 break-all">{form.imgLink || "Not provided"}</p></div>
                  </div>
                </div>
              </section>
            )}

            {(error || success) && (
              <div className="mt-6 space-y-2">
                {error ? <p className="text-sm text-rose-600">{error}</p> : null}
                {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
              </div>
            )}
          </form>

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-8 py-5 backdrop-blur-sm">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0 || submitting}
              className={`flex items-center rounded-xl border px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
                currentStep === 0
                  ? "cursor-not-allowed border-slate-200 text-slate-300"
                  : "border-slate-300 text-slate-700 hover:border-indigo-300 hover:bg-white hover:text-indigo-600 hover:shadow-md"
              }`}
            >
              <ChevronLeft size={18} className="mr-2" /> Back
            </button>

            <div className="flex flex-wrap items-center gap-2">
              
              {!isEditMode && (
                <button
                  type="button"
                  onClick={clearDraft}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white"
                >
                  Clear Form
                </button>
              )}
              {!isEditMode && (
                <button
                  type="button"
                  onClick={autoFillTestData}
                  className="rounded-xl border border-indigo-200 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                >
                  Auto-Fill
                </button>
              )}

              {currentStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={submitting}
                  className="flex items-center rounded-xl bg-indigo-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition-all duration-200 active:scale-95 disabled:opacity-50"
                >
                  Continue <ChevronRight size={18} className="ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void submitEvent()}
                  disabled={submitting}
                  className="flex items-center rounded-xl bg-green-600 px-10 py-2.5 text-sm font-bold text-white shadow-lg shadow-green-100 transition-all duration-200 active:scale-95 disabled:opacity-50"
                >
                  <ArrowRight size={18} className="mr-2" />
                  {submitting ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Finalize & Update" : "Finalize & Save")}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Link href="/students/activity-master" className="text-sm text-slate-600 hover:text-slate-900">
            Back to Activity Master
          </Link>
        </div>
      </div>
    </div>
  )
}
