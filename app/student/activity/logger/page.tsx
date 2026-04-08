'use client'

import React, { useDeferredValue, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Clock3,
  Filter,
  MapPin,
  Search,
  Users,
  User,
  Mail,
  Shield,
} from 'lucide-react'
import { DM_Sans } from 'next/font/google'
import { apiClient, type EventMasterRecord, type EventRegistrationRecord } from '@/lib/api'
import { useRoles } from '@/hooks/useRoles'
import { useAuthStore } from '@/lib/store'

const dmSans = DM_Sans({ subsets: ['latin'] })

type UiEvent = EventMasterRecord
type TabKey = 'all' | 'registered' | 'completed'
type DeliveryFilter = 'all' | 'ONLINE' | 'OFFLINE'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'Avilable Events' },
  { key: 'completed', label: 'Completed Events' },
]

const cardImages = ['/placeholder.jpg', '/placeholder-user.jpg', '/placeholder-logo.png']

const formatEventDate = (startDate: string | null, endDate: string | null) => {
  if (!startDate && !endDate) return 'Date TBA'

  const format = (value: string | null) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const start = format(startDate)
  const end = format(endDate)

  if (start && end) return `${start.toUpperCase()} - ${end.toUpperCase()}`
  return (start || end).toUpperCase()
}

const getDeliveryMode = (event: UiEvent) => {
  const values = [event.eventLocation, event.state, event.country, event.webLink].filter(Boolean).join(' ').toLowerCase()
  if (values.includes('online') || values.includes('zoom') || values.includes('meet') || values.includes('virtual')) {
    return 'ONLINE'
  }
  return 'OFFLINE'
}

const isClosed = (event: UiEvent) => {
  const normalized = event.status.toLowerCase()
  return ['not-active', 'inactive', 'closed', 'completed'].includes(normalized)
}

const isActiveStatus = (event: UiEvent) => {
  const normalized = event.status.trim().toLowerCase()
  return normalized === 'active'
}

const isCompleted = (event: UiEvent) => {
  if (isClosed(event)) return true
  if (!event.endDate) return false
  const endDate = new Date(event.endDate)
  return !Number.isNaN(endDate.getTime()) && endDate.getTime() < Date.now()
}

const getCardImage = (event: UiEvent) => {
  const idx = Math.abs(Number(event.id || 0)) % cardImages.length
  return cardImages[idx]
}

const toInputDate = (value: string | null | undefined) => {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().slice(0, 10)
}

const formatDeadline = (value: string | null) => {
  if (!value) return 'TBA'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'TBA'
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const getAboutText = (event: UiEvent) => {
  const organizer = event.eventOrganizer || 'the organizing institution'
  return `${event.eventName} is designed to provide practical exposure through structured sessions, hands-on tasks, and guided mentorship by ${organizer}.`
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-emerald-100 text-emerald-700'
    case 'rejected':
      return 'bg-rose-100 text-rose-700'
    case 'pending':
    default:
      return 'bg-amber-100 text-amber-700'
  }
}

const getStatusBgColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-emerald-50 border-emerald-200'
    case 'rejected':
      return 'bg-rose-50 border-rose-200'
    case 'pending':
    default:
      return 'bg-amber-50 border-amber-200'
  }
}

function EventCard({
  event,
  onOpenDetails,
}: {
  event: UiEvent
  onOpenDetails: (event: UiEvent) => void
}) {
  const closed = isClosed(event)

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetails(event)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpenDetails(event)
        }
      }}
      className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        closed ? 'border-slate-200 opacity-65 grayscale-[0.2]' : 'border-slate-200'
      }`}
    >
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxBmFlWhIf--GRoU5qIlQ44AUFg9-opDFC7w&s"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute right-2.5 top-2.5 rounded-md bg-slate-900/90 px-2.5 py-1 text-xs font-semibold text-white">
          {event.eventCategory || 'General'}
        </span>
      </div>

      <div className="p-5">
        <h3 className="line-clamp-2 text-2xl font-semibold leading-tight text-slate-900">{event.eventName}</h3>
        <p className="mt-2 text-sm font-medium text-slate-600">Registrations: {event.appliedCount}</p>
      </div>
    </article>
  )
}

function RegistrationRow({ registration }: { registration: EventRegistrationRecord }) {
  return (
    <div className={`rounded-[14px] border p-4 transition ${getStatusBgColor(registration.status)}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-slate-600" />
            <p className="font-semibold text-slate-900">{registration.studentName}</p>
          </div>
          {registration.studentEmail && (
            <div className="flex items-center gap-2 mb-2 text-sm text-slate-600">
              <Mail className="h-3.5 w-3.5" />
              {registration.studentEmail}
            </div>
          )}
          {registration.studentDepartment && (
            <p className="text-sm text-slate-600 mb-2">Dept: {registration.studentDepartment}</p>
          )}
          {registration.modeOfParticipation && (
            <p className="text-sm text-slate-600">Mode: {registration.modeOfParticipation}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(registration.status)}`}>
            {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
          </span>
          {registration.verifiedAt && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Shield className="h-3 w-3" />
              {new Date(registration.verifiedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
      {registration.rejectionReason && (
        <div className="mt-3 rounded bg-white/50 p-2 text-xs text-slate-700">
          <span className="font-semibold">Rejection Reason:</span> {registration.rejectionReason}
        </div>
      )}
    </div>
  )
}

export default function Page() {
  const { isAdmin, isStudent } = useRoles()
  const [events, setEvents] = useState<UiEvent[]>([])
  const [registrations, setRegistrations] = useState<EventRegistrationRecord[]>([])
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [level, setLevel] = useState('all')
  const [delivery, setDelivery] = useState<DeliveryFilter>('all')
  const [selectedEvent, setSelectedEvent] = useState<UiEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingRegistrations, setLoadingRegistrations] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [registrationSortBy, setRegistrationSortBy] = useState<'status' | 'name' | 'date'>('status')

  const deferredSearch = useDeferredValue(search)

  useEffect(() => {
    let isMounted = true

    const loadEvents = async () => {
      try {
        setLoading(true)
        setErrorMessage(null)
        const response = await apiClient.getEvents({ sort: 'desc' })

        if (!isMounted) return
        setEvents(response.events)
        if (response.events.length === 0) {
          setErrorMessage('No events found in the database.')
        }
      } catch (error) {
        if (!isMounted) return
        console.warn('Events could not be loaded from backend at this time.')
        setEvents([])
        setErrorMessage('Could not load events from backend.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadEvents()

    return () => {
      isMounted = false
    }
  }, [])

  const categoryOptions = useMemo(() => {
    const items = Array.from(new Set(events.map((event) => event.eventCategory).filter((value): value is string => Boolean(value))))
    return ['all', ...items]
  }, [events])

  const levelOptions = useMemo(() => {
    const items = Array.from(new Set(events.map((event) => event.eventLevel).filter((value): value is string => Boolean(value))))
    return ['all', ...items]
  }, [events])

  const filteredEvents = useMemo(() => {
    let data = [...events]

    if (activeTab === 'registered') {
      data = data.filter((event) => event.appliedCount > 0)
    }

    if (activeTab === 'completed') {
      data = data.filter((event) => isCompleted(event))
    }

    if (category !== 'all') {
      data = data.filter((event) => (event.eventCategory || 'Uncategorized') === category)
    }

    if (level !== 'all') {
      data = data.filter((event) => (event.eventLevel || 'Unspecified') === level)
    }

    if (delivery !== 'all') {
      data = data.filter((event) => getDeliveryMode(event) === delivery)
    }

    const q = deferredSearch.trim().toLowerCase()
    if (q) {
      data = data.filter((event) => {
        return [event.eventName, event.eventCode, event.eventOrganizer, event.state, event.eventLocation]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q))
      })
    }

    return data
  }, [activeTab, category, deferredSearch, delivery, events, level])

  const counts = useMemo(
    () => ({
      all: events.length,
      registered: events.filter((event) => event.appliedCount > 0).length,
      completed: events.filter((event) => isCompleted(event)).length,
    }),
    [events]
  )

  const openEventDetails = async (event: UiEvent) => {
    setSelectedEvent(event)
    setLoadingRegistrations(true)
    setErrorMessage(null)

    try {
      const response = await apiClient.getRegistrationsByEventId(event.id)
      setRegistrations(response.registrations)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load registrations.'
      setErrorMessage(message)
      setRegistrations([])
    } finally {
      setLoadingRegistrations(false)
    }
  }

  const closeEventDetails = () => {
    setSelectedEvent(null)
    setRegistrations([])
  }

  const sortedRegistrations = useMemo(() => {
    if (!registrations) return []

    const sorted = [...registrations]
    switch (registrationSortBy) {
      case 'name':
        sorted.sort((a, b) => a.studentName.localeCompare(b.studentName))
        break
      case 'date':
        sorted.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
        break
      case 'status':
      default:
        sorted.sort((a, b) => {
          const statusOrder = { pending: 0, approved: 1, rejected: 2 }
          return (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3)
        })
    }
    return sorted
  }, [registrations, registrationSortBy])

  const statusCounts = useMemo(() => {
    return {
      pending: registrations.filter((r) => r.status === 'pending').length,
      approved: registrations.filter((r) => r.status === 'approved').length,
      rejected: registrations.filter((r) => r.status === 'rejected').length,
    }
  }, [registrations])

  return (
    <div className={`${dmSans.className} mx-auto max-w-[1480px] bg-[#F4F6F8] p-4 sm:p-6 lg:p-8`}>
      {errorMessage ? <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">{errorMessage}</div> : null}

      {selectedEvent ? (
        <section>
          <button
            type="button"
            onClick={closeEventDetails}
            className="mb-4 inline-flex items-center gap-2 rounded-[14px] border border-[#E5E9EF] bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
            <section className="space-y-5 lg:col-span-3">
              <div className="rounded-[16px] border border-[#E5E9EF] bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-md border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                    {selectedEvent.eventCategory || 'Competition'}
                  </span>
                  <span className="inline-flex rounded-md border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                    {selectedEvent.eventCode || 'No Code'}
                  </span>
                </div>

                <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{selectedEvent.eventName}</h1>
                <p className="mt-2 text-sm font-medium uppercase tracking-wide text-slate-500">
                  {selectedEvent.eventOrganizer || selectedEvent.eventLocation || 'Organizer TBA'}
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Event Duration</p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <CalendarDays className="h-4 w-4 text-slate-500" />
                      {formatEventDate(selectedEvent.startDate, selectedEvent.endDate)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{selectedEvent.durationDays ? `${selectedEvent.durationDays} day(s)` : 'Duration TBA'}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Location</p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      {getDeliveryMode(selectedEvent)} - {selectedEvent.eventLevel || 'General'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{selectedEvent.state || selectedEvent.country || 'All Regions'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: Building2,
                    label: 'Within BIT',
                    value: selectedEvent.withinBit ? 'Yes' : 'No',
                    tone: 'bg-blue-50 border-blue-100',
                  },
                  {
                    icon: Clock3,
                    label: 'Special Lab',
                    value: selectedEvent.relatedToSpecialLab ? 'Yes' : 'N/A',
                    tone: 'bg-violet-50 border-violet-100',
                  },
                  {
                    icon: Users,
                    label: 'Department',
                    value: selectedEvent.department || 'All Departments',
                    tone: 'bg-emerald-50 border-emerald-100',
                  },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className={`rounded-[14px] border p-4 ${item.tone}`}>
                      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{item.value}</p>
                    </div>
                  )
                })}
              </div>

              <div className="rounded-[14px] border border-[#E5E9EF] bg-white p-6">
                <h3 className="text-3xl font-bold text-slate-900">About This Event</h3>
                <p className="mt-4 text-lg leading-9 text-slate-600">{getAboutText(selectedEvent)}</p>
              </div>
            </section>

            <aside className="space-y-5 lg:sticky lg:top-6 lg:col-span-2 lg:self-start">
              <div className="rounded-[16px] border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                        {isClosed(selectedEvent) ? 'Closed' : 'Active'}
                      </span>
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">Logger View</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-5xl font-bold text-orange-500">{registrations.length}</p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Registered</p>
                  </div>
                </div>

                <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Verification Progress</p>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-indigo-500"
                    style={{
                      width: `${Math.round((statusCounts.approved / Math.max(1, registrations.length)) * 100)}%`,
                    }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                  <span>{statusCounts.approved} approved</span>
                  <span>{statusCounts.pending} pending</span>
                </div>
              </div>

              <div className="rounded-[14px] border border-[#E5E9EF] bg-white p-5">
                <h3 className="text-2xl font-semibold text-slate-900">Event Actions</h3>
                <p className="mt-1 text-sm text-slate-500">Open the event page or review timeline details.</p>

                <a
                  href={selectedEvent.webLink || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-4 inline-flex w-full items-center justify-center rounded-[12px] border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 ${!selectedEvent.webLink ? 'pointer-events-none opacity-50' : ''}`}
                >
                  Visit Event Page
                </a>

                <div className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-700">
                  <p className="text-right text-slate-500">Start Date: {formatDeadline(selectedEvent.startDate)}</p>
                  <p className="mt-1 text-right text-slate-500">End Date: {formatDeadline(selectedEvent.endDate || selectedEvent.startDate)}</p>
                </div>
              </div>

              <div className="rounded-[14px] border border-[#E5E9EF] bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-900">Registrations</h3>
                  <div className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                    <Users className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-semibold text-slate-700">{registrations.length}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
                    <p className="font-semibold text-amber-900">{statusCounts.pending}</p>
                    <p className="text-amber-700">Pending</p>
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
                    <p className="font-semibold text-emerald-900">{statusCounts.approved}</p>
                    <p className="text-emerald-700">Approved</p>
                  </div>
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-center">
                    <p className="font-semibold text-rose-900">{statusCounts.rejected}</p>
                    <p className="text-rose-700">Rejected</p>
                  </div>
                </div>

                {!loadingRegistrations && registrations.length > 0 && (
                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-semibold text-slate-600">Sort by:</label>
                    <select
                      value={registrationSortBy}
                      onChange={(e) => setRegistrationSortBy(e.target.value as 'status' | 'name' | 'date')}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="status">Status</option>
                      <option value="name">Student Name</option>
                      <option value="date">Registration Date</option>
                    </select>
                  </div>
                )}
              </div>
            </aside>
          </div>

          <div className="mt-5">
            {loadingRegistrations ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-[14px] border border-slate-200 bg-white p-4" />
                ))}
              </div>
            ) : registrations.length === 0 ? (
              <div className="rounded-[14px] border border-slate-200 bg-white p-8 text-center">
                <Users className="mx-auto h-10 w-10 text-slate-300" />
                <h4 className="mt-4 text-lg font-semibold text-slate-900">No Registrations</h4>
                <p className="mt-2 text-sm text-slate-500">No students have registered for this event yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedRegistrations.map((registration) => (
                  <RegistrationRow key={registration.id} registration={registration} />
                ))}
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-slate-900">Activity Logger</h1>
              <p className="text-sm text-slate-600">View all events and their registrations</p>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition whitespace-nowrap ${
                    activeTab === tab.key ? 'bg-slate-900 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 text-xs opacity-70">({counts[tab.key]})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search event name or code"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100">
              {categoryOptions.map((item) => (
                <option key={item} value={item}>
                  {item === 'all' ? 'All Categories' : item}
                </option>
              ))}
            </select>

            <select value={level} onChange={(e) => setLevel(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100">
              {levelOptions.map((item) => (
                <option key={item} value={item}>
                  {item === 'all' ? 'All Levels' : item}
                </option>
              ))}
            </select>

            <select value={delivery} onChange={(e) => setDelivery(e.target.value as DeliveryFilter)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100">
              <option value="all">Online / Offline</option>
              <option value="ONLINE">ONLINE</option>
              <option value="OFFLINE">OFFLINE</option>
            </select>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <span>{filteredEvents.length} event{filteredEvents.length === 1 ? '' : 's'} shown</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="h-3 w-28 rounded bg-slate-200" />
                  <div className="mt-4 h-8 w-4/5 rounded bg-slate-200" />
                  <div className="mt-3 h-4 w-2/3 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <Filter className="mx-auto h-10 w-10 text-slate-300" />
              <h2 className="mt-4 text-lg font-semibold text-slate-900">No events found</h2>
              <p className="mt-2 text-sm text-slate-500">Try adjusting the filters or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} onOpenDetails={openEventDetails} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
