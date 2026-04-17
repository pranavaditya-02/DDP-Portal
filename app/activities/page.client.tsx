'use client'

import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import client from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import {
  DEFAULT_WORKFLOW_DEADLINE_MAP,
  DEFAULT_WORKFLOW_SETTINGS,
  getPaperDeadlineKey,
  WORKFLOW_DEADLINES_STORAGE_KEY,
  WORKFLOW_SETTINGS_STORAGE_KEY,
} from '@/lib/workflow-deadlines'
import { useDeadlineAlerts } from '@/hooks/useDeadlineAlerts'
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  FlaskConical,
  FileText,
  Lock,
  Bell,
} from 'lucide-react'

type TabKey = 'all' | 'paper' | 'patent' | 'proposal'
type WorkflowType = 'paper' | 'patent' | 'proposal'
type FieldType = 'text' | 'select' | 'date' | 'file' | 'textarea'

type DynamicField = {
  key: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  options?: string[]
}

type WorkflowStep = {
  id: string
  baseId: string
  title: string
  deadlineLabel: string
  deadlineISO: string
  type: WorkflowType
  targetIndex?: number
  fields: DynamicField[]
}

const STORAGE_KEY = 'faculty-activities-workflow-v1'

const TAB_OPTIONS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'paper', label: 'Paper' },
  { key: 'patent', label: 'Patent' },
  { key: 'proposal', label: 'Funding Proposal' },
]

const PAPER_STEPS: WorkflowStep[] = [
  {
    id: 'paper-title-finalization',
    baseId: 'paper-title-finalization',
    title: 'Title Finalization',
    deadlineLabel: 'June 01',
    deadlineISO: '2026-06-01',
    type: 'paper',
    fields: [
      { key: 'paperTitle', label: 'Paper Title', type: 'text', required: true, placeholder: 'Enter finalized title' },
      { key: 'approvalStatus', label: 'Approval Status', type: 'select', required: true, options: ['Draft', 'Department Approved', 'Finalized'] },
    ],
  },
  {
    id: 'paper-abstract-preparation',
    baseId: 'paper-abstract-preparation',
    title: 'Abstract Preparation',
    deadlineLabel: 'June 15',
    deadlineISO: '2026-06-15',
    type: 'paper',
    fields: [
      { key: 'abstractText', label: 'Abstract Draft', type: 'textarea', required: true, placeholder: 'Write your abstract draft' },
      { key: 'keywords', label: 'Keywords', type: 'text', required: true, placeholder: 'e.g., AI, optimization, analytics' },
    ],
  },
  {
    id: 'paper-first-draft-preparation',
    baseId: 'paper-first-draft-preparation',
    title: 'First Draft Preparation',
    deadlineLabel: 'June 29',
    deadlineISO: '2026-06-29',
    type: 'paper',
    fields: [
      { key: 'draftVersion', label: 'Draft Version', type: 'text', required: true, placeholder: 'e.g., v1.0' },
      { key: 'draftUpload', label: 'Upload First Draft', type: 'file', required: true },
    ],
  },
  {
    id: 'paper-revised-draft-preparation',
    baseId: 'paper-revised-draft-preparation',
    title: 'Revised Draft Preparation',
    deadlineLabel: 'July 13',
    deadlineISO: '2026-07-13',
    type: 'paper',
    fields: [
      { key: 'revisionSummary', label: 'Revision Summary', type: 'textarea', required: true, placeholder: 'Summarize revisions made' },
      { key: 'revisedDraftUpload', label: 'Upload Revised Draft', type: 'file', required: true },
    ],
  },
  {
    id: 'paper-manuscript-submission',
    baseId: 'paper-manuscript-submission',
    title: 'Manuscript Submission',
    deadlineLabel: 'July 20',
    deadlineISO: '2026-07-20',
    type: 'paper',
    fields: [
      { key: 'paperTitle', label: 'Paper Title', type: 'text', required: true, placeholder: 'Enter paper title' },
      { key: 'journalType', label: 'Journal Type', type: 'select', required: true, options: ['WoS/SCI/SCIE', 'Scopus'] },
      { key: 'uploadPaper', label: 'Upload Paper', type: 'file', required: true },
      { key: 'submissionDate', label: 'Submission Date', type: 'date', required: true },
    ],
  },
]

const PATENT_STEPS: WorkflowStep[] = [
  {
    id: 'patent-title-finalization-with-bit-patent-office-approval',
    baseId: 'patent-title-finalization-with-bit-patent-office-approval',
    title: 'Title Finalization with BIT Patent Office Approval',
    deadlineLabel: 'July 01',
    deadlineISO: '2026-07-01',
    type: 'patent',
    fields: [
      { key: 'patentTitle', label: 'Patent Title', type: 'text', required: true, placeholder: 'Enter patent title' },
      { key: 'bitApprovalReference', label: 'BIT Approval Reference', type: 'text', required: true, placeholder: 'Enter approval reference/details' },
    ],
  },
  {
    id: 'patent-initial-draft-preparation',
    baseId: 'patent-initial-draft-preparation',
    title: 'Initial Patent Draft Preparation',
    deadlineLabel: 'July 25',
    deadlineISO: '2026-07-25',
    type: 'patent',
    fields: [
      { key: 'draftUpload', label: 'Upload Initial Draft', type: 'file', required: true },
      { key: 'draftNotes', label: 'Draft Notes', type: 'textarea', required: true, placeholder: 'Key points covered in the initial draft' },
    ],
  },
  {
    id: 'patent-revised-draft-preparation',
    baseId: 'patent-revised-draft-preparation',
    title: 'Revised Patent Draft Preparation',
    deadlineLabel: 'Aug 20',
    deadlineISO: '2026-08-20',
    type: 'patent',
    fields: [
      { key: 'revisionSummary', label: 'Revision Summary', type: 'textarea', required: true, placeholder: 'Mention revisions done after review' },
      { key: 'revisedDraftUpload', label: 'Upload Revised Draft', type: 'file', required: true },
    ],
  },
  {
    id: 'patent-final-submission-of-patent-application',
    baseId: 'patent-final-submission-of-patent-application',
    title: 'Final Submission of Patent Application',
    deadlineLabel: 'Aug 31',
    deadlineISO: '2026-08-31',
    type: 'patent',
    fields: [
      { key: 'patentType', label: 'Patent Type', type: 'select', required: true, options: ['Provisional', 'Complete'] },
      { key: 'filingDate', label: 'Filing Date', type: 'date', required: true },
      { key: 'uploadDocuments', label: 'Upload Documents', type: 'file', required: true },
    ],
  },
]

const PROPOSAL_STEPS: WorkflowStep[] = [
  {
    id: 'proposal-title-finalization',
    baseId: 'proposal-title-finalization',
    title: 'Title Finalization',
    deadlineLabel: 'June 01',
    deadlineISO: '2026-06-01',
    type: 'proposal',
    fields: [
      { key: 'proposalTitle', label: 'Proposal Title', type: 'text', required: true, placeholder: 'Enter proposal title' },
      { key: 'themeArea', label: 'Theme Area', type: 'text', required: true, placeholder: 'Enter focus/theme area' },
    ],
  },
  {
    id: 'proposal-concept-presentation-rnd-approval',
    baseId: 'proposal-concept-presentation-rnd-approval',
    title: 'Concept Presentation & R&D Cell Approval',
    deadlineLabel: 'June 16',
    deadlineISO: '2026-06-16',
    type: 'proposal',
    fields: [
      { key: 'presentationDate', label: 'Presentation Date', type: 'date', required: true },
      { key: 'rndApprovalProof', label: 'R&D Approval Proof', type: 'file', required: true },
    ],
  },
  {
    id: 'proposal-initial-draft-preparation',
    baseId: 'proposal-initial-draft-preparation',
    title: 'Initial Proposal Draft Preparation',
    deadlineLabel: 'July 11',
    deadlineISO: '2026-07-11',
    type: 'proposal',
    fields: [
      { key: 'draftVersion', label: 'Draft Version', type: 'text', required: true, placeholder: 'e.g., v1.0' },
      { key: 'initialDraftUpload', label: 'Upload Initial Draft', type: 'file', required: true },
    ],
  },
  {
    id: 'proposal-revised-draft-preparation',
    baseId: 'proposal-revised-draft-preparation',
    title: 'Revised Proposal Draft Preparation',
    deadlineLabel: 'July 30',
    deadlineISO: '2026-07-30',
    type: 'proposal',
    fields: [
      { key: 'revisionSummary', label: 'Revision Summary', type: 'textarea', required: true, placeholder: 'Mention revisions after feedback' },
      { key: 'revisedDraftUpload', label: 'Upload Revised Draft', type: 'file', required: true },
    ],
  },
  {
    id: 'proposal-final-submission',
    baseId: 'proposal-final-submission',
    title: 'Final Proposal Submission',
    deadlineLabel: 'Based on call received from the agencies',
    deadlineISO: '',
    type: 'proposal',
    fields: [
      { key: 'agencyName', label: 'Agency Name', type: 'text', required: true, placeholder: 'Enter funding agency name' },
      { key: 'callReference', label: 'Call Reference', type: 'text', required: true, placeholder: 'Enter call reference number' },
      { key: 'submissionDate', label: 'Submission Date', type: 'date', required: true },
      { key: 'proposalUpload', label: 'Upload Final Proposal', type: 'file', required: true },
    ],
  },
]

const PROPOSAL_SLOT_2_DEFAULTS: Record<string, string> = {
  'proposal-title-finalization': '2026-08-01',
  'proposal-concept-presentation-rnd-approval': '2026-08-16',
  'proposal-initial-draft-preparation': '2026-09-11',
  'proposal-revised-draft-preparation': '2026-09-30',
}

function classNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

function buildPaperTaskId(baseId: string, targetIndex: number) {
  return targetIndex === 1 ? baseId : `${baseId}__t${targetIndex}`
}

function formatDeadline(deadlineISO: string) {
  if (!deadlineISO || Number.isNaN(new Date(deadlineISO).getTime())) {
    return 'Based on call received from agencies'
  }

  return new Date(deadlineISO).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getUrgency(deadlineISO: string) {
  if (!deadlineISO || Number.isNaN(new Date(deadlineISO).getTime())) {
    return {
      label: 'Call based',
      dotClass: 'bg-slate-400',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    }
  }

  const now = new Date()
  const deadline = new Date(deadlineISO)
  const msInDay = 1000 * 60 * 60 * 24
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / msInDay)

  if (diffDays < 0) {
    return {
      label: 'Overdue',
      dotClass: 'bg-red-500',
      badgeClass: 'bg-red-50 text-red-700 border-red-200',
    }
  }

  if (diffDays <= 14) {
    return {
      label: 'Near deadline',
      dotClass: 'bg-orange-500',
      badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
    }
  }

  return {
    label: 'Upcoming',
    dotClass: 'bg-blue-500',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  }
}

function DynamicModal({
  step,
  values,
  onChange,
  onClose,
  onSubmit,
}: {
  step: WorkflowStep
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  onClose: () => void
  onSubmit: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/40" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl animate-[fadeIn_180ms_ease-out]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Complete Task: {step.title}</h3>
            <p className="mt-1 text-sm text-slate-500">Provide required details to mark this workflow task as completed.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
        >
          {step.fields.map((field) => {
            if (field.type === 'select') {
              return (
                <label key={field.key} className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    {field.label}
                    {field.required ? ' *' : ''}
                  </span>
                  <select
                    className="input-base"
                    value={values[field.key] || ''}
                    onChange={(e) => onChange(field.key, e.target.value)}
                  >
                    <option value="">Select</option>
                    {(field.options || []).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </label>
              )
            }

            if (field.type === 'textarea') {
              return (
                <label key={field.key} className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    {field.label}
                    {field.required ? ' *' : ''}
                  </span>
                  <textarea
                    rows={4}
                    className="input-base"
                    placeholder={field.placeholder}
                    value={values[field.key] || ''}
                    onChange={(e) => onChange(field.key, e.target.value)}
                  />
                </label>
              )
            }

            if (field.type === 'file') {
              return (
                <label key={field.key} className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    {field.label}
                    {field.required ? ' *' : ''}
                  </span>
                  <input
                    type="file"
                    className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-50 file:px-3 file:py-2 file:text-violet-700 hover:file:bg-violet-100"
                    onChange={(e) => {
                      const fileName = e.target.files?.[0]?.name || ''
                      onChange(field.key, fileName)
                    }}
                  />
                  {values[field.key] ? <p className="mt-1 text-xs text-slate-500">Selected: {values[field.key]}</p> : null}
                </label>
              )
            }

            return (
              <label key={field.key} className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  {field.label}
                  {field.required ? ' *' : ''}
                </span>
                <input
                  type={field.type === 'date' ? 'date' : 'text'}
                  className="input-base"
                  placeholder={field.placeholder}
                  value={values[field.key] || ''}
                  onChange={(e) => onChange(field.key, e.target.value)}
                />
              </label>
            )
          })}

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn-primary bg-violet-600 hover:bg-violet-700">
              Submit and Complete
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SubmissionViewModal({
  step,
  values,
  onClose,
}: {
  step: WorkflowStep
  values: Record<string, string>
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/40" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl animate-[fadeIn_180ms_ease-out]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Submitted Details: {step.title}</h3>
            <p className="mt-1 text-sm text-slate-500">Review the submitted information for this task.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="space-y-3">
          {step.fields.map((field) => (
            <div key={field.key} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500">{field.label}</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{values[field.key] || '-'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function WorkflowCard({
  title,
  subtitle,
  icon,
  steps,
  completed,
  onComplete,
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
  steps: WorkflowStep[]
  completed: Record<string, boolean>
  onComplete: (step: WorkflowStep) => void
}) {
  const currentStepIndex = steps.findIndex((step) => !completed[step.id])

  return (
    <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-xl bg-violet-50 p-2 text-violet-600">{icon}</div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>

      <div className="relative space-y-4">
        <div className="absolute bottom-4 left-7 top-4 w-px bg-violet-100" />
        {steps.map((step, idx) => {
          const isDone = Boolean(completed[step.id])
          const isUnlocked = idx === 0 || Boolean(completed[steps[idx - 1].id])
          const isCurrent = isUnlocked && !isDone && currentStepIndex === idx
          const urgency = getUrgency(step.deadlineISO)
          const stateBadge = isDone
            ? { label: 'Completed', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' }
            : isCurrent
              ? { label: 'In progress', className: 'border-violet-200 bg-violet-50 text-violet-700' }
              : !isUnlocked
                ? { label: 'Locked', className: 'border-slate-200 bg-slate-100 text-slate-500' }
                : { label: urgency.label, className: urgency.badgeClass }

          const deadlineClass = isDone
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : urgency.badgeClass

          return (
            <div key={step.id} className="relative">
              <div
                className={classNames(
                  'relative z-10 rounded-xl border p-3 transition-all duration-200 sm:p-4',
                  isUnlocked ? 'border-violet-100 bg-white' : 'border-slate-200 bg-slate-50 opacity-70',
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={classNames(
                      'relative z-10 mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border',
                      isDone
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                        : isUnlocked
                          ? 'border-violet-200 bg-violet-50 text-violet-600'
                          : 'border-slate-200 bg-slate-100 text-slate-400',
                    )}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : <Circle className="h-3.5 w-3.5" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className={classNames('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium', deadlineClass)}>
                            <Calendar className="h-3.5 w-3.5" />
                            Deadline: {formatDeadline(step.deadlineISO)}
                          </span>
                          {!isDone ? (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                              <Clock3 className="h-3.5 w-3.5" />
                              {isCurrent ? 'In Progress' : 'Pending'}
                            </span>
                          ) : null}
                        </div>
                        {!isUnlocked ? (
                          <p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400">
                            <Lock className="h-3.5 w-3.5" />
                            Locked until previous task is completed
                          </p>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                        <span className={classNames('rounded-full border px-2.5 py-1 text-xs font-medium', stateBadge.className)}>
                          {stateBadge.label}
                        </span>

                        {!isDone ? (
                          <button
                            type="button"
                            disabled={!isUnlocked}
                            onClick={() => onComplete(step)}
                            className={classNames(
                              'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                              isUnlocked
                                ? 'bg-violet-600 text-white hover:bg-violet-700'
                                : 'cursor-not-allowed bg-slate-200 text-slate-500',
                            )}
                          >
                            {!isUnlocked ? <Lock className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                            {isCurrent ? 'Complete Current Task' : 'Complete'}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ActivitiesPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [deadlineMap, setDeadlineMap] = useState<Record<string, string>>(DEFAULT_WORKFLOW_DEADLINE_MAP)
  const [paperTargets, setPaperTargets] = useState<number>(DEFAULT_WORKFLOW_SETTINGS.paperTargets)
  const { checkAndSendAlerts } = useDeadlineAlerts()

  const paperWorkflowGroups = useMemo(() => {
    return Array.from({ length: paperTargets }, (_, index) => {
      const targetIndex = index + 1
      return {
        targetIndex,
        steps: PAPER_STEPS.map((step) => ({
          ...step,
          id: buildPaperTaskId(step.baseId, targetIndex),
          baseId: step.baseId,
          targetIndex,
          deadlineISO:
            deadlineMap[getPaperDeadlineKey(step.baseId, targetIndex)] ||
            deadlineMap[step.baseId] ||
            step.deadlineISO,
        })),
      }
    })
  }, [deadlineMap, paperTargets])

  const paperSteps = useMemo(
    () => paperWorkflowGroups.flatMap((group) => group.steps),
    [paperWorkflowGroups],
  )

  const patentSteps = useMemo(
    () => PATENT_STEPS.map((step) => ({ ...step, deadlineISO: deadlineMap[step.baseId] || step.deadlineISO })),
    [deadlineMap],
  )

  const proposalWorkflowGroups = useMemo(() => {
    return Array.from({ length: 2 }, (_, index) => {
      const slotIndex = index + 1
      return {
        slotIndex,
        steps: PROPOSAL_STEPS.map((step) => {
          const slotDeadline = slotIndex === 1
            ? step.deadlineISO
            : PROPOSAL_SLOT_2_DEFAULTS[step.baseId] || step.deadlineISO

          return {
            ...step,
            id: buildPaperTaskId(step.baseId, slotIndex),
            baseId: step.baseId,
            targetIndex: slotIndex,
            deadlineISO:
              deadlineMap[getPaperDeadlineKey(step.baseId, slotIndex)] ||
              (slotIndex === 1 ? deadlineMap[step.baseId] : undefined) ||
              slotDeadline,
          }
        }),
      }
    })
  }, [deadlineMap])

  const proposalSteps = useMemo(
    () => proposalWorkflowGroups.flatMap((group) => group.steps),
    [proposalWorkflowGroups],
  )

  const allSteps = useMemo(() => [...paperSteps, ...patentSteps, ...proposalSteps], [paperSteps, patentSteps, proposalSteps])

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as {
        completed?: Record<string, boolean>
      }
      setCompleted(parsed.completed || {})
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    const raw = localStorage.getItem(WORKFLOW_DEADLINES_STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as Record<string, string>
      setDeadlineMap({ ...DEFAULT_WORKFLOW_DEADLINE_MAP, ...parsed })
    } catch {
      localStorage.removeItem(WORKFLOW_DEADLINES_STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    const raw = localStorage.getItem(WORKFLOW_SETTINGS_STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as { paperTargets?: number }
      const count = parsed.paperTargets || DEFAULT_WORKFLOW_SETTINGS.paperTargets
      setPaperTargets(Math.max(1, Math.min(4, count)))
    } catch {
      localStorage.removeItem(WORKFLOW_SETTINGS_STORAGE_KEY)
    }
  }, [])

  // Check and send deadline alerts when page loads (once per day)
  useEffect(() => {
    if (allSteps.length === 0) return

    const sendAlerts = async () => {
      try {
        // Prepare deadline data for alert checking
        const deadlineList = allSteps.map((step) => ({
          taskId: step.id,
          taskTitle: step.title,
          deadlineISO: step.deadlineISO,
          isCompleted: completed[step.id] || false,
        }))

        const result = await checkAndSendAlerts(deadlineList)
        if (result && result.sent > 0) {
          toast.success(`📧 ${result.sent} deadline reminder(s) sent to your email`, {
            duration: 4000,
          })
        }
      } catch (error) {
        // Silently catch errors to not disrupt user experience
        console.debug('Deadline alerts check had an issue (non-critical):', error)
      }
    }

    // Delay slightly to avoid any race conditions
    const timer = setTimeout(() => {
      sendAlerts()
    }, 500)

    return () => clearTimeout(timer)
  }, [allSteps, completed, checkAndSendAlerts])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed }))
  }, [completed])

  const completedCount = useMemo(
    () => allSteps.filter((step) => completed[step.id]).length,
    [allSteps, completed],
  )

  const paperCompletedCount = useMemo(
    () => paperSteps.filter((step) => completed[step.id]).length,
    [completed, paperSteps],
  )

  const patentCompletedCount = useMemo(
    () => patentSteps.filter((step) => completed[step.id]).length,
    [completed, patentSteps],
  )

  const proposalCompletedCount = useMemo(
    () => proposalSteps.filter((step) => completed[step.id]).length,
    [completed, proposalSteps],
  )

  const progressContext = useMemo(() => {
    if (activeTab === 'paper') {
      const total = paperSteps.length
      const percent = total === 0 ? 0 : Math.round((paperCompletedCount / total) * 100)
      return {
        label: 'Paper Workflow Progress',
        completed: paperCompletedCount,
        total,
        percent,
      }
    }

    if (activeTab === 'patent') {
      const total = patentSteps.length
      const percent = total === 0 ? 0 : Math.round((patentCompletedCount / total) * 100)
      return {
        label: 'Patent Workflow Progress',
        completed: patentCompletedCount,
        total,
        percent,
      }
    }

    if (activeTab === 'proposal') {
      const total = proposalSteps.length
      const percent = total === 0 ? 0 : Math.round((proposalCompletedCount / total) * 100)
      return {
        label: 'Funding Proposal Workflow Progress',
        completed: proposalCompletedCount,
        total,
        percent,
      }
    }

    const total = allSteps.length
    const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100)
    return {
      label: 'Overall Workflow Progress',
      completed: completedCount,
      total,
      percent,
    }
  }, [activeTab, allSteps.length, completedCount, paperCompletedCount, paperSteps.length, patentCompletedCount, patentSteps.length, proposalCompletedCount, proposalSteps.length])

  const mergedTimeline = useMemo(
    () => [...allSteps].sort((a, b) => {
      const at = new Date(a.deadlineISO).getTime()
      const bt = new Date(b.deadlineISO).getTime()
      const safeA = Number.isNaN(at) ? Number.POSITIVE_INFINITY : at
      const safeB = Number.isNaN(bt) ? Number.POSITIVE_INFINITY : bt
      return safeA - safeB
    }),
    [allSteps],
  )

  const completeStep = async (step: WorkflowStep) => {
    setCompleted((prev) => ({
      ...prev,
      [step.id]: true,
    }))
    toast.success('Task completed successfully')

    try {
      await client.post('/alerts/task-completed', {
        taskTitle: step.title,
        completedAt: new Date().toISOString(),
        facultyName: user?.name,
        facultyEmail: user?.email,
      })
    } catch (error) {
      console.debug('Task completion email notification failed (non-critical):', error)
    }
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mb-6 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Activities</h1>
          <p className="text-sm text-slate-500">Faculty Research Tracking System</p>
        </div>

        <div className="mb-5 inline-flex rounded-xl border border-violet-200 bg-violet-50 p-1">
          {TAB_OPTIONS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={classNames(
                'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                activeTab === tab.key
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-violet-700 hover:bg-violet-100',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">{progressContext.label}</span>
            <span className="font-semibold text-violet-700">{progressContext.percent}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-violet-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-700 transition-all duration-700 ease-out"
              style={{ width: `${progressContext.percent}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">{progressContext.completed} of {progressContext.total} tasks completed</p>
        </div>
      </div>

      {activeTab === 'all' ? (
        <section className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Combined Planning Timeline</h2>
            <p className="text-sm text-slate-500">Paper and patent milestones sorted by nearest deadline.</p>
          </div>

          <div className="space-y-4">
            {mergedTimeline.map((item, idx) => {
              const urgency = getUrgency(item.deadlineISO)
              const isDone = Boolean(completed[item.id])
              return (
                <div key={item.id} className="relative pl-8">
                  {idx < mergedTimeline.length - 1 ? (
                    <div className="absolute left-[11px] top-6 h-[calc(100%+14px)] w-px bg-violet-100" />
                  ) : null}
                  <span
                    className={classNames(
                      'absolute left-0 top-1.5 h-5 w-5 rounded-full border-2 border-white shadow',
                      isDone ? 'bg-emerald-500' : urgency.dotClass,
                    )}
                  />

                  <div className="rounded-xl border border-slate-200 p-3 transition-colors duration-200 hover:border-violet-200 sm:p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {item.title} <span className="text-slate-400">- {item.type === 'paper' ? `Paper${item.targetIndex ? ` T${item.targetIndex}` : ''}` : 'Patent'}</span>
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDeadline(item.deadlineISO)}
                          </span>
                          <span
                            className={classNames(
                              'rounded-full px-2.5 py-1 font-medium',
                              item.type === 'paper'
                                ? 'bg-violet-50 text-violet-700'
                                : item.type === 'patent'
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : 'bg-emerald-50 text-emerald-700',
                            )}
                          >
                            {item.type === 'paper' ? 'Paper' : item.type === 'patent' ? 'Patent' : 'Funding Proposal'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Completed
                          </span>
                        ) : (
                          <span
                            className={classNames('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium', urgency.badgeClass)}
                          >
                            <AlertCircle className="h-3.5 w-3.5" />
                            {urgency.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}

      {activeTab === 'paper' ? (
        <div className="space-y-6">
          {paperWorkflowGroups.map((group) => (
            <WorkflowCard
              key={`paper-target-${group.targetIndex}`}
              title={paperTargets > 1 ? `Journal Publication Workflow - Target ${group.targetIndex}` : 'Journal Publication Workflow'}
              subtitle="Complete each phase sequentially to move from idea to acceptance."
              icon={<FileText className="h-5 w-5" />}
              steps={group.steps}
              completed={completed}
              onComplete={completeStep}
            />
          ))}
        </div>
      ) : null}

      {activeTab === 'patent' ? (
        <WorkflowCard
          title="Patent Filing Workflow"
          subtitle="Track invention progress from ideation through filing."
          icon={<FlaskConical className="h-5 w-5" />}
          steps={patentSteps}
          completed={completed}
          onComplete={completeStep}
        />
      ) : null}

      {activeTab === 'proposal' ? (
        <div className="space-y-6">
          {proposalWorkflowGroups.map((group) => (
            <WorkflowCard
              key={`proposal-slot-${group.slotIndex}`}
              title={`Funding Proposal Submission Workflow - Slot ${group.slotIndex}`}
              subtitle="Plan and submit proposal milestones aligned to agency call cycles."
              icon={<Bell className="h-5 w-5" />}
              steps={group.steps}
              completed={completed}
              onComplete={completeStep}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
