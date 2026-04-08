export type WorkflowStage = {
  title: string
  route: string
  summary: string
  owner: string
  accent: string
  badge: string
}

export type WorkflowRecord = {
  id: string
  title: string
  subtitle: string
  status: 'approved' | 'pending' | 'rejected'
  meta: string
  route?: string
}

export const studentWorkflowStages: WorkflowStage[] = [
  {
    title: 'Activity Master',
    route: '/students/activity-master',
    summary: 'Publish events, manage availability, and keep the master register in sync.',
    owner: 'Activity owner',
    accent: 'from-indigo-600 to-indigo-800',
    badge: 'Master data',
  },
  {
    title: 'Activity Logger',
    route: '/students/activity-logger',
    summary: 'Track submissions, review status, and keep only approved items visible.',
    owner: 'Student logger',
    accent: 'from-emerald-600 to-teal-700',
    badge: 'Approved only',
  },
  {
    title: 'Verification Panel',
    route: '/verification-panel',
    summary: 'Approve or reject submissions after checking evidence and eligibility.',
    owner: 'Verifier',
    accent: 'from-amber-600 to-orange-700',
    badge: 'Review queue',
  },
]

export const studentWorkflowQuickLinks = [
  {
    title: 'Create Event',
    route: '/students/create-event',
    summary: 'Open the event intake form for a new master record.',
  },
  {
    title: 'Activity Master',
    route: '/students/activity-master',
    summary: 'Open the master catalog and registration controls.',
  },
  {
    title: 'Activity Logger',
    route: '/students/activity-logger',
    summary: 'Open the approved activity feed.',
  },
]

export const activityLoggerRecords: WorkflowRecord[] = [
  {
    id: 'AL-101',
    title: 'National AI Innovation Hackathon',
    subtitle: 'Submitted by Arun Kumar on 07 Mar 2026',
    status: 'approved',
    meta: '4 points awarded | Evidence verified',
    route: '/students/my-registrations',
  },
  {
    id: 'AL-102',
    title: 'Industry Workshop Registration',
    subtitle: 'Pending review from verification desk',
    status: 'pending',
    meta: 'Waiting on proof document and seat validation',
    route: '/verification-panel',
  },
  {
    id: 'AL-103',
    title: 'Data Science Case Challenge',
    subtitle: 'Rejected due to incomplete proof packet',
    status: 'rejected',
    meta: 'Rejected with resubmission notes attached',
    route: '/verification-panel',
  },
]

export const registrationRecords: WorkflowRecord[] = [
  {
    id: 'RG-201',
    title: 'Startup Pitch Sprint',
    subtitle: 'Registered for 17 Apr 2026',
    status: 'approved',
    meta: 'Seat confirmed | Eligible for rewards',
    route: '/student/activity/logger',
  },
  {
    id: 'RG-202',
    title: 'IoT Innovation Summit',
    subtitle: 'Registration submitted',
    status: 'pending',
    meta: 'Awaiting verification before logger visibility',
    route: '/verification-panel',
  },
  {
    id: 'RG-203',
    title: 'Full Stack Bootcamp',
    subtitle: 'Request rejected',
    status: 'rejected',
    meta: 'Capacity exhausted for selected batch',
    route: '/student/activity/master',
  },
]

export const verificationRecords: WorkflowRecord[] = [
  {
    id: 'VR-301',
    title: 'Submitter: Arun Kumar',
    subtitle: 'Paper presentation proof received',
    status: 'approved',
    meta: 'Approved and moved to logger',
  },
  {
    id: 'VR-302',
    title: 'Submitter: Priya S',
    subtitle: 'Event registration awaiting review',
    status: 'pending',
    meta: 'Check event code and attachment link',
  },
  {
    id: 'VR-303',
    title: 'Submitter: K. Vignesh',
    subtitle: 'Rejected for incomplete details',
    status: 'rejected',
    meta: 'Needs corrected proof document URL',
  },
]
