'use client'

import React, { useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { useRoles } from '@/hooks/useRoles'
import {
  facultyMembers, monthlyTrends, categoryBreakdown,
  approvalFunnelData, deptCategoryData, leaderboard,
  getPersonalizedHodData, departmentStats,
  facultyKpiData, departmentTargets, deptPerformanceIndex,
} from '@/lib/mock-data'
import {
  ChartCard, TrendAreaChart, ComparisonBarChart, DonutChart,
  ComposedBarLineChart, StackedBarChart,
} from '@/components/charts'
import {
  Users, FileText, Award, TrendingUp, Building2,
  Clock, Star, BarChart3, Search, Target, AlertTriangle,
  CheckCircle2, ArrowUpRight, Pencil, Activity,
} from 'lucide-react'
import Link from 'next/link'

const DEPT_OPTIONS = [
  { id: 1, short: 'CSE' },
  { id: 2, short: 'IT' },
  { id: 3, short: 'ECE' },
  { id: 4, short: 'EEE' },
  { id: 5, short: 'MECH' },
  { id: 6, short: 'CIVIL' },
]

/* ---- Heatmap color helpers ---- */
function heatBg(v: number) {
  if (v >= 80) return { bg: 'rgba(34,197,94,0.85)', text: '#fff' }       // green
  if (v >= 60) return { bg: 'rgba(134,239,172,0.7)', text: '#14532d' }   // light-green
  if (v >= 40) return { bg: 'rgba(253,224,71,0.7)', text: '#713f12' }    // yellow
  if (v >= 20) return { bg: 'rgba(251,146,60,0.8)', text: '#fff' }       // orange
  if (v > 0) return { bg: 'rgba(239,68,68,0.85)', text: '#fff' }         // red
  return { bg: '#f1f5f9', text: '#94a3b8' }                              // gray
}

function avgColor(v: number) {
  if (v >= 80) return 'text-green-600'
  if (v >= 60) return 'text-emerald-600'
  if (v >= 40) return 'text-yellow-600'
  if (v >= 20) return 'text-orange-600'
  return 'text-red-600'
}

export default function DepartmentPage() {
  const { user } = useAuthStore()
  const { isDean } = useRoles()
  const isDeanUser = isDean()

  // Dean can switch departments; HOD sees their own
  const defaultDeptId = user?.departmentId || 1
  const [selectedDeptId, setSelectedDeptId] = useState<number>(defaultDeptId)
  const activeDeptId = isDeanUser ? selectedDeptId : defaultDeptId

  const hodData = getPersonalizedHodData(user?.id || 2, user?.name || 'Dr. Rajesh Kumar', activeDeptId)
  const { stats, leaderboard: deptLeaderboard, categoryBreakdown: deptCategories, pendingActivities: deptPending, faculty: deptFaculty } = hodData
  const perf = deptPerformanceIndex

  // Insights from heatmap
  const kpiKeys = ['research', 'publications', 'teaching', 'events', 'innovation', 'engagement'] as const
  const critical = facultyKpiData.filter(f => {
    const avg = kpiKeys.reduce((s, k) => s + f[k], 0) / kpiKeys.length
    return avg < 45
  })
  const attention = facultyKpiData.filter(f => {
    const avg = kpiKeys.reduce((s, k) => s + f[k], 0) / kpiKeys.length
    return avg >= 45 && avg < 65
  })
  const topPerformers = facultyKpiData.filter(f => {
    const avg = kpiKeys.reduce((s, k) => s + f[k], 0) / kpiKeys.length
    return avg >= 85
  })

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
            {stats.departmentShort}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{stats.departmentName}</h1>
            <p className="text-sm text-slate-500">
              Department Overview & Analytics {isDeanUser ? '· Dean View' : `· HOD: ${user?.name}`}
            </p>
          </div>
        </div>

        {/* Dean department selector */}
        {isDeanUser && (
          <div className="mt-4 inline-flex items-center bg-slate-100 rounded-full p-1 gap-0.5">
            {DEPT_OPTIONS.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDeptId(d.id)}
                className={`relative px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedDeptId === d.id
                    ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {d.short}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ============ Enhanced Performance Stats Row ============ */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Dept Performance Index */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 border-l-4 border-l-indigo-500">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Dept Performance Index</p>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{perf.score}</p>
            <span className="text-sm text-slate-400">/{perf.maxScore}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
              <ArrowUpRight className="w-3 h-3" />{perf.trend}%
            </span>
            <span className="text-xs text-slate-400">Rank #{perf.rank}</span>
          </div>
        </div>

        {/* Faculty Count */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 border-l-4 border-l-blue-500">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Faculty Count</p>
          <p className="text-3xl font-bold text-slate-900 mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{perf.facultyCount}</p>
          <p className="text-xs text-slate-400 mt-1">{perf.activeFaculty}/{perf.facultyCount + 2} Active</p>
          <p className="text-xs text-emerald-500 mt-0.5">+{perf.newThisYear} New this year</p>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 border-l-4 border-l-emerald-500">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Achievements</p>
          <p className="text-3xl font-bold text-slate-900 mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{perf.achievements}</p>
          <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600 mt-1">
            <ArrowUpRight className="w-3 h-3" />{perf.achievementsGrowth}% YoY Growth
          </span>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 border-l-4 border-l-amber-500">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pending Approvals</p>
          <p className="text-3xl font-bold text-slate-900 mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{perf.pendingApprovals}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs text-red-600 font-medium">{perf.urgentPending} Urgent</span>
          </div>
          <Link href="/verification" className="text-[11px] text-blue-600 font-medium hover:text-blue-700 mt-0.5 inline-block">Review All &rarr;</Link>
        </div>

        {/* Target Rate */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 border-l-4 border-l-green-500">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Target Rate</p>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{perf.targetRate}%</p>
            {/* Mini donut */}
            <svg width="40" height="40" viewBox="0 0 40 40" className="flex-shrink-0">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" strokeWidth="5" />
              <circle cx="20" cy="20" r="16" fill="none" stroke="#10b981" strokeWidth="5"
                strokeDasharray={`${perf.targetRate * 1.005} ${100.5 - perf.targetRate * 1.005}`}
                strokeDashoffset="25" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span className="text-xs text-emerald-600 font-medium">On Track</span>
          </div>
        </div>
      </div>

      {/* ============ Department Targets ============ */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Department Targets</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {departmentTargets.map((t) => {
            const pct = Math.round((t.current / t.target) * 100)
            const displayCurrent = t.unit === 'Rs' ? (t.current / 100000).toFixed(1) + 'L' : t.current
            const displayTarget = t.unit === 'Rs' ? (t.target / 100000).toFixed(0) + 'L' : t.target
            return (
              <div key={t.label} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900">{t.label}</h4>
                  <Pencil className="w-4 h-4 text-amber-500" />
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
                  <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">{displayCurrent} / {displayTarget} {t.unit === 'Rs' ? '' : t.unit}</p>
                  <span className="text-sm font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Due: {t.dueDate}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ============ Faculty vs KPI Heatmap ============ */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <h3 className="text-lg font-bold text-slate-900 mb-1">Faculty vs KPI Heatmap</h3>
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 mb-4 text-[11px]">
          {[
            { label: 'Exceeding (80+)', cls: 'bg-green-500' },
            { label: 'Meeting (60-79)', cls: 'bg-green-300' },
            { label: 'Approaching (40-59)', cls: 'bg-yellow-300' },
            { label: 'Below (20-39)', cls: 'bg-orange-400' },
            { label: 'Critical (<20)', cls: 'bg-red-500' },
            { label: 'No Activity', cls: 'bg-slate-100 border border-slate-200' },
          ].map(l => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm ${l.cls}`} />
              <span className="text-slate-600">{l.label}</span>
            </span>
          ))}
        </div>

        {/* True Heatmap Grid */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '160px' }} />
              {kpiKeys.map(k => <col key={k} style={{ width: '100px' }} />)}
              <col style={{ width: '90px' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="text-left px-4 py-3 bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wide">Faculty</th>
                {kpiKeys.map(k => (
                  <th key={k} className="text-center px-2 py-3 bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wide">
                    {k.charAt(0).toUpperCase() + k.slice(1)}
                  </th>
                ))}
                <th className="text-center px-2 py-3 bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wide">Avg</th>
              </tr>
            </thead>
            <tbody>
              {facultyKpiData.map((f, idx) => {
                const avg = Math.round(kpiKeys.reduce((s, k) => s + f[k], 0) / kpiKeys.length)
                return (
                  <tr key={f.name}>
                    <td className={`px-4 py-0 border-b border-slate-100 font-medium text-sm text-slate-800 whitespace-nowrap ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}>
                      {f.name}
                    </td>
                    {kpiKeys.map(k => {
                      const c = heatBg(f[k])
                      return (
                        <td key={k} className="p-0 border-b border-slate-100">
                          <div
                            className="flex items-center justify-center h-11 text-xs font-bold transition-colors"
                            style={{ backgroundColor: c.bg, color: c.text }}
                          >
                            {f[k]}
                          </div>
                        </td>
                      )
                    })}
                    <td className={`px-2 py-0 border-b border-slate-100 text-center ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}>
                      <span className={`text-sm font-bold ${avgColor(avg)}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{avg}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Insight cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {/* Critical */}
          <div className="rounded-xl border border-red-200 bg-red-50/80 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🔔</span>
              <h4 className="text-base font-bold text-red-800">Critical Areas</h4>
            </div>
            {critical.length > 0 ? critical.map(f => {
              const lowest = kpiKeys.reduce((min, k) => f[k] < (f as any)[min] ? k : min, kpiKeys[0] as string)
              return (
                <p key={f.name} className="text-sm text-red-700 mt-1.5 leading-relaxed">
                  • {f.name} – {lowest.charAt(0).toUpperCase() + lowest.slice(1)} needs focus
                </p>
              )
            }) : <p className="text-sm text-red-600">No critical areas</p>}
          </div>

          {/* Attention */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">⚠️</span>
              <h4 className="text-base font-bold text-amber-800">Attention Needed</h4>
            </div>
            {attention.length > 0 ? attention.map(f => {
              const lowest = kpiKeys.reduce((min, k) => f[k] < (f as any)[min] ? k : min, kpiKeys[0] as string)
              return (
                <p key={f.name} className="text-sm text-amber-700 mt-1.5 leading-relaxed">
                  • {f.name} – {lowest.charAt(0).toUpperCase() + lowest.slice(1)} score declining
                </p>
              )
            }) : <p className="text-sm text-amber-600">No concerns</p>}
          </div>

          {/* Top Performers */}
          <div className="rounded-xl border border-green-200 bg-green-50/80 p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h4 className="text-base font-bold text-green-800">Top Performers</h4>
            </div>
            {topPerformers.length > 0 ? topPerformers.map(f => (
              <p key={f.name} className="text-sm text-green-700 mt-1.5 leading-relaxed">
                • {f.name} – Exceeding in all areas
              </p>
            )) : <p className="text-sm text-green-600">Keep pushing!</p>}
          </div>
        </div>
      </div>

      {/* ============ Charts ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard title="Approval Funnel" subtitle={`${stats.departmentShort} \u2013 Monthly submission pipeline`} className="lg:col-span-2">
          <ComposedBarLineChart data={approvalFunnelData} xKey="month"
            bars={[
              { key: 'submitted', color: '#94a3b8', name: 'Submitted' },
              { key: 'approved', color: '#10b981', name: 'Approved' },
            ]}
            lines={[{ key: 'rejected', color: '#ef4444', name: 'Rejected' }]} />
        </ChartCard>
        <ChartCard title="Category Breakdown" subtitle={`${stats.departmentShort} activity categories`}>
          <DonutChart data={deptCategories.length > 0 ? deptCategories : categoryBreakdown.map(c => ({ name: c.category, value: c.count, color: c.color }))} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Monthly Trends" subtitle={`${stats.departmentShort} \u2013 Activities & approvals over time`}>
          <TrendAreaChart data={monthlyTrends} xKey="month"
            areas={[
              { key: 'activities', color: '#3b82f6', name: 'Submitted' },
              { key: 'approved', color: '#10b981', name: 'Approved' },
            ]} />
        </ChartCard>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Top Performers</h3>
              <p className="text-xs text-slate-500">{stats.departmentName}</p>
            </div>
            <Link href="/leaderboard" className="text-xs font-medium text-blue-600 hover:text-blue-700">View All &rarr;</Link>
          </div>
          <div className="space-y-3">
            {(deptLeaderboard.length > 0 ? deptLeaderboard : leaderboard).slice(0, 5).map((f) => (
              <div key={f.rank} className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  f.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                  f.rank === 2 ? 'bg-slate-100 text-slate-600' :
                  f.rank === 3 ? 'bg-orange-100 text-orange-700' :
                  'bg-slate-50 text-slate-500'
                }`}>{f.rank}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{f.name}</p>
                  <p className="text-[11px] text-slate-400">{f.department} &middot; {f.activities} activities</p>
                </div>
                <span className="text-sm font-bold text-slate-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{f.points}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending queue for this department */}
      {deptPending.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Pending Approvals</h3>
              <p className="text-xs text-slate-500">{deptPending.length} submissions from {stats.departmentShort} faculty</p>
            </div>
            <Link href="/verification" className="text-xs font-medium text-blue-600 hover:text-blue-700">Review All &rarr;</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {deptPending.slice(0, 5).map((act) => (
              <div key={act.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">{act.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{act.facultyName} &middot; {act.type} &middot; {act.date}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 ml-4">
                  +{act.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Faculty list */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Faculty Members</h3>
              <p className="text-xs text-slate-500 mt-0.5">{deptFaculty.length > 0 ? deptFaculty.length : facultyMembers.filter(f => f.department === stats.departmentShort).length} members in {stats.departmentShort} department</p>
            </div>
            <Link href="/leaderboard" className="text-xs font-medium text-blue-600 hover:text-blue-700">
              View Leaderboard &rarr;
            </Link>
          </div>
        </div>

        {/* Table header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide border-b border-slate-50">
          <div className="col-span-4">Name</div>
          <div className="col-span-2">Designation</div>
          <div className="col-span-2 text-center">Activities</div>
          <div className="col-span-2 text-center">Points</div>
          <div className="col-span-2 text-center">Joined</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-50">
          {(deptFaculty.length > 0 ? deptFaculty : facultyMembers.filter(f => f.department === stats.departmentShort)).map((f) => (
            <div key={f.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-50/50 transition-colors">
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {f.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{f.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{f.email}</p>
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-slate-600 truncate">{f.designation}</p>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-sm font-semibold text-slate-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {f.activitiesCount}
                </span>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-sm font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {f.totalPoints}
                </span>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-xs text-slate-400">{f.joinedDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
