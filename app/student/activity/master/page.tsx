'use client'

import React, { useDeferredValue, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  MapPin,
  Search,
} from 'lucide-react'
import { DM_Sans } from 'next/font/google'
import { apiClient, type EventMasterRecord } from '@/lib/api'
import { useRoles } from '@/hooks/useRoles'
import { useAuthStore } from '@/lib/store'

const dmSans = DM_Sans({ subsets: ['latin'] })

type UiEvent = EventMasterRecord
type TabKey = 'all' | 'registered' | 'completed'
type DeliveryFilter = 'all' | 'ONLINE' | 'OFFLINE'

type RegistrationFormData = {
  student: string
  eventCategory: string
  activityEvent: string
  fromDate: string
  toDate: string
  modeOfParticipation: string
  iqacVerification: string
}

const tabs: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All Events' },
  { key: 'registered', label: 'My Registered' },
  { key: 'completed', label: 'Completed' },
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

const buildActivityEventLabel = (event: UiEvent) => {
  return `Event Name : ${event.eventName} - Event Code : ${event.eventCode || 'N/A'} - Event Category : ${event.eventCategory || 'N/A'} - Organizer : ${event.eventOrganizer || 'N/A'} - Start Date : ${toInputDate(event.startDate) || 'N/A'} - End Date : ${toInputDate(event.endDate) || 'N/A'} - Balance Count : ${Math.max(0, event.balanceCount ?? 0)}`
}

const buildRegistrationDefaults = (event: UiEvent, studentName = 'Student Name'): RegistrationFormData => ({
  student: studentName,
  eventCategory: '',
  activityEvent: buildActivityEventLabel(event),
  fromDate: toInputDate(event.startDate),
  toDate: toInputDate(event.endDate || event.startDate),
  modeOfParticipation: getDeliveryMode(event) === 'ONLINE' ? 'Online' : 'Offline',
  iqacVerification: 'Initiated',
})

const getAboutText = (event: UiEvent) => {
  const organizer = event.eventOrganizer || 'the organizing institution'
  return `${event.eventName} is designed to provide practical exposure through structured sessions, hands-on tasks, and guided mentorship by ${organizer}.`
}

const getSeatsProgressTone = (seatsLeft: number, totalSeats: number) => {
  const ratio = totalSeats <= 0 ? 0 : seatsLeft / totalSeats
  if (ratio > 0.5) return 'bg-emerald-500'
  if (ratio > 0.2) return 'bg-amber-500'
  return 'bg-rose-500'
}

function EventCard({
  event,
  onOpenDetails,
}: {
  event: UiEvent
  onOpenDetails: (event: UiEvent) => void
}) {
  const seatsLeft = Math.max(0, event.balanceCount ?? 0)
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
          // src={imageUrl}
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
        <p className="mt-2 text-sm font-medium text-slate-600">Seats left: {seatsLeft}</p>

        
      </div>
    </article>
  )
}

export default function Page() {
  const { isStudent, isAdmin, isVerification } = useRoles()
  const user = useAuthStore((state) => state.user)
  const [events, setEvents] = useState<UiEvent[]>([])
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [level, setLevel] = useState('all')
  const [delivery, setDelivery] = useState<DeliveryFilter>('all')
  const [selectedEvent, setSelectedEvent] = useState<UiEvent | null>(null)
  const [registrationForm, setRegistrationForm] = useState<RegistrationFormData | null>(null)
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false)
  const [registrationSubmitting, setRegistrationSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)

  const deferredSearch = useDeferredValue(search)

  useEffect(() => {
    let isMounted = true

    const loadEvents = async () => {
      try {
        setLoading(true)
        setErrorMessage(null)
        setUsingFallback(false)
        const response = await apiClient.getEvents({ sort: 'desc' })

        if (!isMounted) return
        setEvents(response.events)
        setUsingFallback(false)
        if (response.events.length === 0) {
          setErrorMessage('No events found in the database.')
        }
      } catch (error) {
        if (!isMounted) return
        console.warn('Events could not be loaded from backend at this time.')
        setEvents([])
        setUsingFallback(false)
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

  const canCreate = isAdmin()

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

    if (isStudent()) {
      data = data.filter((event) => isActiveStatus(event))
    }

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
  }, [activeTab, category, deferredSearch, delivery, events, isStudent(), level])

  const counts = useMemo(
    () => ({
      all: isStudent() ? events.filter((event) => isActiveStatus(event)).length : events.length,
      registered: (isStudent() ? events.filter((event) => isActiveStatus(event)) : events).filter((event) => event.appliedCount > 0).length,
      completed: (isStudent() ? events.filter((event) => isActiveStatus(event)) : events).filter((event) => isCompleted(event)).length,
    }),
    [events, isStudent()]
  )

  const activeCount = filteredEvents.filter((event) => isActiveStatus(event)).length

  const openEventDetails = (event: UiEvent) => {
    setSelectedEvent(event)
    setRegistrationForm(buildRegistrationDefaults(event, user?.name || 'Student Name'))
    setRegistrationSubmitted(false)
  }

  const closeEventDetails = () => {
    setSelectedEvent(null)
    setRegistrationForm(null)
    setRegistrationSubmitted(false)
  }

  const handleQuickRegister = async () => {
    if (!selectedEvent || !registrationForm) return

    try {
      setRegistrationSubmitting(true)
      setErrorMessage(null)
      await apiClient.registerForEvent({
        eventId: selectedEvent.id,
        studentName: registrationForm.student,
        studentDepartment: null,
        eventCategory: registrationForm.eventCategory || selectedEvent.eventCategory || null,
        activityEvent: registrationForm.activityEvent,
        fromDate: registrationForm.fromDate || null,
        toDate: registrationForm.toDate || null,
        modeOfParticipation: registrationForm.modeOfParticipation || null,
        iqacVerification: registrationForm.iqacVerification || 'Initiated',
      })

      setRegistrationSubmitted(true)

      setEvents((prev) =>
        prev.map((item) =>
          item.id === selectedEvent.id
            ? {
                ...item,
                appliedCount: item.appliedCount + 1,
                balanceCount: Math.max(0, item.balanceCount - 1),
              }
            : item,
        ),
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to register for the event.'
      setErrorMessage(message)
    } finally {
      setRegistrationSubmitting(false)
    }
  }

  return (
    <div className={`${dmSans.className} mx-auto max-w-[1480px] bg-[#F4F6F8] p-4 sm:p-6 lg:p-8`}>
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        

        <div className="flex flex-wrap gap-3">
          {canCreate ? (
            <Link href="/students/create-event" className="btn-primary">
              Create Event
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
          {isVerification() ? (
            <Link href="/students/verification-panel" className="btn-outline">
              Verification Panel
            </Link>
          ) : null}
        </div>
      </div>
      </div>

      {errorMessage ? <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">{errorMessage}</div> : null}

      {selectedEvent && registrationForm ? (
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
            <section className="space-y-5 overflow-y-auto lg:col-span-3 lg:max-h-[calc(100vh-190px)] lg:pr-1">
              <div className="rounded-[14px] border border-[#E5E9EF] bg-white p-6">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {selectedEvent.eventCategory || 'Competition'}
                </span>
                <h1 className="mt-3 text-3xl font-bold text-slate-900">{selectedEvent.eventName}</h1>
                <p className="mt-2 text-3xl text-slate-500">{selectedEvent.department || 'II Year Only'}</p>

                <div className="mt-4 grid grid-cols-1 gap-3 text-slate-800 sm:grid-cols-2">
                  <p className="flex items-center gap-2 text-xl">
                    <CalendarDays className="h-4 w-4 text-slate-500" />
                    {formatEventDate(selectedEvent.startDate, selectedEvent.endDate)}
                  </p>
                  <p className="flex items-center gap-2 text-xl">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    {selectedEvent.eventOrganizer || selectedEvent.eventLocation || 'Tech Innovation Institute'}
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    icon: CalendarDays,
                    label: 'Start Date',
                    value: toInputDate(selectedEvent.startDate) ? new Date(selectedEvent.startDate as string).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBA',
                  },
                  {
                    icon: Clock3,
                    label: 'End Date',
                    value: toInputDate(selectedEvent.endDate) ? new Date(selectedEvent.endDate as string).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBA',
                  },
                  {
                    icon: MapPin,
                    label: 'Mode',
                    value: getDeliveryMode(selectedEvent),
                  },
                  {
                    icon: MapPin,
                    label: 'State',
                    value: selectedEvent.state || 'All India',
                  },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="rounded-[14px] border border-[#E5E9EF] bg-white p-4">
                      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-medium text-slate-500">{item.label}</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-900">{item.value}</p>
                    </div>
                  )
                })}
              </div>

              <div className="rounded-[14px] border border-[#E5E9EF] bg-white p-6">
                <h3 className="text-4xl font-bold text-slate-900">About This Event</h3>
                <p className="mt-4 text-xl leading-10 text-slate-500">{getAboutText(selectedEvent)}</p>
              </div>
            </section>

            <aside className="space-y-5 lg:sticky lg:top-6 lg:col-span-2 lg:self-start">
              <div className="rounded-[14px] border border-[#E5E9EF] bg-white p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-5xl font-bold text-orange-500">{Math.max(0, selectedEvent.balanceCount ?? 0)}</p>
                    <p className="text-lg text-slate-500">Seats Remaining</p>
                  </div>
                </div>
                <div className="mt-4 h-2 w-full rounded-full bg-slate-200">
                  <div
                    className={`h-2 rounded-full ${getSeatsProgressTone(
                      Math.max(0, selectedEvent.balanceCount ?? 0),
                      Math.max(1, selectedEvent.maximumCount || 1),
                    )}`}
                    style={{
                      width: `${Math.round(
                        (Math.max(0, selectedEvent.balanceCount ?? 0) / Math.max(1, selectedEvent.maximumCount || 1)) * 100,
                      )}%`,
                    }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{Math.max(0, selectedEvent.appliedCount ?? 0)} registered</span>
                  <span>{Math.max(1, selectedEvent.maximumCount || 1)} total capacity</span>
                </div>
              </div>

              <div className="rounded-[14px] border border-[#E5E9EF] bg-white p-5">
              {!registrationSubmitted ? (
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-slate-900">Register for this Event</h3>
                  <p className="text-lg text-slate-500">Secure your spot before it's too late</p>


                  <a
                    href={selectedEvent.webLink || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex w-full items-center justify-center rounded-[14px] border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-50 ${!selectedEvent.webLink ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    Open Event Website
                  </a>

                  <button
                    type="button"
                    disabled={registrationSubmitting || Math.max(0, selectedEvent.balanceCount ?? 0) === 0}
                    onClick={handleQuickRegister}
                    className="w-full rounded-[14px] bg-[#0F172A] px-4 py-3 text-xl font-semibold text-white transition hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {registrationSubmitting ? 'Registering...' : Math.max(0, selectedEvent.balanceCount ?? 0) === 0 ? 'No Seats Left' : 'Register'}
                  </button>
                </div>
              ) : (
                <div className="rounded-[14px] border border-emerald-200 bg-emerald-50 p-5 text-center">
                  <CheckCircle2 className="mx-auto h-11 w-11 text-emerald-600" />
                  <h4 className="mt-3 text-xl font-semibold text-emerald-900">Registration Submitted!</h4>
                  <p className="mt-1 text-sm text-emerald-700">Your application is under review.</p>
                  <span className="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    Status: Pending Approval
                  </span>
                </div>
              )}

              <div className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-700">
                <p className="text-right text-slate-500">Deadline: {formatDeadline(selectedEvent.endDate || selectedEvent.startDate)}</p>
              </div>
              </div>
            </aside>
          </div>
        </section>
      ) : (
      <>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === tab.key ? 'bg-slate-900 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs opacity-70">({counts[tab.key]})</span>
            </button>
          ))}
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2 xl:max-w-4xl xl:grid-cols-4">
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
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <span>{filteredEvents.length} event{filteredEvents.length === 1 ? '' : 's'} shown</span>
        {usingFallback ? <span>Showing fallback data</span> : <span>Data loaded from backend</span>}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-3 w-28 rounded bg-slate-200" />
              <div className="mt-4 h-8 w-4/5 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-2/3 rounded bg-slate-200" />
              <div className="mt-2 h-4 w-1/2 rounded bg-slate-200" />
              <div className="mt-4 h-5 w-full rounded bg-slate-100" />
              <div className="mt-4 h-10 w-36 rounded-xl bg-slate-200" />
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
        <>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} onOpenDetails={openEventDetails} />
          ))}
        </div>
        </>
      )}

      {/* {!loading && activeCount > 0 ? (
        <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
          Active events are emphasized across the dashboard. Full or closed cards are dimmed and their action buttons are disabled.
        </div>
      ) : null} */}
      </>
      )}
    </div>
  )
}
