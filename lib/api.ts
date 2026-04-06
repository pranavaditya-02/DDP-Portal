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

const apiBaseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

  updateInternshipTrackerIqac: async (id: number, iqac_verification: 'initiated' | 'inprogress' | 'completed') => {
    const response = await client.patch(`/internship-tracker/${id}/iqac`, { iqac_verification });
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

  getEvents: async (): Promise<{ events: EventMasterRecord[] }> => {
    const response = await client.get('/events');
    return response.data;
  },

  createEvent: async (data: CreateEventPayload): Promise<{ message: string; event: EventMasterRecord }> => {
    const response = await client.post('/events', data);
    return response.data;
  },
};

export default client;
