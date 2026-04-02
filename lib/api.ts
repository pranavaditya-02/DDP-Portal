import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from './store';

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
    if (error.response?.status === 401) {
      const token = useAuthStore.getState().token;
      // Don't auto-logout for demo tokens — they don't hit a real backend
      if (token && !token.startsWith('demo-')) {
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
};

export default client;
