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
type TabKey = 'active' | 'completed'
type DeliveryFilter = 'all' | 'ONLINE' | 'OFFLINE'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'active', label: 'Active Events' },
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
  if (event.imgLink && event.imgLink.trim().length > 0) {
    return event.imgLink.trim()
  }
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
  const imageUrl = getCardImage(event)

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
          src={imageUrl}
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
  const { isAdmin, isFaculty, isHod, isDean, isVerification, isMaintenance } = useRoles()
  const [events, setEvents] = useState<UiEvent[]>([])
  const [registrations, setRegistrations] = useState<EventRegistrationRecord[]>([])
  const [activeTab, setActiveTab] = useState<TabKey>('active')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [level, setLevel] = useState('all')
  const [delivery, setDelivery] = useState<DeliveryFilter>('all')
  const [selectedEvent, setSelectedEvent] = useState<UiEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingRegistrations, setLoadingRegistrations] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [registrationSortBy, setRegistrationSortBy] = useState<'status' | 'name' | 'date'>('status')
  const [registrationStatusFilter, setRegistrationStatusFilter] = useState<'all' | 'approved' | 'rejected' | 'pending'>('all')

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

    if (activeTab === 'active') {
      data = data.filter((event) => isActiveStatus(event) && !isCompleted(event))
    } else if (activeTab === 'completed') {
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
      active: events.filter((event) => isActiveStatus(event) && !isCompleted(event)).length,
      completed: events.filter((event) => isCompleted(event)).length,
    }),
    [events]
  )

  const openEventDetails = async (event: UiEvent) => {
    setSelectedEvent(event)
    setLoadingRegistrations(true)
    setErrorMessage(null)
    setRegistrationStatusFilter('all')

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

  const visibleRegistrations = useMemo(() => {
    if (registrationStatusFilter === 'all') return registrations
    return registrations.filter((r) => r.status === registrationStatusFilter)
  }, [registrations, registrationStatusFilter])

  const sortedRegistrations = useMemo(() => {
    if (!visibleRegistrations) return []

    const sorted = [...visibleRegistrations]
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
  }, [visibleRegistrations, registrationSortBy])

  const statusCounts = useMemo(() => {
    return {
      pending: registrations.filter((r) => r.status === 'pending').length,
      approved: registrations.filter((r) => r.status === 'approved').length,
      rejected: registrations.filter((r) => r.status === 'rejected').length,
    }
  }, [registrations])
  const selectedEventImage = selectedEvent ? getCardImage(selectedEvent) : cardImages[0]
  const canAccessLogger = isFaculty() || isHod() || isDean() || isVerification() || isMaintenance()

  if (!canAccessLogger) {
    return (
      <div className={`${dmSans.className} min-h-screen w-full bg-[#F4F6F8] p-4 sm:p-6 lg:p-8`}>
        <div className="mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <h1 className="text-2xl font-bold text-rose-900">Access denied</h1>
          <p className="mt-2 text-sm text-rose-800">Activity Logger is available for faculty, HOD, dean, verification, and admin roles only.</p>
          <Link href="/student/activity/master" className="mt-4 inline-flex rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-900">
            Go to Activity Master
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`${dmSans.className} min-h-screen w-full bg-[#F4F6F8] p-4 sm:p-6 lg:p-8`}>
      
      {selectedEvent ? (
        <section className="w-full">
          <button
            type="button"
            onClick={closeEventDetails}
            className="mb-4 inline-flex items-center gap-2 rounded-[14px] border border-[#E5E9EF] bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(240px,1fr)_minmax(0,1.8fr)]">
              <section className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="relative h-48 w-full sm:h-56 lg:h-64">
                    <img
                      src={selectedEventImage}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="min-h-[280px] rounded-2xl border border-slate-200 bg-white p-6 ">
                  <h3 className="text-3xl font-semibold text-slate-900">About the Event</h3>
                  <p className="mt-4 text-base leading-8 text-slate-600">{getAboutText(selectedEvent)}</p>
                </div>
              </section>

              <section className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="text-2xl font-semibold text-slate-900">Location & Eligibility</h3>
                    <p className="mt-4 flex items-start gap-2 text-sm text-slate-700">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                      {selectedEvent.eventLocation || selectedEvent.state || selectedEvent.country || 'Location TBA'}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      {getDeliveryMode(selectedEvent)} • {selectedEvent.eventOrganizer || 'Organizer TBA'}
                    </p>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-500" />
                        Department: {selectedEvent.department || 'All Departments'}
                      </p>
                      <p>Level: {selectedEvent.eventLevel || 'General'}</p>
                      <p>Within BIT: {selectedEvent.withinBit ? 'Yes' : 'No'}</p>
                      <p>Special Lab: {selectedEvent.relatedToSpecialLab ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="text-2xl font-semibold text-slate-900">Date and Time</h3>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-slate-500" />
                        {formatEventDate(selectedEvent.startDate, selectedEvent.endDate)}
                      </p>
                      <p>Duration: {selectedEvent.durationDays ? `${selectedEvent.durationDays} day(s)` : 'TBA'}</p>
                      <p>Starts: {formatDeadline(selectedEvent.startDate)}</p>
                      <p>Ends: {formatDeadline(selectedEvent.endDate || selectedEvent.startDate)}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-3xl font-semibold text-slate-900">Registration</h3>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                      Logger View
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">
                      {isClosed(selectedEvent) ? 'Closed' : 'Active'}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-3">
                      <p className="text-xs font-semibold uppercase text-slate-600">Total Registered</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{registrations.length}</p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-3">
                      <p className="text-xs font-semibold uppercase text-emerald-700">Approved</p>
                      <p className="mt-2 text-2xl font-bold text-emerald-900">{statusCounts.approved}</p>
                    </div>
                    <div className="rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100 p-3">
                      <p className="text-xs font-semibold uppercase text-rose-700">Rejected</p>
                      <p className="mt-2 text-2xl font-bold text-rose-900">{statusCounts.rejected}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Verification Progress</p>
                  <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-2 bg-emerald-500"
                      style={{
                        width: `${Math.round((statusCounts.approved / Math.max(1, registrations.length)) * 100)}%`,
                      }}
                    />
                    <div
                      className="h-2 bg-rose-500"
                      style={{
                        width: `${Math.round((statusCounts.rejected / Math.max(1, registrations.length)) * 100)}%`,
                      }}
                    />
                    <div
                      className="h-2 bg-amber-400"
                      style={{
                        width: `${Math.round((statusCounts.pending / Math.max(1, registrations.length)) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-amber-700">{statusCounts.pending} pending</span>
                    <span className="text-emerald-700">{statusCounts.approved} approved</span>
                    <span className="text-rose-700">{statusCounts.rejected} rejected</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-5 w-full rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-2xl font-semibold text-slate-900">Event Actions</h3>
              <p className="mt-1 text-sm text-slate-500">Open the event page.</p>

              <a
                href={selectedEvent.webLink || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-4 inline-flex w-full items-center justify-center rounded-[12px] border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 ${!selectedEvent.webLink ? 'pointer-events-none opacity-50' : ''}`}
              >
                Visit Event Page
              </a>

              
            </div>

            <div className="mt-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {([
                  { key: 'all', label: 'All', count: registrations.length },
                  { key: 'approved', label: 'Approved', count: statusCounts.approved },
                  { key: 'rejected', label: 'Rejected', count: statusCounts.rejected },
                  { key: 'pending', label: 'Pending', count: statusCounts.pending },
                ] as const).map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setRegistrationStatusFilter(option.key)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      registrationStatusFilter === option.key
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {option.label} ({option.count})
                  </button>
                ))}
              </div>

              {loadingRegistrations ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-24 animate-pulse rounded-[14px] border border-slate-200 bg-white p-4" />
                  ))}
                </div>
              ) : sortedRegistrations.length === 0 ? (
                <div className="rounded-[14px] border border-slate-200 bg-white p-8 text-center">
                  <Users className="mx-auto h-10 w-10 text-slate-300" />
                  <h4 className="mt-4 text-lg font-semibold text-slate-900">No Matching Registrations</h4>
                  <p className="mt-2 text-sm text-slate-500">No registrations found for the selected status filter.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedRegistrations.map((registration) => (
                    <RegistrationRow key={registration.id} registration={registration} />
                  ))}
                </div>
              )}
            </div>
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

          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    activeTab === tab.key ? 'bg-[#7D53F6] text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-[#7D53F6]/40 hover:bg-[#7D53F6]/5'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 text-xs opacity-70">({counts[tab.key]})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-2 rounded-2xl">
          <div className="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search event name or code"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#7D53F6] focus:ring-2 focus:ring-[#7D53F6]/20"
              />
            </div>

            <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#7D53F6] focus:ring-2 focus:ring-[#7D53F6]/20">
              {categoryOptions.map((item) => (
                <option key={item} value={item}>
                  {item === 'all' ? 'All Categories' : item}
                </option>
              ))}
            </select>

            <select value={level} onChange={(e) => setLevel(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#7D53F6] focus:ring-2 focus:ring-[#7D53F6]/20">
              {levelOptions.map((item) => (
                <option key={item} value={item}>
                  {item === 'all' ? 'All Levels' : item}
                </option>
              ))}
            </select>

            <select value={delivery} onChange={(e) => setDelivery(e.target.value as DeliveryFilter)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#7D53F6] focus:ring-2 focus:ring-[#7D53F6]/20">
              <option value="all">Online / Offline</option>
              <option value="ONLINE">ONLINE</option>
              <option value="OFFLINE">OFFLINE</option>
            </select>
          </div>
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
