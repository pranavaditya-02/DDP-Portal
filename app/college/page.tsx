'use client'

import React, { useMemo, useState } from 'react'
import {
  deanStats, monthlyTrends, yearlyComparisonData,
  collegeActivityTypeData, facultyGrowthData,
  deptRadarData, leaderboard,
} from '@/lib/mock-data'
import {
  ddpOverallIndexing, ddpSheetOverallIndexing, ddpAllActivities, ddpOverallTotals,
  ddpJournalPublicationsOverall, ddpJournalDeptBreakdown, ddpMonthlyTrend,
  ddpCategoryAchievementRates, getDDPInsights,
  buildDDPRealtimeOverallIndexing,
} from '@/lib/ddp-data'
import { useRealData } from '@/hooks/useRealData'
import DateRangePicker, { type DateRange } from '@/components/DateRangePicker'
import {
  ChartCard, TrendAreaChart, ComparisonBarChart, DonutChart,
  MultiLineChart, ComposedBarLineChart, MultiRadarChart,
} from '@/components/charts'
import {
  GraduationCap, Building2, Users, Activity,
  ArrowUpRight, AlertTriangle, CheckCircle2, ShieldAlert,
  Trophy, ChevronDown, BarChart3, TrendingUp, Target,
} from 'lucide-react'

/* ================================================================
   HELPERS & CONSTANTS
   ================================================================ */

const MONO_FONT = { fontFamily: "'JetBrains Mono', monospace" }

const DEPT_COLORS: Record<string, string> = {
  CSE: '#3b82f6', IT: '#10b981', ECE: '#8b5cf6', EEE: '#f59e0b', MECH: '#ef4444',
  CIVIL: '#6366f1', AIML: '#14b8a6', AIDS: '#f97316', BIOTECH: '#ec4899',
  AGRI: '#84cc16', EIE: '#a855f7', FT: '#06b6d4', MTRX: '#e11d48',
  CSD: '#7c3aed', CT: '#0891b2',
}

const HEATMAP_LEGEND = [
  { label: 'Exceeding (80%+)', cls: 'bg-green-500' },
  { label: 'On Track (60-79%)', cls: 'bg-green-300' },
  { label: 'At Risk (40-59%)', cls: 'bg-yellow-300' },
  { label: 'Behind (20-39%)', cls: 'bg-orange-400' },
  { label: 'Critical (<20%)', cls: 'bg-red-500' },
  { label: 'No Progress', cls: 'bg-slate-100 border border-slate-200' },
]

const HEATMAP_COLS = ['Paper Pres.', 'Online Courses', 'Guest Lect.', 'Events Org.', 'Events Att.', 'Patent Filed', 'Patent Pub.', 'Patent Grant'] as const
const HEATMAP_KEYS = ['paperPresentations', 'onlineCourses', 'guestLectures', 'eventsOrganized', 'eventsAttended', 'patentFiled', 'patentPublished', 'patentGranted'] as const
type HeatmapKey = typeof HEATMAP_KEYS[number]

function heatBg(v: number) {
  if (v >= 80) return { bg: '#22c55e', text: '#fff' }
  if (v >= 60) return { bg: '#86efac', text: '#14532d' }
  if (v >= 40) return { bg: '#fde047', text: '#713f12' }
  if (v >= 20) return { bg: '#fb923c', text: '#fff' }
  if (v > 0) return { bg: '#ef4444', text: '#fff' }
  return { bg: '#f1f5f9', text: '#94a3b8' }
}

function progressColor(pct: number) {
  if (pct >= 80) return '#22c55e'
  if (pct >= 60) return '#eab308'
  if (pct >= 40) return '#f97316'
  return '#ef4444'
}

function pctTextColor(pct: number) {
  if (pct >= 80) return 'text-emerald-600'
  if (pct >= 60) return 'text-yellow-600'
  if (pct >= 40) return 'text-orange-600'
  return 'text-red-500'
}

/* ================================================================
   DERIVED DATA
   ================================================================ */

const insights = getDDPInsights()

const ACTIVITY_OPTIONS = ['All', ...ddpAllActivities.map(a => a.activityName)]

/* ================================================================
   SUB-COMPONENTS
   ================================================================ */

/** Divider between major dashboard sections */
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
function KpiCard({ label, value, note, gradient, borderColor, noteIcon }: {
  label: string
  value: string | number
  note: string
  gradient: string
  borderColor: string
  noteIcon?: React.ReactNode
}) {
  return (
    <div className={`${gradient} border ${borderColor} rounded-xl p-6 text-center`}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-4xl font-black" style={MONO_FONT}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <div className="flex items-center justify-center gap-1 mt-1 text-xs">
        {noteIcon}
        <span className="font-bold">{note}</span>
      </div>
    </div>
  )
}

/** Small stat card for institutional overview */
function StatCard({ label, value, subtitle, icon: Icon, iconBg, iconColor }: {
  label: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1" style={MONO_FONT}>{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg} ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

/** Insight highlight card */
function InsightCard({ label, title, detail, gradient, borderColor, iconBg, icon: Icon, iconColor }: {
  label: string
  title: string
  detail: string
  gradient: string
  borderColor: string
  iconBg: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
}) {
  return (
    <div className={`${gradient} border ${borderColor} rounded-xl p-4 flex items-start gap-3`}>
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div>
        <p className="text-xs font-semibold">{label}</p>
        <p className="text-base font-bold leading-tight">{title}</p>
        <p className="text-[11px] opacity-80">{detail}</p>
      </div>
    </div>
  )
}

/* ================================================================
   MAIN PAGE COMPONENT
   ================================================================ */

export default function CollegePage() {
  const [dateRange, setDateRange] = useState<DateRange>({ from: '', to: '' })
  const { collegeStats: realCollegeStats, deptRankings: realDeptRankings, activityBreakdown: realActivityBreakdown, loading: realLoading } = useRealData({
    dateFrom: dateRange.from || undefined,
    dateTo:   dateRange.to   || undefined,
  })
  const [selectedActivity, setSelectedActivity] = useState(ACTIVITY_OPTIONS[0])
  const [showAllIndexing, setShowAllIndexing] = useState(false)
  const [showAllJournal, setShowAllJournal] = useState(false)
  const realtimeOverallIndexing = useMemo(() => buildDDPRealtimeOverallIndexing(realDeptRankings), [realDeptRankings])
  const activeOverallIndexing = realtimeOverallIndexing.length
    ? realtimeOverallIndexing
    : (ddpSheetOverallIndexing.length ? ddpSheetOverallIndexing : ddpOverallIndexing)
  const ddpDeptIndexData = useMemo(() => activeOverallIndexing.slice(0, 10).map(d => ({
    dept: d.shortName,
    baseIndex: +(d.baseIndex * 100).toFixed(1),
    additionalIndex: +(d.additionalIndex * 100).toFixed(1),
  })), [activeOverallIndexing])

  const journalBaseTarget = Math.max(ddpJournalPublicationsOverall.proposedTarget, 1)
  const journalBaseAchieved = Math.max(ddpJournalPublicationsOverall.proposedAchieved, 1)

  const allAggregated = {
    activityName: 'All',
    proposedTarget: ddpAllActivities.reduce((s, a) => s + a.proposedTarget, 0),
    proposedAchieved: ddpAllActivities.reduce((s, a) => s + a.proposedAchieved, 0),
    pending: ddpAllActivities.reduce((s, a) => s + a.pending, 0),
  }
  const selectedAct = selectedActivity === 'All'
    ? allAggregated
    : ddpAllActivities.find(a => a.activityName === selectedActivity) || ddpAllActivities[0]
  const selectedDeptData = selectedActivity === 'All'
    ? ddpJournalDeptBreakdown.map(d => ({
        ...d,
        totalTarget: Math.round(d.totalTarget * (allAggregated.proposedTarget / journalBaseTarget)),
        achieved: Math.round(d.achieved * (allAggregated.proposedAchieved / journalBaseAchieved)),
        pending: Math.round(d.totalTarget * (allAggregated.proposedTarget / journalBaseTarget)) - Math.round(d.achieved * (allAggregated.proposedAchieved / journalBaseAchieved)),
      }))
    : selectedActivity.toUpperCase() === 'JOURNAL PUBLICATIONS (SCI / WOS)'
      ? ddpJournalDeptBreakdown
      : ddpJournalDeptBreakdown.map(d => ({
          ...d,
          totalTarget: Math.round(d.totalTarget * (selectedAct.proposedTarget / journalBaseTarget)),
          achieved: Math.round(d.achieved * (selectedAct.proposedAchieved / journalBaseAchieved)),
          pending: Math.round(d.totalTarget * (selectedAct.proposedTarget / journalBaseTarget)) - Math.round(d.achieved * (selectedAct.proposedAchieved / journalBaseAchieved)),
        }))

  const activityMaxima = {
    paperPresentations: Math.max(...realDeptRankings.map(d => d.paperPresentations), 1),
    onlineCourses: Math.max(...realDeptRankings.map(d => d.onlineCourses), 1),
    guestLectures: Math.max(...realDeptRankings.map(d => d.guestLectures), 1),
    eventsOrganized: Math.max(...realDeptRankings.map(d => d.eventsOrganized), 1),
    eventsAttended: Math.max(...realDeptRankings.map(d => d.eventsAttended), 1),
    patentFiled: Math.max(...realDeptRankings.map(d => d.patentFiled), 1),
    patentPublished: Math.max(...realDeptRankings.map(d => d.patentPublished), 1),
    patentGranted: Math.max(...realDeptRankings.map(d => d.patentGranted), 1),
  }

  const realHeatmapData: Array<{ dept: string } & Record<HeatmapKey, number>> = realDeptRankings.map(d => ({
    dept: d.shortCode,
    paperPresentations: Math.round((d.paperPresentations / activityMaxima.paperPresentations) * 100),
    onlineCourses: Math.round((d.onlineCourses / activityMaxima.onlineCourses) * 100),
    guestLectures: Math.round((d.guestLectures / activityMaxima.guestLectures) * 100),
    eventsOrganized: Math.round((d.eventsOrganized / activityMaxima.eventsOrganized) * 100),
    eventsAttended: Math.round((d.eventsAttended / activityMaxima.eventsAttended) * 100),
    patentFiled: Math.round((d.patentFiled / activityMaxima.patentFiled) * 100),
    patentPublished: Math.round((d.patentPublished / activityMaxima.patentPublished) * 100),
    patentGranted: Math.round((d.patentGranted / activityMaxima.patentGranted) * 100),
  }))

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6 sm:space-y-8">

      {/* ================================================================
         SECTION 1: HEADER & EXECUTIVE SUMMARY
         ================================================================ */}
      <header>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">DDP Indicator Dashboard</h1>
          </div>
        </div>

        {/* Date range filter */}
        <div className="flex items-center gap-3 mb-4 px-1">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            label="Filter activities by date"
          />
          {realLoading && (
            <span className="text-xs text-slate-400 animate-pulse">Loading…</span>
          )}
        </div>

        {/* Top KPI numbers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            label="Proposed Targets"
            value={ddpOverallTotals.proposedTargets}
            note="Across all departments &amp; activities"
            gradient="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700"
            borderColor="border-blue-200"
          />
          <KpiCard
            label="Proposed Achieved"
            value={ddpOverallTotals.proposedAchieved}
            note={`${insights.overallRate.toFixed(1)}% achievement rate`}
            gradient="bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700"
            borderColor="border-emerald-200"
            noteIcon={<ArrowUpRight className="w-3 h-3" />}
          />
          <KpiCard
            label="Pending"
            value={ddpOverallTotals.pending}
            note={`${(100 - insights.overallRate).toFixed(1)}% remaining to achieve`}
            gradient="bg-gradient-to-br from-rose-50 to-pink-50 text-rose-700"
            borderColor="border-rose-200"
          />
        </div>
      </header>

      

      {/* ================================================================
         SECTION 3: INSTITUTIONAL OVERVIEW
         ================================================================ */}
      <section>
        <SectionDivider icon={Building2} title="Institutional Overview" subtitle="Key institutional metrics at a glance" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Departments" value={realCollegeStats.totalDepartments} icon={Building2} iconBg="bg-blue-50" iconColor="text-blue-600" />
          <StatCard label="Total Faculty" value={realCollegeStats.totalUniqueFaculty} subtitle="Across all departments" icon={Users} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
          <StatCard label="Activities" value={realCollegeStats.totalActivities.toLocaleString()} subtitle="Approved records" icon={Activity} iconBg="bg-purple-50" iconColor="text-purple-600" />
          <StatCard label="Research Output" value={realCollegeStats.paperPresentations.toLocaleString()} subtitle={`${realCollegeStats.totalPatents} patents (F+P+G)`} icon={GraduationCap} iconBg="bg-amber-50" iconColor="text-amber-600" />
        </div>
      </section>

      {/* ================================================================
         SECTION 3.5: REAL ACTIVITY BREAKDOWN (from CSV data)
         ================================================================ */}
      <section>
        <SectionDivider icon={Activity} title="Approved Activity Breakdown" subtitle="Real data from BIP system — 12,063 approved activities across 8 categories" />

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <KpiCard
            label="Total Approved"
            value={realCollegeStats.totalActivities.toLocaleString()}
            note={`${realCollegeStats.totalDepartments} departments`}
            gradient="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700"
            borderColor="border-blue-200"
          />
          <KpiCard
            label="Events & FDP"
            value={(realCollegeStats.eventsAttended + realCollegeStats.eventsOrganized).toLocaleString()}
            note="attended + organized"
            gradient="bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700"
            borderColor="border-emerald-200"
          />
          <KpiCard
            label="Online Courses"
            value={realCollegeStats.onlineCourses.toLocaleString()}
            note="NPTEL / SWAYAM / MOOC"
            gradient="bg-gradient-to-br from-violet-50 to-purple-50 text-violet-700"
            borderColor="border-violet-200"
          />
          <KpiCard
            label="Patents"
            value={realCollegeStats.totalPatents}
            note="filed · published · granted"
            gradient="bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700"
            borderColor="border-amber-200"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Activity category progress bars */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Activity Category Totals</h3>
            <p className="text-xs text-slate-500 mb-4">Approved records per activity type</p>
            <div className="space-y-3">
              {realActivityBreakdown.map(a => {
                const pct = Math.round((a.count / realCollegeStats.totalActivities) * 100)
                return (
                  <div key={a.name}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-slate-700">{a.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{pct}%</span>
                        <span className="text-xs font-bold text-slate-800 font-mono w-14 text-right">{a.count.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: a.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top departments by activity count */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Top Departments by Activity Volume</h3>
            <p className="text-xs text-slate-500 mb-4">Total approved activities per department</p>
            <div className="space-y-2">
              {realDeptRankings.slice(0, 10).map((d, i) => {
                const maxTotal = realDeptRankings[0].total
                const pct = Math.round((d.total / maxTotal) * 100)
                return (
                  <div key={d.shortCode} className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-200 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-500'
                    }`}>{i + 1}</span>
                    <span className="text-[11px] font-semibold text-slate-700 w-10 flex-shrink-0">{d.shortCode}</span>
                    <div className="flex-1">
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-800 font-mono w-12 text-right">{d.total.toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
         SECTION 4: DDP PERFORMANCE RANKINGS
         ================================================================ */}
      <section>
        <SectionDivider icon={Trophy} title="DDP Performance Rankings" subtitle="Department rankings by DDP performance index" />

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Overall Indexing</h3>
            <button onClick={() => setShowAllIndexing(!showAllIndexing)} className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              {showAllIndexing ? 'Show Less' : 'View All'}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllIndexing ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-700 text-white">
                  {['Rank', 'Department', 'Total Target', 'Achieved', 'Base Index', 'Additional Index', 'Normalized'].map((col, i) => (
                    <th key={col} className={`${i < 2 ? 'text-left' : 'text-right'} px-4 py-3 font-semibold`}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(showAllIndexing ? activeOverallIndexing : activeOverallIndexing.slice(0, 8)).map((d, i) => {
                  const pct = Math.round((d.achieved / d.totalTarget) * 100)
                  return (
                    <tr key={d.shortName} className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${i === 0 ? 'bg-yellow-50/60' : i === 1 ? 'bg-slate-50/40' : ''}`}>
                      <td className="px-4 py-3">
                        <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-[10px] font-bold ${
                          i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-200 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-500'
                        }`}>{d.rank}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: DEPT_COLORS[d.shortName] || '#94a3b8' }} />
                          <span className="font-semibold text-slate-800">{d.department}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700">{d.totalTarget.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold font-mono text-slate-800">{d.achieved.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 ml-1">({pct}%)</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold font-mono ${d.baseIndex >= 0.4 ? 'text-emerald-600' : d.baseIndex >= 0.3 ? 'text-yellow-600' : 'text-red-500'}`}>
                          {d.baseIndex.toFixed(3)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">{d.additionalIndex.toFixed(4)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold font-mono text-indigo-700">{d.normalizedBonus.toFixed(3)}</span>
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
         SECTION 5: PERFORMANCE ANALYTICS
         ================================================================ */}
      <section>
        <SectionDivider icon={BarChart3} title="Performance Analytics" subtitle="Visual breakdown of department indices and monthly progress" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <ChartCard title="Department Index Distribution" subtitle="Base Index + Additional Index (scaled &times;100)">
            <ComparisonBarChart
              data={ddpDeptIndexData}
              xKey="dept"
              bars={[
                { key: 'baseIndex', color: '#3b82f6', name: 'Base Index (\u00d7100)' },
                { key: 'additionalIndex', color: '#10b981', name: 'Additional (\u00d7100)' },
              ]}
              height={300}
            />
          </ChartCard>
          <ChartCard title="Monthly DDP Progress" subtitle="Target vs Achieved trend over time">
            <TrendAreaChart
              data={ddpMonthlyTrend}
              xKey="month"
              areas={[
                { key: 'target', color: '#94a3b8', name: 'Target' },
                { key: 'achieved', color: '#10b981', name: 'Achieved' },
                { key: 'pending', color: '#f59e0b', name: 'Pending' },
              ]}
              height={300}
            />
          </ChartCard>
        </div>

        {/* Department x Activity Heatmap */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Department &times; Activity Achievement Heatmap</h3>
          <p className="text-xs text-slate-500 mb-3">Real approved activity volume by department (normalized to percentage within each activity)</p>
          <div className="flex flex-wrap items-center gap-3 mb-4 text-[11px]">
            {HEATMAP_LEGEND.map(l => (
              <span key={l.label} className="flex items-center gap-1.5">
                <span className={`inline-block w-3 h-3 rounded-sm ${l.cls}`} />
                <span className="text-slate-600">{l.label}</span>
              </span>
            ))}
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full border-collapse text-xs" style={{ minWidth: 900 }}>
              <thead>
                <tr className="bg-slate-700">
                  <th className="text-left px-3 py-2.5 text-white font-semibold sticky left-0 bg-slate-700 z-10">Dept</th>
                  {HEATMAP_COLS.map(h => (
                    <th key={h} className="text-center px-2 py-2.5 text-white font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {realHeatmapData.map(row => (
                  <tr key={row.dept} className="border-b border-slate-100">
                    <td className="px-3 py-0 font-semibold text-slate-800 sticky left-0 bg-white z-10 border-r border-slate-100">
                      <div className="flex items-center gap-1.5 h-10">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: DEPT_COLORS[row.dept] || '#94a3b8' }} />
                        {row.dept}
                      </div>
                    </td>
                    {HEATMAP_KEYS.map(k => {
                      const v = row[k as HeatmapKey]
                      const c = heatBg(v)
                      return (
                        <td key={k} className="p-0">
                          <div className="flex items-center justify-center h-10 text-xs font-bold" style={{ backgroundColor: c.bg, color: c.text }}>
                            {v}%
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ================================================================
         SECTION 6: ACHIEVEMENT ANALYSIS
         ================================================================ */}
      <section>
        <SectionDivider icon={Target} title="Achievement Analysis" subtitle="Activity-wise and category-wise achievement breakdown" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Activity-wise progress bars */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 text-sm mb-1">Activity-wise Achievement Rate</h3>
            <p className="text-xs text-slate-500 mb-4">All DDP activities &mdash; sorted by completion percentage</p>
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-2">
              {[...ddpAllActivities]
                .sort((a, b) => (b.proposedAchieved / Math.max(b.proposedTarget, 1)) - (a.proposedAchieved / Math.max(a.proposedTarget, 1)))
                .map(a => {
                  const pct = Math.round((a.proposedAchieved / Math.max(a.proposedTarget, 1)) * 100)
                  return (
                    <div key={a.activityName} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-slate-700 truncate max-w-[280px]" title={a.activityName}>
                          {a.activityName}
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] text-slate-400">{a.proposedAchieved}/{a.proposedTarget}</span>
                          <span className={`text-xs font-bold ${pctTextColor(pct)}`}>{pct}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, background: progressColor(pct) }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Category donut */}
          <ChartCard title="Category-wise Achievement" subtitle="Achievement distribution by category">
            <DonutChart
              data={ddpCategoryAchievementRates.map(c => ({ name: c.name, value: c.achieved, color: c.color }))}
              innerRadius={45}
              outerRadius={70}
              showLabel={false}
            />
            <div className="mt-3 space-y-2">
              {ddpCategoryAchievementRates.map(c => (
                <div key={c.name} className="flex items-center gap-2 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <span className="text-slate-600 flex-1 truncate">{c.name}</span>
                  <span className="font-bold text-slate-800">{c.value}%</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </section>

      {/* ================================================================
         SECTION 7: ACTIVITY DEEP DIVE
         ================================================================ */}
      <section>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Activity-wise Status</h2>
              <p className="text-xs text-slate-500">Select an activity to view department-wise breakdown</p>
            </div>
            <select
              value={selectedActivity}
              onChange={e => setSelectedActivity(e.target.value)}
              className="text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 max-w-md focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
            >
              {ACTIVITY_OPTIONS.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Activity KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-xs font-semibold text-amber-700 uppercase mb-1">Proposed Target</p>
              <p className="text-3xl font-black text-amber-900" style={MONO_FONT}>{selectedAct.proposedTarget}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-xs font-semibold text-emerald-700 uppercase mb-1">Proposed Achieved</p>
              <p className="text-3xl font-black text-emerald-900" style={MONO_FONT}>{selectedAct.proposedAchieved}</p>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center">
              <p className="text-xs font-semibold text-rose-700 uppercase mb-1">Pending</p>
              <p className="text-3xl font-black text-rose-900" style={MONO_FONT}>{selectedAct.pending}</p>
            </div>
          </div>

          {/* Department breakdown table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-amber-100">
                  {['S.No', 'Department', 'Total Target', 'Achieved', 'Pending'].map((col, i) => (
                    <th key={col} className={`${i < 2 ? 'text-left' : 'text-right'} px-4 py-2.5 font-semibold text-amber-900`}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(showAllJournal ? selectedDeptData : selectedDeptData.slice(0, 10)).map(d => (
                  <tr key={d.sNo} className={`border-b border-slate-50 hover:bg-slate-50/50 ${
                    d.pending < 0 ? 'bg-emerald-50/40' : d.pending > 5 ? 'bg-red-50/30' : ''
                  }`}>
                    <td className="px-4 py-2.5 text-slate-500">{d.sNo}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{d.department}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-700">{d.totalTarget}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`font-bold font-mono ${d.achieved >= d.totalTarget ? 'text-emerald-600' : 'text-slate-800'}`}>{d.achieved}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`font-bold font-mono ${
                        d.pending < 0 ? 'text-emerald-600' : d.pending === 0 ? 'text-slate-400' : d.pending > 5 ? 'text-red-500' : 'text-amber-600'
                      }`}>{d.pending}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100">
                  <td colSpan={2} className="px-4 py-2.5 font-bold text-slate-700">Total</td>
                  <td className="px-4 py-2.5 text-right font-bold font-mono text-slate-700">{selectedAct.proposedTarget}</td>
                  <td className="px-4 py-2.5 text-right font-bold font-mono text-emerald-700">{selectedAct.proposedAchieved}</td>
                  <td className="px-4 py-2.5 text-right font-bold font-mono text-rose-600">{selectedAct.pending}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {selectedDeptData.length > 10 && (
            <button onClick={() => setShowAllJournal(!showAllJournal)} className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              {showAllJournal ? 'Show Less' : `View All ${selectedDeptData.length} Departments`}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllJournal ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </section>
      {/* ================================================================
         SECTION 10: TOP PERFORMERS & MONTHLY ACTIVITY
         ================================================================ */}
      <section>
        <SectionDivider icon={Trophy} title="Top Performers & Monthly Activity" subtitle="Leading faculty and submission trends across the college" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="mb-4">
              <h3 className="font-semibold text-slate-900 text-sm">College Top Performers</h3>
              <p className="text-xs text-slate-500 mt-0.5">Across all departments</p>
            </div>
            <div className="space-y-2.5">
              {leaderboard.slice(0, 8).map(f => (
                <div key={f.rank} className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    f.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                    f.rank === 2 ? 'bg-slate-200 text-slate-600' :
                    f.rank === 3 ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-50 text-slate-400'
                  }`}>{f.rank}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{f.name}</p>
                    <p className="text-[10px] text-slate-400">{f.department}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-700 font-mono">{f.points}</span>
                </div>
              ))}
            </div>
          </div>
          <ChartCard title="Monthly Activity Trends" subtitle="Submissions, approvals & pending" className="lg:col-span-2">
            <TrendAreaChart data={monthlyTrends as unknown as Record<string, unknown>[]} xKey="month"
              areas={[
                { key: 'activities', color: '#3b82f6', name: 'Submitted' },
                { key: 'approved', color: '#10b981', name: 'Approved' },
                { key: 'pending', color: '#f59e0b', name: 'Pending' },
              ]}
              height={300} />
          </ChartCard>
        </div>
      </section>
    </div>
  )
}
