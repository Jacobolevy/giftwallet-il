import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_VERSION = 'v1';

const api = axios.create({
  baseURL: `${API_URL}/api/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
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
  (response) => {
    // If response has success wrapper, return data directly
    if (response.data?.success !== undefined) {
      return { ...response, data: response.data.data || response.data };
    }
    return response;
  },
  (error) => {
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
    api.post('/auth/signup', data).then(res => res.data),
  login: (data: { email: string; password: string; remember_me?: boolean }) =>
    api.post('/auth/login', data).then(res => res.data),
  logout: () =>
    api.post('/auth/logout').then(res => res.data),
  refresh: () =>
    api.post('/auth/refresh').then(res => res.data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then(res => res.data),
  resetPassword: (data: { token: string; new_password: string }) =>
    api.post('/auth/reset-password', data).then(res => res.data),
};

// Cards API
export const cardsAPI = {
  getAll: (filters?: { status?: string; issuer_id?: string; sort?: string; order?: string; expiring_soon?: boolean; page?: number; limit?: number }) =>
    api.get('/cards', { params: filters }).then(res => res.data),
  getById: (id: string) =>
    api.get(`/cards/${id}`).then(res => res.data),
  create: (data: any) =>
    api.post('/cards', data).then(res => res.data),
  update: (id: string, data: any) =>
    api.put(`/cards/${id}`, data).then(res => res.data),
  updateBalance: (id: string, data: { new_balance?: number; deduct_amount?: number; change_type?: string; notes?: string; store_name?: string }) =>
    api.patch(`/cards/${id}/balance`, data).then(res => res.data),
  markAsUsed: (id: string, notes?: string) =>
    api.post(`/cards/${id}/mark-used`, { notes }).then(res => res.data),
  delete: (id: string) =>
    api.delete(`/cards/${id}`).then(res => res.data),
  getFullCode: (id: string) =>
    api.get(`/cards/${id}/full-code`).then(res => res.data),
  getStats: () =>
    api.get('/cards/stats').then(res => res.data),
  getHistory: (id: string, params?: { limit?: number; offset?: number }) =>
    api.get(`/cards/${id}/history`, { params }).then(res => res.data),
};

// Issuers API
export const issuersAPI = {
  getAll: (language?: string) =>
    api.get('/issuers', { params: { language } }).then(res => res.data),
  getById: (id: string) =>
    api.get(`/issuers/${id}`).then(res => res.data),
};

// Users API
export const usersAPI = {
  getProfile: () =>
    api.get('/users/me').then(res => res.data),
  updateProfile: (data: any) =>
    api.patch('/users/me', data).then(res => res.data),
  changePassword: (data: { current_password: string; new_password: string; confirm_password: string }) =>
    api.put('/users/me/password', data).then(res => res.data),
  exportData: (format: 'json' | 'csv' = 'json') =>
    api.get('/users/me/export', { params: { format } }).then(res => res.data),
  deleteAccount: (data: { password: string; confirmation: string }) =>
    api.delete('/users/me', { data }).then(res => res.data),
};

// Reminders API
export const remindersAPI = {
  getAll: (filters?: { sent?: boolean; card_id?: string; upcoming?: boolean }) =>
    api.get('/reminders', { params: filters }).then(res => res.data),
  getById: (id: string) =>
    api.get(`/reminders/${id}`).then(res => res.data),
  markRead: (id: string) =>
    api.patch(`/reminders/${id}/read`).then(res => res.data),
};

// Statistics API (for future implementation)
export const statisticsAPI = {
  getOverview: () =>
    api.get('/statistics/overview').then(res => res.data),
  getByIssuer: () =>
    api.get('/statistics/by-issuer').then(res => res.data),
  getExpiryTimeline: (months_ahead?: number) =>
    api.get('/statistics/expiry-timeline', { params: { months_ahead } }).then(res => res.data),
  getSpendingTrends: (period?: string, periods_count?: number) =>
    api.get('/statistics/spending-trends', { params: { period, periods_count } }).then(res => res.data),
};
