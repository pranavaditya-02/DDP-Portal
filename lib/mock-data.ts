// ============================================================
// ROLE MANAGEMENT DATA
// ============================================================

export interface Resource {
  id: string
  label: string
  icon: string       // lucide icon name
  href: string
  group: string
}

export interface Role {
  id: number
  name: string
  description: string
  passwordPrefix: string
  editAccess: boolean       // can edit activities / records
  deleteAccess: boolean     // can delete activities / records
  status: boolean           // active / inactive
  resources: string[]       // resource ids
  isSystem: boolean         // system roles can't be deleted
  createdAt: string
  usersCount: number
}

export const availableResources: Resource[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/dashboard', group: 'Overview' },
  { id: 'student-dashboard', label: 'Student Dashboard', icon: 'LayoutDashboard', href: '/student/dashboard', group: 'Overview' },
  { id: 'student-overview', label: 'Student Overview', icon: 'FileText', href: '/student/overview', group: 'Overview' },
  { id: 'my-activities', label: 'My Activities', icon: 'FileText', href: '/activities', group: 'Faculty' },
  { id: 'submit-achievements', label: 'Submit Achievements', icon: 'Award', href: '/achievements/submit', group: 'Faculty' },
  { id: 'submit-action-plan', label: 'Submit Action Plan', icon: 'Clipboard', href: '/action-plan/submit', group: 'Faculty' },
  { id: 'department', label: 'Department', icon: 'Building2', href: '/department', group: 'Department' },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'Trophy', href: '/leaderboard', group: 'Department' },
  { id: 'college-overview', label: 'College Overview', icon: 'GraduationCap', href: '/college', group: 'College' },
  { id: 'verification-queue', label: 'Verification Queue', icon: 'ShieldCheck', href: '/verification', group: 'Management' },

  { id: 'role-management', label: 'Manage Roles', icon: 'Shield', href: '/roles', group: 'Management' },
  { id: 'settings', label: 'Settings', icon: 'Settings', href: '/settings', group: 'Management' },
]

export const roles: Role[] = [
  {
    id: 1, name: 'Faculty', description: 'Regular faculty member with basic access',
    passwordPrefix: 'fc', editAccess: true, deleteAccess: false, status: true,
    resources: ['dashboard', 'my-activities', 'submit-achievements', 'submit-action-plan', 'leaderboard'],
    isSystem: true, createdAt: '2024-01-01', usersCount: 165,
  },
  {
    id: 2, name: 'HOD', description: 'Head of Department with department-level access',
    passwordPrefix: 'hd', editAccess: true, deleteAccess: true, status: true,
    resources: ['dashboard', 'my-activities', 'submit-achievements', 'submit-action-plan', 'department', 'leaderboard'],
    isSystem: true, createdAt: '2024-01-01', usersCount: 6,
  },
  {
    id: 3, name: 'Dean', description: 'Dean with college-wide access and analytics',
    passwordPrefix: 'dn', editAccess: true, deleteAccess: true, status: true,
    resources: ['dashboard', 'my-activities', 'submit-achievements', 'submit-action-plan', 'department', 'leaderboard', 'college-overview'],
    isSystem: true, createdAt: '2024-01-01', usersCount: 2,
  },
  {
    id: 4, name: 'Verification', description: 'Verification committee with queue access',
    passwordPrefix: 'vc', editAccess: true, deleteAccess: false, status: true,
    resources: ['dashboard', 'verification-queue'],
    isSystem: true, createdAt: '2024-01-01', usersCount: 8,
  },
  {
    id: 5, name: 'Maintenance', description: 'System admin with full portal access',
    passwordPrefix: 'ad', editAccess: true, deleteAccess: true, status: true,
    resources: ['dashboard', 'my-activities', 'submit-achievements', 'submit-action-plan', 'department', 'leaderboard', 'college-overview', 'verification-queue', 'role-management', 'settings'],
    isSystem: true, createdAt: '2024-01-01', usersCount: 3,
  },
  {
    id: 6, name: 'Student', description: 'Student user with student achievements and reports access',
    passwordPrefix: 'st', editAccess: true, deleteAccess: false, status: true,
    resources: ['student-dashboard', 'student-overview'],
    isSystem: true, createdAt: '2026-04-02', usersCount: 120,
  },
  {
    id: 7, name: 'Guest Reviewer', description: 'External reviewer with read-only access',
    passwordPrefix: 'gr', editAccess: false, deleteAccess: false, status: true,
    resources: ['dashboard', 'leaderboard'],
    isSystem: false, createdAt: '2025-06-15', usersCount: 4,
  },
]

// ============================================================
// Mock Data for Faculty Achievement Tracking System
// ============================================================

export interface Activity {
  id: number
  title: string
  type: string
  category: string
  date: string
  status: 'approved' | 'pending' | 'rejected'
  points: number
  facultyName?: string
  facultyId?: number
  department?: string
  proofUrl?: string
}

export interface FacultyMember {
  id: number
  name: string
  email: string
  department: string
  designation: string
  totalPoints: number
  activitiesCount: number
  avatar?: string
  joinedDate: string
}

export interface DepartmentStat {
  name: string
  shortName: string
  facultyCount: number
  totalActivities: number
  avgPoints: number
  topPerformer: string
  pendingApprovals: number
}

export interface MonthlyTrend {
  month: string
  activities: number
  points: number
  approved: number
  pending: number
}

export interface CategoryBreakdown {
  category: string
  count: number
  percentage: number
  color: string
}

// ---- Faculty Activities (for Faculty role) ----
export const myActivities: Activity[] = [
  { id: 1, title: 'Published paper in IEEE Transactions on Neural Networks', type: 'Journal Publication', category: 'Research', date: '2026-01-15', status: 'approved', points: 50 },
  { id: 2, title: 'Attended FDP on Machine Learning at IIT Madras', type: 'FDP/Workshop', category: 'Professional Development', date: '2026-01-08', status: 'approved', points: 20 },
  { id: 3, title: 'Filed patent for IoT-based Smart Agriculture System', type: 'Patent', category: 'Research', date: '2025-12-20', status: 'approved', points: 75 },
  { id: 4, title: 'Guest lecture at Anna University on Cloud Computing', type: 'Guest Lecture', category: 'Teaching', date: '2026-01-22', status: 'pending', points: 15 },
  { id: 5, title: 'Organized National Workshop on Cybersecurity', type: 'Event Organized', category: 'Service', date: '2025-12-10', status: 'approved', points: 30 },
  { id: 6, title: 'Conference paper at ICACCI 2026', type: 'Conference Paper', category: 'Research', date: '2026-02-01', status: 'pending', points: 35 },
  { id: 7, title: 'Completed NPTEL certification on Deep Learning', type: 'Certification', category: 'Professional Development', date: '2025-11-28', status: 'approved', points: 15 },
  { id: 8, title: 'Mentored 3 students for Smart India Hackathon', type: 'Student Mentoring', category: 'Teaching', date: '2025-12-05', status: 'approved', points: 20 },
  { id: 9, title: 'Book chapter in Springer: AI in Healthcare', type: 'Book Chapter', category: 'Research', date: '2026-02-05', status: 'pending', points: 40 },
  { id: 10, title: 'Industry consultancy project with TCS', type: 'Consultancy', category: 'Industry', date: '2025-11-15', status: 'approved', points: 45 },
]

// ---- Pending verification queue ----
export const pendingActivities: Activity[] = [
  { id: 101, title: 'Published paper in Elsevier - Computer Networks', type: 'Journal Publication', category: 'Research', date: '2026-02-03', status: 'pending', points: 50, facultyName: 'Dr. Ramesh', facultyId: 5, department: 'CSE' },
  { id: 102, title: 'AWS Solutions Architect Certification', type: 'Certification', category: 'Professional Development', date: '2026-01-28', status: 'pending', points: 20, facultyName: 'Prof. Karthik R', facultyId: 6, department: 'IT' },
  { id: 103, title: 'Keynote at International AI Summit', type: 'Guest Lecture', category: 'Teaching', date: '2026-01-30', status: 'pending', points: 25, facultyName: 'Dr. Lakshmi Priya', facultyId: 7, department: 'CSE' },
  { id: 104, title: 'Patent granted: Blockchain-based Voting System', type: 'Patent', category: 'Research', date: '2026-02-01', status: 'pending', points: 75, facultyName: 'Dr. Arun Kumar', facultyId: 8, department: 'ECE' },
  { id: 105, title: 'FDP on Quantum Computing - 5 days', type: 'FDP/Workshop', category: 'Professional Development', date: '2026-01-25', status: 'pending', points: 20, facultyName: 'Prof. Divya S', facultyId: 9, department: 'EEE' },
  { id: 106, title: 'Organized Hackathon with 500+ participants', type: 'Event Organized', category: 'Service', date: '2026-02-07', status: 'pending', points: 30, facultyName: 'Dr. Ramesh B', facultyId: 10, department: 'CSE' },
  { id: 107, title: 'Industry project with Infosys on Edge AI', type: 'Consultancy', category: 'Industry', date: '2026-01-18', status: 'pending', points: 45, facultyName: 'Prof. Sathya N', facultyId: 11, department: 'IT' },
]

// ---- Faculty members (for HOD/Dean) ----
export const facultyMembers: FacultyMember[] = [
  { id: 1, name: 'Dr. Priya Sharma', email: 'priya@bit.edu', department: 'CSE', designation: 'Associate Professor', totalPoints: 345, activitiesCount: 18, joinedDate: '2018-06-15' },
  { id: 2, name: 'Dr. Rajesh Kumar', email: 'rajesh@bit.edu', department: 'CSE', designation: 'Professor & HOD', totalPoints: 420, activitiesCount: 24, joinedDate: '2015-08-01' },
  { id: 3, name: 'Prof. Anitha Devi', email: 'anitha@bit.edu', department: 'CSE', designation: 'Assistant Professor', totalPoints: 210, activitiesCount: 12, joinedDate: '2020-01-10' },
  { id: 4, name: 'Dr. Suresh Babu', email: 'suresh@bit.edu', department: 'ECE', designation: 'Associate Professor', totalPoints: 380, activitiesCount: 20, joinedDate: '2016-03-20' },
  { id: 5, name: 'Dr. Ramesh', email: 'ramesh@bit.edu', department: 'CSE', designation: 'Professor', totalPoints: 510, activitiesCount: 28, joinedDate: '2012-07-01' },
  { id: 6, name: 'Prof. Karthik R', email: 'karthik@bit.edu', department: 'IT', designation: 'Assistant Professor', totalPoints: 180, activitiesCount: 10, joinedDate: '2021-06-15' },
  { id: 7, name: 'Dr. Lakshmi Priya', email: 'lakshmi@bit.edu', department: 'CSE', designation: 'Associate Professor', totalPoints: 290, activitiesCount: 16, joinedDate: '2019-01-05' },
  { id: 8, name: 'Dr. Arun Kumar', email: 'arun@bit.edu', department: 'ECE', designation: 'Professor', totalPoints: 465, activitiesCount: 22, joinedDate: '2014-08-20' },
  { id: 9, name: 'Prof. Divya S', email: 'divya@bit.edu', department: 'EEE', designation: 'Assistant Professor', totalPoints: 150, activitiesCount: 8, joinedDate: '2022-01-10' },
  { id: 10, name: 'Dr. Ramesh B', email: 'ramesh@bit.edu', department: 'CSE', designation: 'Associate Professor', totalPoints: 330, activitiesCount: 19, joinedDate: '2017-03-01' },
  { id: 11, name: 'Prof. Sathya N', email: 'sathya@bit.edu', department: 'IT', designation: 'Assistant Professor', totalPoints: 195, activitiesCount: 11, joinedDate: '2020-07-15' },
  { id: 12, name: 'Dr. Venkat K', email: 'venkat@bit.edu', department: 'MECH', designation: 'Professor', totalPoints: 400, activitiesCount: 21, joinedDate: '2013-06-01' },
]

// ---- Department stats (for Dean) ----
export const departmentStats: DepartmentStat[] = [
  { name: 'Computer Science & Engineering', shortName: 'CSE', facultyCount: 45, totalActivities: 312, avgPoints: 285, topPerformer: 'Dr. Ramesh', pendingApprovals: 8 },
  { name: 'Information Technology', shortName: 'IT', facultyCount: 30, totalActivities: 198, avgPoints: 245, topPerformer: 'Dr. Senthil Kumar', pendingApprovals: 5 },
  { name: 'Electronics & Communication', shortName: 'ECE', facultyCount: 38, totalActivities: 256, avgPoints: 260, topPerformer: 'Dr. Arun Kumar', pendingApprovals: 6 },
  { name: 'Electrical & Electronics', shortName: 'EEE', facultyCount: 28, totalActivities: 167, avgPoints: 220, topPerformer: 'Dr. Vani R', pendingApprovals: 3 },
  { name: 'Mechanical Engineering', shortName: 'MECH', facultyCount: 35, totalActivities: 210, avgPoints: 235, topPerformer: 'Dr. Venkat K', pendingApprovals: 4 },
  { name: 'Civil Engineering', shortName: 'CIVIL', facultyCount: 22, totalActivities: 134, avgPoints: 210, topPerformer: 'Dr. Pradeep N', pendingApprovals: 2 },
]

// ---- Monthly trends ----
export const monthlyTrends: MonthlyTrend[] = [
  { month: 'Sep 2025', activities: 42, points: 1250, approved: 38, pending: 4 },
  { month: 'Oct 2025', activities: 58, points: 1680, approved: 51, pending: 7 },
  { month: 'Nov 2025', activities: 65, points: 1920, approved: 55, pending: 10 },
  { month: 'Dec 2025', activities: 48, points: 1450, approved: 42, pending: 6 },
  { month: 'Jan 2026', activities: 72, points: 2150, approved: 60, pending: 12 },
  { month: 'Feb 2026', activities: 35, points: 980, approved: 22, pending: 13 },
]

// ---- Category breakdown ----
export const categoryBreakdown: CategoryBreakdown[] = [
  { category: 'Research', count: 145, percentage: 35, color: '#3b82f6' },
  { category: 'Teaching', count: 82, percentage: 20, color: '#10b981' },
  { category: 'Professional Development', count: 98, percentage: 24, color: '#f59e0b' },
  { category: 'Service', count: 45, percentage: 11, color: '#8b5cf6' },
  { category: 'Industry', count: 42, percentage: 10, color: '#ef4444' },
]

// ---- Quick stats per role ----
export const facultyStats = {
  totalActivities: 18,
  approved: 14,
  pending: 3,
  rejected: 1,
  totalPoints: 345,
  rank: 5,
  totalFaculty: 45,
  thisMonthActivities: 3,
  lastMonthActivities: 5,
  pointsTrend: +12, // percentage
}

export const hodStats = {
  departmentName: 'Computer Science & Engineering',
  totalFaculty: 45,
  activeFaculty: 42,
  totalActivities: 312,
  pendingApprovals: 8,
  avgPointsPerFaculty: 285,
  topPerformer: 'Dr. Ramesh',
  topPerformerPoints: 510,
  thisMonthActivities: 48,
  activitiesGrowth: +15,
}

export const deanStats = {
  totalDepartments: 27,
  totalFaculty: 699,
  totalActivities: 12063,
  totalPending: 28,
  avgPointsCollege: 448,
  topDepartment: 'CSE',
  topDepartmentPoints: 1339,
  researchOutput: 170,
  patentsFiled: 303,
}

export const verificationStats = {
  pendingReview: 7,
  reviewedToday: 4,
  reviewedThisWeek: 18,
  avgReviewTime: '1.2 days',
  approvalRate: 87,
  rejectionRate: 13,
}

export const adminStats = {
  totalUsers: 198,
  activeUsers: 185,
  newUsersThisMonth: 5,
  totalRoles: 6,
  systemUptime: '99.9%',
  lastBackup: '2026-02-10 02:00 AM',
  storageUsed: '2.4 GB / 10 GB',
  pendingRegistrations: 3,
}

// ---- Recent notifications ----
export const recentNotifications = [
  { id: 1, message: 'Your paper submission was approved (+50 pts)', time: '2 hours ago', type: 'success' as const },
  { id: 2, message: 'New FDP opportunity: AI in Education', time: '5 hours ago', type: 'info' as const },
  { id: 3, message: 'Deadline reminder: Submit Q4 activities by Feb 28', time: '1 day ago', type: 'warning' as const },
  { id: 4, message: 'Dr. Ramesh reached 500 points milestone!', time: '2 days ago', type: 'success' as const },
  { id: 5, message: 'System maintenance scheduled for Feb 15', time: '3 days ago', type: 'info' as const },
]

// ---- Users (for User Management) ----
export interface SystemUser {
  id: number
  facultyId: string
  name: string
  email: string
  department: string
  designation: string
  role: string
  status: 'active' | 'inactive'
  joinedDate: string
}

export const systemUsers: SystemUser[] = [
  { id: 1, facultyId: 'BIT-CSE-001', name: 'Dr. Priya Sharma', email: 'priya@bit.edu', department: 'CSE', designation: 'Associate Professor', role: 'faculty', status: 'active', joinedDate: '2018-06-15' },
  { id: 2, facultyId: 'BIT-CSE-002', name: 'Dr. Rajesh Kumar', email: 'rajesh@bit.edu', department: 'CSE', designation: 'Professor & HOD', role: 'hod', status: 'active', joinedDate: '2015-08-01' },
  { id: 3, facultyId: 'BIT-CSE-003', name: 'Prof. Anitha Devi', email: 'anitha@bit.edu', department: 'CSE', designation: 'Assistant Professor', role: 'faculty', status: 'active', joinedDate: '2020-01-10' },
  { id: 4, facultyId: 'BIT-ECE-001', name: 'Dr. Suresh Babu', email: 'suresh@bit.edu', department: 'ECE', designation: 'Associate Professor', role: 'faculty', status: 'active', joinedDate: '2016-03-20' },
  { id: 5, facultyId: 'BIT-CSE-004', name: 'Dr. Ramesh', email: 'ramesh@bit.edu', department: 'CSE', designation: 'Professor', role: 'faculty', status: 'active', joinedDate: '2012-07-01' },
  { id: 6, facultyId: 'BIT-IT-001', name: 'Prof. Karthik R', email: 'karthik@bit.edu', department: 'IT', designation: 'Assistant Professor', role: 'faculty', status: 'active', joinedDate: '2021-06-15' },
  { id: 7, facultyId: 'BIT-CSE-005', name: 'Dr. Lakshmi Priya', email: 'lakshmi@bit.edu', department: 'CSE', designation: 'Associate Professor', role: 'faculty', status: 'active', joinedDate: '2019-01-05' },
  { id: 8, facultyId: 'BIT-ECE-002', name: 'Dr. Arun Kumar', email: 'arun@bit.edu', department: 'ECE', designation: 'Professor', role: 'hod', status: 'active', joinedDate: '2014-08-20' },
  { id: 9, facultyId: 'BIT-EEE-001', name: 'Prof. Divya S', email: 'divya@bit.edu', department: 'EEE', designation: 'Assistant Professor', role: 'faculty', status: 'inactive', joinedDate: '2022-01-10' },
  { id: 10, facultyId: 'BIT-CSE-006', name: 'Dr. Ramesh B', email: 'rameshb@bit.edu', department: 'CSE', designation: 'Associate Professor', role: 'verification', status: 'active', joinedDate: '2017-03-01' },
  { id: 11, facultyId: 'BIT-IT-002', name: 'Prof. Sathya N', email: 'sathya@bit.edu', department: 'IT', designation: 'Assistant Professor', role: 'faculty', status: 'active', joinedDate: '2020-07-15' },
  { id: 12, facultyId: 'BIT-MECH-001', name: 'Dr. Venkat K', email: 'venkat@bit.edu', department: 'MECH', designation: 'Professor', role: 'hod', status: 'active', joinedDate: '2013-06-01' },
  { id: 13, facultyId: 'BIT-EEE-002', name: 'Dr. Meena V', email: 'meena@bit.edu', department: 'EEE', designation: 'Professor & HOD', role: 'hod', status: 'active', joinedDate: '2011-08-15' },
  { id: 14, facultyId: 'BIT-CIVIL-001', name: 'Prof. Ajay S', email: 'ajay@bit.edu', department: 'CIVIL', designation: 'Assistant Professor', role: 'faculty', status: 'inactive', joinedDate: '2023-01-05' },
  { id: 15, facultyId: 'BIT-IT-003', name: 'Dr. Nalini R', email: 'nalini@bit.edu', department: 'IT', designation: 'Associate Professor', role: 'verification', status: 'active', joinedDate: '2016-06-20' },
  { id: 16, facultyId: 'BIT-MECH-002', name: 'Dr. Chandran M', email: 'chandran@bit.edu', department: 'MECH', designation: 'Associate Professor', role: 'faculty', status: 'active', joinedDate: '2018-03-10' },
  { id: 17, facultyId: 'BIT-ECE-003', name: 'Dr. Saranya P', email: 'saranya@bit.edu', department: 'ECE', designation: 'Assistant Professor', role: 'faculty', status: 'active', joinedDate: '2021-07-01' },
  { id: 18, facultyId: 'BIT-ADM-001', name: 'Admin User', email: 'admin@bit.edu', department: 'Admin', designation: 'System Administrator', role: 'maintenance', status: 'active', joinedDate: '2010-01-01' },
  { id: 19, facultyId: 'BIT-CIVIL-002', name: 'Dr. Pradeep N', email: 'pradeep@bit.edu', department: 'CIVIL', designation: 'Professor & HOD', role: 'hod', status: 'active', joinedDate: '2014-09-01' },
  { id: 20, facultyId: 'BIT-IT-004', name: 'Prof. Revathi K', email: 'revathi@bit.edu', department: 'IT', designation: 'Assistant Professor', role: 'faculty', status: 'active', joinedDate: '2022-07-20' },
]

// ---- Leaderboard (weighted points: DDP-aligned scoring, NOT raw activity count) ----
export const leaderboard = [
  { rank: 1,  name: 'THULASIMANI T',            department: 'MA',   points: 1917, activities: 415, badge: 'gold'   },
  { rank: 2,  name: 'GANESH BABU C',             department: 'EI',   points: 384,  activities: 64,  badge: 'gold'   },
  { rank: 3,  name: 'SANGEETHAA SN',             department: 'CSE',  points: 283,  activities: 50,  badge: 'silver' },
  { rank: 4,  name: 'HARIKUMAR R',               department: 'ECE',  points: 260,  activities: 35,  badge: 'silver' },
  { rank: 5,  name: 'MAHESWARI K T',             department: 'EEE',  points: 244,  activities: 95,  badge: 'silver' },
  { rank: 6,  name: 'LAKSHMI NARAYANA M MOHAN',  department: 'ECE',  points: 243,  activities: 23,  badge: 'bronze' },
  { rank: 7,  name: 'SIVARAMAN P',               department: 'EEE',  points: 240,  activities: 25,  badge: 'bronze' },
  { rank: 8,  name: 'GUNALAN K',                 department: 'CT',   points: 221,  activities: 59,  badge: 'bronze' },
  { rank: 9,  name: 'VINOTHINI V R',             department: 'MA',   points: 219,  activities: 82,  badge: 'none'   },
  { rank: 10, name: 'BIJU J',                    department: 'ISE',  points: 212,  activities: 67,  badge: 'none'   },
]

// ============================================================
// CHART-SPECIFIC DATA
// ============================================================

// ---- Faculty: weekly points progression ----
export const weeklyPointsData = [
  { week: 'W1', points: 45, activities: 3 },
  { week: 'W2', points: 70, activities: 4 },
  { week: 'W3', points: 30, activities: 2 },
  { week: 'W4', points: 95, activities: 5 },
  { week: 'W5', points: 60, activities: 3 },
  { week: 'W6', points: 110, activities: 6 },
  { week: 'W7', points: 85, activities: 4 },
  { week: 'W8', points: 50, activities: 3 },
]

// ---- Faculty: activity status distribution ----
export const activityStatusData = [
  { name: 'Approved', value: 14, color: '#10b981' },
  { name: 'Pending', value: 3, color: '#f59e0b' },
  { name: 'Rejected', value: 1, color: '#ef4444' },
]

// ---- Faculty: points goal tracker ----
export const pointsGoalData = [
  { month: 'Sep', actual: 45, target: 50 },
  { month: 'Oct', actual: 70, target: 50 },
  { month: 'Nov', actual: 55, target: 55 },
  { month: 'Dec', actual: 80, target: 60 },
  { month: 'Jan', actual: 65, target: 60 },
  { month: 'Feb', actual: 30, target: 65 },
]

// ---- Faculty: radar chart – skill dimensions ----
export const facultyRadarData = [
  { subject: 'Research', value: 85, fullMark: 100 },
  { subject: 'Teaching', value: 65, fullMark: 100 },
  { subject: 'Service', value: 50, fullMark: 100 },
  { subject: 'Industry', value: 70, fullMark: 100 },
  { subject: 'Development', value: 60, fullMark: 100 },
]

// ---- HOD: faculty performance scatter ----
export const facultyPerformanceData = [
  { name: 'Dr. Ramesh', activities: 28, points: 510 },
  { name: 'Dr. Rajesh Kumar', activities: 24, points: 420 },
  { name: 'Prof. Anitha Devi', activities: 12, points: 210 },
  { name: 'Dr. Lakshmi Priya', activities: 16, points: 290 },
  { name: 'Dr. Ramesh B', activities: 19, points: 330 },
  { name: 'Dr. Priya Sharma', activities: 18, points: 345 },
]

// ---- HOD: department category performance ----
export const deptCategoryData = [
  { category: 'Research', CSE: 95, IT: 72, ECE: 85, EEE: 60 },
  { category: 'Teaching', CSE: 70, IT: 65, ECE: 55, EEE: 75 },
  { category: 'Prof Dev', CSE: 80, IT: 90, ECE: 60, EEE: 50 },
  { category: 'Service', CSE: 55, IT: 40, ECE: 45, EEE: 35 },
  { category: 'Industry', CSE: 65, IT: 80, ECE: 70, EEE: 45 },
]

// ---- HOD: monthly approval funnel ----
export const approvalFunnelData = [
  { month: 'Oct', submitted: 58, reviewed: 52, approved: 51, rejected: 1 },
  { month: 'Nov', submitted: 65, reviewed: 58, approved: 55, rejected: 3 },
  { month: 'Dec', submitted: 48, reviewed: 45, approved: 42, rejected: 3 },
  { month: 'Jan', submitted: 72, reviewed: 65, approved: 60, rejected: 5 },
  { month: 'Feb', submitted: 35, reviewed: 28, approved: 22, rejected: 6 },
]

// ---- Dean: department comparison radar ----
export const deptRadarData = [
  { metric: 'Research', CSE: 95, IT: 72, ECE: 85, EEE: 60, MECH: 50, CIVIL: 40 },
  { metric: 'Teaching', CSE: 70, IT: 65, ECE: 55, EEE: 75, MECH: 60, CIVIL: 70 },
  { metric: 'Prof Dev', CSE: 80, IT: 90, ECE: 60, EEE: 50, MECH: 45, CIVIL: 55 },
  { metric: 'Service', CSE: 55, IT: 40, ECE: 45, EEE: 35, MECH: 65, CIVIL: 50 },
  { metric: 'Industry', CSE: 65, IT: 80, ECE: 70, EEE: 45, MECH: 75, CIVIL: 35 },
]

// ---- Dean: yearly comparison ----
export const yearlyComparisonData = [
  { month: 'Sep', thisYear: 1250, lastYear: 980 },
  { month: 'Oct', thisYear: 1680, lastYear: 1200 },
  { month: 'Nov', thisYear: 1920, lastYear: 1450 },
  { month: 'Dec', thisYear: 1450, lastYear: 1100 },
  { month: 'Jan', thisYear: 2150, lastYear: 1600 },
  { month: 'Feb', thisYear: 980, lastYear: 1350 },
]

// ---- Dean: activity type distribution across college ----
export const collegeActivityTypeData = [
  { type: 'Journal Papers', count: 82, color: '#3b82f6' },
  { type: 'Conference Papers', count: 63, color: '#6366f1' },
  { type: 'Patents', count: 12, color: '#8b5cf6' },
  { type: 'FDP/Workshops', count: 98, color: '#10b981' },
  { type: 'Certifications', count: 75, color: '#14b8a6' },
  { type: 'Guest Lectures', count: 45, color: '#f59e0b' },
  { type: 'Events Organized', count: 38, color: '#f97316' },
  { type: 'Consultancy', count: 42, color: '#ef4444' },
  { type: 'Mentoring', count: 55, color: '#ec4899' },
  { type: 'Book Chapters', count: 18, color: '#a855f7' },
]

// ---- Dean: faculty growth over semesters ----
export const facultyGrowthData = [
  { semester: '2022-I', active: 155, new: 12 },
  { semester: '2022-II', active: 162, new: 10 },
  { semester: '2023-I', active: 170, new: 14 },
  { semester: '2023-II', active: 178, new: 11 },
  { semester: '2024-I', active: 185, new: 13 },
  { semester: '2024-II', active: 192, new: 9 },
  { semester: '2025-I', active: 198, new: 8 },
]

// ---- Verification: daily review volume ----
export const dailyReviewData = [
  { day: 'Mon', reviewed: 6, approved: 5, rejected: 1 },
  { day: 'Tue', reviewed: 8, approved: 7, rejected: 1 },
  { day: 'Wed', reviewed: 4, approved: 3, rejected: 1 },
  { day: 'Thu', reviewed: 7, approved: 6, rejected: 1 },
  { day: 'Fri', reviewed: 5, approved: 5, rejected: 0 },
  { day: 'Sat', reviewed: 2, approved: 2, rejected: 0 },
  { day: 'Sun', reviewed: 0, approved: 0, rejected: 0 },
]

// ---- Verification: review time distribution ----
export const reviewTimeData = [
  { range: '< 1 hr', count: 12 },
  { range: '1-4 hrs', count: 28 },
  { range: '4-12 hrs', count: 18 },
  { range: '12-24 hrs', count: 8 },
  { range: '1-2 days', count: 5 },
  { range: '2+ days', count: 2 },
]

// ---- Verification: category-wise pending ----
export const categoryPendingData = [
  { category: 'Research', pending: 3, color: '#3b82f6' },
  { category: 'Teaching', pending: 1, color: '#10b981' },
  { category: 'Prof Dev', pending: 2, color: '#f59e0b' },
  { category: 'Service', pending: 0, color: '#8b5cf6' },
  { category: 'Industry', pending: 1, color: '#ef4444' },
]

// ---- Verification: weekly approval trend ----
export const weeklyApprovalTrend = [
  { week: 'W1', approved: 12, rejected: 2, pending: 3 },
  { week: 'W2', approved: 15, rejected: 1, pending: 5 },
  { week: 'W3', approved: 10, rejected: 3, pending: 4 },
  { week: 'W4', approved: 18, rejected: 2, pending: 7 },
]

// ---- Admin: user growth over time ----
export const userGrowthData = [
  { month: 'Jul 2025', users: 175, active: 162 },
  { month: 'Aug 2025', users: 180, active: 168 },
  { month: 'Sep 2025', users: 183, active: 171 },
  { month: 'Oct 2025', users: 188, active: 176 },
  { month: 'Nov 2025', users: 191, active: 180 },
  { month: 'Dec 2025', users: 193, active: 181 },
  { month: 'Jan 2026', users: 196, active: 184 },
  { month: 'Feb 2026', users: 198, active: 185 },
]

// ---- Admin: role distribution ----
export const roleDistributionData = [
  { role: 'Faculty', count: 165, color: '#3b82f6' },
  { role: 'Student', count: 120, color: '#6366f1' },
  { role: 'HOD', count: 6, color: '#10b981' },
  { role: 'Dean', count: 2, color: '#8b5cf6' },
  { role: 'Verification', count: 8, color: '#f59e0b' },
  { role: 'Admin', count: 3, color: '#ef4444' },
]

// ---- Admin: activity volume by department ----
export const deptActivityVolumeData = [
  { dept: 'CSE', activities: 312, points: 12825 },
  { dept: 'IT', dept2: 'Information Tech', activities: 198, points: 7350 },
  { dept: 'ECE', activities: 256, points: 9880 },
  { dept: 'EEE', activities: 167, points: 6160 },
  { dept: 'MECH', activities: 210, points: 8225 },
  { dept: 'CIVIL', activities: 134, points: 4620 },
]

// ---- Admin: system health metrics ----
export const systemHealthData = [
  { hour: '00:00', cpu: 12, memory: 45, requests: 5 },
  { hour: '04:00', cpu: 8, memory: 42, requests: 2 },
  { hour: '08:00', cpu: 35, memory: 52, requests: 45 },
  { hour: '10:00', cpu: 68, memory: 65, requests: 120 },
  { hour: '12:00', cpu: 45, memory: 58, requests: 85 },
  { hour: '14:00', cpu: 72, memory: 68, requests: 150 },
  { hour: '16:00', cpu: 55, memory: 62, requests: 95 },
  { hour: '18:00', cpu: 30, memory: 50, requests: 40 },
  { hour: '20:00', cpu: 18, memory: 46, requests: 15 },
  { hour: '22:00', cpu: 10, memory: 44, requests: 8 },
]

// ---- Admin: monthly login stats ----
export const loginStatsData = [
  { month: 'Sep', logins: 1250, unique: 162 },
  { month: 'Oct', logins: 1480, unique: 170 },
  { month: 'Nov', logins: 1320, unique: 168 },
  { month: 'Dec', logins: 980, unique: 155 },
  { month: 'Jan', logins: 1550, unique: 178 },
  { month: 'Feb', logins: 820, unique: 160 },
]

// ============================================================
// PERSONALIZED DATA HELPERS
// ============================================================

// Map department ids to department short names
const departmentIdMap: Record<number, string> = {
  1: 'CSE',
  2: 'IT',
  3: 'ECE',
  4: 'EEE',
  5: 'MECH',
  6: 'CIVIL',
}

// All activities across the system (faculty-specific)
const allActivities: Activity[] = [
  // Dr. Priya Sharma (id:1) - CSE
  { id: 1, title: 'Published paper in IEEE Transactions on Neural Networks', type: 'Journal Publication', category: 'Research', date: '2026-01-15', status: 'approved', points: 50, facultyName: 'Dr. Priya Sharma', facultyId: 1, department: 'CSE' },
  { id: 2, title: 'Attended FDP on Machine Learning at IIT Madras', type: 'FDP/Workshop', category: 'Professional Development', date: '2026-01-08', status: 'approved', points: 20, facultyName: 'Dr. Priya Sharma', facultyId: 1, department: 'CSE' },
  { id: 3, title: 'Filed patent for IoT-based Smart Agriculture System', type: 'Patent', category: 'Research', date: '2025-12-20', status: 'approved', points: 75, facultyName: 'Dr. Priya Sharma', facultyId: 1, department: 'CSE' },
  { id: 4, title: 'Guest lecture at Anna University on Cloud Computing', type: 'Guest Lecture', category: 'Teaching', date: '2026-01-22', status: 'pending', points: 15, facultyName: 'Dr. Priya Sharma', facultyId: 1, department: 'CSE' },
  { id: 5, title: 'Organized National Workshop on Cybersecurity', type: 'Event Organized', category: 'Service', date: '2025-12-10', status: 'approved', points: 30, facultyName: 'Dr. Priya Sharma', facultyId: 1, department: 'CSE' },
  { id: 6, title: 'Conference paper at ICACCI 2026', type: 'Conference Paper', category: 'Research', date: '2026-02-01', status: 'pending', points: 35, facultyName: 'Dr. Priya Sharma', facultyId: 1, department: 'CSE' },
  { id: 7, title: 'Completed NPTEL certification on Deep Learning', type: 'Certification', category: 'Professional Development', date: '2025-11-28', status: 'approved', points: 15, facultyName: 'Dr. Priya Sharma', facultyId: 1, department: 'CSE' },
  { id: 8, title: 'Mentored 3 students for Smart India Hackathon', type: 'Student Mentoring', category: 'Teaching', date: '2025-12-05', status: 'approved', points: 20, facultyName: 'Dr. Priya Sharma', facultyId: 1, department: 'CSE' },
  { id: 9, title: 'Book chapter in Springer: AI in Healthcare', type: 'Book Chapter', category: 'Research', date: '2026-02-05', status: 'pending', points: 40, facultyName: 'Dr. Priya Sharma', facultyId: 1, department: 'CSE' },
  { id: 10, title: 'Industry consultancy project with TCS', type: 'Consultancy', category: 'Industry', date: '2025-11-15', status: 'approved', points: 45, facultyName: 'Dr. Priya Sharma', facultyId: 1, department: 'CSE' },
  { id: 11, title: 'Webinar on Edge Computing Trends', type: 'Guest Lecture', category: 'Teaching', date: '2025-10-20', status: 'approved', points: 10, facultyName: 'Dr. Priya Sharma', facultyId: 1, department: 'CSE' },
  { id: 12, title: 'Review for ACM Computing Surveys', type: 'Journal Review', category: 'Service', date: '2025-10-05', status: 'approved', points: 10, facultyName: 'Dr. Priya Sharma', facultyId: 1, department: 'CSE' },
  { id: 13, title: 'Python Workshop for First-Year Students', type: 'FDP/Workshop', category: 'Teaching', date: '2025-09-18', status: 'approved', points: 15, facultyName: 'Dr. Priya Sharma', facultyId: 1, department: 'CSE' },
  { id: 14, title: 'Published survey on Federated Learning in Elsevier', type: 'Journal Publication', category: 'Research', date: '2025-09-10', status: 'approved', points: 50, facultyName: 'Dr. Priya Sharma', facultyId: 1, department: 'CSE' },
  { id: 15, title: 'AWS Cloud Practitioner Certification', type: 'Certification', category: 'Professional Development', date: '2025-09-02', status: 'approved', points: 15, facultyName: 'Dr. Priya Sharma', facultyId: 1, department: 'CSE' },
  { id: 16, title: 'Quiz committee member – University Fest', type: 'Event Organized', category: 'Service', date: '2025-08-28', status: 'approved', points: 10, facultyName: 'Dr. Priya Sharma', facultyId: 1, department: 'CSE' },
  { id: 17, title: 'IoT Lab Development – Infosys Partnership', type: 'Consultancy', category: 'Industry', date: '2025-08-15', status: 'approved', points: 30, facultyName: 'Dr. Priya Sharma', facultyId: 1, department: 'CSE' },
  { id: 18, title: 'FDP on Blockchain at NIT Trichy (5 days)', type: 'FDP/Workshop', category: 'Professional Development', date: '2025-08-01', status: 'rejected', points: 20, facultyName: 'Dr. Priya Sharma', facultyId: 1, department: 'CSE' },

  // Dr. Rajesh Kumar (id:2) - CSE - HOD
  { id: 201, title: 'Research paper on Quantum Algorithms in IEEE Access', type: 'Journal Publication', category: 'Research', date: '2026-01-25', status: 'approved', points: 50, facultyName: 'Dr. Rajesh Kumar', facultyId: 2, department: 'CSE' },
  { id: 202, title: 'Keynote at National Conference on AI', type: 'Guest Lecture', category: 'Teaching', date: '2026-01-10', status: 'approved', points: 25, facultyName: 'Dr. Rajesh Kumar', facultyId: 2, department: 'CSE' },
  { id: 203, title: 'FDP on Data Science – 5 days', type: 'FDP/Workshop', category: 'Professional Development', date: '2025-12-15', status: 'approved', points: 20, facultyName: 'Dr. Rajesh Kumar', facultyId: 2, department: 'CSE' },
  { id: 204, title: 'Patent filed: AI-based Crop Disease Detection', type: 'Patent', category: 'Research', date: '2025-12-01', status: 'approved', points: 75, facultyName: 'Dr. Rajesh Kumar', facultyId: 2, department: 'CSE' },
  { id: 205, title: 'Industry project with Wipro on Smart Grid', type: 'Consultancy', category: 'Industry', date: '2025-11-20', status: 'approved', points: 45, facultyName: 'Dr. Rajesh Kumar', facultyId: 2, department: 'CSE' },
  { id: 206, title: 'Organized Symposium on Cloud Security', type: 'Event Organized', category: 'Service', date: '2025-11-10', status: 'approved', points: 30, facultyName: 'Dr. Rajesh Kumar', facultyId: 2, department: 'CSE' },
  { id: 207, title: 'Conference paper at IEEE TENCON 2026', type: 'Conference Paper', category: 'Research', date: '2026-02-03', status: 'pending', points: 35, facultyName: 'Dr. Rajesh Kumar', facultyId: 2, department: 'CSE' },
  { id: 208, title: 'Book: "Machine Learning Fundamentals" – Springer', type: 'Book Chapter', category: 'Research', date: '2026-01-30', status: 'pending', points: 60, facultyName: 'Dr. Rajesh Kumar', facultyId: 2, department: 'CSE' },
  { id: 209, title: 'Google TensorFlow Developer Certificate', type: 'Certification', category: 'Professional Development', date: '2025-10-25', status: 'approved', points: 20, facultyName: 'Dr. Rajesh Kumar', facultyId: 2, department: 'CSE' },
  { id: 210, title: 'Mentored students for ACM ICPC Regional', type: 'Student Mentoring', category: 'Teaching', date: '2025-10-12', status: 'approved', points: 20, facultyName: 'Dr. Rajesh Kumar', facultyId: 2, department: 'CSE' },
  { id: 211, title: 'Guest lecture at PSG Tech on Cybersecurity', type: 'Guest Lecture', category: 'Teaching', date: '2025-09-28', status: 'approved', points: 15, facultyName: 'Dr. Rajesh Kumar', facultyId: 2, department: 'CSE' },
  { id: 212, title: 'Published survey on Explainable AI in Springer', type: 'Journal Publication', category: 'Research', date: '2025-09-15', status: 'approved', points: 50, facultyName: 'Dr. Rajesh Kumar', facultyId: 2, department: 'CSE' },
  { id: 213, title: 'Chaired session at ICSCC Conference', type: 'Conference Paper', category: 'Research', date: '2025-09-05', status: 'approved', points: 15, facultyName: 'Dr. Rajesh Kumar', facultyId: 2, department: 'CSE' },
  { id: 214, title: 'Azure Solutions Architect Certification', type: 'Certification', category: 'Professional Development', date: '2025-08-20', status: 'approved', points: 20, facultyName: 'Dr. Rajesh Kumar', facultyId: 2, department: 'CSE' },
  { id: 215, title: 'NBA Documentation Committee Lead', type: 'Event Organized', category: 'Service', date: '2025-08-10', status: 'approved', points: 10, facultyName: 'Dr. Rajesh Kumar', facultyId: 2, department: 'CSE' },
  { id: 216, title: 'Summer Internship Coordinator – CSE Dept', type: 'Student Mentoring', category: 'Service', date: '2025-07-15', status: 'approved', points: 10, facultyName: 'Dr. Rajesh Kumar', facultyId: 2, department: 'CSE' },

  // Other CSE faculty activities
  { id: 301, title: 'Published paper in Elsevier - Computer Networks', type: 'Journal Publication', category: 'Research', date: '2026-02-03', status: 'pending', points: 50, facultyName: 'Dr. Ramesh', facultyId: 5, department: 'CSE' },
  { id: 302, title: 'Keynote at International AI Summit', type: 'Guest Lecture', category: 'Teaching', date: '2026-01-30', status: 'pending', points: 25, facultyName: 'Dr. Lakshmi Priya', facultyId: 7, department: 'CSE' },
  { id: 303, title: 'Organized Hackathon with 500+ participants', type: 'Event Organized', category: 'Service', date: '2026-02-07', status: 'pending', points: 30, facultyName: 'Dr. Ramesh B', facultyId: 10, department: 'CSE' },
  { id: 304, title: 'FDP on Quantum Computing - 5 days', type: 'FDP/Workshop', category: 'Professional Development', date: '2026-01-25', status: 'approved', points: 20, facultyName: 'Prof. Anitha Devi', facultyId: 3, department: 'CSE' },
  { id: 305, title: 'Paper on Deep Reinforcement Learning at NeurIPS', type: 'Conference Paper', category: 'Research', date: '2025-12-18', status: 'approved', points: 55, facultyName: 'Dr. Ramesh', facultyId: 5, department: 'CSE' },

  // Other department activities
  { id: 401, title: 'AWS Solutions Architect Certification', type: 'Certification', category: 'Professional Development', date: '2026-01-28', status: 'pending', points: 20, facultyName: 'Prof. Karthik R', facultyId: 6, department: 'IT' },
  { id: 402, title: 'Patent granted: Blockchain-based Voting System', type: 'Patent', category: 'Research', date: '2026-02-01', status: 'pending', points: 75, facultyName: 'Dr. Arun Kumar', facultyId: 8, department: 'ECE' },
  { id: 403, title: 'Industry project with Infosys on Edge AI', type: 'Consultancy', category: 'Industry', date: '2026-01-18', status: 'pending', points: 45, facultyName: 'Prof. Sathya N', facultyId: 11, department: 'IT' },
  { id: 404, title: 'FDP on Quantum Computing - 5 days', type: 'FDP/Workshop', category: 'Professional Development', date: '2026-01-25', status: 'pending', points: 20, facultyName: 'Prof. Divya S', facultyId: 9, department: 'EEE' },
]

/** Get personalized faculty dashboard data based on the logged-in user */
export function getPersonalizedFacultyData(userId: number, userName: string) {
  const me = facultyMembers.find(f => f.id === userId)
    || facultyMembers.find(f => f.name === userName)
  const myDept = me?.department || 'CSE'

  // Activities for this specific faculty
  const myActs = allActivities
    .filter(a => a.facultyId === userId || a.facultyName === userName)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const approved = myActs.filter(a => a.status === 'approved').length
  const pending = myActs.filter(a => a.status === 'pending').length
  const rejected = myActs.filter(a => a.status === 'rejected').length
  const totalPoints = myActs.filter(a => a.status === 'approved').reduce((s, a) => s + a.points, 0)

  // Build rank from leaderboard or faculty list
  const sorted = [...facultyMembers].sort((a, b) => b.totalPoints - a.totalPoints)
  const rank = sorted.findIndex(f => f.id === userId || f.name === userName) + 1

  // Category breakdown for this faculty
  const catMap: Record<string, { count: number; points: number }> = {}
  myActs.forEach(a => {
    if (!catMap[a.category]) catMap[a.category] = { count: 0, points: 0 }
    catMap[a.category].count++
    catMap[a.category].points += a.points
  })
  const catColors: Record<string, string> = {
    Research: '#3b82f6', Teaching: '#10b981', 'Professional Development': '#f59e0b',
    Service: '#8b5cf6', Industry: '#ef4444',
  }
  const myCategoryBreakdown = Object.entries(catMap).map(([cat, v]) => ({
    name: cat, value: v.count, color: catColors[cat] || '#94a3b8',
  }))

  // Activity status distribution
  const myStatusData = [
    { name: 'Approved', value: approved, color: '#10b981' },
    ...(pending > 0 ? [{ name: 'Pending', value: pending, color: '#f59e0b' }] : []),
    ...(rejected > 0 ? [{ name: 'Rejected', value: rejected, color: '#ef4444' }] : []),
  ]

  // Weekly points (seeded from total to give realistic per-week values)
  const weeklyBase = Math.max(1, Math.round(totalPoints / 8))
  const seed = userId * 7
  const myWeeklyData = weeklyPointsData.map((w, i) => ({
    week: w.week,
    points: Math.round(weeklyBase * (0.5 + ((seed + i * 13) % 10) / 10)),
    activities: Math.max(1, Math.round(myActs.length / 8 * (0.5 + ((seed + i * 7) % 10) / 10))),
  }))

  // Target vs actual
  const monthlyBase = Math.round(totalPoints / 6)
  const myGoalData = pointsGoalData.map((m, i) => ({
    month: m.month,
    actual: Math.round(monthlyBase * (0.6 + ((seed + i * 11) % 10) / 12)),
    target: Math.round(monthlyBase * (0.8 + i * 0.05)),
  }))

  // Radar data from categories
  const maxCat = Math.max(...Object.values(catMap).map(v => v.count), 1)
  const myRadarData = [
    { subject: 'Research', value: Math.round(((catMap['Research']?.count || 0) / maxCat) * 100), fullMark: 100 },
    { subject: 'Teaching', value: Math.round(((catMap['Teaching']?.count || 0) / maxCat) * 100), fullMark: 100 },
    { subject: 'Service', value: Math.round(((catMap['Service']?.count || 0) / maxCat) * 100), fullMark: 100 },
    { subject: 'Industry', value: Math.round(((catMap['Industry']?.count || 0) / maxCat) * 100), fullMark: 100 },
    { subject: 'Development', value: Math.round(((catMap['Professional Development']?.count || 0) / maxCat) * 100), fullMark: 100 },
  ]

  return {
    stats: {
      totalActivities: myActs.length,
      approved, pending, rejected,
      totalPoints,
      rank: rank || 1,
      totalFaculty: sorted.length,
      pointsTrend: +12,
    },
    activities: myActs,
    statusData: myStatusData,
    weeklyData: myWeeklyData,
    goalData: myGoalData,
    radarData: myRadarData,
    categoryBreakdown: myCategoryBreakdown,
    department: myDept,
    designation: me?.designation || 'Faculty',
  }
}

/** Get personalized HOD dashboard data based on the HOD's department */
export function getPersonalizedHodData(userId: number, userName: string, departmentId?: number) {
  const deptShort = departmentId ? departmentIdMap[departmentId] || 'CSE' : 'CSE'
  const dept = departmentStats.find(d => d.shortName === deptShort) || departmentStats[0]

  // Faculty in this department
  const deptFaculty = facultyMembers.filter(f => f.department === deptShort)
  const deptActivities = allActivities.filter(a => a.department === deptShort)

  // Pending approvals for this department
  const deptPending = deptActivities.filter(a => a.status === 'pending')

  // Top performers in this department
  const deptLeaderboard = [...deptFaculty]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((f, i) => ({
      rank: i + 1,
      name: f.name,
      department: f.department,
      points: f.totalPoints,
      activities: f.activitiesCount,
      badge: i === 0 ? 'gold' : i < 3 ? 'silver' : i < 5 ? 'bronze' : 'none',
    }))

  // Category breakdown for this department
  const catMap: Record<string, number> = {}
  deptActivities.forEach(a => {
    catMap[a.category] = (catMap[a.category] || 0) + 1
  })
  const catColors: Record<string, string> = {
    Research: '#3b82f6', Teaching: '#10b981', 'Professional Development': '#f59e0b',
    Service: '#8b5cf6', Industry: '#ef4444',
  }
  const deptCategoryBreakdown = Object.entries(catMap).map(([cat, count]) => ({
    name: cat, value: count, color: catColors[cat] || '#94a3b8',
  }))

  return {
    stats: {
      departmentName: dept.name,
      departmentShort: deptShort,
      totalFaculty: deptFaculty.length || dept.facultyCount,
      activeFaculty: Math.round((deptFaculty.length || dept.facultyCount) * 0.93),
      totalActivities: deptActivities.length || dept.totalActivities,
      pendingApprovals: deptPending.length || dept.pendingApprovals,
      avgPointsPerFaculty: dept.avgPoints,
      topPerformer: deptLeaderboard[0]?.name || dept.topPerformer,
      topPerformerPoints: deptLeaderboard[0]?.points || 0,
      activitiesGrowth: +15,
    },
    faculty: deptFaculty,
    activities: deptActivities,
    pendingActivities: deptPending,
    leaderboard: deptLeaderboard,
    categoryBreakdown: deptCategoryBreakdown,
  }
}

// ============================================================
// COLLEGE PAGE – DEEP ANALYTICS DATA
// ============================================================

// ---- Department quarterly growth trends (activities per quarter) ----
export const deptQuarterlyGrowth = [
  { quarter: 'Q1 2025', CSE: 68, IT: 42, ECE: 55, EEE: 35, MECH: 44, CIVIL: 28 },
  { quarter: 'Q2 2025', CSE: 75, IT: 48, ECE: 62, EEE: 40, MECH: 50, CIVIL: 32 },
  { quarter: 'Q3 2025', CSE: 82, IT: 52, ECE: 68, EEE: 44, MECH: 55, CIVIL: 35 },
  { quarter: 'Q4 2025', CSE: 87, IT: 56, ECE: 71, EEE: 48, MECH: 61, CIVIL: 39 },
]

// ---- Department year-over-year growth rates (%) ----
export const deptYoYGrowth = [
  { dept: 'CSE', growth2024: 18, growth2025: 24, growth2026: 28 },
  { dept: 'IT', growth2024: 12, growth2025: 20, growth2026: 22 },
  { dept: 'ECE', growth2024: 15, growth2025: 18, growth2026: 21 },
  { dept: 'EEE', growth2024: 8, growth2025: 14, growth2026: 16 },
  { dept: 'MECH', growth2024: 10, growth2025: 16, growth2026: 19 },
  { dept: 'CIVIL', growth2024: 5, growth2025: 10, growth2026: 14 },
]

// ---- Department research vs teaching balance ----
export const deptResearchTeachingBalance = [
  { dept: 'CSE', research: 62, teaching: 38 },
  { dept: 'IT', research: 45, teaching: 55 },
  { dept: 'ECE', research: 58, teaching: 42 },
  { dept: 'EEE', research: 40, teaching: 60 },
  { dept: 'MECH', research: 48, teaching: 52 },
  { dept: 'CIVIL', research: 35, teaching: 65 },
]

// ---- Department monthly points trend (for sparklines & growth) ----
export const deptMonthlyPoints = [
  { month: 'Sep', CSE: 2250, IT: 1350, ECE: 1850, EEE: 1050, MECH: 1450, CIVIL: 820 },
  { month: 'Oct', CSE: 2480, IT: 1520, ECE: 1980, EEE: 1180, MECH: 1620, CIVIL: 900 },
  { month: 'Nov', CSE: 2680, IT: 1680, ECE: 2120, EEE: 1280, MECH: 1750, CIVIL: 980 },
  { month: 'Dec', CSE: 2100, IT: 1280, ECE: 1720, EEE: 1020, MECH: 1380, CIVIL: 780 },
  { month: 'Jan', CSE: 3050, IT: 1880, ECE: 2380, EEE: 1420, MECH: 1920, CIVIL: 1080 },
  { month: 'Feb', CSE: 1650, IT: 980, ECE: 1280, EEE: 720, MECH: 1050, CIVIL: 580 },
]

// ---- Department quality metrics (publications per category) ----
export const deptQualityMetrics = [
  { dept: 'CSE', journals: 28, conferences: 22, patents: 5, bookChapters: 6, certifications: 18 },
  { dept: 'IT', journals: 16, conferences: 14, patents: 2, bookChapters: 3, certifications: 22 },
  { dept: 'ECE', journals: 22, conferences: 18, patents: 4, bookChapters: 4, certifications: 14 },
  { dept: 'EEE', journals: 12, conferences: 10, patents: 1, bookChapters: 2, certifications: 10 },
  { dept: 'MECH', journals: 14, conferences: 12, patents: 3, bookChapters: 2, certifications: 8 },
  { dept: 'CIVIL', journals: 8, conferences: 8, patents: 1, bookChapters: 1, certifications: 6 },
]

// ---- Faculty distribution tiers per department ----
export const deptFacultyTiers = [
  { dept: 'CSE', highPerformers: 12, midPerformers: 22, lowPerformers: 11 },
  { dept: 'IT', highPerformers: 7, midPerformers: 15, lowPerformers: 8 },
  { dept: 'ECE', highPerformers: 10, midPerformers: 18, lowPerformers: 10 },
  { dept: 'EEE', highPerformers: 5, midPerformers: 14, lowPerformers: 9 },
  { dept: 'MECH', highPerformers: 8, midPerformers: 17, lowPerformers: 10 },
  { dept: 'CIVIL', highPerformers: 4, midPerformers: 10, lowPerformers: 8 },
]

// ---- College overall semester trend ----
export const collegeSemesterTrend = [
  { semester: '2022-I', activities: 580, points: 16800, avgPerFaculty: 108, approvalRate: 82 },
  { semester: '2022-II', activities: 640, points: 18500, avgPerFaculty: 114, approvalRate: 84 },
  { semester: '2023-I', activities: 720, points: 21200, avgPerFaculty: 125, approvalRate: 85 },
  { semester: '2023-II', activities: 810, points: 24500, avgPerFaculty: 138, approvalRate: 86 },
  { semester: '2024-I', activities: 920, points: 28200, avgPerFaculty: 152, approvalRate: 87 },
  { semester: '2024-II', activities: 1050, points: 32800, avgPerFaculty: 171, approvalRate: 88 },
  { semester: '2025-I', activities: 1277, points: 38600, avgPerFaculty: 195, approvalRate: 89 },
]

// ---- Department approval efficiency ----
export const deptApprovalEfficiency = [
  { dept: 'CSE', avgDaysToApprove: 1.2, approvalRate: 91, rejectionRate: 9 },
  { dept: 'IT', avgDaysToApprove: 0.8, approvalRate: 93, rejectionRate: 7 },
  { dept: 'ECE', avgDaysToApprove: 1.5, approvalRate: 88, rejectionRate: 12 },
  { dept: 'EEE', avgDaysToApprove: 1.0, approvalRate: 90, rejectionRate: 10 },
  { dept: 'MECH', avgDaysToApprove: 1.8, approvalRate: 85, rejectionRate: 15 },
  { dept: 'CIVIL', avgDaysToApprove: 2.1, approvalRate: 82, rejectionRate: 18 },
]

// ============================================================
// DEPARTMENT PAGE – KPI HEATMAP & TARGETS
// ============================================================

export interface FacultyKPI {
  name: string
  research: number
  publications: number
  teaching: number
  events: number
  innovation: number
  engagement: number
}

export const facultyKpiData: FacultyKPI[] = [
  { name: 'Dr. Rajesh Kumar', research: 95, publications: 92, teaching: 88, events: 85, innovation: 90, engagement: 92 },
  { name: 'Dr. Priya Sharma', research: 88, publications: 85, teaching: 92, events: 82, innovation: 80, engagement: 88 },
  { name: 'Dr. Amit Patel', research: 82, publications: 78, teaching: 85, events: 88, innovation: 75, engagement: 82 },
  { name: 'Prof. Neha Gupta', research: 72, publications: 68, teaching: 82, events: 75, innovation: 62, engagement: 70 },
  { name: 'Dr. Vikram Singh', research: 68, publications: 62, teaching: 75, events: 58, innovation: 52, engagement: 60 },
  { name: 'Dr. Anjali Desai', research: 58, publications: 52, teaching: 68, events: 48, innovation: 45, engagement: 55 },
  { name: 'Prof. Sanjay Rao', research: 45, publications: 38, teaching: 55, events: 42, innovation: 35, engagement: 48 },
  { name: 'Dr. Meera Iyer', research: 38, publications: 32, teaching: 48, events: 35, innovation: 28, engagement: 40 },
]

export interface DepartmentTarget {
  label: string
  current: number
  target: number
  unit: string
  dueDate: string
}

export const departmentTargets: DepartmentTarget[] = [
  { label: 'Research Publications', current: 165, target: 200, unit: 'papers', dueDate: '10/7/2026' },
  { label: 'Research Funding', current: 3800000, target: 5000000, unit: 'Rs', dueDate: '10/6/2026' },
  { label: 'Events Organized', current: 132, target: 180, unit: 'events', dueDate: '11/5/2026' },
  { label: 'Innovation Projects', current: 68, target: 100, unit: 'projects', dueDate: '9/8/2026' },
]

export interface DeptPerformanceIndex {
  score: number
  maxScore: number
  rank: number
  totalDepts: number
  trend: number
  facultyCount: number
  activeFaculty: number
  newThisYear: number
  achievements: number
  achievementsGrowth: number
  pendingApprovals: number
  urgentPending: number
  targetRate: number
}

export const deptPerformanceIndex: DeptPerformanceIndex = {
  score: 82,
  maxScore: 100,
  rank: 2,
  totalDepts: 6,
  trend: 12.5,
  facultyCount: 26,
  activeFaculty: 26,
  newThisYear: 3,
  achievements: 387,
  achievementsGrowth: 28.5,
  pendingApprovals: 12,
  urgentPending: 3,
  targetRate: 76,
}
