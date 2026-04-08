import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from './store';

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
  createdDate: string;
  updatedDate: string;
}

export interface CreateEventPayload {
  maximumCount: number;
  appliedCount: number;
  balanceCount: number;
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

const client: AxiosInstance = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
client.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.error;
    const token = useAuthStore.getState().token;

    if ((status === 401 || status === 403) && token && !token.startsWith('demo-')) {
      if (message?.toString().toLowerCase().includes('invalid') || message?.toString().toLowerCase().includes('expired') || status === 401) {
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

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

  login: async (email: string, password: string) => {
    const response = await client.post('/auth/login', {
      email,
      password,
    });
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
    const response = await client.post('/internship-tracker', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

  getApprovedTrackersByStudent: async (studentId: number) => {
    const response = await client.get(`/internship-tracker/student/${studentId}/approved`);
    return response.data;
  },

  updateInternshipTrackerIqac: async (id: number, iqac_verification: 'initiated' | 'approved' | 'declined', reject_reason?: string) => {
    const payload: Record<string, unknown> = { iqac_verification };
    if (reject_reason) payload.reject_reason = reject_reason;
    const response = await client.patch(`/internship-tracker/${id}/iqac`, payload);
    return response.data;
  },

  createInternshipReport: async (formData: FormData) => {
    const response = await client.post('/internship-report', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateInternshipReportIqac: async (id: number, iqac_verification: 'Initiated' | 'Approved' | 'Rejected', reject_reason?: string) => {
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

    const response = await client.post('/import/industries/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  importEventsAttendedCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await client.post('/import/events-attended/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  getEvents: async (params?: { sort?: 'asc' | 'desc' }): Promise<{ events: EventMasterRecord[] }> => {
    const searchParams = new URLSearchParams();
    const token = useAuthStore.getState().token;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (params?.sort) {
      searchParams.set('sort', params.sort);
    }

    const response = await fetch(`/api/events${searchParams.toString() ? `?${searchParams.toString()}` : ''}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      throw new Error(errorPayload?.error || `Failed to load events (${response.status})`);
    }

    return response.json();
  },

  createEvent: async (data: CreateEventPayload): Promise<{ message: string; event: EventMasterRecord }> => {
    const token = useAuthStore.getState().token;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch('/api/events', {
      method: 'POST',
      headers,
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
};

export default client;
