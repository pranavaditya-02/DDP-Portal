'use client'

import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, ShieldCheck, Clock3, Search, Inbox, Calendar, Users, Tag, User, Mail } from 'lucide-react'
import { DM_Sans } from 'next/font/google'
import { apiClient, type EventMasterRecord, type EventRegistrationRecord } from '@/lib/api'
import { useRoles } from '@/hooks/useRoles'

type RecordStatus = 'approved' | 'pending' | 'rejected'

const STATUS_OPTIONS = ['all', 'approved', 'pending', 'rejected'] as const

const dmSans = DM_Sans({ subsets: ['latin'] })

const cardImages = ['/placeholder.jpg', '/placeholder-user.jpg', '/placeholder-logo.png']

type RegistrationStatusFilter = 'all' | RecordStatus
type EventDivision = 'active' | 'completed'

type EventCardSummary = {
  eventId: number
  eventName: string
  eventCode: string
  eventCategory: string
  eventLevel: string
  imageUrl: string
  latestUpdated: string | null
  counts: {
    approved: number
    pending: number
    rejected: number
  }
  total: number
}

function StatusBadge({ status }: { status: RecordStatus }) {
  const config = {
    approved: { icon: CheckCircle2, class: 'bg-emerald-50 text-emerald-600', label: 'Approved' },
    pending: { icon: Clock3, class: 'bg-amber-50 text-amber-600', label: 'Pending' },
    rejected: { icon: XCircle, class: 'bg-red-50 text-red-600', label: 'Rejected' },
  }
  const cfg = config[status]
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.class}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

const getStatusColor = (status: RecordStatus) => {
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

const getStatusBgColor = (status: RecordStatus) => {
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

const isClosedEventStatus = (status: string) => {
  const normalized = status.trim().toLowerCase()
  return ['not-active', 'inactive', 'closed', 'completed'].includes(normalized)
}

const isEventCompleted = (event?: EventMasterRecord) => {
  if (!event) return false
  if (isClosedEventStatus(event.status)) return true
  if (!event.endDate) return false

  const endDate = new Date(event.endDate)
  return !Number.isNaN(endDate.getTime()) && endDate.getTime() < Date.now()
}

export default function VerificationPanelPage() {
  const { isVerification, isAdmin } = useRoles()
  const [records, setRecords] = useState<EventRegistrationRecord[]>([])
  const [eventsById, setEventsById] = useState<Record<number, EventMasterRecord>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_OPTIONS[number]>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [modeFilter, setModeFilter] = useState('all')
  const [eventDivision, setEventDivision] = useState<EventDivision>('active')
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistrationRecord[]>([])
  const [eventRegistrationFilter, setEventRegistrationFilter] = useState<RegistrationStatusFilter>('pending')
  const [loadingEventRegistrations, setLoadingEventRegistrations] = useState(false)
  const [eventDetailsError, setEventDetailsError] = useState<string | null>(null)
  const deferredSearch = useDeferredValue(search)

  const canVerify = isVerification() || isAdmin()

  const loadRecords = async () => {
    try {
      setLoading(true)
      setError(null)
      const [registrationResponse, eventResponse] = await Promise.all([
        apiClient.getVerificationRegistrations(),
        apiClient.getEvents({ sort: 'desc' }),
      ])

      setRecords(registrationResponse.registrations)
      const eventMap = eventResponse.events.reduce<Record<number, EventMasterRecord>>((acc, event) => {
        acc[event.id] = event
        return acc
      }, {})
      setEventsById(eventMap)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load verification records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!canVerify) {
      setLoading(false)
      return
    }

    loadRecords()
  }, [canVerify])

  const filtered = useMemo(() => {
    let data = [...records]

    // Search
    if (deferredSearch) {
      const q = deferredSearch.toLowerCase()
      data = data.filter(r => 
        r.studentName.toLowerCase().includes(q) || 
        r.eventName.toLowerCase().includes(q) ||
        r.eventCode.toLowerCase().includes(q)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      data = data.filter(r => r.status === statusFilter)
    }

    if (categoryFilter !== 'all') {
      data = data.filter(r => (r.eventCategory || 'N/A') === categoryFilter)
    }

    if (levelFilter !== 'all') {
      data = data.filter(r => (r.eventLevel || 'N/A') === levelFilter)
    }

    if (modeFilter !== 'all') {
      data = data.filter(r => (r.modeOfParticipation || 'N/A') === modeFilter)
    }

    return data
  }, [records, deferredSearch, statusFilter, categoryFilter, levelFilter, modeFilter])

  const categoryOptions = useMemo(
    () => ['all', ...Array.from(new Set(records.map((record) => record.eventCategory || 'N/A')))],
    [records]
  )

  const levelOptions = useMemo(
    () => ['all', ...Array.from(new Set(records.map((record) => record.eventLevel || 'N/A')))],
    [records]
  )

  const modeOptions = useMemo(
    () => ['all', ...Array.from(new Set(records.map((record) => record.modeOfParticipation || 'N/A')))],
    [records]
  )

  const stats = useMemo(() => ({
    all: records.length,
    approved: records.filter((record) => record.status === 'approved').length,
    pending: records.filter((record) => record.status === 'pending').length,
    rejected: records.filter((record) => record.status === 'rejected').length,
  }), [records])

  const pendingByEventId = useMemo(() => {
    const map = new Map<number, number>()
    records.forEach((record) => {
      if (record.status !== 'pending') return
      map.set(record.eventId, (map.get(record.eventId) || 0) + 1)
    })
    return map
  }, [records])

  const handleApprove = async (registrationId: number) => {
    try {
      setUpdatingId(registrationId)
      const response = await apiClient.approveRegistration(registrationId)
      setRecords((prev) => prev.map((record) => (record.id === registrationId ? response.registration : record)))
      setEventRegistrations((prev) => prev.map((record) => (record.id === registrationId ? response.registration : record)))
      window.dispatchEvent(new Event('verification-pending-updated'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve registration')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleReject = async (registrationId: number) => {
    const reason = window.prompt('Enter rejection reason:')
    if (!reason || !reason.trim()) return

    try {
      setUpdatingId(registrationId)
      const response = await apiClient.rejectRegistration(registrationId, reason.trim())
      setRecords((prev) => prev.map((record) => (record.id === registrationId ? response.registration : record)))
      setEventRegistrations((prev) => prev.map((record) => (record.id === registrationId ? response.registration : record)))
      window.dispatchEvent(new Event('verification-pending-updated'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject registration')
    } finally {
      setUpdatingId(null)
    }
  }

  if (!canVerify) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-rose-900">Access denied</h1>
          <p className="mt-2 text-sm text-rose-800">Only verification or admin users can access this panel.</p>
          <div className="mt-5">
            <Link href="/students/activity-master" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition-colors">
              Back to Activity Master
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (value: string | null) => {
    if (!value) return 'N/A'
    const dt = new Date(value)
    if (Number.isNaN(dt.getTime())) return value
    return dt.toLocaleString()
  }

  const getCardImage = (record: EventRegistrationRecord) => {
    const event = eventsById[record.eventId]
    if (event?.imgLink && event.imgLink.trim().length > 0) {
      return event.imgLink.trim()
    }
    const idx = Math.abs(Number(record.eventId || 0)) % cardImages.length
    return cardImages[idx]
  }

  const openEventDetails = async (eventId: number) => {
    setSelectedEventId(eventId)
    setEventRegistrationFilter('pending')
    setEventDetailsError(null)
    setLoadingEventRegistrations(true)

    try {
      const response = await apiClient.getRegistrationsByEventId(eventId)
      setEventRegistrations(response.registrations)
    } catch (err) {
      setEventDetailsError(err instanceof Error ? err.message : 'Failed to load event registrations')
      setEventRegistrations([])
    } finally {
      setLoadingEventRegistrations(false)
    }
  }

  const closeEventDetails = () => {
    setSelectedEventId(null)
    setEventRegistrations([])
    setEventRegistrationFilter('pending')
    setEventDetailsError(null)
  }

  const eventCards = useMemo(() => {
    const map = new Map<number, EventCardSummary>()

    filtered.forEach((record) => {
      const existing = map.get(record.eventId)
      if (existing) {
        existing.total += 1
        existing.counts[record.status] += 1
        if (!existing.latestUpdated || new Date(record.updatedDate).getTime() > new Date(existing.latestUpdated).getTime()) {
          existing.latestUpdated = record.updatedDate
        }
        return
      }

      map.set(record.eventId, {
        eventId: record.eventId,
        eventName: record.eventName || 'Untitled Event',
        eventCode: record.eventCode || 'N/A',
        eventCategory: record.eventCategory || 'General',
        eventLevel: record.eventLevel || 'N/A',
        imageUrl: getCardImage(record),
        latestUpdated: record.updatedDate || null,
        counts: {
          pending: record.status === 'pending' ? 1 : 0,
          approved: record.status === 'approved' ? 1 : 0,
          rejected: record.status === 'rejected' ? 1 : 0,
        },
        total: 1,
      })
    })

    return Array.from(map.values()).sort((a, b) => {
      const aTime = a.latestUpdated ? new Date(a.latestUpdated).getTime() : 0
      const bTime = b.latestUpdated ? new Date(b.latestUpdated).getTime() : 0
      return bTime - aTime
    })
  }, [filtered])

  const selectedEventSummary = useMemo(() => {
    if (!selectedEventId) return null

    return eventCards.find((card) => card.eventId === selectedEventId) || null
  }, [eventCards, selectedEventId])

  const divisionCounts = useMemo(
    () => ({
      active: eventCards.filter((card) => !isEventCompleted(eventsById[card.eventId])).length,
      completed: eventCards.filter((card) => isEventCompleted(eventsById[card.eventId])).length,
    }),
    [eventCards, eventsById]
  )

  const visibleEventCards = useMemo(() => {
    if (eventDivision === 'active') {
      return eventCards.filter((card) => !isEventCompleted(eventsById[card.eventId]))
    }
    return eventCards.filter((card) => isEventCompleted(eventsById[card.eventId]))
  }, [eventCards, eventDivision, eventsById])

  const eventStatusCounts = useMemo(
    () => ({
      pending: eventRegistrations.filter((record) => record.status === 'pending').length,
      approved: eventRegistrations.filter((record) => record.status === 'approved').length,
      rejected: eventRegistrations.filter((record) => record.status === 'rejected').length,
    }),
    [eventRegistrations]
  )

  const visibleEventRegistrations = useMemo(() => {
    if (eventRegistrationFilter === 'all') return eventRegistrations
    return eventRegistrations.filter((record) => record.status === eventRegistrationFilter)
  }, [eventRegistrations, eventRegistrationFilter])

  return (
    <div className={`${dmSans.className} p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto`}>
      {/* Header */}
      <div className="mb-6">
        
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900">Verification Panel</h1>
        <p className="text-sm text-slate-500 mt-2">View all events and verify their registrations</p>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
      ) : null}

      {selectedEventSummary ? (
        <section className="w-full">
          <button
            type="button"
            onClick={closeEventDetails}
            className="mb-4 inline-flex items-center gap-2 rounded-[14px] border border-[#E5E9EF] bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(240px,1fr)_minmax(0,1.8fr)]">
              <section className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="relative h-48 w-full sm:h-56 lg:h-64">
                    <img src={selectedEventSummary.imageUrl} className="h-full w-full object-cover" loading="lazy" />
                    <span className="absolute right-2.5 top-2.5 rounded-md bg-slate-900/90 px-2.5 py-1 text-xs font-semibold text-white">
                      {selectedEventSummary.eventCategory}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h2 className="text-3xl font-semibold text-slate-900">{selectedEventSummary.eventName}</h2>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <p className="inline-flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{selectedEventSummary.eventCode}</p>
                    <p className="text-right">{selectedEventSummary.eventLevel}</p>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                      <p className="text-xs font-semibold uppercase text-amber-700">Pending</p>
                      <p className="mt-2 text-2xl font-bold text-amber-900">{eventStatusCounts.pending}</p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-xs font-semibold uppercase text-emerald-700">Approved</p>
                      <p className="mt-2 text-2xl font-bold text-emerald-900">{eventStatusCounts.approved}</p>
                    </div>
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                      <p className="text-xs font-semibold uppercase text-rose-700">Rejected</p>
                      <p className="mt-2 text-2xl font-bold text-rose-900">{eventStatusCounts.rejected}</p>
                    </div>
                  </div>

                  
                </div>
              </section>

              <section className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    {([
                      { key: 'pending', label: 'Pending', count: eventStatusCounts.pending },
                      { key: 'approved', label: 'Approved', count: eventStatusCounts.approved },
                      { key: 'rejected', label: 'Rejected', count: eventStatusCounts.rejected },
                    ] as const).map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setEventRegistrationFilter(option.key)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                          eventRegistrationFilter === option.key
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {option.label} ({option.count})
                      </button>
                    ))}
                  </div>

                  {eventDetailsError ? (
                    <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{eventDetailsError}</div>
                  ) : null}

                  {loadingEventRegistrations ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-24 animate-pulse rounded-[14px] border border-slate-200 bg-white p-4" />
                      ))}
                    </div>
                  ) : visibleEventRegistrations.length === 0 ? (
                    <div className="rounded-[14px] border border-slate-200 bg-white p-8 text-center">
                      <Users className="mx-auto h-10 w-10 text-slate-300" />
                      <h4 className="mt-4 text-lg font-semibold text-slate-900">No Matching Registrations</h4>
                      <p className="mt-2 text-sm text-slate-500">No registrations found for the selected status filter.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {visibleEventRegistrations.map((record) => (
                        <div key={record.id} className={`rounded-[14px] border p-4 transition ${getStatusBgColor(record.status as RecordStatus)}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-2">
                                <User className="h-4 w-4 text-slate-600" />
                                <p className="font-semibold text-slate-900">{record.studentName || 'N/A'}</p>
                              </div>
                              {record.studentEmail ? (
                                <div className="mb-2 flex items-center gap-2 text-sm text-slate-600">
                                  <Mail className="h-3.5 w-3.5" />
                                  {record.studentEmail}
                                </div>
                              ) : null}
                              <p className="text-sm text-slate-600">Dept: {record.studentDepartment || 'N/A'}</p>
                              <p className="text-sm text-slate-600">Mode: {record.modeOfParticipation || 'N/A'}</p>
                              <p className="text-xs text-slate-500 mt-1">Updated: {formatDate(record.updatedDate)}</p>
                              {record.rejectionReason ? (
                                <div className="mt-3 rounded bg-white/60 p-2 text-xs text-slate-700">
                                  <span className="font-semibold">Rejection Reason:</span> {record.rejectionReason}
                                </div>
                              ) : null}
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(record.status as RecordStatus)}`}>
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  disabled={record.status !== 'pending' || updatingId === record.id}
                                  onClick={() => handleApprove(record.id)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  {updatingId === record.id ? 'Updating...' : 'Approve'}
                                </button>
                                <button
                                  type="button"
                                  disabled={record.status !== 'pending' || updatingId === record.id}
                                  onClick={() => handleReject(record.id)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </section>
      ) : (
        <>

          {/* Division tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setEventDivision('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                eventDivision === 'active'
                  ? 'bg-[#7D53F6] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Active Events
              <span className="ml-1.5 text-xs opacity-70">({divisionCounts.active})</span>
            </button>
            <button
              type="button"
              onClick={() => setEventDivision('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                eventDivision === 'completed'
                  ? 'bg-[#7D53F6] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Completed Events
              <span className="ml-1.5 text-xs opacity-70">({divisionCounts.completed})</span>
            </button>
          </div>

         
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="relative xl:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search event name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7D53F6] focus:border-transparent"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7D53F6] focus:border-transparent"
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All Categories' : option}
                </option>
              ))}
            </select>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7D53F6] focus:border-transparent"
            >
              {levelOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All Levels' : option}
                </option>
              ))}
            </select>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7D53F6] focus:border-transparent"
            >
              {modeOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'Online / Offline' : option}
                </option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <p className="text-xs text-slate-400 mb-4">{visibleEventCards.length} events shown</p>

          {/* Records list */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-sm text-slate-600">Loading verification records...</div>
            ) : visibleEventCards.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200 col-span-full">
                <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">No registrations found</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              visibleEventCards.map((card) => (
                <article
                  key={card.eventId}
                  role="button"
                  tabIndex={0}
                  onClick={() => openEventDetails(card.eventId)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      void openEventDetails(card.eventId)
                    }
                  }}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-40 w-full overflow-hidden">
                    <img
                      src={card.imageUrl}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {(pendingByEventId.get(card.eventId) || 0) > 0 ? (
                      <span className="absolute left-2.5 top-2.5 w-7 h-7 text-[11px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm">
                        {pendingByEventId.get(card.eventId)}
                      </span>
                    ) : null}
                    <span className="absolute right-2.5 top-2.5 rounded-md bg-slate-900/90 px-2.5 py-1 text-xs font-semibold text-white">
                      {card.eventCategory}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-2xl font-semibold leading-tight text-slate-900">{card.eventName}</h3>
                        <p className="text-xs text-slate-500 mt-1">Registrations: {card.total}</p>
                      </div>
                      <StatusBadge
                        status={
                          card.counts.pending > 0 ? 'pending' : card.counts.rejected > 0 && card.counts.approved === 0 ? 'rejected' : 'approved'
                        }
                      />
                    </div>

                  

                
                  </div>
                </article>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
