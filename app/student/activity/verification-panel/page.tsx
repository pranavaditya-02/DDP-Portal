'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, XCircle, ShieldCheck, Clock3 } from 'lucide-react'
import { apiClient, type EventRegistrationRecord } from '@/lib/api'
import { useRoles } from '@/hooks/useRoles'

type RecordStatus = 'approved' | 'pending' | 'rejected'

const statusStyles: Record<RecordStatus, string> = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
}

export default function VerificationPanelPage() {
  const { isVerification, isAdmin } = useRoles()
  const [records, setRecords] = useState<EventRegistrationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const canVerify = isVerification() || isAdmin()

  const loadRecords = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getVerificationRegistrations()
      setRecords(response.registrations)
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

  const stats = useMemo(() => {
    const approved = records.filter((record) => record.status === 'approved').length
    const pending = records.filter((record) => record.status === 'pending').length
    const rejected = records.filter((record) => record.status === 'rejected').length

    return { approved, pending, rejected }
  }, [records])

  const handleApprove = async (registrationId: number) => {
    try {
      setUpdatingId(registrationId)
      const response = await apiClient.approveRegistration(registrationId)
      setRecords((prev) => prev.map((record) => (record.id === registrationId ? response.registration : record)))
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject registration')
    } finally {
      setUpdatingId(null)
    }
  }

  if (!canVerify) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-rose-900">Access denied</h1>
          <p className="mt-2 text-sm text-rose-800">Only verification or admin users can access this panel.</p>
          <div className="mt-5">
            <Link href="/students/activity-master" className="btn-outline inline-flex items-center gap-2">
              Back to Activity Master
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          Verification desk
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Verification Panel</h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          Review pending event registrations, confirm details, and move approved items forward.
        </p>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Approved', value: String(stats.approved), icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
          { label: 'Pending review', value: String(stats.pending), icon: Clock3, tone: 'bg-amber-50 text-amber-700' },
          { label: 'Rejected', value: String(stats.rejected), icon: XCircle, tone: 'bg-rose-50 text-rose-700' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.tone}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-sm text-slate-600">Loading verification records...</div>
        ) : records.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-sm text-slate-600">No registrations found.</div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400">REG-{record.id}</p>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">{record.studentName} - {record.eventName}</h3>
                  <p className="mt-1 text-sm text-slate-500">Event code: {record.eventCode} | Mode: {record.modeOfParticipation || 'N/A'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[record.status as RecordStatus]}`}>
                  {record.status}
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-600">
                IQAC: {record.iqacVerification}
                {record.rejectionReason ? ` | Reason: ${record.rejectionReason}` : ''}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={record.status !== 'pending' || updatingId === record.id}
                  onClick={() => handleApprove(record.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {updatingId === record.id ? 'Updating...' : 'Approve'}
                </button>
                <button
                  type="button"
                  disabled={record.status !== 'pending' || updatingId === record.id}
                  onClick={() => handleReject(record.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition-colors disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <Link href="/students/activity-logger" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 ml-auto">
                  View logger
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
