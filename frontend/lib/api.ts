import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_VERSION = 'v1';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === '[object Object]';

const toCamelKey = (key: string) => key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

const camelizeKeysDeep = (input: unknown): unknown => {
  if (Array.isArray(input)) {
    return input.map(camelizeKeysDeep);
  }
  if (isPlainObject(input)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) {
      out[toCamelKey(k)] = camelizeKeysDeep(v);
    }
    return out;
  }
  return input;
};

const api = axios.create({
  baseURL: `${API_URL}/api/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config: any) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors and response format
api.interceptors.response.use(
  (response: any) => {
    const isWrapped = response.data?.success !== undefined;
    const payload = isWrapped ? (response.data.data ?? response.data) : response.data;

    return { ...response, data: camelizeKeysDeep(payload) };
  },
  (error: any) => {
    // Normalize backend error payloads so UI can consistently read message/details
    if (error.response?.data) {
      error.response.data = camelizeKeysDeep(error.response.data);
    }
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  signup: (data: { email: string; password: string; name?: string; phone?: string; language_preference?: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string; remember_me?: boolean }) =>
    api.post('/auth/login', data),
  devLogin: (data?: { email?: string; name?: string; language_preference?: string }) =>
    api.post('/auth/dev-login', data ?? {}),
  logout: () =>
    api.post('/auth/logout'),
  refresh: () =>
    api.post('/auth/refresh'),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; new_password: string }) =>
    api.post('/auth/reset-password', data),
};

// Cards API
export const cardsAPI = {
  getAll: (filters?: { status?: string; issuer_id?: string; sort?: string; order?: string; expiring_soon?: boolean; page?: number; limit?: number }) =>
    api.get('/cards', { params: filters }),
  getById: (id: string) =>
    api.get(`/cards/${id}`),
  create: (data: any) =>
    api.post('/cards', data),
  update: (id: string, data: any) =>
    api.put(`/cards/${id}`, data),
  updateBalance: (id: string, data: { new_balance?: number; deduct_amount?: number; change_type?: string; notes?: string; store_name?: string }) =>
    api.patch(`/cards/${id}/balance`, data),
  markAsUsed: (id: string, notes?: string) =>
    api.post(`/cards/${id}/mark-used`, { notes }),
  delete: (id: string) =>
    api.delete(`/cards/${id}`),
  getFullCode: (id: string) =>
    api.get(`/cards/${id}/full-code`),
  getStats: () =>
    api.get('/cards/stats'),
  getHistory: (id: string, params?: { limit?: number; offset?: number }) =>
    api.get(`/cards/${id}/history`, { params }),
};

// Issuers API
export const issuersAPI = {
  getAll: (language?: string) =>
    api.get('/issuers', { params: { language } }),
  getById: (id: string) =>
    api.get(`/issuers/${id}`),
};

// Users API
export const usersAPI = {
  getProfile: () =>
    api.get('/users/me'),
  updateProfile: (data: any) =>
    api.patch('/users/me', data),
  changePassword: (data: { current_password: string; new_password: string; confirm_password: string }) =>
    api.put('/users/me/password', data),
  exportData: (format: 'json' | 'csv' = 'json') =>
    api.get('/users/me/export', { params: { format } }),
  deleteAccount: (data: { password: string; confirmation: string }) =>
    api.delete('/users/me', { data }),
};

// Reminders API
export const remindersAPI = {
  getAll: (filters?: { sent?: boolean; card_id?: string; upcoming?: boolean }) =>
    api.get('/reminders', { params: filters }),
  getById: (id: string) =>
    api.get(`/reminders/${id}`),
  markRead: (id: string) =>
    api.patch(`/reminders/${id}/read`),
};

// Statistics API (for future implementation)
export const statisticsAPI = {
  getOverview: () =>
    api.get('/statistics/overview'),
  getByIssuer: () =>
    api.get('/statistics/by-issuer'),
  getExpiryTimeline: (months_ahead?: number) =>
    api.get('/statistics/expiry-timeline', { params: { months_ahead } }),
  getSpendingTrends: (period?: string, periods_count?: number) =>
    api.get('/statistics/spending-trends', { params: { period, periods_count } }),
};
