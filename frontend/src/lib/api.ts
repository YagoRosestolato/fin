import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (val: unknown) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(original));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post('/auth/refresh');
        const newToken = res.data?.accessToken;
        if (newToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          // Atualiza no store também
          try {
            const { useAuthStore } = await import('@/stores/auth.store');
            useAuthStore.getState().setToken(newToken);
          } catch {}
        }
        processQueue(null, newToken);
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('fin-auth');
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: object) => api.post('/auth/register', data),
  login: (data: object) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
};

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: object) => api.put('/users/profile', data),
  getSummary: (params?: object) => api.get('/users/summary', { params }),
  getSavingsHistory: () => api.get('/users/savings-history'),
  getDailySpending: (params?: object) => api.get('/users/daily-spending', { params }),
  deleteAccount: () => api.delete('/users/account'),
};

export const transactionApi = {
  getAll: (params?: object) => api.get('/transactions', { params }),
  create: (data: object) => api.post('/transactions', data),
  update: (id: string, data: object) => api.put(`/transactions/${id}`, data),
  delete: (id: string, deleteAll?: boolean) =>
    api.delete(`/transactions/${id}`, { params: { deleteAll } }),
  getCategories: () => api.get('/transactions/categories'),
  importCSV: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/transactions/import-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const notificationApi = {
  getAll: (params?: object) => api.get('/notifications', { params }),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read'),
};
