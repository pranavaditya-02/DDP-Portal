import axios, { AxiosInstance } from 'axios';

export interface RoleResourceRecord {
  id: string;
  label: string;
  icon: string;
  href: string;
  group: string;
}

export interface RoleAccessSummary {
  resources: RoleResourceRecord[];
  routePaths: string[];
}

export interface RoleRecord {
  id: number;
  name: string;
  description: string;
  passwordPrefix: string;
  editAccess: boolean;
  deleteAccess: boolean;
  status: boolean;
  resources: string[];
  isSystem: boolean;
  createdAt: string;
  usersCount: number;
}

export interface UserDepartmentOption {
  id: number;
  code: string;
  name: string;
}

export interface UserRoleOption {
  id: number;
  value: string;
  label: string;
  dbName: string;
}

export interface UserDesignationOption {
  id: number;
  name: string;
}

export interface UsersLookupMetadata {
  departments: UserDepartmentOption[];
  roles: UserRoleOption[];
  designations: UserDesignationOption[];
}

export interface DesignationTargetRuleRecord {
  designationId: number;
  designationName: string;
  facultyCount: number;
  academicYear: string;
  targets: Record<string, number>;
}

export interface WorkflowPlanTaskRecord {
  id: string;
  baseId: string;
  title: string;
  type: 'paper' | 'patent' | 'proposal';
  slotNo: number;
  deadlineISO: string;
  completed: boolean;
}

export interface WorkflowPlanRecord {
  academicYear: string;
  paperTargets: number;
  proposalSlots: number;
  patentEnabled: boolean;
  deadlineMap: Record<string, string>;
  completedTaskIds: string[];
  tasks: WorkflowPlanTaskRecord[];
}

export interface UpsertRolePayload {
  name: string;
  description: string;
  passwordPrefix?: string;
  editAccess: boolean;
  deleteAccess: boolean;
  status: boolean;
  resources: string[];
  isSystem?: boolean;
}

export interface EventMasterRecord {
  id: number;
  maximumCount: number;
  appliedCount: number;
  balanceCount: number;
  applyByStudent: boolean;
  eventCode: string;
  eventName: string;
  eventOrganizer: string | null;
  webLink: string | null;
  eventCategory: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  durationDays: number | null;
  eventLocation: string | null;
  eventLevel: string | null;
  state: string | null;
  country: string | null;
  withinBit: boolean;
  relatedToSpecialLab: boolean;
  department: string | null;
  competitionName: string | null;
  totalLevelOfCompetition: string | null;
  eligibleForRewards: boolean;
  winnerRewards: string | null;
  imgLink: string | null;
  createdDate: string;
  updatedDate: string;
}

export interface CreateEventPayload {
  maximumCount: number;
  appliedCount: number;
  applyByStudent: boolean;
  eventCode: string;
  eventName: string;
  eventOrganizer?: string | null;
  webLink?: string | null;
  eventCategory?: string | null;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  durationDays?: number | null;
  eventLocation?: string | null;
  eventLevel?: string | null;
  state?: string | null;
  country?: string | null;
  withinBit: boolean;
  relatedToSpecialLab: boolean;
  department?: string | null;
  competitionName?: string | null;
  totalLevelOfCompetition?: string | null;
  eligibleForRewards: boolean;
  winnerRewards?: string | null;
  imgLink?: string | null;
}

export interface EventRegistrationRecord {
  id: number;
  eventId: number;
  studentId: number | null;
  studentName: string;
  studentEmail: string | null;
  studentDepartment: string | null;
  eventCategory: string | null;
  activityEvent: string | null;
  fromDate: string | null;
  toDate: string | null;
  modeOfParticipation: string | null;
  iqacVerification: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string | null;
  verifiedBy: number | null;
  verifiedAt: string | null;
  createdDate: string;
  updatedDate: string;
  eventName: string;
  eventCode: string;
  eventOrganizer: string | null;
  eventLevel: string | null;
}

export interface CreateRegistrationPayload {
  eventId: number;
  studentName: string;
  studentDepartment?: string | null;
  eventCategory?: string | null;
  activityEvent?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  modeOfParticipation?: string | null;
  iqacVerification?: string | null;
}

export interface EventRegistrationRecord {
  id: number;
  eventId: number;
  studentId: number | null;
  studentName: string;
  studentEmail: string | null;
  studentDepartment: string | null;
  eventCategory: string | null;
  activityEvent: string | null;
  fromDate: string | null;
  toDate: string | null;
  modeOfParticipation: string | null;
  iqacVerification: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string | null;
  verifiedBy: number | null;
  verifiedAt: string | null;
  createdDate: string;
  updatedDate: string;
  eventName: string;
  eventCode: string;
  eventOrganizer: string | null;
  eventLevel: string | null;
}

export interface CreateRegistrationPayload {
  eventId: number;
  studentName: string;
  studentDepartment?: string | null;
  eventCategory?: string | null;
  activityEvent?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  modeOfParticipation?: string | null;
  iqacVerification?: string | null;
}

const DEFAULT_API_URL = 'http://localhost:5000/api';

function normalizeApiUrl(rawUrl?: string) {
  const urlValue = rawUrl?.toString().trim();
  if (!urlValue) return undefined;

  let normalizedUrl = urlValue;
  if (normalizedUrl.startsWith(':')) {
    normalizedUrl = `http://localhost${normalizedUrl}`;
  } else if (normalizedUrl.startsWith('//')) {
    normalizedUrl = `http:${normalizedUrl}`;
  } else if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(normalizedUrl)) {
    normalizedUrl = `http://${normalizedUrl}`;
  }

  try {
    return new URL(normalizedUrl).toString().replace(/\/+$/, '');
  } catch {
    return undefined;
  }
}

const apiBaseURL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL) || DEFAULT_API_URL;

const API_UNREACHABLE_MESSAGE = `Cannot reach API server at ${apiBaseURL}. Start the backend and verify NEXT_PUBLIC_API_URL/ALLOWED_ORIGINS.`

const client: AxiosInstance = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
});

let unauthorizedHandlingInProgress = false;

// Response interceptor to handle errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.error;

    if (status === 401 && typeof window !== 'undefined' && !unauthorizedHandlingInProgress) {
      unauthorizedHandlingInProgress = true;

      void fetch(`${apiBaseURL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      }).catch(() => undefined)
        .finally(() => {
          if (message?.toString().toLowerCase().includes('invalid') || message?.toString().toLowerCase().includes('expired') || status === 401) {
            window.location.href = '/login';
          }
          unauthorizedHandlingInProgress = false;
        });
    }

    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (error: unknown, fallback = 'Request failed') => {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.error
    if (typeof responseMessage === 'string' && responseMessage.trim().length > 0) {
      return responseMessage
    }

    if (error.code === 'ERR_NETWORK') {
      return API_UNREACHABLE_MESSAGE
    }

    if (typeof error.message === 'string' && error.message.trim().length > 0) {
      return error.message
    }
  }

  return fallback
}

export const apiClient = {
  // Auth endpoints
  register: async (data: {
    email: string;
    password: string;
    name: string;
    employeeId: string;
  }) => {
    const response = await client.post('/auth/register', data);
    return response.data;
  },

  loginWithGoogle: async (credential: string): Promise<{ message: string; user: any; access?: RoleAccessSummary; defaultRoute?: string }> => {
    const response = await client.post('/auth/google', {
      credential,
    });
    return response.data;
  },

  logout: async () => {
    const response = await client.post('/auth/logout');
    return response.data;
  },

  verify: async () => {
    const response = await client.post('/auth/verify');
    return response.data;
  },

  getMe: async () => {
    const response = await client.get('/auth/me');
    return response.data;
  },

  // Activity endpoints
  getMyActivities: async () => {
    const response = await client.get('/activities/my-activities');
    return response.data;
  },

  submitActivity: async (data: {
    activityTypeId: number;
    title: string;
    description: string;
    activityDate: string;
    proofDocumentPath?: string;
    additionalData?: Record<string, any>;
  }) => {
    const response = await client.post('/activities/submit', data);
    return response.data;
  },

  getPendingActivities: async (departmentId?: number) => {
    const response = await client.get('/activities/pending', {
      params: { departmentId },
    });
    return response.data;
  },

  approveActivity: async (activityId: number, pointsEarned: number) => {
    const response = await client.post(`/activities/${activityId}/approve`, {
      pointsEarned,
    });
    return response.data;
  },

  rejectActivity: async (activityId: number, rejectionReason: string) => {
    const response = await client.post(`/activities/${activityId}/reject`, {
      rejectionReason,
    });
    return response.data;
  },

  getDepartmentActivities: async (departmentId: number, academicYear?: string) => {
    const response = await client.get(`/activities/department/${departmentId}`, {
      params: { academicYear },
    });
    return response.data;
  },

  getActivityStats: async (departmentId: number, academicYear?: string) => {
    const response = await client.get(`/activities/stats/department/${departmentId}`, {
      params: { academicYear },
    });
    return response.data;
  },

  // Industries
  getIndustries: async () => {
    const response = await client.get('/industries');
    return response.data;
  },

  getActiveIndustries: async () => {
    const response = await client.get('/industries/active');
    return response.data;
  },

  getStudents: async (q?: string) => {
    const response = await client.get('/students', {
      params: q ? { q } : undefined,
    });
    return response.data;
  },

  getFaculties: async (q?: string) => {
    const response = await client.get('/faculties', {
      params: q ? { q } : undefined,
    });
    return response.data;
  },

  getJournalPublicationsApplied: async () => {
    const response = await client.get('/journal-publications-applied');
    return response.data;
  },

  createJournalPublicationApplied: async (formData: FormData) => {
    const response = await client.post('/journal-publications-applied', formData);
    return response.data;
  },

  createIndustry: async (data: {
    industry: string;
    address: string;
    website_link: string;
    active_now?: boolean;
  }) => {
    const response = await client.post('/industries', data);
    return response.data;
  },

  updateIndustry: async (id: number, data: {
    industry?: string;
    address?: string;
    website_link?: string;
    active_now?: boolean;
  }) => {
    const response = await client.put(`/industries/${id}`, data);
    return response.data;
  },

  deleteIndustry: async (id: number) => {
    const response = await client.delete(`/industries/${id}`);
    return response.data;
  },

  createInternshipTracker: async (formData: FormData) => {
    const response = await client.post('/internship-tracker', formData);
    return response.data;
  },

  createPatentTracker: async (formData: FormData) => {
    const response = await client.post('/patent-tracker', formData);
    return response.data;
  },

  createPatentReport: async (formData: FormData) => {
    const response = await client.post('/patent-report', formData);
    return response.data;
  },

  getPatentTrackers: async () => {
    const response = await client.get('/patent-tracker');
    return response.data;
  },

  getPatentTrackerById: async (id: number) => {
    const response = await client.get(`/patent-tracker/${id}`);
    return response.data;
  },

  updatePatentTrackerIqac: async (id: number, iqac_verification: 'initiated' | 'approved' | 'declined', reject_reason?: string) => {
    const payload: Record<string, unknown> = { iqac_verification };
    if (reject_reason) payload.reject_reason = reject_reason;
    const response = await client.patch(`/patent-tracker/${id}/iqac`, payload);
    return response.data;
  },

  getPatentReports: async () => {
    const response = await client.get('/patent-report');
    return response.data;
  },

  getInternshipTrackers: async () => {
    const response = await client.get('/internship-tracker');
    return response.data;
  },

  getInternshipTrackerById: async (id: number) => {
    const response = await client.get(`/internship-tracker/${id}`);
    return response.data;
  },

  getAvailableTrackersByStudent: async (studentId: number) => {
    const response = await client.get(`/internship-tracker/student/${studentId}/available`);
    return response.data;
  },

  updateInternshipTrackerIqac: async (id: number, iqac_verification: 'initiated' | 'approved' | 'declined', reject_reason?: string) => {
    const payload: Record<string, unknown> = { iqac_verification };
    if (reject_reason) payload.reject_reason = reject_reason;
    const response = await client.patch(`/internship-tracker/${id}/iqac`, payload);
    return response.data;
  },

  createInternshipReport: async (formData: FormData) => {
    const response = await client.post('/internship-report', formData);
    return response.data;
  },

  updateInternshipReportIqac: async (id: number, iqac_verification: 'initiated' | 'approved' | 'declined', reject_reason?: string) => {
    const payload: Record<string, unknown> = { iqac_verification };
    if (reject_reason) payload.reject_reason = reject_reason;
    const response = await client.patch(`/internship-report/${id}/iqac`, payload);
    return response.data;
  },

  getInternshipReports: async () => {
    const response = await client.get('/internship-report');
    return response.data;
  },

  getInternshipReportById: async (id: number) => {
    const response = await client.get(`/internship-report/${id}`);
    return response.data;
  },

  getSpecialLabs: async () => {
    const response = await client.get('/internship-report/special-labs');
    return response.data;
  },

  getSdgGoals: async () => {
    const response = await client.get('/internship-report/sdg-goals');
    return response.data;
  },

  importIndustriesCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await client.post('/import/industries/csv', formData);

    return response.data;
  },

  importEventsAttendedCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await client.post('/import/events-attended/csv', formData);

    return response.data;
  },

  getEvents: async (params?: { sort?: 'asc' | 'desc' }): Promise<{ events: EventMasterRecord[] }> => {
    const searchParams = new URLSearchParams();

    if (params?.sort) {
      searchParams.set('sort', params.sort);
    }

    const response = await fetch(`/api/events${searchParams.toString() ? `?${searchParams.toString()}` : ''}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      throw new Error(errorPayload?.error || `Failed to load events (${response.status})`);
    }

    return response.json();
  },

  createEvent: async (data: CreateEventPayload): Promise<{ message: string; event: EventMasterRecord }> => {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      throw new Error(errorPayload?.error || `Failed to create event (${response.status})`);
    }

    return response.json();
  },

  registerForEvent: async (data: CreateRegistrationPayload): Promise<{ message: string; registration: EventRegistrationRecord }> => {
    const response = await client.post('/registrations', data);
    return response.data;
  },

  getVerificationRegistrations: async (status?: 'pending' | 'approved' | 'rejected'): Promise<{ registrations: EventRegistrationRecord[] }> => {
    const response = await client.get('/registrations/verification', {
      params: { status },
    });
    return response.data;
  },

  getRegistrationsByEventId: async (eventId: number, status?: 'pending' | 'approved' | 'rejected'): Promise<{ registrations: EventRegistrationRecord[] }> => {
    const response = await client.get(`/registrations/by-event/${eventId}`, {
      params: { status },
    });
    return response.data;
  },

  getMyRegistrations: async (status?: 'pending' | 'approved' | 'rejected'): Promise<{ registrations: EventRegistrationRecord[] }> => {
    const response = await client.get('/registrations/my', {
      params: { status },
    });
    return response.data;
  },

  approveRegistration: async (registrationId: number): Promise<{ message: string; registration: EventRegistrationRecord }> => {
    const response = await client.post(`/registrations/${registrationId}/approve`);
    return response.data;
  },

  rejectRegistration: async (registrationId: number, reason: string): Promise<{ message: string; registration: EventRegistrationRecord }> => {
    const response = await client.post(`/registrations/${registrationId}/reject`, { reason });
    return response.data;
  },

  // User Management endpoints
  getAllUsers: async (): Promise<{ users: any[] }> => {
    const response = await client.get('/users');
    return response.data;
  },

  getUsersMetadata: async (): Promise<UsersLookupMetadata> => {
    const response = await client.get('/users/metadata');
    return response.data;
  },

  getUserById: async (id: number) => {
    const response = await client.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (data: {
    facultyId: string;
    email: string;
    name: string;
    department: string;
    designation: string;
    role: string;
    status: 'active' | 'inactive';
  }) => {
    const response = await client.post('/users', data);
    return response.data;
  },

  updateUser: async (id: number, data: {
    facultyId?: string;
    email?: string;
    name?: string;
    department?: string;
    designation?: string;
    role?: string;
    status?: 'active' | 'inactive';
  }) => {
    const response = await client.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number) => {
    const response = await client.delete(`/users/${id}`);
    return response.data;
  },

  bulkImportUsers: async (users: {
    facultyId: string;
    email: string;
    name: string;
    department: string;
    designation: string;
    role: string;
    status: 'active' | 'inactive';
  }[]) => {
    const response = await client.post('/users/bulk/import', { users });
    return response.data;
  },

  checkDuplicateUsers: async (facultyId: string, email: string) => {
    const response = await client.post('/users/check/duplicates', {
      facultyId,
      email,
    });
    return response.data;
  },

  // Role Management endpoints
  getRoles: async (): Promise<{ roles: RoleRecord[] }> => {
    const response = await client.get('/roles');
    return response.data;
  },

  getRoleResources: async (): Promise<{ resources: RoleResourceRecord[] }> => {
    const response = await client.get('/roles/resources');
    return response.data;
  },

  getMyRoleAccess: async (): Promise<RoleAccessSummary> => {
    const response = await client.get('/roles/me/access');
    return response.data;
  },

  createRole: async (data: UpsertRolePayload): Promise<{ message: string; role: RoleRecord }> => {
    const response = await client.post('/roles', data);
    return response.data;
  },

  updateRole: async (id: number, data: UpsertRolePayload): Promise<{ message: string; role: RoleRecord }> => {
    const response = await client.put(`/roles/${id}`, data);
    return response.data;
  },

  deleteRole: async (id: number): Promise<{ message: string }> => {
    const response = await client.delete(`/roles/${id}`);
    return response.data;
  },

  getWorkflowDesignationRules: async (academicYear = '2026-27'): Promise<{ academicYear: string; rules: DesignationTargetRuleRecord[] }> => {
    const response = await client.get('/workflow-targets/designation-rules', {
      params: { academicYear },
    });
    return response.data;
  },

  updateWorkflowDesignationTargets: async (
    designationId: number,
    data: { academicYear: string; targets: Record<string, number> },
  ) => {
    const response = await client.put(`/workflow-targets/designation-rules/${designationId}`, data);
    return response.data;
  },

  rebuildWorkflowAssignments: async (data: { academicYear: string; designationId?: number }) => {
    const response = await client.post('/workflow-targets/assignments/rebuild', data);
    return response.data;
  },

  getWorkflowDeadlines: async (academicYear = '2026-27'): Promise<{ academicYear: string; settings: Record<string, string> }> => {
    const response = await client.get('/workflow-targets/admin/deadlines', {
      params: { academicYear },
    });
    return response.data;
  },

  updateWorkflowDeadlines: async (data: { academicYear: string; settings: Record<string, string> }) => {
    const response = await client.put('/workflow-targets/admin/deadlines', data);
    return response.data;
  },

  getMyWorkflowPlan: async (academicYear = '2026-27'): Promise<WorkflowPlanRecord> => {
    const response = await client.get('/workflow-targets/me/workflow', {
      params: { academicYear },
    });
    return response.data;
  },

  completeMyWorkflowTask: async (data: {
    academicYear?: string;
    workflowType: 'paper' | 'patent' | 'proposal';
    slotNo: number;
    taskCode: string;
    payload?: Record<string, unknown>;
  }) => {
    const response = await client.post('/workflow-targets/me/workflow/complete', {
      academicYear: data.academicYear || '2026-27',
      workflowType: data.workflowType,
      slotNo: data.slotNo,
      taskCode: data.taskCode,
      payload: data.payload,
    });
    return response.data;
  },
};

export default client;
