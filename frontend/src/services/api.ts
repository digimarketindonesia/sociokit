import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle 401, refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/sign-in';
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/sign-in';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

// Auth API
export const authApi = {
  login: (data: { emailOrUsername: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: {
    email: string;
    username: string;
    password: string;
    fullName: string;
    referralCode?: string;
  }) => api.post('/auth/register', data),
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  getMe: () => api.get('/auth/me'),
};

// Users API
export const usersApi = {
  getMe: () => api.get('/users/me'),
  getMySubscription: () => api.get('/users/me/subscription'),
  getMyStats: () => api.get('/users/me/stats'),
  updateProfile: (data: { fullName?: string; email?: string }) =>
    api.put('/users/me', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/users/me/password', data),
};

// Social Accounts API
export const socialApi = {
  getAccounts: () => api.get('/social/facebook/accounts'),
  addAccount: (data: { cookies: string; accountName: string; proxy?: object }) =>
    api.post('/social/facebook/accounts', data),
  deleteAccount: (id: string) => api.delete(`/social/facebook/accounts/${id}`),
  getFanpages: (accountId: string) =>
    api.get(`/social/facebook/accounts/${accountId}/fanpages`),
  refreshFanpages: (accountId: string) =>
    api.post(`/social/facebook/accounts/${accountId}/fanpages/refresh`),
};

// Auto Post API
export const autoPostApi = {
  getPosts: (params?: { status?: string; page?: number }) =>
    api.get('/tools/auto-post', { params }),
  createPost: (data: object) => api.post('/tools/auto-post', data),
  getPost: (id: string) => api.get(`/tools/auto-post/${id}`),
  updatePost: (id: string, data: object) => api.put(`/tools/auto-post/${id}`, data),
  deletePost: (id: string) => api.delete(`/tools/auto-post/${id}`),
  startPost: (id: string) => api.post(`/tools/auto-post/${id}/start`),
};

// Shortlink API
export const shortlinkApi = {
  getShortlinks: (params?: { page?: number }) =>
    api.get('/tools/shortlinks', { params }),
  createShortlink: (data: object) => api.post('/tools/shortlinks', data),
  deleteShortlink: (id: string) => api.delete(`/tools/shortlinks/${id}`),
  getClicks: (id: string) => api.get(`/tools/shortlinks/${id}/clicks`),
  getDomains: () => api.get('/tools/shortlinks/domains'),
};

// Subscription & Payment API
export const subscriptionApi = {
  getPlans: () => api.get('/subscriptions/plans'),
  getMySubscription: () => api.get('/subscriptions/me'),
};

export const paymentApi = {
  createTripay: (planId: string, channel: string) =>
    api.post('/payments/tripay', { planId, channel }),
  createXendit: (planId: string) => api.post('/payments/xendit', { planId }),
  createManual: (planId: string, bankAccountId: string, proofImageUrl: string) =>
    api.post('/payments/manual', { planId, bankAccountId, proofImageUrl }),
  getBankAccounts: () => api.get('/payments/bank-accounts'),
  getTripayChannels: () => api.get('/payments/tripay/channels'),
};

// Affiliate API
export const affiliateApi = {
  getInfo: () => api.get('/affiliate/info'),
  getEarnings: (params?: { status?: string; page?: number }) =>
    api.get('/affiliate/earnings', { params }),
  createWithdrawal: (data: {
    amount: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  }) => api.post('/affiliate/withdrawals', data),
  getWithdrawals: () => api.get('/affiliate/withdrawals'),
};

// Admin API
export const adminApi = {
  // Dashboard Stats
  getDashboardStats: () => api.get('/admin/stats/dashboard'),
  getRevenueByMethod: () => api.get('/admin/stats/revenue-by-method'),
  getUserGrowth: () => api.get('/admin/stats/user-growth'),

  // User Management
  getUsers: (params?: { search?: string; role?: string; page?: number; limit?: number }) =>
    api.get('/admin/users', { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  updateUser: (id: string, data: { fullName?: string; email?: string; role?: string }) =>
    api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

  // Payment Management
  getPayments: (params?: { status?: string; method?: string; page?: number }) =>
    api.get('/admin/payments', { params }),
  getPayment: (id: string) => api.get(`/admin/payments/${id}`),

  // Plan Management
  getPlans: () => api.get('/admin/plans'),
  getPlan: (id: string) => api.get(`/admin/plans/${id}`),
  createPlan: (data: {
    name: string;
    durationMonths: number;
    price: number;
    features?: string[];
    isActive?: boolean;
    sortOrder?: number;
  }) => api.post('/admin/plans', data),
  updatePlan: (id: string, data: object) => api.put(`/admin/plans/${id}`, data),
  deletePlan: (id: string) => api.delete(`/admin/plans/${id}`),

  // Bank Account Management
  getBankAccounts: () => api.get('/admin/bank-accounts'),
  getBankAccount: (id: string) => api.get(`/admin/bank-accounts/${id}`),
  createBankAccount: (data: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    isActive?: boolean;
    sortOrder?: number;
  }) => api.post('/admin/bank-accounts', data),
  updateBankAccount: (id: string, data: object) =>
    api.put(`/admin/bank-accounts/${id}`, data),
  deleteBankAccount: (id: string) => api.delete(`/admin/bank-accounts/${id}`),

  // Affiliate Management
  getWithdrawals: (status?: string) =>
    api.get('/affiliate/admin/withdrawals', { params: { status } }),
  processWithdrawal: (id: string, data: { status: string; notes?: string }) =>
    api.put(`/affiliate/admin/withdrawals/${id}`, data),
  getAffiliateSettings: () => api.get('/affiliate/admin/settings'),
  updateAffiliateSettings: (data: {
    commissionRate?: number;
    minWithdrawal?: number;
    cookieDays?: number;
    isActive?: boolean;
  }) => api.put('/affiliate/admin/settings', data),
};
