// ============================================================
// DDP (Department Development Plan) INDICATOR DATA
// Modeled after the real DDP dashboard at dashboard.bitsathy.ac.in
// ============================================================

import ddpIndexingSheet from '@/assets/ddp-indexing.generated.json'
import type { DeptActivityStats } from '@/lib/real-data'

// ---- Types ----
export interface DDPActivity {
  sNo: number
  activityName: string
  weightage: number
  totalTarget: number
  attained: number
  actualIndex: number
  permittedIndex: number
}

export interface DDPDepartmentOverall {
  rank: number
  department: string
  shortName: string
  totalTarget: number
  achieved: number
  baseIndex: number
  additionalIndex: number
  normalizedBonus: number
}

export interface DDPActivityWiseStatus {
  sNo: number
  department: string
  shortName: string
  totalTarget: number
  achieved: number
  pending: number
  bipIds: string
}

export interface DDPMonthlyAttainment {
  activityName: string
  planned: number
  achievedPlanned: number
  pending: number
  achievedUnplanned: number
}

export interface DDPMonthlyDeptActivity {
  department: string
  activityName: string
  actualPlanned: number
  achievedPlanned: number
  pending: number
  achievedUnplanned: number
}

export interface DDPActivityOverall {
  activityName: string
  proposedTarget: number
  proposedAchieved: number
  pending: number
}

function normalizeActivityKey(name: string) {
  return name.toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim()
}

function attainedFromRealDept(activityName: string, dept: DeptActivityStats): number {
  const key = normalizeActivityKey(activityName)

  if (key === 'PATENT PUBLICATIONS') return dept.patentPublished
  if (key === 'GUEST LECTURE DELIVERED') return dept.guestLectures
  if (key === 'ONLINE COURSES NPTEL') return dept.onlineCourses
  if (key === 'MOOC NPTEL E CONTENT DEVELOPMENT') return dept.onlineCourses
  if (key === 'PUBLICATION IN CONFERENCES') return dept.paperPresentations
  if (key === 'NATIONAL CONFERENCE') return Math.round(dept.paperPresentations * 0.7)
  if (key === 'INTERNATIONAL CONFERENCE') return Math.round(dept.paperPresentations * 0.3)
  if (key === 'WORKSHOP SEMINAR OBT IN HOUSE TRAINING') return Math.round(dept.eventsOrganized * 0.6)
  if (key === 'FDP STTP ORGANISED') return Math.round(dept.eventsOrganized * 0.4)
  if (key === 'FDP STTP ATTENDING FACULTY INTERNSHIP INDUSTRIAL TRAINING') return Math.round(dept.eventsAttended * 0.6)
  if (key === 'TECHNICAL EVENT HACKATHON PARTICIPATION STUDENT S PARTICIPATION') return Math.round(dept.eventsAttended * 0.4)

  return 0
}

function computeActivityIndexRow(template: DDPActivity, attained: number): DDPActivity {
  const actualIndex = template.totalTarget > 0 ? attained / template.totalTarget : 0
  const permittedIndex = Math.min(1, Math.max(0, actualIndex))

  return {
    sNo: template.sNo,
    activityName: template.activityName,
    weightage: template.weightage,
    totalTarget: template.totalTarget,
    attained,
    actualIndex,
    permittedIndex,
  }
}

export function buildDDPRealtimeActivityIndexing(dept: DeptActivityStats): DDPActivity[] {
  return cseActivityIndexing.map(template => {
    const attained = attainedFromRealDept(template.activityName, dept)
    return computeActivityIndexRow(template, attained)
  })
}

export function buildDDPRealtimeOverallIndexing(deptStats: DeptActivityStats[]): DDPDepartmentOverall[] {
  const raw = deptStats.map(dept => {
    const rows = buildDDPRealtimeActivityIndexing(dept)
    const totalWeightage = Math.max(rows.reduce((sum, r) => sum + r.weightage, 0), 1)
    const totalTarget = rows.reduce((sum, r) => sum + r.totalTarget, 0)
    const achieved = rows.reduce((sum, r) => sum + r.attained, 0)

    const baseIndex = rows.reduce((sum, r) => sum + (r.permittedIndex * r.weightage), 0) / totalWeightage
    const additionalIndex = rows.reduce((sum, r) => {
      const additionalPermitted = Math.min(1, Math.max(0, r.actualIndex - 1))
      return sum + (additionalPermitted * r.weightage)
    }, 0) / totalWeightage

    return {
      department: dept.dept,
      shortName: dept.shortCode,
      totalTarget,
      achieved,
      baseIndex,
      additionalIndex,
    }
  })

  const maxAdditional = Math.max(...raw.map(r => r.additionalIndex), 0)

  const ranked = raw
    .map(r => ({
      ...r,
      normalizedBonus: r.baseIndex + (maxAdditional > 0 ? (r.additionalIndex * 0.05) / maxAdditional : 0),
    }))
    .sort((a, b) => b.normalizedBonus - a.normalizedBonus)
    .map((r, idx) => ({
      rank: idx + 1,
      department: r.department,
      shortName: r.shortName,
      totalTarget: r.totalTarget,
      achieved: r.achieved,
      baseIndex: r.baseIndex,
      additionalIndex: r.additionalIndex,
      normalizedBonus: r.normalizedBonus,
    }))

  return ranked
}

type SheetIndexingPayload = {
  cseLike?: {
    totalWeightage?: number
    totalIndex?: number
    additionalIndex?: number
    activityIndexing?: Array<{
      sNo: number
      activityName: string
      weightage: number
      totalTarget: number
      attained: number
      actualIndex: number
      permittedIndex: number
    }>
  }
  overallIndexing?: Array<{
    rank: number
    department: string
    shortName: string
    totalTarget: number
    achieved: number
    baseIndex: number
    additionalIndex: number
    normalizedBonus: number
  }>
  ddpJournalPublicationsOverall?: DDPActivityOverall
  ddpJournalDeptBreakdown?: DDPActivityWiseStatus[]
  ddpAllActivities?: DDPActivityOverall[]
  ddpOverallTotals?: {
    proposedTargets: number
    proposedAchieved: number
    pending: number
  }
}

const sheetData = ddpIndexingSheet as SheetIndexingPayload

// ---- Overall Indexing (All Departments Ranking) ----
export const ddpOverallIndexing: DDPDepartmentOverall[] = [
  { rank: 1, department: 'Mechanical Engineering', shortName: 'MECH', totalTarget: 413, achieved: 305, baseIndex: 0.450, additionalIndex: 0.152, normalizedBonus: 0.498 },
  { rank: 2, department: 'Computer Science & Engineering', shortName: 'CSE', totalTarget: 1060, achieved: 819, baseIndex: 0.446, additionalIndex: 0.0790, normalizedBonus: 0.471 },
  { rank: 3, department: 'Electrical and Electronics Engineering', shortName: 'EEE', totalTarget: 397, achieved: 318, baseIndex: 0.399, additionalIndex: 0.129, normalizedBonus: 0.440 },
  { rank: 4, department: 'Agricultural Engineering', shortName: 'AGRI', totalTarget: 205, achieved: 156, baseIndex: 0.356, additionalIndex: 0.127, normalizedBonus: 0.396 },
  { rank: 5, department: 'Artificial Intelligence and Machine Learning', shortName: 'AIML', totalTarget: 530, achieved: 299, baseIndex: 0.367, additionalIndex: 0.0340, normalizedBonus: 0.378 },
  { rank: 6, department: 'Electronics and Communication Engineering', shortName: 'ECE', totalTarget: 945, achieved: 631, baseIndex: 0.355, additionalIndex: 0.0560, normalizedBonus: 0.373 },
  { rank: 7, department: 'Biotechnology', shortName: 'BIOTECH', totalTarget: 409, achieved: 394, baseIndex: 0.340, additionalIndex: 0.0780, normalizedBonus: 0.365 },
  { rank: 8, department: 'Electronics and Instrumentation Engineering', shortName: 'EIE', totalTarget: 299, achieved: 243, baseIndex: 0.331, additionalIndex: 0.0710, normalizedBonus: 0.353 },
  { rank: 9, department: 'Artificial Intelligence and Data Science', shortName: 'AIDS', totalTarget: 822, achieved: 443, baseIndex: 0.332, additionalIndex: 0.0520, normalizedBonus: 0.348 },
  { rank: 10, department: 'Food Technology', shortName: 'FT', totalTarget: 112, achieved: 102, baseIndex: 0.241, additionalIndex: 0.159, normalizedBonus: 0.291 },
  { rank: 11, department: 'Mechatronics Engineering', shortName: 'MTRX', totalTarget: 326, achieved: 182, baseIndex: 0.256, additionalIndex: 0.0520, normalizedBonus: 0.272 },
  { rank: 12, department: 'Civil Engineering', shortName: 'CIVIL', totalTarget: 280, achieved: 168, baseIndex: 0.230, additionalIndex: 0.045, normalizedBonus: 0.248 },
  { rank: 13, department: 'Computer Science and Design', shortName: 'CSD', totalTarget: 185, achieved: 92, baseIndex: 0.210, additionalIndex: 0.032, normalizedBonus: 0.225 },
  { rank: 14, department: 'Information Technology', shortName: 'IT', totalTarget: 420, achieved: 238, baseIndex: 0.295, additionalIndex: 0.041, normalizedBonus: 0.315 },
  { rank: 15, department: 'Computer Technology', shortName: 'CT', totalTarget: 156, achieved: 88, baseIndex: 0.218, additionalIndex: 0.028, normalizedBonus: 0.232 },
]

// Same structure as ddpOverallIndexing, sourced from the Excel workbook summary.
export const ddpSheetOverallIndexing: DDPDepartmentOverall[] =
  (sheetData.overallIndexing || []).map(d => ({
    rank: d.rank,
    department: d.department,
    shortName: d.shortName,
    totalTarget: d.totalTarget,
    achieved: d.achieved,
    baseIndex: d.baseIndex,
    additionalIndex: d.additionalIndex,
    normalizedBonus: d.normalizedBonus,
  }))

// ---- CSE Department: Index Calculation ----
export const cseTotalWeightage = sheetData.cseLike?.totalWeightage ?? 100
export const cseTotalIndex = sheetData.cseLike?.totalIndex ?? 0.451
export const cseAdditionalIndex = sheetData.cseLike?.additionalIndex ?? 0.0790

// ---- CSE Department: Activity-wise Total Indexing ----
export const cseActivityIndexing: DDPActivity[] =
  (sheetData.cseLike?.activityIndexing || []).map(a => ({
    sNo: a.sNo,
    activityName: a.activityName,
    weightage: a.weightage,
    totalTarget: a.totalTarget,
    attained: a.attained,
    actualIndex: a.actualIndex,
    permittedIndex: a.permittedIndex,
  }))

// ---- Overall Activity-wise DDP Attainment Status (Journal Publications SCI/WOS as example) ----
export const ddpJournalPublicationsOverall: DDPActivityOverall = {
  activityName: sheetData.ddpJournalPublicationsOverall?.activityName ?? 'JOURNAL PUBLICATIONS (SCI / WOS)',
  proposedTarget: sheetData.ddpJournalPublicationsOverall?.proposedTarget ?? 238,
  proposedAchieved: sheetData.ddpJournalPublicationsOverall?.proposedAchieved ?? 168,
  pending: sheetData.ddpJournalPublicationsOverall?.pending ?? 70,
}

export const ddpJournalDeptBreakdown: DDPActivityWiseStatus[] =
  sheetData.ddpJournalDeptBreakdown || []

// ---- Month-wise DDP Attainment (CSE Department) ----
export const cseMonthlyDDPStatus = {
  planned: 72,
  achievedPlanned: 0,
  pending: 72,
  achievedUnplanned: 0,
}

export const cseMonthlyActivities: DDPMonthlyAttainment[] = [
  { activityName: 'RESEARCH FUNDING, RS. IN LAKHS', planned: 60, achievedPlanned: 0, pending: 60, achievedUnplanned: 0 },
  { activityName: 'INDUSTRIAL CONSULTANCY PROJECTS, RS IN LAKHS', planned: 12, achievedPlanned: 0, pending: 12, achievedUnplanned: 0 },
]

// ---- Activity-wise Monthly Attainment Status ----
export const cseMonthlyActivityStatus: DDPMonthlyDeptActivity[] = [
  { department: 'Computer Science & Engineering', activityName: 'JOURNAL PUBLICATIONS (SCI / WOS)', actualPlanned: 21, achievedPlanned: 20, pending: 1, achievedUnplanned: 0 },
]

// ---- Overall Targets, Achieved, and Pending (All Activities) ----
export const ddpOverallTotals = {
  proposedTargets: sheetData.ddpOverallTotals?.proposedTargets ?? 7314,
  proposedAchieved: sheetData.ddpOverallTotals?.proposedAchieved ?? 5146,
  pending: sheetData.ddpOverallTotals?.pending ?? 1497,
}

// ---- All Activities Summary (College-wide) ----
export const ddpAllActivities: DDPActivityOverall[] = sheetData.ddpAllActivities || []

// ---- Monthly Trend by Month (for time-series charts) ----
export const ddpMonthlyTrend = [
  { month: 'Jun 2025', target: 610, achieved: 320, pending: 290, index: 0.182 },
  { month: 'Jul 2025', target: 610, achieved: 485, pending: 125, index: 0.248 },
  { month: 'Aug 2025', target: 610, achieved: 590, pending: 20, index: 0.312 },
  { month: 'Sep 2025', target: 610, achieved: 605, pending: 5, index: 0.345 },
  { month: 'Oct 2025', target: 610, achieved: 608, pending: 2, index: 0.368 },
  { month: 'Nov 2025', target: 610, achieved: 580, pending: 30, index: 0.385 },
  { month: 'Dec 2025', target: 610, achieved: 545, pending: 65, index: 0.398 },
  { month: 'Jan 2026', target: 610, achieved: 620, pending: 0, index: 0.425 },
  { month: 'Feb 2026', target: 610, achieved: 435, pending: 175, index: 0.442 },
]

// ---- Department Comparison across Key DDP Activities ----
export const ddpDeptActivityComparison = [
  { activity: 'Journal (SCI)', CSE: 95, ECE: 81, MECH: 83, EEE: 50, AIML: 100, AIDS: 13, BIOTECH: 89 },
  { activity: 'Conference', CSE: 93, ECE: 85, MECH: 78, EEE: 72, AIML: 88, AIDS: 65, BIOTECH: 82 },
  { activity: 'Patents', CSE: 83, ECE: 75, MECH: 90, EEE: 60, AIML: 70, AIDS: 45, BIOTECH: 55 },
  { activity: 'Placements', CSE: 12, ECE: 35, MECH: 42, EEE: 28, AIML: 22, AIDS: 18, BIOTECH: 52 },
  { activity: 'Research Funding', CSE: 0, ECE: 25, MECH: 55, EEE: 30, AIML: 15, AIDS: 10, BIOTECH: 40 },
  { activity: 'Guest Lectures', CSE: 78, ECE: 65, MECH: 72, EEE: 55, AIML: 80, AIDS: 42, BIOTECH: 68 },
  { activity: 'FDP Organised', CSE: 0, ECE: 50, MECH: 67, EEE: 33, AIML: 40, AIDS: 20, BIOTECH: 75 },
]

// ---- Key Insights derived from DDP data ----
export function getDDPInsights() {
  const overallRate = ((ddpOverallTotals.proposedAchieved / ddpOverallTotals.proposedTargets) * 100)
  
  // Top & bottom departments
  const topDept = ddpOverallIndexing[0]
  const bottomDept = ddpOverallIndexing[ddpOverallIndexing.length - 1]
  
  // Activities with 0 achievement (critical)
  const criticalActivities = cseActivityIndexing.filter(a => a.attained === 0)
  
  // Activities exceeding target
  const exceedingActivities = cseActivityIndexing.filter(a => a.attained > a.totalTarget)
  
  // Biggest gap activities (college-wide)
  const biggestGaps = [...ddpAllActivities]
    .sort((a, b) => (b.pending / Math.max(b.proposedTarget, 1)) - (a.pending / Math.max(a.proposedTarget, 1)))
    .slice(0, 5)
  
  // Best performing activities
  const bestPerforming = [...ddpAllActivities]
    .sort((a, b) => (b.proposedAchieved / Math.max(b.proposedTarget, 1)) - (a.proposedAchieved / Math.max(a.proposedTarget, 1)))
    .slice(0, 5)
  
  // Department with highest pending in journal pubs
  const highestPendingDept = [...ddpJournalDeptBreakdown]
    .sort((a, b) => b.pending - a.pending)[0]
  
  // Departments exceeding targets (negative pending)
  const exceedingDepts = ddpJournalDeptBreakdown.filter(d => d.pending < 0)
  
  return {
    overallRate,
    topDept,
    bottomDept,
    criticalActivities,
    exceedingActivities,
    biggestGaps,
    bestPerforming,
    highestPendingDept,
    exceedingDepts,
  }
}

// ---- Category-wise Achievement Rates (for donut chart) ----
export const ddpCategoryAchievementRates = [
  { name: 'Research & Publications', value: 72, total: 1588, achieved: 1143, color: '#3b82f6' },
  { name: 'Industry & Consultancy', value: 58, total: 695, achieved: 403, color: '#8b5cf6' },
  { name: 'Teaching & Training', value: 78, total: 512, achieved: 399, color: '#10b981' },
  { name: 'Placements', value: 63, total: 1130, achieved: 715, color: '#f59e0b' },
  { name: 'Extension & Awards', value: 81, total: 2789, achieved: 2197, color: '#ef4444' },
  { name: 'MOU & Collaboration', value: 65, total: 308, achieved: 200, color: '#ec4899' },
]

// ---- Heatmap data: Department vs Activity Achievement % ----
export const ddpHeatmapData = [
  { dept: 'CSE', journals: 95, conferences: 93, patents: 83, placements: 12, funding: 0, guestLectures: 78, fdp: 0, nptel: 53, events: 85 },
  { dept: 'ECE', journals: 81, conferences: 85, patents: 75, placements: 35, funding: 25, guestLectures: 65, fdp: 50, nptel: 60, events: 78 },
  { dept: 'MECH', journals: 83, conferences: 78, patents: 90, placements: 42, funding: 55, guestLectures: 72, fdp: 67, nptel: 48, events: 82 },
  { dept: 'EEE', journals: 50, conferences: 72, patents: 60, placements: 28, funding: 30, guestLectures: 55, fdp: 33, nptel: 45, events: 65 },
  { dept: 'AIML', journals: 100, conferences: 88, patents: 70, placements: 22, funding: 15, guestLectures: 80, fdp: 40, nptel: 65, events: 75 },
  { dept: 'AIDS', journals: 13, conferences: 65, patents: 45, placements: 18, funding: 10, guestLectures: 42, fdp: 20, nptel: 38, events: 55 },
  { dept: 'BIOTECH', journals: 89, conferences: 82, patents: 55, placements: 52, funding: 40, guestLectures: 68, fdp: 75, nptel: 58, events: 80 },
  { dept: 'EIE', journals: 63, conferences: 70, patents: 50, placements: 38, funding: 28, guestLectures: 55, fdp: 42, nptel: 50, events: 72 },
  { dept: 'IT', journals: 67, conferences: 75, patents: 55, placements: 30, funding: 20, guestLectures: 60, fdp: 35, nptel: 55, events: 70 },
  { dept: 'CIVIL', journals: 67, conferences: 68, patents: 42, placements: 45, funding: 35, guestLectures: 58, fdp: 55, nptel: 42, events: 68 },
]

// ---- CSE Department Month-by-Month Activity Tracking ----
export const cseDDPMonthlyBreakdown = [
  { month: 'Jun', journalSCI: 1, journalScopus: 2, conferences: 3, patents: 0, placements: 0, funding: 0, events: 45, total: 62 },
  { month: 'Jul', journalSCI: 2, journalScopus: 3, conferences: 4, patents: 1, placements: 0, funding: 0, events: 55, total: 78 },
  { month: 'Aug', journalSCI: 3, journalScopus: 4, conferences: 5, patents: 2, placements: 1, funding: 0, events: 65, total: 95 },
  { month: 'Sep', journalSCI: 2, journalScopus: 3, conferences: 5, patents: 1, placements: 1, funding: 0, events: 70, total: 98 },
  { month: 'Oct', journalSCI: 3, journalScopus: 4, conferences: 6, patents: 2, placements: 2, funding: 0, events: 80, total: 115 },
  { month: 'Nov', journalSCI: 3, journalScopus: 5, conferences: 5, patents: 1, placements: 1, funding: 0, events: 75, total: 108 },
  { month: 'Dec', journalSCI: 2, journalScopus: 4, conferences: 4, patents: 1, placements: 1, funding: 0, events: 68, total: 92 },
  { month: 'Jan', journalSCI: 3, journalScopus: 4, conferences: 6, patents: 1, placements: 1, funding: 0, events: 72, total: 102 },
  { month: 'Feb', journalSCI: 1, journalScopus: 3, conferences: 4, patents: 1, placements: 0, funding: 0, events: 45, total: 69 },
]
