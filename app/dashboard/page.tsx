'use client'

import React from 'react'
import { useAuthStore } from '@/lib/store'
import { useRoles } from '@/hooks/useRoles'
import { RoleGuard } from '@/components/RoleGuard'
import {
  ChartCard, TrendAreaChart, ComparisonBarChart, DonutChart,
  MultiLineChart, RadarChartComponent, ComposedBarLineChart,
  PerformanceScatter, InsightCard, Sparkline,
} from '@/components/charts'
import {
  facultyStats, hodStats, deanStats, verificationStats, adminStats,
  myActivities, pendingActivities, monthlyTrends, categoryBreakdown,
  departmentStats, leaderboard, recentNotifications,
  weeklyPointsData, activityStatusData, pointsGoalData, facultyRadarData,
  approvalFunnelData, dailyReviewData, reviewTimeData, categoryPendingData,
  yearlyComparisonData, collegeActivityTypeData, facultyGrowthData,
  userGrowthData, roleDistributionData, deptActivityVolumeData, loginStatsData,
  getPersonalizedFacultyData, getPersonalizedHodData,
} from '@/lib/mock-data'
import {
  TrendingUp, TrendingDown, Award, FileText, Clock, CheckCircle2,
  XCircle, Users, Building2, GraduationCap, ShieldCheck, Activity,
  BarChart3, Target, AlertTriangle, Star, ArrowUpRight, ArrowDownRight,
  Zap, Eye, Calendar, Bell,
} from 'lucide-react'
import Link from 'next/link'

/* ------------------------------------------------------------------ */
/* Helper: Stat card                                                   */
/* ------------------------------------------------------------------ */
function StatCard({ label, value, icon: Icon, description, trend, color }: {
  label: string; value: string | number; icon: React.ElementType
  description?: string; trend?: number; color: string
}) {
  const isPositive = trend && trend > 0
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {value}
          </p>
          {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
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
function FacultyDashboard() {
  const { user } = useAuthStore()
  const data = getPersonalizedFacultyData(user?.id || 1, user?.name || 'Dr. Priya Sharma')
  const { stats, activities, statusData, weeklyData, goalData, radarData, department, designation } = data
  const recentActs = activities.slice(0, 5)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Personal info bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
          {(user?.name || 'U').charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{user?.name || 'Faculty'}</p>
          <p className="text-xs text-slate-500">{designation} &middot; {department} Department</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">Rank #{stats.rank}</span>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Activities" value={stats.totalActivities} icon={FileText} description="All time" trend={stats.pointsTrend} color="bg-blue-50 text-blue-600" />
        <StatCard label="Total Points" value={stats.totalPoints} icon={Award} description={`Rank #${stats.rank} of ${stats.totalFaculty}`} trend={stats.pointsTrend} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} description="Awaiting verification" color="bg-amber-50 text-amber-600" />
        <StatCard label="Approved" value={stats.approved} icon={CheckCircle2} description={`${stats.totalActivities > 0 ? ((stats.approved / stats.totalActivities) * 100).toFixed(0) : 0}% approval rate`} color="bg-green-50 text-green-600" />
      </div>

      {/* Chart row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Weekly Points" subtitle="Last 8 weeks" className="lg:col-span-2">
          <TrendAreaChart data={weeklyData} xKey="week" areas={[{ key: 'points', color: '#3b82f6', name: 'Points' }]} />
        </ChartCard>
        <ChartCard title="Status Breakdown" subtitle="Activity outcomes">
          <DonutChart data={statusData} />
        </ChartCard>
      </div>

      {/* Chart row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Target vs Actual" subtitle="Monthly points goal">
          <MultiLineChart data={goalData} xKey="month"
            lines={[
              { key: 'actual', color: '#3b82f6', name: 'Actual' },
              { key: 'target', color: '#94a3b8', name: 'Target', dashed: true },
            ]} />
        </ChartCard>
        <ChartCard title="Skill Dimensions" subtitle="Activity distribution by area">
          <RadarChartComponent data={radarData} dataKey="value" nameKey="subject" color="#6366f1" />
        </ChartCard>
      </div>

      {/* Recent activities */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Recent Activities</h3>
            <p className="text-xs text-slate-500">Your latest submissions</p>
          </div>
          <Link href="/activities" className="text-xs font-medium text-blue-600 hover:text-blue-700">
            View All &rarr;
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recentActs.map((act) => (
            <div key={act.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 truncate">{act.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{act.type} &middot; {act.date}</p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className="text-xs font-bold text-slate-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  +{act.points}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  act.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                  act.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  {act.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* HOD DASHBOARD                                                       */
/* ------------------------------------------------------------------ */
function HodDashboard() {
  const { user } = useAuthStore()
  const hodData = getPersonalizedHodData(user?.id || 2, user?.name || 'Dr. Rajesh Kumar', user?.departmentId)
  const { stats, leaderboard: deptLeaderboard, categoryBreakdown: deptCategories, pendingActivities: deptPending } = hodData

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Department info bar */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
          {stats.departmentShort}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{stats.departmentName}</p>
          <p className="text-xs text-slate-500">Head of Department &middot; {user?.name || 'HOD'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Faculty" value={stats.totalFaculty} icon={Users} description={`${stats.activeFaculty} active`} color="bg-blue-50 text-blue-600" />
        <StatCard label="Activities" value={stats.totalActivities} icon={FileText} description={stats.departmentName} trend={stats.activitiesGrowth} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Pending Approvals" value={stats.pendingApprovals} icon={Clock} description="Need review" color="bg-amber-50 text-amber-600" />
        <StatCard label="Avg Points" value={stats.avgPointsPerFaculty} icon={BarChart3} description={`Top: ${stats.topPerformer}`} color="bg-purple-50 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Approval Funnel" subtitle={`${stats.departmentShort} – Monthly submission pipeline`} className="lg:col-span-2">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Monthly Trends" subtitle={`${stats.departmentShort} – Activities & approvals over time`}>
          <TrendAreaChart data={monthlyTrends} xKey="month"
            areas={[
              { key: 'activities', color: '#3b82f6', name: 'Activities' },
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
        <div className="bg-white rounded-xl border border-slate-200 p-5">
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
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* DEAN DASHBOARD                                                      */
/* ------------------------------------------------------------------ */
function DeanDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Departments" value={deanStats.totalDepartments} icon={Building2} color="bg-blue-50 text-blue-600" />
        <StatCard label="Total Faculty" value={deanStats.totalFaculty} icon={Users} description="Across all departments" color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Activities" value={deanStats.totalActivities} icon={Activity} description={`${deanStats.totalPending} pending`} color="bg-purple-50 text-purple-600" />
        <StatCard label="Research Output" value={deanStats.researchOutput} icon={GraduationCap} description={`${deanStats.patentsFiled} patents filed`} color="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Year-over-Year Comparison" subtitle="Points by month" className="lg:col-span-2">
          <MultiLineChart data={yearlyComparisonData} xKey="month"
            lines={[
              { key: 'thisYear', color: '#3b82f6', name: '2025-26' },
              { key: 'lastYear', color: '#94a3b8', name: '2024-25', dashed: true },
            ]} />
        </ChartCard>
        <ChartCard title="Activity Types" subtitle="College-wide distribution">
          <DonutChart data={collegeActivityTypeData.slice(0, 5).map(t => ({ name: t.type, value: t.count, color: t.color }))} innerRadius={50} outerRadius={75} showLabel={false} />
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
            {collegeActivityTypeData.slice(0, 6).map(t => (
              <div key={t.type} className="flex items-center gap-2 text-[11px] text-slate-600">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.color }} />
                <span className="truncate">{t.type}</span>
                <span className="ml-auto font-semibold">{t.count}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Faculty Growth" subtitle="Active faculty & new joiners by semester">
          <ComposedBarLineChart data={facultyGrowthData} xKey="semester"
            bars={[{ key: 'new', color: '#6366f1', name: 'New Joiners' }]}
            lines={[{ key: 'active', color: '#10b981', name: 'Active Faculty' }]} />
        </ChartCard>

        {/* Department cards */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Department Overview</h3>
              <p className="text-xs text-slate-500">Performance summary</p>
            </div>
            <Link href="/college" className="text-xs font-medium text-blue-600 hover:text-blue-700">Details &rarr;</Link>
          </div>
          <div className="space-y-3">
            {departmentStats.map((d) => (
              <div key={d.shortName} className="flex items-center gap-3 py-2">
                <span className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">{d.shortName}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{d.name}</p>
                  <p className="text-[11px] text-slate-400">{d.facultyCount} faculty &middot; {d.totalActivities} activities</p>
                </div>
                <span className="text-sm font-bold text-slate-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{d.avgPoints}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* VERIFICATION DASHBOARD                                              */
/* ------------------------------------------------------------------ */
function VerificationDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Review" value={verificationStats.pendingReview} icon={Clock} description="Needs action" color="bg-amber-50 text-amber-600" />
        <StatCard label="Reviewed Today" value={verificationStats.reviewedToday} icon={Eye} description="Completed today" color="bg-blue-50 text-blue-600" />
        <StatCard label="This Week" value={verificationStats.reviewedThisWeek} icon={Calendar} description="18 reviewed" color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Approval Rate" value={`${verificationStats.approvalRate}%`} icon={CheckCircle2} description={`${verificationStats.rejectionRate}% rejected`} color="bg-green-50 text-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Daily Review Volume" subtitle="This week" className="lg:col-span-2">
          <ComparisonBarChart data={dailyReviewData} xKey="day"
            bars={[
              { key: 'approved', color: '#10b981', name: 'Approved' },
              { key: 'rejected', color: '#ef4444', name: 'Rejected' },
            ]} />
        </ChartCard>
        <ChartCard title="Pending by Category" subtitle="Awaiting review">
          <DonutChart data={categoryPendingData.filter(c => c.pending > 0).map(c => ({ name: c.category, value: c.pending, color: c.color }))} innerRadius={45} outerRadius={70} />
        </ChartCard>
      </div>

      <ChartCard title="Review Time Distribution" subtitle="Hours to review completion">
        <ComparisonBarChart data={reviewTimeData} xKey="range"
          bars={[{ key: 'count', color: '#6366f1', name: 'Reviews' }]} height={200} />
      </ChartCard>

      {/* Pending queue preview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Pending Queue</h3>
            <p className="text-xs text-slate-500">{pendingActivities.length} items awaiting review</p>
          </div>
          <Link href="/verification" className="text-xs font-medium text-blue-600 hover:text-blue-700">
            Open Queue &rarr;
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {pendingActivities.slice(0, 4).map((act) => (
            <div key={act.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 truncate">{act.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{act.facultyName} &middot; {act.department} &middot; {act.date}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 ml-4">
                +{act.points} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* ADMIN DASHBOARD                                                     */
/* ------------------------------------------------------------------ */
function AdminDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={adminStats.totalUsers} icon={Users} description={`${adminStats.activeUsers} active`} color="bg-blue-50 text-blue-600" />
        <StatCard label="New This Month" value={adminStats.newUsersThisMonth} icon={Zap} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="System Uptime" value={adminStats.systemUptime} icon={Activity} description="Last 30 days" color="bg-green-50 text-green-600" />
        <StatCard label="Storage" value={adminStats.storageUsed} icon={BarChart3} color="bg-purple-50 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="User Growth" subtitle="Total vs Active users" className="lg:col-span-2">
          <TrendAreaChart data={userGrowthData} xKey="month"
            areas={[
              { key: 'users', color: '#3b82f6', name: 'Total' },
              { key: 'active', color: '#10b981', name: 'Active' },
            ]} />
        </ChartCard>
        <ChartCard title="Role Distribution" subtitle="Users by role">
          <DonutChart data={roleDistributionData.map(r => ({ name: r.role, value: r.count, color: r.color }))} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Dept Activity Volume" subtitle="Activities & points by dept">
          <ComparisonBarChart data={deptActivityVolumeData} xKey="dept"
            bars={[
              { key: 'activities', color: '#6366f1', name: 'Activities' },
            ]} />
        </ChartCard>
        <ChartCard title="Login Statistics" subtitle="Monthly logins vs unique users">
          <ComposedBarLineChart data={loginStatsData} xKey="month"
            bars={[{ key: 'logins', color: '#94a3b8', name: 'Total Logins' }]}
            lines={[{ key: 'unique', color: '#3b82f6', name: 'Unique Users' }]} />
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
  const { isFaculty, isHod, isDean, isVerification, isMaintenance } = useRoles()

  // Determine greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Pick primary role for the dashboard view
  // HOD sees their personal faculty dashboard here; department data is on /department
  const primaryRole = isMaintenance() ? 'admin'
    : isDean() ? 'dean'
    : isVerification() ? 'verification'
    : 'faculty'

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          {greeting}, {user?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here&apos;s what&apos;s happening with your {primaryRole === 'admin' ? 'system' : primaryRole === 'dean' ? 'college' : primaryRole === 'verification' ? 'review queue' : 'achievements'} today.
        </p>
      </div>

      {/* Notifications bar */}
      {recentNotifications.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <Bell className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-800">{recentNotifications[0].message}</p>
            <p className="text-xs text-blue-500 mt-0.5">{recentNotifications[0].time}</p>
          </div>
        </div>
      )}

      {/* Role-specific dashboards — HOD & Faculty both see the personal faculty view */}
      {primaryRole === 'faculty' && <FacultyDashboard />}
      {primaryRole === 'dean' && <DeanDashboard />}
      {primaryRole === 'verification' && <VerificationDashboard />}
      {primaryRole === 'admin' && <AdminDashboard />}
    </div>
  )
}
