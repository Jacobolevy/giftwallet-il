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
  devLogin: () => api.post('/auth/dev-login'),
  logout: () =>
    api.post('/auth/logout'),
};

// Cards API
export const cardsAPI = {
  getAll: () => api.get('/cards'),
  getById: (id: string) =>
    api.get(`/cards/${id}`),
  create: (data: any) =>
    api.post('/cards', data),
  markAsUsed: (id: string) => api.post(`/cards/${id}/mark-used`),
  delete: (id: string) =>
    api.delete(`/cards/${id}`),
  getFullCode: (id: string) =>
    api.get(`/cards/${id}/full-code`),
  getEstablishments: (id: string) => api.get(`/cards/${id}/establishments`),
};

// Issuers API
export const issuersAPI = {
  getAll: () => api.get('/issuers'),
};

// Establishments API
export const establishmentsAPI = {
  search: (q?: string) => api.get('/establishments/search', { params: { q } }),
  getMyCards: (id: string) =>
    api.get(`/establishments/${id}/my-cards`),
};
