'use client'

import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useRoles } from '@/hooks/useRoles'
import {
  apiClient,
  getApiErrorMessage,
  type DesignationTargetRuleRecord,
  type WorkflowTargetDefinitionRecord,
} from '@/lib/api'
import { getWorkflowSlotKey, WORKFLOW_DEADLINE_ITEMS } from '@/lib/workflow-deadlines'
import { CalendarDays, RotateCcw, Save, Search, ShieldAlert, Settings } from 'lucide-react'

const ACADEMIC_YEAR = '2026-27'

function toInteger(value: number, min: number, max: number) {
  const normalized = Number.isFinite(value) ? Math.trunc(value) : min
  return Math.max(min, Math.min(max, normalized))
}

function WorkflowAdminLoadingSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto animate-pulse">
      <div className="mb-6 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="h-8 w-72 rounded-lg bg-slate-200" />
        <div className="mt-3 h-4 w-[28rem] rounded bg-slate-100" />
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="h-12 rounded-lg bg-slate-100" />
            <div className="h-12 rounded-lg bg-slate-100" />
            <div className="h-12 rounded-lg bg-slate-100" />
          </div>
          <div className="mt-4 h-10 rounded-lg bg-slate-100" />
        </div>

        <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 h-6 w-64 rounded bg-slate-200" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-20 rounded-xl border border-slate-200 bg-slate-50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ActivitiesAdminPage() {
  const { canAccessResource } = useRoles()
  const isAdmin = canAccessResource('/activities/admin')

  const [loading, setLoading] = useState(true)
  const [savingDeadlines, setSavingDeadlines] = useState(false)
  const [savingTargets, setSavingTargets] = useState(false)
  const [deadlineMap, setDeadlineMap] = useState<Record<string, string>>({})
  const [rules, setRules] = useState<DesignationTargetRuleRecord[]>([])
  const [targetDefinitions, setTargetDefinitions] = useState<WorkflowTargetDefinitionRecord[]>([])
  const [targetDrafts, setTargetDrafts] = useState<Record<number, Record<string, number>>>({})
  const [selectedDesignationId, setSelectedDesignationId] = useState<number | null>(null)
  const [selectedPaperTarget, setSelectedPaperTarget] = useState(1)
  const [selectedProposalSlot, setSelectedProposalSlot] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  const grouped = useMemo(
    () => ({
      paper: WORKFLOW_DEADLINE_ITEMS.filter((item) => item.type === 'paper'),
      proposal: WORKFLOW_DEADLINE_ITEMS.filter((item) => item.type === 'proposal'),
      patent: WORKFLOW_DEADLINE_ITEMS.filter((item) => item.type === 'patent'),
    }),
    [],
  )

  const targetDefinitionMap = useMemo(
    () => new Map(targetDefinitions.map((target) => [target.code, target])),
    [targetDefinitions],
  )

  const selectedRule = useMemo(() => {
    if (!selectedDesignationId) return null
    return rules.find((rule) => rule.designationId === selectedDesignationId) || null
  }, [rules, selectedDesignationId])

  const selectedDraftTargets = selectedDesignationId ? (targetDrafts[selectedDesignationId] || {}) : {}

  const maxPaperTargets = useMemo(() => {
    const highest = rules.reduce((acc, rule) => Math.max(acc, Number(rule.targets.paper_target_count || 0)), 1)
    return toInteger(highest, 1, 4)
  }, [rules])

  const maxProposalSlots = useMemo(() => {
    const highest = rules.reduce((acc, rule) => Math.max(acc, Number(rule.targets.funding_proposal_slot_count || 0)), 1)
    return toInteger(highest, 1, 2)
  }, [rules])

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredPaper = grouped.paper.filter((item) => item.title.toLowerCase().includes(normalizedSearch))
  const filteredProposal = grouped.proposal.filter((item) => item.title.toLowerCase().includes(normalizedSearch))
  const filteredPatent = grouped.patent.filter((item) => item.title.toLowerCase().includes(normalizedSearch))

  const paperTargetOptions = Array.from({ length: maxPaperTargets }, (_, index) => index + 1)
  const proposalSlotOptions = Array.from({ length: maxProposalSlots }, (_, index) => index + 1)

  const targetKeys = selectedRule ? Object.keys(selectedRule.targets) : []
  const sortedTargetKeys = targetKeys
    .slice()
    .sort((a, b) => {
      const left = targetDefinitionMap.get(a)?.name || a
      const right = targetDefinitionMap.get(b)?.name || b
      return left.localeCompare(right)
    })

  const loadData = async () => {
    setLoading(true)
    try {
      const [deadlineResponse, ruleResponse, targetMasterResponse] = await Promise.all([
        apiClient.getWorkflowDeadlines(ACADEMIC_YEAR),
        apiClient.getWorkflowDesignationRules(ACADEMIC_YEAR),
        apiClient.getWorkflowTargetDefinitions(),
      ])

      setDeadlineMap(deadlineResponse.settings || {})
      setRules(ruleResponse.rules || [])
      setTargetDefinitions(targetMasterResponse.targets || [])

      const drafts: Record<number, Record<string, number>> = {}
      for (const rule of ruleResponse.rules || []) {
        drafts[rule.designationId] = { ...rule.targets }
      }
      setTargetDrafts(drafts)

      if ((ruleResponse.rules || []).length > 0) {
        setSelectedDesignationId((prev) => prev || ruleResponse.rules[0].designationId)
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load workflow settings'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) return
    void loadData()
  }, [isAdmin])

  useEffect(() => {
    if (selectedPaperTarget > maxPaperTargets) {
      setSelectedPaperTarget(maxPaperTargets)
    }
  }, [maxPaperTargets, selectedPaperTarget])

  useEffect(() => {
    if (selectedProposalSlot > maxProposalSlots) {
      setSelectedProposalSlot(maxProposalSlots)
    }
  }, [maxProposalSlots, selectedProposalSlot])

  const handleTargetChange = (targetCode: string, value: string) => {
    if (!selectedDesignationId) return
    const next = Number(value)
    setTargetDrafts((prev) => ({
      ...prev,
      [selectedDesignationId]: {
        ...(prev[selectedDesignationId] || {}),
        [targetCode]: Number.isFinite(next) && next >= 0 ? next : 0,
      },
    }))
  }

  const handleSaveDesignationTargets = async () => {
    if (!selectedDesignationId) return

    setSavingTargets(true)
    try {
      await apiClient.updateWorkflowDesignationTargets(selectedDesignationId, {
        academicYear: ACADEMIC_YEAR,
        targets: selectedDraftTargets,
      })
      await apiClient.rebuildWorkflowAssignments({
        academicYear: ACADEMIC_YEAR,
        designationId: selectedDesignationId,
      })
      await loadData()
      toast.success('FAP targets updated and assignments rebuilt')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update FAP targets'))
    } finally {
      setSavingTargets(false)
    }
  }

  const saveDeadlines = async (successMessage: string, fallbackMessage: string) => {
    setSavingDeadlines(true)
    try {
      await apiClient.updateWorkflowDeadlines({
        academicYear: ACADEMIC_YEAR,
        settings: deadlineMap,
      })
      toast.success(successMessage)
    } catch (error) {
      toast.error(getApiErrorMessage(error, fallbackMessage))
    } finally {
      setSavingDeadlines(false)
    }
  }

  if (loading) {
    return <WorkflowAdminLoadingSkeleton />
  }

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-violet-600" />
          Workflow Deadline Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">Action Plan - Time Lines (Jun 2026 to Dec 2026) managed from backend configuration.</p>
        <p className="text-xs text-slate-500 mt-1">Designation source is resolved from faculty table and mapped to master designation rules.</p>
      </div>

      <div className="space-y-6 animate-fade-in">
        <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr,1fr,1fr] lg:items-end">
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Journal Target Set</span>
              <select value={selectedPaperTarget} onChange={(e) => setSelectedPaperTarget(Number(e.target.value))} className="input-base">
                {paperTargetOptions.map((value) => (
                  <option key={value} value={value}>{`Paper ${value}`}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Proposal Slot</span>
              <select value={selectedProposalSlot} onChange={(e) => setSelectedProposalSlot(Number(e.target.value))} className="input-base">
                {proposalSlotOptions.map((value) => (
                  <option key={value} value={value}>{`Slot ${value}`}</option>
                ))}
              </select>
            </label>

            <div className="text-xs text-slate-500">
              <p>Academic Year: <span className="font-semibold text-slate-700">{ACADEMIC_YEAR}</span></p>
              <p>Max journal targets from FAP: <span className="font-semibold text-slate-700">{maxPaperTargets}</span></p>
              <p>Max proposal slots from FAP: <span className="font-semibold text-slate-700">{maxProposalSlots}</span></p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search journal, proposal, or patent task"
                className="input-base pl-10 border-violet-200 focus:border-violet-400 focus:ring-violet-200"
              />
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => void loadData()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <RotateCcw className="h-4 w-4" />
                Reload Backend Data
              </button>
              <button
                type="button"
                onClick={() => void saveDeadlines('Workflow deadlines saved successfully', 'Failed to save workflow deadlines')}
                disabled={savingDeadlines}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                Save All Deadlines
              </button>
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">FAP Target Management</h2>
            <button
              type="button"
              onClick={() => void handleSaveDesignationTargets()}
              disabled={!selectedDesignationId || savingTargets}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              Save FAP Targets
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Designation</span>
              <select value={selectedDesignationId || ''} onChange={(e) => setSelectedDesignationId(Number(e.target.value))} className="input-base">
                {rules.map((rule) => (
                  <option key={rule.designationId} value={rule.designationId}>
                    {rule.designationName} ({rule.facultyCount})
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {sortedTargetKeys.map((targetCode) => {
                const target = targetDefinitionMap.get(targetCode)
                return (
                  <label key={targetCode} className="block rounded-xl border border-slate-200 p-3">
                    <span className="mb-1 block text-xs font-medium text-slate-500">
                      {target?.name || targetCode}
                      {target?.unit ? ` (${target.unit})` : ''}
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={(target?.unit || '').includes('lakh') ? '0.1' : '1'}
                      value={selectedDraftTargets[targetCode] ?? 0}
                      onChange={(e) => handleTargetChange(targetCode, e.target.value)}
                      className="input-base"
                    />
                  </label>
                )
              })}
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-1 text-lg font-semibold text-slate-900">Journal Publications - Individual Faculty Action Plan</h2>
            <p className="mb-4 text-xs text-slate-500">Paper 1 to Paper 4 timeline dates come from backend workflow deadline settings.</p>
            <div className="space-y-3">
              {filteredPaper.map((item) => {
                const key = getWorkflowSlotKey(item.id, selectedPaperTarget)
                return (
                  <div key={item.id} className="rounded-xl border border-slate-200 p-3 sm:p-4">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <label className="mt-2 block">
                      <span className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Deadline
                      </span>
                      <input
                        type="date"
                        value={deadlineMap[key] || deadlineMap[item.id] || ''}
                        onChange={(e) => setDeadlineMap((prev) => ({ ...prev, [key]: e.target.value }))}
                        className="input-base"
                      />
                    </label>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-1 text-lg font-semibold text-slate-900">Funding Proposal Submission - Individual Faculty Action Plan</h2>
            <p className="mb-4 text-xs text-slate-500">Slot 1 and Slot 2 timeline dates come from backend workflow deadline settings.</p>
            <div className="space-y-3">
              {filteredProposal.map((item) => {
                const key = getWorkflowSlotKey(item.id, selectedProposalSlot)
                return (
                  <div key={item.id} className="rounded-xl border border-slate-200 p-3 sm:p-4">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <label className="mt-2 block">
                      <span className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Deadline
                      </span>
                      <input
                        type="date"
                        value={deadlineMap[key] || deadlineMap[item.id] || ''}
                        onChange={(e) => setDeadlineMap((prev) => ({ ...prev, [key]: e.target.value }))}
                        className="input-base"
                      />
                    </label>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-1 text-lg font-semibold text-slate-900">Patent Submission - Individual Faculty Action Plan</h2>
            <p className="mb-4 text-xs text-slate-500">Patent timeline dates come from backend workflow deadline settings.</p>
            <div className="space-y-3">
              {filteredPatent.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-3 sm:p-4">
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
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
