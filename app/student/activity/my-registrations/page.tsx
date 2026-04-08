import Link from 'next/link'
import { ArrowRight, BadgeCheck, CalendarClock, Users } from 'lucide-react'
import { registrationRecords } from '@/lib/student-workflow'

const badgeStyles = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
} as const

export default function MyRegistrationsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-white mb-4">
          <Users className="w-3.5 h-3.5" />
          Registration tracking
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Registrations</h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          This page summarizes the student-side registration state before and after verification.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Confirmed', value: '8', icon: BadgeCheck, tone: 'bg-emerald-50 text-emerald-700' },
          { label: 'Awaiting review', value: '3', icon: CalendarClock, tone: 'bg-amber-50 text-amber-700' },
          { label: 'Closed', value: '2', icon: Users, tone: 'bg-slate-100 text-slate-700' },
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
        {registrationRecords.map((record) => (
          <div key={record.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400">{record.id}</p>
                <h3 className="mt-1 text-base font-semibold text-slate-900">{record.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{record.subtitle}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badgeStyles[record.status]}`}>
                {record.status}
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-600">{record.meta}</p>
            {record.route ? (
              <div className="mt-4">
                <Link href={record.route} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1">
                  Continue workflow
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
