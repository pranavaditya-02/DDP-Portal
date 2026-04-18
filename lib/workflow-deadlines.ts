export type WorkflowKind = 'paper' | 'patent' | 'proposal'

export type WorkflowSettings = {
  paperTargets: number
}

export type WorkflowDeadlineItem = {
  id: string
  title: string
  type: WorkflowKind
  defaultDeadlineISO: string
}

export function getPaperDeadlineKey(baseId: string, targetIndex: number) {
  return targetIndex <= 1 ? baseId : `${baseId}__t${targetIndex}`
}

export function getWorkflowSlotKey(baseId: string, slotIndex: number) {
  return slotIndex <= 1 ? baseId : `${baseId}__t${slotIndex}`
}

export const WORKFLOW_DEADLINES_STORAGE_KEY = 'faculty-workflow-deadlines-v1'
export const WORKFLOW_SETTINGS_STORAGE_KEY = 'faculty-workflow-settings-v1'
export const DEFAULT_WORKFLOW_SETTINGS: WorkflowSettings = {
  paperTargets: 1,
}

export const WORKFLOW_DEADLINE_ITEMS: WorkflowDeadlineItem[] = [
  { id: 'paper-title-finalization', title: 'Title Finalization', type: 'paper', defaultDeadlineISO: '2026-06-01' },
  { id: 'paper-abstract-preparation', title: 'Abstract Preparation', type: 'paper', defaultDeadlineISO: '2026-06-15' },
  { id: 'paper-first-draft-preparation', title: 'First Draft Preparation', type: 'paper', defaultDeadlineISO: '2026-06-29' },
  { id: 'paper-revised-draft-preparation', title: 'Revised Draft Preparation', type: 'paper', defaultDeadlineISO: '2026-07-13' },
  { id: 'paper-manuscript-submission', title: 'Manuscript Submission', type: 'paper', defaultDeadlineISO: '2026-07-20' },
  { id: 'proposal-title-finalization', title: 'Title Finalization', type: 'proposal', defaultDeadlineISO: '2026-06-01' },
  {
    id: 'proposal-concept-presentation-rnd-approval',
    title: 'Concept Presentation & R&D Cell Approval',
    type: 'proposal',
    defaultDeadlineISO: '2026-06-16',
  },
  {
    id: 'proposal-initial-proposal-draft-preparation',
    title: 'Initial Proposal Draft Preparation',
    type: 'proposal',
    defaultDeadlineISO: '2026-07-11',
  },
  {
    id: 'proposal-revised-proposal-draft-preparation',
    title: 'Revised Proposal Draft Preparation',
    type: 'proposal',
    defaultDeadlineISO: '2026-07-30',
  },
  {
    id: 'proposal-final-proposal-submission',
    title: 'Final Proposal Submission',
    type: 'proposal',
    defaultDeadlineISO: '',
  },
  {
    id: 'patent-title-finalization-with-bit-patent-office-approval',
    title: 'Title Finalization with BIT Patent Office Approval',
    type: 'patent',
    defaultDeadlineISO: '2026-07-01',
  },
  {
    id: 'patent-initial-patent-draft-preparation',
    title: 'Initial Patent Draft Preparation',
    type: 'patent',
    defaultDeadlineISO: '2026-07-25',
  },
  {
    id: 'patent-revised-patent-draft-preparation',
    title: 'Revised Patent Draft Preparation',
    type: 'patent',
    defaultDeadlineISO: '2026-08-20',
  },
  { id: 'patent-final-submission-of-patent-application', title: 'Final Submission of Patent Application', type: 'patent', defaultDeadlineISO: '2026-08-31' },
]

export const DEFAULT_WORKFLOW_DEADLINE_MAP: Record<string, string> = WORKFLOW_DEADLINE_ITEMS.reduce((acc, item) => {
  acc[item.id] = item.defaultDeadlineISO
  return acc
}, {} as Record<string, string>)
