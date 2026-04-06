export type WorkflowKind = 'paper' | 'patent'

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

export const WORKFLOW_DEADLINES_STORAGE_KEY = 'faculty-workflow-deadlines-v1'
export const WORKFLOW_SETTINGS_STORAGE_KEY = 'faculty-workflow-settings-v1'
export const DEFAULT_WORKFLOW_SETTINGS: WorkflowSettings = {
  paperTargets: 1,
}

export const WORKFLOW_DEADLINE_ITEMS: WorkflowDeadlineItem[] = [
  { id: 'paper-idea-selection', title: 'Idea Selection', type: 'paper', defaultDeadlineISO: '2026-07-31' },
  { id: 'paper-literature-review', title: 'Literature Review', type: 'paper', defaultDeadlineISO: '2026-09-30' },
  { id: 'paper-implementation', title: 'Implementation', type: 'paper', defaultDeadlineISO: '2026-12-31' },
  { id: 'paper-writing', title: 'Paper Writing', type: 'paper', defaultDeadlineISO: '2027-02-28' },
  { id: 'paper-submission', title: 'Submission', type: 'paper', defaultDeadlineISO: '2027-03-31' },
  { id: 'paper-acceptance', title: 'Acceptance', type: 'paper', defaultDeadlineISO: '2027-05-15' },
  { id: 'patent-idea-finalization', title: 'Idea Finalization', type: 'patent', defaultDeadlineISO: '2026-07-31' },
  { id: 'patent-prior-art-search', title: 'Prior Art Search', type: 'patent', defaultDeadlineISO: '2026-09-30' },
  { id: 'patent-prototype-development', title: 'Prototype Development', type: 'patent', defaultDeadlineISO: '2026-12-31' },
  { id: 'patent-drafting', title: 'Drafting', type: 'patent', defaultDeadlineISO: '2027-02-28' },
  { id: 'patent-filing', title: 'Filing', type: 'patent', defaultDeadlineISO: '2027-04-30' },
]

export const DEFAULT_WORKFLOW_DEADLINE_MAP: Record<string, string> = WORKFLOW_DEADLINE_ITEMS.reduce((acc, item) => {
  acc[item.id] = item.defaultDeadlineISO
  return acc
}, {} as Record<string, string>)
