'use client'

import React, { useMemo, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { useRoles } from '@/hooks/useRoles'
import {
  ChartCard, TrendAreaChart, RadarChartComponent,
} from '@/components/charts'
import {
  recentNotifications,
  getPersonalizedFacultyData,
  facultyMembers,
} from '@/lib/mock-data'
import { cseActivityIndexing } from '@/lib/ddp-data'
import {
  Award, FileText, Clock, CheckCircle2,
  ArrowUpRight, ArrowDownRight,
  Bell, Zap, ChevronDown, Building2, Search,
} from 'lucide-react'
import Link from 'next/link'

function indexColor(v: number) {
  if (v >= 0.8) return 'text-emerald-600 bg-emerald-50'
  if (v >= 0.5) return 'text-yellow-700 bg-yellow-50'
  if (v > 0) return 'text-orange-600 bg-orange-50'
  return 'text-red-600 bg-red-50'
}

function getFacultyAttainedCount(activityName: string, activities: Array<{ type: string; title: string; status: string }>) {
  const name = activityName.toUpperCase()

  return activities.filter((a) => {
    if (a.status !== 'approved') return false
    const type = a.type.toLowerCase()
    const title = a.title.toLowerCase()

    if (name.includes('SCI / WOS')) return type.includes('journal')
    if (name.includes('SCOPUS')) return type.includes('journal') || title.includes('scopus')
    if (name.includes('CONFERENCE')) return type.includes('conference')
    if (name.includes('BOOK / BOOK CHAPTER')) return type.includes('book')
    if (name.includes('RESEARCH PROPOSALS SUBMITTED')) return type.includes('research proposal')
    if (name.includes('RESEARCH FUNDING')) return type.includes('research funding')
    if (name.includes('PATENTS PUBLISHED') || name.includes('PATENTS GRANTED') || name.includes('PATENT PUBLICATIONS')) return type.includes('patent')
    if (name.includes('CONSULTANCY PROJECTS COMPLETED') || name.includes('INDUSTRIAL CONSULTANCY')) return type.includes('consultancy')
    if (name.includes('SEED MONEY PROJECTS')) return title.includes('seed money')
    if (name.includes('GUEST LECTURE')) return type.includes('guest lecture')
    if (name.includes('MOU SIGNED')) return title.includes('mou')
    if (name.includes('PLACEMENT TARGETS') || name.includes('NEW COMPANIES')) return title.includes('placement')
    if (name.includes('INDUSTRY COLLABORATIVE')) return title.includes('industry') || type.includes('consultancy')
    if (name.includes('INVITING SCIENTISTS')) return type.includes('guest lecture')
    if (name.includes('COLLABORATIVE INITIATIVES')) return type.includes('consultancy') || title.includes('collaborative')
    if (name.includes('FDP / STTP')) return type.includes('fdp') || type.includes('workshop')
    if (name.includes('PARTIAL DELIVERY OF COURSES')) return type.includes('teaching')
    if (name.includes('CERTIFICATE / VALUE-ADDED COURSES / PS')) return type.includes('certification')
    if (name.includes('NPTEL COURSES')) return title.includes('nptel') || type.includes('certification')
    if (name.includes('STUDENT AWARDS / ACHIEVEMENTS')) return type.includes('student mentoring')
    if (name.includes('EVENTS ORGANIZED')) return type.includes('event organized')

    return false
  }).length
}

/* ------------------------------------------------------------------ */
/* Helper: Stat card                                                   */
/* ------------------------------------------------------------------ */
function StatCard({ label, value, icon: Icon, description, trend, color }: {
  label: string; value: string | number; icon: React.ElementType
  description?: string; trend?: number; color: string
}) {
  const isPositive = trend && trend > 0
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {value}
          </p>
          {description && <p className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">{description}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {Math.abs(trend)}% vs last month
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* FACULTY DASHBOARD                                                   */
/* ------------------------------------------------------------------ */
function FacultyDashboard({ selectedFaculty, isDeanView = false }: {
  selectedFaculty?: { id: number; name: string }
  isDeanView?: boolean
}) {
  const { user } = useAuthStore()
  const targetUserId = selectedFaculty?.id || user?.id || 1
  const targetUserName = selectedFaculty?.name || user?.name || 'Dr. Priya Sharma'
  const data = getPersonalizedFacultyData(targetUserId, targetUserName)
  const { stats, activities, weeklyData, radarData, department, designation } = data
  const recentActs = activities.slice(0, 5)
  const [showAllIndexRows, setShowAllIndexRows] = useState(false)
  const [pointsView, setPointsView] = useState<'week' | 'month' | 'year'>('week')
  const displayName = selectedFaculty?.name || user?.name || 'Faculty'

  const facultyIndexRows = useMemo(() => {
    return cseActivityIndexing.map((a) => {
      const individualizedTarget = Math.max(1, Math.round(a.totalTarget / Math.max(stats.totalFaculty, 1)))
      const attained = getFacultyAttainedCount(a.activityName, activities)
      const actualIndex = individualizedTarget > 0 ? attained / individualizedTarget : 0
      const permittedIndex = Math.min(actualIndex, 1)

      return {
        ...a,
        totalTarget: individualizedTarget,
        attained,
        actualIndex,
        permittedIndex,
      }
    })
  }, [activities, stats.totalFaculty])

  const facultyTotalWeightage = useMemo(
    () => facultyIndexRows.reduce((sum, row) => sum + row.weightage, 0),
    [facultyIndexRows],
  )
  const facultyWeightedIndex = useMemo(() => {
    if (!facultyTotalWeightage) return 0
    const weighted = facultyIndexRows.reduce((sum, row) => sum + (row.permittedIndex * row.weightage), 0)
    return weighted / facultyTotalWeightage
  }, [facultyIndexRows, facultyTotalWeightage])
  const facultyAdditionalIndex = useMemo(() => {
    if (!facultyTotalWeightage) return 0
    const additional = facultyIndexRows.reduce((sum, row) => sum + (Math.max(row.actualIndex - 1, 0) * row.weightage), 0)
    return additional / facultyTotalWeightage
  }, [facultyIndexRows, facultyTotalWeightage])

  const monthlyPointsData = useMemo(() => {
    const monthMap = new Map<string, number>()

    for (const activity of activities) {
      if (activity.status !== 'approved') continue
      const date = new Date(activity.date)
      if (Number.isNaN(date.getTime())) continue

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + activity.points)
    }

    return [...monthMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, points]) => {
        const [year, month] = key.split('-').map(Number)
        const label = new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'short', year: '2-digit' })
        return { period: label, points }
      })
  }, [activities])

  const yearlyPointsData = useMemo(() => {
    const yearMap = new Map<string, number>()

    for (const activity of activities) {
      if (activity.status !== 'approved') continue
      const date = new Date(activity.date)
      if (Number.isNaN(date.getTime())) continue

      const yearKey = String(date.getFullYear())
      yearMap.set(yearKey, (yearMap.get(yearKey) || 0) + activity.points)
    }

    return [...yearMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, points]) => ({ period, points }))
  }, [activities])

  const weeklyPointsData = useMemo(
    () => weeklyData.map((entry) => ({ period: entry.week, points: entry.points })),
    [weeklyData],
  )

  const chartDataByView = {
    week: weeklyPointsData,
    month: monthlyPointsData,
    year: yearlyPointsData,
  }
  const pointsSubtitleByView = {
    week: 'Last 8 weeks',
    month: 'Month-wise approved points',
    year: 'Year-wise approved points',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Personal info bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-base sm:text-lg font-bold flex-shrink-0">
          {displayName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
          <p className="text-xs text-slate-500 truncate">{designation} &middot; {department} Department</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700 flex-shrink-0">Rank #{stats.rank}</span>
        {isDeanView && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-violet-100 text-violet-700 flex-shrink-0">
            Dean View
          </span>
        )}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Activities" value={stats.totalActivities} icon={FileText} description="All time" trend={stats.pointsTrend} color="bg-blue-50 text-blue-600" />
        <StatCard label="Total Points" value={stats.totalPoints} icon={Award} description={`Rank #${stats.rank} of ${stats.totalFaculty}`} trend={stats.pointsTrend} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} description="Awaiting verification" color="bg-amber-50 text-amber-600" />
        <StatCard label="Approved" value={stats.approved} icon={CheckCircle2} description={`${stats.totalActivities > 0 ? ((stats.approved / stats.totalActivities) * 100).toFixed(0) : 0}% approval rate`} color="bg-green-50 text-green-600" />
      </div>
      {/* Activity indexing (faculty view) */}
      <section>
        <div className="flex items-center gap-3 mb-5 mt-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Activity Indexing</h2>
            <p className="text-xs text-slate-500">Activity-wise performance indexing with weightage (individual faculty view)</p>
          </div>
          <div className="hidden sm:block flex-1 h-px bg-slate-200" />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Total Indexing ({department})</h3>
            <button
              onClick={() => setShowAllIndexRows(!showAllIndexRows)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              {showAllIndexRows ? 'Show Less' : 'View All'}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllIndexRows ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-violet-700 text-white">
                  {['S.No', 'Activity Name', 'Weightage', 'My Target', 'My Attained', 'Actual Index', 'Permitted Index'].map((col, i) => (
                    <th key={col} className={`${i < 2 ? 'text-left' : i === 2 ? 'text-center' : 'text-right'} px-3 py-2.5 font-semibold`}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(showAllIndexRows ? facultyIndexRows : facultyIndexRows.slice(0, 12)).map((a) => (
                  <tr
                    key={a.sNo}
                    className={`border-b border-slate-100 hover:bg-slate-50/50 ${
                      a.attained === 0 ? 'bg-red-50/40' : a.attained >= a.totalTarget ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    <td className="px-3 py-2.5 text-slate-500">{a.sNo}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-800 max-w-[250px]">
                      <span className="truncate block">{a.activityName}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700">{a.weightage}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-700">{a.totalTarget}</td>
                    <td className="px-3 py-2.5 text-right">
                      <span className={`font-bold font-mono ${
                        a.attained === 0 ? 'text-red-500' : a.attained >= a.totalTarget ? 'text-emerald-600' : 'text-slate-800'
                      }`}>{a.attained}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${indexColor(a.actualIndex)}`}>
                        {a.actualIndex.toFixed(3)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${indexColor(a.permittedIndex)}`}>
                        {a.permittedIndex.toFixed(3)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Chart row 1 */}
      <div className="grid grid-cols-1 gap-4">
        <ChartCard
          title="Weekly Points"
          subtitle={pointsSubtitleByView[pointsView]}
          action={(
            <select
              value={pointsView}
              onChange={(e) => setPointsView(e.target.value as 'week' | 'month' | 'year')}
              className="min-w-[120px] text-sm border border-slate-200 rounded-lg px-3.5 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              aria-label="Filter points chart by time period"
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          )}
        >
          <TrendAreaChart data={chartDataByView[pointsView]} xKey="period" areas={[{ key: 'points', color: '#3b82f6', name: 'Points' }]} />
        </ChartCard>
      </div>

      {/* Chart row 2 */}
      <div className="grid grid-cols-1 gap-4">
        <ChartCard title="Skill Dimensions" subtitle="Activity distribution by area">
          <RadarChartComponent data={radarData} dataKey="value" nameKey="subject" color="#6366f1" />
        </ChartCard>
      </div>
    </div>
  )
}



/* ------------------------------------------------------------------ */
/* MAIN DASHBOARD PAGE                                                 */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  const { user } = useAuthStore()
  const { isDean } = useRoles()
  const isDeanUser = isDean()
  const [facultySearch, setFacultySearch] = useState('')
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(null)

  // Determine greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const filteredFaculty = useMemo(() => {
    const q = facultySearch.trim().toLowerCase()
    if (!q) return facultyMembers
    return facultyMembers.filter((f) =>
      f.name.toLowerCase().includes(q) ||
      f.department.toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q) ||
      String(f.id).includes(q),
    )
  }, [facultySearch])

  const selectedFaculty = useMemo(() => {
    if (!isDeanUser) return undefined
    const explicit = selectedFacultyId ? facultyMembers.find((f) => f.id === selectedFacultyId) : undefined
    return explicit || filteredFaculty[0]
  }, [isDeanUser, selectedFacultyId, filteredFaculty])



  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          {greeting}, {user?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here&apos;s what&apos;s happening with your achievements today.
        </p>

        {isDeanUser && (
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/70 p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/department"
                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3.5 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                Open Department Page
              </Link>

              <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    value={facultySearch}
                    onChange={(e) => setFacultySearch(e.target.value)}
                    placeholder="Search faculty by name/department"
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    aria-label="Search faculty"
                  />
                </div>
                <select
                  value={selectedFaculty?.id ?? ''}
                  onChange={(e) => setSelectedFacultyId(e.target.value ? Number(e.target.value) : null)}
                  className="h-9 min-w-[220px] rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  aria-label="Select faculty dashboard"
                >
                  {filteredFaculty.length === 0 ? (
                    <option value="">No faculty found</option>
                  ) : (
                    filteredFaculty.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.department})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notifications bar */}
      {recentNotifications.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-3 sm:p-4 flex items-start gap-3">
          <Bell className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-800">{recentNotifications[0].message}</p>
            <p className="text-xs text-blue-500 mt-0.5">{recentNotifications[0].time}</p>
          </div>
        </div>
      )}

      <FacultyDashboard selectedFaculty={selectedFaculty ? { id: selectedFaculty.id, name: selectedFaculty.name } : undefined} isDeanView={isDeanUser} />
    </div>
  )
}
