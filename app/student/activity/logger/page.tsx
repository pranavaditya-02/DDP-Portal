import Link from 'next/link'
import { ArrowRight, Clock, FileCheck2, Filter, ShieldCheck, XCircle } from 'lucide-react'
import { activityLoggerRecords } from '@/lib/student-workflow'

const statusStyles = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
} as const

const statusLabels = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
} as const

export default function ActivityLoggerPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              Approved activity feed
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Activity Logger</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              The logger is the read-only view of activity records that survived verification. Pending and rejected
              submissions stay in the review layer until they are cleared.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/students/activity-master" className="btn-outline">
              Open Activity Master
            </Link>
            <Link href="/verification-panel" className="btn-primary">
              Open Verification Panel
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Approved', value: '24', icon: FileCheck2, tone: 'bg-emerald-50 text-emerald-700' },
          { label: 'Pending review', value: '7', icon: Clock, tone: 'bg-amber-50 text-amber-700' },
          { label: 'Rejected', value: '3', icon: XCircle, tone: 'bg-rose-50 text-rose-700' },
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

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-white/10 text-white">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Logger structure</h2>
            <p className="text-sm text-slate-400">Only approved submissions should appear here.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['Submit activity', 'Verifier approves or rejects', 'Approved item appears in logger'].map((step, index) => (
            <div key={step} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-semibold text-emerald-300 mb-2">Step {index + 1}</div>
              <p className="text-sm text-slate-200 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
        {activityLoggerRecords.map((record) => (
          <div key={record.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400">{record.id}</p>
                <h3 className="mt-1 text-base font-semibold text-slate-900">{record.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{record.subtitle}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[record.status]}`}>
                {statusLabels[record.status]}
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-600">{record.meta}</p>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">Activity logger view</span>
              {record.route ? (
                <Link href={record.route} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1">
                  Open route
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
