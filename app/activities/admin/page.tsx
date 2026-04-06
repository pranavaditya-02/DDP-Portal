'use client'

import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useRoles } from '@/hooks/useRoles'
import {
  DEFAULT_WORKFLOW_SETTINGS,
  DEFAULT_WORKFLOW_DEADLINE_MAP,
  getPaperDeadlineKey,
  WORKFLOW_DEADLINE_ITEMS,
  WORKFLOW_DEADLINES_STORAGE_KEY,
  WORKFLOW_SETTINGS_STORAGE_KEY,
} from '@/lib/workflow-deadlines'
import { CalendarDays, RotateCcw, Save, Search, ShieldAlert, Settings } from 'lucide-react'

export default function ActivitiesAdminPage() {
  const { isMaintenance } = useRoles()
  const isAdmin = isMaintenance()

  const [deadlineMap, setDeadlineMap] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return DEFAULT_WORKFLOW_DEADLINE_MAP

    const raw = localStorage.getItem(WORKFLOW_DEADLINES_STORAGE_KEY)
    if (!raw) return DEFAULT_WORKFLOW_DEADLINE_MAP

    try {
      const parsed = JSON.parse(raw) as Record<string, string>
      return { ...DEFAULT_WORKFLOW_DEADLINE_MAP, ...parsed }
    } catch {
      return DEFAULT_WORKFLOW_DEADLINE_MAP
    }
  })

  const [paperTargets, setPaperTargets] = useState<number>(() => {
    if (typeof window === 'undefined') return DEFAULT_WORKFLOW_SETTINGS.paperTargets

    const raw = localStorage.getItem(WORKFLOW_SETTINGS_STORAGE_KEY)
    if (!raw) return DEFAULT_WORKFLOW_SETTINGS.paperTargets

    try {
      const parsed = JSON.parse(raw) as { paperTargets?: number }
      const count = parsed.paperTargets || DEFAULT_WORKFLOW_SETTINGS.paperTargets
      return count >= 2 ? 2 : 1
    } catch {
      return DEFAULT_WORKFLOW_SETTINGS.paperTargets
    }
  })

  const [selectedPaperTarget, setSelectedPaperTarget] = useState<number>(1)
  const [searchTerm, setSearchTerm] = useState('')

  const grouped = useMemo(
    () => ({
      paper: WORKFLOW_DEADLINE_ITEMS.filter((item) => item.type === 'paper'),
      patent: WORKFLOW_DEADLINE_ITEMS.filter((item) => item.type === 'patent'),
    }),
    [],
  )

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredPaper = grouped.paper.filter((item) => item.title.toLowerCase().includes(normalizedSearch))
  const filteredPatent = grouped.patent.filter((item) => item.title.toLowerCase().includes(normalizedSearch))

  useEffect(() => {
    if (paperTargets === 1 && selectedPaperTarget !== 1) {
      setSelectedPaperTarget(1)
    }
  }, [paperTargets, selectedPaperTarget])

  if (!isAdmin) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
        <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="mb-3 inline-flex rounded-lg bg-red-50 p-2 text-red-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Access Restricted</h1>
          <p className="mt-1 text-sm text-slate-500">Only admin users can manage workflow deadlines.</p>
        </div>
      </div>
    )
  }

  const handleSaveAll = () => {
    localStorage.setItem(WORKFLOW_DEADLINES_STORAGE_KEY, JSON.stringify({ ...DEFAULT_WORKFLOW_DEADLINE_MAP, ...deadlineMap }))
    localStorage.setItem(WORKFLOW_SETTINGS_STORAGE_KEY, JSON.stringify({ paperTargets }))
    toast.success('Workflow deadlines saved successfully')
  }

  const handleSavePaperTargets = () => {
    localStorage.setItem(WORKFLOW_SETTINGS_STORAGE_KEY, JSON.stringify({ paperTargets }))
    toast.success('Paper target settings saved')
  }

  const handleSaveSingleDeadline = (label: string) => {
    localStorage.setItem(WORKFLOW_DEADLINES_STORAGE_KEY, JSON.stringify({ ...DEFAULT_WORKFLOW_DEADLINE_MAP, ...deadlineMap }))
    toast.success(`${label} deadline saved`)
  }

  const handleReset = () => {
    setDeadlineMap(DEFAULT_WORKFLOW_DEADLINE_MAP)
    setPaperTargets(DEFAULT_WORKFLOW_SETTINGS.paperTargets)
    localStorage.setItem(WORKFLOW_DEADLINES_STORAGE_KEY, JSON.stringify(DEFAULT_WORKFLOW_DEADLINE_MAP))
    localStorage.setItem(WORKFLOW_SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_WORKFLOW_SETTINGS))
    toast.success('Workflow deadlines reset to defaults')
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-violet-600" />
          Workflow Deadline Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">Set paper and patent deadlines used across activities planning.</p>
      </div>

      <div className="space-y-6 animate-fade-in">
        <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr,1fr,auto] lg:items-end">
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Paper Targets</span>
              <select
                value={paperTargets}
                onChange={(e) => setPaperTargets(Number(e.target.value))}
                className="input-base"
              >
                <option value={1}>1 Target</option>
                <option value={2}>2 Targets</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Paper Deadline Set</span>
              <select
                value={selectedPaperTarget}
                onChange={(e) => setSelectedPaperTarget(Number(e.target.value))}
                className="input-base"
              >
                <option value={1}>Paper 1</option>
                {paperTargets === 2 ? <option value={2}>Paper 2</option> : null}
              </select>
            </label>

            <button
              type="button"
              onClick={handleSavePaperTargets}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 text-sm font-semibold text-violet-700 hover:bg-violet-100"
            >
              <Save className="h-4 w-4" />
              Save Target Settings
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search paper or patent task"
                className="input-base pl-10 border-violet-200 focus:border-violet-400 focus:ring-violet-200"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Defaults
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700"
              >
                <Save className="h-4 w-4" />
                Save All
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Paper Tasks</h2>
            <div className="space-y-3">
              {filteredPaper.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-3 sm:p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <label className="mt-2 block">
                        <span className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Deadline
                        </span>
                        <input
                          type="date"
                          value={deadlineMap[getPaperDeadlineKey(item.id, selectedPaperTarget)] || deadlineMap[item.id] || ''}
                          onChange={(e) =>
                            setDeadlineMap((prev) => ({
                              ...prev,
                              [getPaperDeadlineKey(item.id, selectedPaperTarget)]: e.target.value,
                            }))
                          }
                          className="input-base"
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveSingleDeadline(item.title)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Save Task
                    </button>
                  </div>
                </div>
              ))}
              {filteredPaper.length === 0 ? (
                <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50 p-4 text-sm text-slate-500">
                  No paper tasks found for "{searchTerm}".
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Patent Tasks</h2>
            <div className="space-y-3">
              {filteredPatent.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-3 sm:p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <label className="mt-2 block">
                        <span className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Deadline
                        </span>
                        <input
                          type="date"
                          value={deadlineMap[item.id] || ''}
                          onChange={(e) => setDeadlineMap((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          className="input-base"
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveSingleDeadline(item.title)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Save Task
                    </button>
                  </div>
                </div>
              ))}
              {filteredPatent.length === 0 ? (
                <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50 p-4 text-sm text-slate-500">
                  No patent tasks found for "{searchTerm}".
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
