'use client'

import React, { useMemo, useState } from 'react'
import { useRoles } from '@/hooks/useRoles'
import { facultyMembers } from '@/lib/mock-data'
import { ChartCard, ComparisonBarChart, DonutChart, MultiLineChart } from '@/components/charts'
import {
  DEFAULT_WORKFLOW_DEADLINE_MAP,
  DEFAULT_WORKFLOW_SETTINGS,
  getPaperDeadlineKey,
  WORKFLOW_DEADLINES_STORAGE_KEY,
  WORKFLOW_DEADLINE_ITEMS,
  WORKFLOW_SETTINGS_STORAGE_KEY,
} from '@/lib/workflow-deadlines'
import { CheckCircle2, Clock3, ShieldAlert, Users } from 'lucide-react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
const MONTH_OPTIONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

type TabKey = 'pending' | 'completed'

type FacultyCompliance = {
  id: number
  name: string
  email: string
  department: string
  designation: string
  completedTasks: number
  pendingTasks: number
  completionRate: number
}

type TaskOption = {
  key: string
  baseId: string
  targetIndex: number
  label: string
  type: 'paper' | 'patent'
  deadlineISO: string
}

function buildTaskOptions(paperTargets: number, deadlineMap: Record<string, string>): TaskOption[] {
  const options: TaskOption[] = []

  WORKFLOW_DEADLINE_ITEMS.forEach((item) => {
    if (item.type === 'paper' && paperTargets > 1) {
      for (let target = 1; target <= paperTargets; target += 1) {
        const deadlineKey = getPaperDeadlineKey(item.id, target)
        options.push({
          key: deadlineKey,
          baseId: item.id,
          targetIndex: target,
          label: `${item.title} (Paper ${target})`,
          type: 'paper',
          deadlineISO: deadlineMap[deadlineKey] || deadlineMap[item.id] || item.defaultDeadlineISO,
        })
      }
      return
    }

    options.push({
      key: item.id,
      baseId: item.id,
      targetIndex: 1,
      label: item.title,
      type: item.type,
      deadlineISO: deadlineMap[item.id] || item.defaultDeadlineISO,
    })
  })

  return options
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function buildComplianceData(totalTasks: number): FacultyCompliance[] {
  return facultyMembers.map((member) => {
    const completedTasks = Math.min(totalTasks, 6 + (member.id % Math.max(3, totalTasks - 2)))
    const pendingTasks = Math.max(0, totalTasks - completedTasks)
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

    return {
      id: member.id,
      name: member.name,
      email: member.email,
      department: member.department,
      designation: member.designation,
      completedTasks,
      pendingTasks,
      completionRate,
    }
  })
}

function buildMonthlyTaskRateData(selectedTaskKey: string, taskOptions: TaskOption[], facultyCount: number) {
  const taskIndex = taskOptions.findIndex((t) => t.key === selectedTaskKey)
  const base = taskIndex >= 0 ? taskIndex : 0

  return MONTHS.map((month, idx) => {
    const simulatedCompleted = Math.max(
      0,
      Math.min(
        facultyCount,
        Math.round(facultyCount * (0.45 + (idx * 0.08) + ((base % 3) * 0.03) - ((idx % 2) * 0.02))),
      ),
    )
    const rate = facultyCount === 0 ? 0 : Math.round((simulatedCompleted / facultyCount) * 100)

    return {
      month,
      completionRate: rate,
      completedFaculty: simulatedCompleted,
      pendingFaculty: Math.max(0, facultyCount - simulatedCompleted),
    }
  })
}

export default function DeanTaskCompliancePage() {
  const { isDean } = useRoles()
  const [activeTab, setActiveTab] = useState<TabKey>('pending')
  const [search, setSearch] = useState('')
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [paperTargets] = useState<number>(() => {
    if (typeof window === 'undefined') return DEFAULT_WORKFLOW_SETTINGS.paperTargets
    try {
      const raw = localStorage.getItem(WORKFLOW_SETTINGS_STORAGE_KEY)
      if (!raw) return DEFAULT_WORKFLOW_SETTINGS.paperTargets
      const parsed = JSON.parse(raw) as { paperTargets?: number }
      const count = parsed.paperTargets || DEFAULT_WORKFLOW_SETTINGS.paperTargets
      return count >= 2 ? 2 : 1
    } catch {
      return DEFAULT_WORKFLOW_SETTINGS.paperTargets
    }
  })

  const [deadlineMap] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return DEFAULT_WORKFLOW_DEADLINE_MAP
    try {
      const raw = localStorage.getItem(WORKFLOW_DEADLINES_STORAGE_KEY)
      if (!raw) return DEFAULT_WORKFLOW_DEADLINE_MAP
      const parsed = JSON.parse(raw) as Record<string, string>
      return { ...DEFAULT_WORKFLOW_DEADLINE_MAP, ...parsed }
    } catch {
      return DEFAULT_WORKFLOW_DEADLINE_MAP
    }
  })

  const taskOptions = useMemo(() => buildTaskOptions(paperTargets, deadlineMap), [paperTargets, deadlineMap])
  const [selectedTaskKey, setSelectedTaskKey] = useState<string>('')

  const selectedTaskLabel = useMemo(() => {
    const selected = taskOptions.find((t) => t.key === selectedTaskKey)
    return selected?.label || taskOptions[0]?.label || 'Task'
  }, [selectedTaskKey, taskOptions])

  const effectiveTaskKey = selectedTaskKey || taskOptions[0]?.key || ''

  const compliance = useMemo(() => buildComplianceData(taskOptions.length), [taskOptions.length])

  const pendingFaculty = useMemo(
    () => compliance.filter((f) => f.pendingTasks > 0),
    [compliance],
  )

  const completedFaculty = useMemo(
    () => compliance.filter((f) => f.pendingTasks === 0),
    [compliance],
  )

  const visibleRows = useMemo(() => {
    const source = activeTab === 'pending' ? pendingFaculty : completedFaculty
    const term = search.trim().toLowerCase()

    if (!term) return source
    return source.filter((item) => {
      return (
        item.name.toLowerCase().includes(term) ||
        item.department.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term)
      )
    })
  }, [activeTab, completedFaculty, pendingFaculty, search])

  const statusDonutData = useMemo(
    () => [
      { name: 'Completed', value: completedFaculty.length, color: '#7c3aed' },
      { name: 'Pending', value: pendingFaculty.length, color: '#f59e0b' },
    ],
    [completedFaculty.length, pendingFaculty.length],
  )

  const pendingByDepartment = useMemo(() => {
    const grouped = new Map<string, number>()
    pendingFaculty.forEach((f) => {
      grouped.set(f.department, (grouped.get(f.department) || 0) + f.pendingTasks)
    })

    return Array.from(grouped.entries())
      .map(([department, pending]) => ({ department, pending }))
      .sort((a, b) => b.pending - a.pending)
      .slice(0, 8)
  }, [pendingFaculty])

  const averageCompletion = useMemo(() => {
    if (compliance.length === 0) return 0
    const total = compliance.reduce((sum, item) => sum + item.completionRate, 0)
    return Math.round(total / compliance.length)
  }, [compliance])

  const monthlyTaskRates = useMemo(() => {
    return buildMonthlyTaskRateData(effectiveTaskKey, taskOptions, compliance.length)
  }, [effectiveTaskKey, taskOptions, compliance.length])

  const tasksDueInSelectedMonth = useMemo(() => {
    return taskOptions.filter((task) => new Date(task.deadlineISO).getMonth() === selectedMonth)
  }, [taskOptions, selectedMonth])

  const dueTaskRateRows = useMemo(() => {
    return tasksDueInSelectedMonth.map((task) => {
      const data = buildMonthlyTaskRateData(task.key, taskOptions, compliance.length)
      const monthData = data.find((d) => d.month === MONTH_OPTIONS[selectedMonth]) || data[0]
      return {
        task: task.label,
        deadline: formatDate(task.deadlineISO),
        completionRate: monthData?.completionRate || 0,
        completedFaculty: monthData?.completedFaculty || 0,
        pendingFaculty: monthData?.pendingFaculty || 0,
      }
    })
  }, [tasksDueInSelectedMonth, selectedMonth, taskOptions, compliance.length])

  if (!isDean()) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
        <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="mb-3 inline-flex rounded-lg bg-red-50 p-2 text-red-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Access Restricted</h1>
          <p className="mt-1 text-sm text-slate-500">Only dean users can access task compliance analytics.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-violet-600" />
          Activities Task Compliance
        </h1>
        <p className="text-sm text-slate-500 mt-1">Monitor faculty completion against the same task workflow used in the Activities page.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-xl border border-violet-100 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total Faculty</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{compliance.length}</p>
        </div>
        <div className="rounded-xl border border-violet-100 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Completed</p>
          <p className="mt-1 text-2xl font-bold text-violet-700">{completedFaculty.length}</p>
        </div>
        <div className="rounded-xl border border-violet-100 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Pending</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{pendingFaculty.length}</p>
        </div>
        <div className="rounded-xl border border-violet-100 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Avg Completion</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{averageCompletion}%</p>
        </div>
        <div className="rounded-xl border border-violet-100 bg-white p-4 shadow-sm sm:col-span-2 lg:col-span-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Workflow Scope</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {taskOptions.length} tracked tasks ({taskOptions.filter((t) => t.type === 'paper').length} Paper, {taskOptions.filter((t) => t.type === 'patent').length} Patent)
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <ChartCard title="Completion Status Split" subtitle="Faculty distribution by status">
          <DonutChart data={statusDonutData} height={260} />
        </ChartCard>
        <ChartCard title="Pending Tasks by Department" subtitle="Higher bar means more pending work">
          <ComparisonBarChart
            data={pendingByDepartment}
            xKey="department"
            bars={[{ key: 'pending', color: '#7c3aed', name: 'Pending Tasks' }]}
            height={260}
          />
        </ChartCard>
      </div>

      <div className="mb-6">
        <ChartCard
          title="Monthly Completion Rate by Task"
          subtitle={`Month-wise completion trend for ${selectedTaskLabel}`}
          action={(
            <select
              value={effectiveTaskKey}
              onChange={(e) => setSelectedTaskKey(e.target.value)}
              className="rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
            >
              {taskOptions.map((task) => (
                <option key={task.key} value={task.key}>{task.label}</option>
              ))}
            </select>
          )}
        >
          <MultiLineChart
            data={monthlyTaskRates}
            xKey="month"
            lines={[
              { key: 'completionRate', color: '#7c3aed', name: 'Completion %' },
            ]}
            height={280}
          />
        </ChartCard>
      </div>

      <div className="mb-6">
        <ChartCard
          title="Month-wise Due Task Tracking"
          subtitle={`Tasks due in ${MONTH_OPTIONS[selectedMonth]} and their completion rate`}
          action={(
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
            >
              {MONTH_OPTIONS.map((month, idx) => (
                <option key={month} value={idx}>{month}</option>
              ))}
            </select>
          )}
        >
          {dueTaskRateRows.length > 0 ? (
            <ComparisonBarChart
              data={dueTaskRateRows.map((row) => ({
                task: row.task.length > 18 ? `${row.task.slice(0, 18)}...` : row.task,
                completionRate: row.completionRate,
              }))}
              xKey="task"
              bars={[{ key: 'completionRate', color: '#7c3aed', name: 'Completion %' }]}
              height={280}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50 p-4 text-sm text-slate-600">
              No configured tasks are due in {MONTH_OPTIONS[selectedMonth]}. Update deadlines in Workflow Deadline Settings to track this month.
            </div>
          )}
        </ChartCard>
      </div>

      {dueTaskRateRows.length > 0 ? (
        <div className="mb-6 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Tasks Due in {MONTH_OPTIONS[selectedMonth]}</h3>
          <div className="space-y-2">
            {dueTaskRateRows.map((row) => (
              <div key={`${row.task}-${row.deadline}`} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{row.task}</p>
                  <p className="text-xs text-slate-500">Deadline: {row.deadline}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                    {row.completionRate}%
                  </span>
                  <span className="text-xs text-slate-500">{row.completedFaculty} done • {row.pendingFaculty} pending</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="inline-flex rounded-xl border border-violet-200 bg-violet-50 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'pending' ? 'bg-violet-600 text-white' : 'text-violet-700 hover:bg-violet-100'
              }`}
            >
              <Clock3 className="inline-block mr-1 h-4 w-4" />
              Pending
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'completed' ? 'bg-violet-600 text-white' : 'text-violet-700 hover:bg-violet-100'
              }`}
            >
              <CheckCircle2 className="inline-block mr-1 h-4 w-4" />
              Completed
            </button>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search faculty by name, department, or email"
            className="input-base max-w-md"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wide">
                <th className="px-3 py-2 text-left">Faculty</th>
                <th className="px-3 py-2 text-left">Department</th>
                <th className="px-3 py-2 text-left">Designation</th>
                <th className="px-3 py-2 text-center">Completed</th>
                <th className="px-3 py-2 text-center">Pending</th>
                <th className="px-3 py-2 text-center">Rate</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-900">{row.name}</p>
                    <p className="text-xs text-slate-500">{row.email}</p>
                  </td>
                  <td className="px-3 py-3 text-slate-700">{row.department}</td>
                  <td className="px-3 py-3 text-slate-700">{row.designation}</td>
                  <td className="px-3 py-3 text-center text-violet-700 font-semibold">{row.completedTasks}</td>
                  <td className="px-3 py-3 text-center text-amber-700 font-semibold">{row.pendingTasks}</td>
                  <td className="px-3 py-3 text-center">
                    <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                      {row.completionRate}%
                    </span>
                  </td>
                </tr>
              ))}
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                    No faculty found for this filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
