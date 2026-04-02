'use client'

import React, { useMemo, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { useRoles } from '@/hooks/useRoles'
import {
  monthlyTrends,
  approvalFunnelData,
  getPersonalizedHodData,
  departmentTargets, deptPerformanceIndex,
} from '@/lib/mock-data'
import { useRealData } from '@/hooks/useRealData'
import DateRangePicker, { type DateRange } from '@/components/DateRangePicker'
import {
  cseActivityIndexing, cseTotalWeightage, cseTotalIndex, cseAdditionalIndex,
  cseMonthlyDDPStatus, cseMonthlyActivities,
  cseDDPMonthlyBreakdown, ddpOverallIndexing,
  buildDDPRealtimeActivityIndexing, buildDDPRealtimeOverallIndexing,
} from '@/lib/ddp-data'
import {
  ChartCard, TrendAreaChart,
  ComposedBarLineChart, StackedBarChart,
} from '@/components/charts'
import {
  Users, Building2, Target, AlertTriangle,
  CheckCircle2, ArrowUpRight, Pencil, Activity,
  ChevronDown, BarChart3, TrendingUp, Trophy, Award, Zap,
} from 'lucide-react'
import Link from 'next/link'
import LeaderboardWidget from '@/components/LeaderboardWidget'

/* ================================================================
   CONSTANTS & HELPERS
   ================================================================ */

const MONO_FONT = { fontFamily: "'JetBrains Mono', monospace" }

/** All departments with real data — shortCodes match realDeptMap keys directly */
const DEPT_OPTIONS = [
  { id: 1,  short: 'CSE'  }, { id: 2,  short: 'ECE'  }, { id: 3,  short: 'MA'   },
  { id: 4,  short: 'EEE'  }, { id: 5,  short: 'IT'   }, { id: 6,  short: 'ME'   },
  { id: 7,  short: 'AIDS' }, { id: 8,  short: 'EI'   }, { id: 9,  short: 'CE'   },
  { id: 10, short: 'CH'   }, { id: 11, short: 'PH'   }, { id: 12, short: 'AIML' },
  { id: 13, short: 'BT'   }, { id: 14, short: 'ISE'  }, { id: 15, short: 'CT'   },
  { id: 16, short: 'AG'   }, { id: 17, short: 'FT'   }, { id: 18, short: 'CSBS' },
  { id: 19, short: 'MC'   }, { id: 20, short: 'AU'   }, { id: 21, short: 'SMS'  },
  { id: 22, short: 'TT'   }, { id: 23, short: 'FD'   }, { id: 24, short: 'BM'   },
  { id: 25, short: 'AE'   }, { id: 26, short: 'MZ'   }, { id: 27, short: 'CSD'  },
  { id: 28, short: 'HU'   },
]

function tierStyle(pts: number, avg: number) {
  if (pts >= avg * 1.5) return { label: 'Excellent', cls: 'bg-emerald-100 text-emerald-700' }
  if (pts >= avg)       return { label: 'Good',      cls: 'bg-blue-100 text-blue-700'    }
  if (pts >= avg * 0.6) return { label: 'Average',   cls: 'bg-yellow-100 text-yellow-700' }
  return                       { label: 'Needs Work', cls: 'bg-red-100 text-red-600'      }
}

function indexColor(v: number) {
  if (v >= 0.8) return 'text-emerald-600 bg-emerald-50'
  if (v >= 0.5) return 'text-yellow-700 bg-yellow-50'
  if (v > 0) return 'text-orange-600 bg-orange-50'
  return 'text-red-600 bg-red-50'
}

function progressColor(pct: number) {
  if (pct >= 80) return '#22c55e'
  if (pct >= 60) return '#eab308'
  if (pct >= 40) return '#f97316'
  return '#ef4444'
}

function facHeatBg(v: number, maxV: number) {
  if (maxV === 0 || v === 0) return { bg: '#f1f5f9', text: '#94a3b8' }
  const pct = v / maxV
  if (pct >= 0.6)  return { bg: '#22c55e', text: '#fff' }
  if (pct >= 0.35) return { bg: '#86efac', text: '#14532d' }
  if (pct >= 0.15) return { bg: '#fde047', text: '#713f12' }
  return                   { bg: '#fb923c', text: '#fff' }
}

const FACULTY_HEATMAP_COLS = [
  { key: 'papers'          as const, label: 'Papers'       },
  { key: 'patents'         as const, label: 'Patents'      },
  { key: 'courses'         as const, label: 'Courses'      },
  { key: 'guestLectures'   as const, label: 'Guest Lect.'  },
  { key: 'eventsOrganized' as const, label: 'Evt Org.'     },
  { key: 'eventsAttended'  as const, label: 'FDP/Evt Att.' },
]

const FACULTY_HEATMAP_LEGEND = [
  { label: 'Top (≥60%)',    cls: 'bg-green-500' },
  { label: 'High (35–59%)', cls: 'bg-green-300' },
  { label: 'Mid (15–34%)',  cls: 'bg-yellow-300' },
  { label: 'Low (<15%)',    cls: 'bg-orange-400' },
  { label: 'None',          cls: 'bg-slate-100 border border-slate-200' },
]

/* ================================================================
   SUB-COMPONENTS
   ================================================================ */

/** Section divider with icon, title, subtitle and a horizontal rule */
function SectionDivider({ icon: Icon, title, subtitle }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex items-center gap-3 mb-5 mt-2">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="hidden sm:block flex-1 h-px bg-slate-200" />
    </div>
  )
}

/** Big KPI number card */
function KpiCard({ label, value, note, gradient, borderColor, small }: {
  label: string
  value: string | number
  note?: string
  gradient: string
  borderColor: string
  small?: boolean
}) {
  return (
    <div className={`${gradient} border ${borderColor} rounded-xl p-4 sm:p-6 text-center`}>
      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
      <p className={small ? 'text-sm sm:text-base font-bold leading-snug break-words' : 'text-2xl sm:text-4xl font-black'} style={MONO_FONT}>{value}</p>
      {note && <p className="text-[10px] mt-1 opacity-70">{note}</p>}
    </div>
  )
}

/** Stat card with left colored border */
function StatCard({ label, value, extra, borderAccent }: {
  label: string
  value: string | number
  extra?: React.ReactNode
  borderAccent: string
}) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 sm:p-5 border-l-4 ${borderAccent}`}>
      <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-xl sm:text-3xl font-bold text-slate-900 mt-1" style={MONO_FONT}>{value}</p>
      {extra && <div className="mt-1">{extra}</div>}
    </div>
  )
}

/* ================================================================
   MAIN PAGE COMPONENT
   ================================================================ */

export default function DepartmentPage() {
  const { user } = useAuthStore()
  const { isDean } = useRoles()
  const isDeanUser = isDean()

  const defaultDeptId = user?.departmentId || 1
  const [selectedDeptId, setSelectedDeptId] = useState<number>(defaultDeptId)
  const activeDeptId = isDeanUser ? selectedDeptId : defaultDeptId
  const [showAllActivities, setShowAllActivities] = useState(false)

  /* ---- Derived data ---- */
  const hodData = getPersonalizedHodData(user?.id || 2, user?.name || 'Dr. Rajesh Kumar', activeDeptId)
  const { stats, leaderboard: deptLeaderboard, pendingActivities: deptPending, faculty: deptFaculty } = hodData
  const perf = deptPerformanceIndex

  const deptShort = DEPT_OPTIONS.find(d => d.id === activeDeptId)?.short || 'CSE'

  /* ---- Real CSV-derived dept stats ---- */
  const [dateRange, setDateRange] = useState<DateRange>({ from: '', to: '' })
  const { deptMap: realDeptMap, deptRankings: realDeptRankings, deptFacultyRankings: realDeptFacultyRankings, loading: realLoading } = useRealData({
    dateFrom: dateRange.from || undefined,
    dateTo:   dateRange.to   || undefined,
  })
  const realCode = deptShort  // DEPT_OPTIONS now uses real shortCodes directly
  const realDept = realDeptMap[realCode]
  const headerDeptName = realDept?.dept || stats.departmentName
  const headerDeptShort = realCode || stats.departmentShort
  const deptFacultyRankings = realDeptFacultyRankings[realCode] || []
  const deptRankPosition = realDeptRankings.findIndex(d => d.shortCode === realCode) + 1
  const realtimeOverallIndexing = useMemo(() => buildDDPRealtimeOverallIndexing(realDeptRankings), [realDeptRankings])
  const ddpRanking = realtimeOverallIndexing.find(d => d.shortName === deptShort)
    || ddpOverallIndexing.find(d => d.shortName === deptShort)
    || ddpOverallIndexing[1]
  const ddpAchievementPct = Math.round((ddpRanking.achieved / Math.max(ddpRanking.totalTarget, 1)) * 100)

  const activities = useMemo(() => realDept ? buildDDPRealtimeActivityIndexing(realDept) : cseActivityIndexing, [realDept])
  const criticalActivities = activities.filter(a => a.attained === 0)
  const exceedingActivities = activities.filter(a => a.attained > a.totalTarget)
  const computedTotalWeightage = Math.max(activities.reduce((sum, a) => sum + a.weightage, 0), 1)
  const computedBaseIndex = activities.reduce((sum, a) => sum + (a.permittedIndex * a.weightage), 0) / computedTotalWeightage
  const computedAdditionalIndex = activities.reduce((sum, a) => sum + (Math.min(1, Math.max(0, a.actualIndex - 1)) * a.weightage), 0) / computedTotalWeightage

  const monthlyChartData = cseDDPMonthlyBreakdown.map(m => ({
    month: m.month,
    'Journal SCI': m.journalSCI,
    'Journal Scopus': m.journalScopus,
    Conferences: m.conferences,
    Patents: m.patents,
    Events: Math.round(m.events / 10),
  }))

  // Faculty performance tiers derived from real dept rankings
  const realAvgPts = realDept?.avgPoints || 1
  const topPerformers = deptFacultyRankings.filter(f => f.points >= realAvgPts * 1.5)
  const needsWork     = deptFacultyRankings.filter(f => f.points < realAvgPts * 0.6)

  // Faculty × Domain heatmap: per-faculty domain counts (real from API or estimated from dept proportions)
  const deptTotalActs = realDept
    ? realDept.paperPresentations + realDept.patentFiled + realDept.patentPublished +
      realDept.patentGranted + realDept.onlineCourses + realDept.guestLectures +
      realDept.eventsOrganized + realDept.eventsAttended
    : 1
  const heatmapRows = deptFacultyRankings.map(f => {
    const ratio = f.activities / Math.max(deptTotalActs, 1)
    return {
      ...f,
      d: {
        papers:          f.papers          ?? Math.round(ratio * (realDept?.paperPresentations ?? 0)),
        patents:         f.patents         ?? Math.round(ratio * ((realDept?.patentFiled ?? 0) + (realDept?.patentPublished ?? 0) + (realDept?.patentGranted ?? 0))),
        courses:         f.courses         ?? Math.round(ratio * (realDept?.onlineCourses ?? 0)),
        guestLectures:   f.guestLectures   ?? Math.round(ratio * (realDept?.guestLectures ?? 0)),
        eventsOrganized: f.eventsOrganized ?? Math.round(ratio * (realDept?.eventsOrganized ?? 0)),
        eventsAttended:  f.eventsAttended  ?? Math.round(ratio * (realDept?.eventsAttended ?? 0)),
      },
    }
  })
  const facColMaxes: Record<string, number> = {}
  for (const c of FACULTY_HEATMAP_COLS) {
    facColMaxes[c.key] = Math.max(1, ...heatmapRows.map(r => r.d[c.key]))
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 sm:space-y-8">

      {/* ================================================================
         SECTION 1: HEADER
         ================================================================ */}
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
            {headerDeptShort}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{headerDeptName}</h1>
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              DDP Indicator &amp; Department Analytics {isDeanUser ? '\u00b7 Dean View' : `\u00b7 HOD: ${user?.name}`}
            </p>
          </div>
        </div>

        {/* Dean department selector */}
        {isDeanUser && (
          <div className="mt-4 overflow-x-auto pb-1">
            <div className="inline-flex items-center bg-slate-100 rounded-full p-1 gap-0.5 min-w-max">
              {DEPT_OPTIONS.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDeptId(d.id)}
                  className={`relative px-4 sm:px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedDeptId === d.id
                      ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {d.short}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date range filter */}
        <div className="flex items-center gap-3 mt-3 px-1">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            label="Filter activities by date"
          />
          {realLoading && (
            <span className="text-xs text-slate-400 animate-pulse">Loading…</span>
          )}
        </div>
      </header>


      {/* ================================================================
         SECTION 2.5: REAL ACTIVITY BREAKDOWN (from CSV data)
         ================================================================ */}
      {realDept && (
        <section>
          <SectionDivider icon={Activity} title="Approved Activity Data" subtitle="Real approved records from BIP system" />

          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            <KpiCard label="Total Activities" value={realDept.total.toLocaleString()}
              gradient="bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-700" borderColor="border-blue-200" />
            <KpiCard label="Weighted Points" value={realDept.totalPoints.toLocaleString()}
              note={`avg ${realDept.avgPoints} / faculty`}
              gradient="bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-700" borderColor="border-indigo-200" />
            <KpiCard label="Faculty Active" value={realDept.uniqueFaculty}
              gradient="bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700" borderColor="border-emerald-200" />
            <KpiCard label="Patents (F+P+G)" value={realDept.patentFiled + realDept.patentPublished + realDept.patentGranted}
              gradient="bg-gradient-to-br from-violet-50 to-fuchsia-50 text-violet-700" borderColor="border-violet-200" />
            <KpiCard label="Top Performer" value={realDept.topPerformer}
              note={`${realDept.topPerformerPoints} pts · ${realDept.topPerformerActivities} acts`}
              gradient="bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700" borderColor="border-amber-200" small />
          </div>

          {/* Activity breakdown bars */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Activity Category Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {[
                { label: 'Events Attended',     value: realDept.eventsAttended,    color: '#3b82f6' },
                { label: 'Online Courses',       value: realDept.onlineCourses,     color: '#10b981' },
                { label: 'Events Organized',     value: realDept.eventsOrganized,   color: '#8b5cf6' },
                { label: 'Paper Presentations',  value: realDept.paperPresentations, color: '#f59e0b' },
                { label: 'Guest Lectures',       value: realDept.guestLectures,     color: '#6366f1' },
                { label: 'Patent Filed',         value: realDept.patentFiled,       color: '#ef4444' },
                { label: 'Patent Published',     value: realDept.patentPublished,   color: '#ec4899' },
                { label: 'Patent Granted',       value: realDept.patentGranted,     color: '#14b8a6' },
              ].map(item => {
                const pct = realDept.total > 0 ? Math.round((item.value / realDept.total) * 100) : 0
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-slate-700">{item.label}</p>
                      <span className="text-xs font-bold text-slate-800 font-mono">{item.value.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${Math.max(pct, item.value > 0 ? 2 : 0)}%`, background: item.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
         SECTION 3: DDP INDEX SUMMARY
         ================================================================ */}
      <section>
        <SectionDivider icon={Award} title="DDP Index Summary" subtitle="Weightage, indexing, and college-wide ranking" />

        {/* Index KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <KpiCard label="Total Weightage" value={cseTotalWeightage}
            gradient="bg-gradient-to-br from-violet-50 to-purple-50 text-violet-700" borderColor="border-violet-200" />
          <KpiCard label="Total Index (weightage)" value={(realDept ? computedBaseIndex : cseTotalIndex).toFixed(3)}
            gradient="bg-gradient-to-br from-green-50 to-emerald-50 text-green-700" borderColor="border-green-200" />
          <KpiCard label="Additional Index (weightage)" value={(realDept ? computedAdditionalIndex : cseAdditionalIndex).toFixed(4)}
            gradient="bg-gradient-to-br from-teal-50 to-cyan-50 text-teal-700" borderColor="border-teal-200" />
        </div>

        {/* DDP Ranking card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-black text-white ${
                ddpRanking.rank <= 3 ? 'bg-yellow-500' : ddpRanking.rank <= 6 ? 'bg-blue-500' : 'bg-slate-500'
              }`}>
                #{ddpRanking.rank}
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">DDP Rank</p>
                <p className="text-lg font-bold text-slate-900">{ddpRanking.department}</p>
              </div>
            </div>
            <div className="h-12 w-px bg-slate-200 hidden md:block" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Total Target</p>
                <p className="text-xl font-bold text-slate-800 font-mono">{ddpRanking.totalTarget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Achieved</p>
                <p className="text-xl font-bold text-emerald-600 font-mono">{ddpRanking.achieved.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Base Index</p>
                <p className="text-xl font-bold text-blue-600 font-mono">{ddpRanking.baseIndex.toFixed(3)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Normalized Bonus</p>
                <p className="text-xl font-bold text-indigo-600 font-mono">{ddpRanking.normalizedBonus.toFixed(3)}</p>
              </div>
            </div>
          </div>
          {/* Achievement progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Overall Achievement</span>
              <span className="text-xs font-bold text-slate-700">{ddpAchievementPct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                style={{ width: `${Math.min(ddpAchievementPct, 100)}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
         SECTION 4: DDP ACTIVITY INDEXING
         ================================================================ */}
      <section>
        <SectionDivider icon={Zap} title="Activity Indexing" subtitle="Activity-wise performance indexing with weightage" />

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Total Indexing ({stats.departmentShort})</h3>
            <button onClick={() => setShowAllActivities(!showAllActivities)} className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              {showAllActivities ? 'Show Less' : 'View All'}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllActivities ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-violet-700 text-white">
                  {['S.No', 'Activity Name', 'Weightage', 'Total Target', 'Attained', 'Actual Index', 'Permitted Index'].map((col, i) => (
                    <th key={col} className={`${i < 2 ? 'text-left' : i === 2 ? 'text-center' : 'text-right'} px-3 py-2.5 font-semibold`}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(showAllActivities ? activities : activities.slice(0, 12)).map(a => {
                  return (
                    <tr key={a.sNo} className={`border-b border-slate-100 hover:bg-slate-50/50 ${
                      a.attained === 0 ? 'bg-red-50/40' : a.attained >= a.totalTarget ? 'bg-emerald-50/30' : ''
                    }`}>
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
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {/* ================================================================
         SECTION 7: PERFORMANCE ANALYTICS (charts)
         ================================================================ */}
      <section>
        <SectionDivider icon={TrendingUp} title="Performance Analytics" subtitle="Activity breakdown, approval pipeline, and submission trends" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <ChartCard title="Monthly Activity Breakdown" subtitle={`${stats.departmentShort} \u2014 Key activities per month`}>
            <StackedBarChart
              data={monthlyChartData}
              xKey="month"
              bars={[
                { key: 'Journal SCI', color: '#3b82f6', name: 'SCI Journals' },
                { key: 'Journal Scopus', color: '#6366f1', name: 'Scopus Journals' },
                { key: 'Conferences', color: '#8b5cf6', name: 'Conferences' },
                { key: 'Patents', color: '#10b981', name: 'Patents' },
                { key: 'Events', color: '#f59e0b', name: 'Events (\u00f710)' },
              ]}
              height={280}
            />
          </ChartCard>
          <ChartCard title="Approval Funnel" subtitle={`${stats.departmentShort} \u2014 Monthly submission pipeline`}>
            <ComposedBarLineChart data={approvalFunnelData} xKey="month"
              bars={[
                { key: 'submitted', color: '#94a3b8', name: 'Submitted' },
                { key: 'approved', color: '#10b981', name: 'Approved' },
              ]}
              lines={[]} />
          </ChartCard>
        </div>

        <ChartCard title="Monthly Trends" subtitle={`${stats.departmentShort} \u2014 Activities & approvals over time`}>
          <TrendAreaChart data={monthlyTrends as unknown as Record<string, unknown>[]} xKey="month"
            areas={[
              { key: 'activities', color: '#3b82f6', name: 'Submitted' },
              { key: 'approved', color: '#10b981', name: 'Approved' },
            ]} />
        </ChartCard>
      </section>

  
      <section>
        {realDept && (
          <>
            {/* Faculty rankings table */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Faculty Rankings — {realCode}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">DDP-aligned weighted points · patents weighted highest</p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 font-semibold border border-indigo-100">
                  Dept avg: {realDept.avgPoints} pts
                </span>
              </div>

              {deptFacultyRankings.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-emerald-700 text-white">
                        <th className="text-center px-3 py-2.5 font-semibold w-12">Rank</th>
                        <th className="text-left px-3 py-2.5 font-semibold w-24">Faculty ID</th>
                        <th className="text-left px-3 py-2.5 font-semibold">Name</th>
                        <th className="text-right px-3 py-2.5 font-semibold w-20">Points</th>
                        <th className="text-right px-3 py-2.5 font-semibold w-20">Activities</th>
                        <th className="text-left px-4 py-2.5 font-semibold">vs Dept Max</th>
                        <th className="text-center px-3 py-2.5 font-semibold w-24">Tier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deptFacultyRankings.map((f, i) => {
                        const topPts = deptFacultyRankings[0].points
                        const pct = Math.round((f.points / topPts) * 100)
                        const tier = tierStyle(f.points, realAvgPts)
                        return (
                          <tr key={f.facultyId} className={`border-b border-slate-100 hover:bg-slate-50/50 ${i % 2 === 1 ? 'bg-slate-50/40' : ''}`}>
                            <td className="px-3 py-2.5 text-center">
                              <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-[10px] font-bold ${
                                i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-200 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-500'
                              }`}>{f.rank}</span>
                            </td>
                            <td className="px-3 py-2.5 font-mono text-slate-500 text-[11px]">{f.facultyId}</td>
                            <td className="px-3 py-2.5 font-semibold text-[10px] text-slate-800">{f.name}</td>
                            <td className="px-3 py-2.5 text-right font-bold font-mono text-indigo-700">{f.points.toLocaleString()}</td>
                            <td className="px-3 py-2.5 text-right font-mono text-slate-500">{f.activities}</td>
                            <td className="px-4 py-2.5">
                              <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: progressColor(pct) }} />
                              </div>
                              <p className="text-[9px] text-slate-400 mt-0.5">{pct}% of {topPts} pts</p>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tier.cls}`}>{tier.label}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-6">No ranked faculty data for this department yet</p>
              )}

              {/* Insight cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-sm font-bold text-emerald-800">Top Performers</h4>
                  </div>
                  {(topPerformers.length > 0 ? topPerformers : deptFacultyRankings.slice(0, 2)).map(f => (
                    <p key={f.facultyId} className="text-xs text-emerald-700 mt-1">
                      &bull; {f.name} &mdash; {f.points.toLocaleString()} pts
                    </p>
                  ))}
                  {topPerformers.length === 0 && deptFacultyRankings.length === 0 && (
                    <p className="text-xs text-emerald-600">No data</p>
                  )}
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-bold text-blue-800">Dept Standing</h4>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">&bull; College Rank #{deptRankPosition} of {realDeptRankings.length}</p>
                  <p className="text-xs text-blue-700 mt-1">&bull; Avg Points: {realDept.avgPoints} / faculty</p>
                  <p className="text-xs text-blue-700 mt-1">&bull; Total: {realDept.totalPoints.toLocaleString()} pts</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-amber-600" />
                    <h4 className="text-sm font-bold text-amber-800">Activity Mix</h4>
                  </div>
                  {needsWork.length > 0 && (
                    <p className="text-xs text-amber-700 mt-1 font-medium">{needsWork.length} faculty below avg threshold</p>
                  )}
                  <p className="text-xs text-amber-700 mt-1">&bull; Patents: {realDept.patentFiled + realDept.patentPublished + realDept.patentGranted}</p>
                  <p className="text-xs text-amber-700 mt-1">&bull; Papers: {realDept.paperPresentations}</p>
                  <p className="text-xs text-amber-700 mt-1">&bull; Courses: {realDept.onlineCourses}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Placeholder when no real data for this dept */}
        {!realDept && (
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-sm text-slate-400">No real data available for this department</p>
          </div>
        )}

        {/* Faculty × Activity Domain Heatmap */}
        {heatmapRows.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Faculty &times; Activity Domain Heatmap</h3>
            <p className="text-xs text-slate-500 mb-3">{realCode} &mdash; Activity counts per faculty &middot; colour relative to top performer in each column</p>
            <div className="flex flex-wrap items-center gap-3 mb-4 text-[11px]">
              {FACULTY_HEATMAP_LEGEND.map(l => (
                <span key={l.label} className="flex items-center gap-1.5">
                  <span className={`inline-block w-3 h-3 rounded-sm ${l.cls}`} />
                  <span className="text-slate-600">{l.label}</span>
                </span>
              ))}
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full border-collapse text-xs" style={{ minWidth: 720 }}>
                <thead>
                  <tr className="bg-slate-700">
                    <th className="text-left px-3 py-2.5 text-white font-semibold sticky left-0 bg-slate-700 z-10 whitespace-nowrap">Rank &middot; Faculty</th>
                    {FACULTY_HEATMAP_COLS.map(c => (
                      <th key={c.key} className="text-center px-3 py-2.5 text-white font-semibold whitespace-nowrap">{c.label}</th>
                    ))}
                    <th className="text-right px-3 py-2.5 text-white font-semibold whitespace-nowrap">Total Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {heatmapRows.map((f, i) => (
                    <tr key={f.facultyId} className="border-b border-slate-100">
                      <td className="px-3 py-0 sticky left-0 bg-white z-10 border-r border-slate-100">
                        <div className="h-9 flex items-center gap-2 min-w-[190px]">
                          <span className={`w-5 h-5 inline-flex items-center justify-center rounded-full text-[9px] font-bold flex-shrink-0 ${
                            i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-200 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-500'
                          }`}>{f.rank}</span>
                          <span className="font-semibold text-[10px] text-slate-800 truncate" title={f.name}>{f.name}</span>
                        </div>
                      </td>
                      {FACULTY_HEATMAP_COLS.map(c => {
                        const v = f.d[c.key]
                        const col = facHeatBg(v, facColMaxes[c.key])
                        return (
                          <td key={c.key} className="p-0">
                            <div className="flex items-center justify-center h-9 text-xs font-bold" style={{ backgroundColor: col.bg, color: col.text }}>
                              {v}
                            </div>
                          </td>
                        )
                      })}
                      <td className="px-3 py-0 text-right">
                        <div className="h-9 flex items-center justify-end font-bold font-mono text-indigo-700">{f.points.toLocaleString()}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      
    </div>
  )
}
