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
  deletePost: (id: string) => api.delete(`/tools/auto-post/${id}`),
  getGroups: (accountId: string) =>
    api.get(`/tools/auto-post/groups/${accountId}`),
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
  createXendit: (planId: string) =>
    api.post('/payments/xendit', { planId }),
  createManual: (planId: string, bankAccountId: string, proofImage: File) => {
    const formData = new FormData();
    formData.append('planId', planId);
    formData.append('bankAccountId', bankAccountId);
    formData.append('proof', proofImage);
    return api.post('/payments/manual', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getBankAccounts: () => api.get('/payments/bank-accounts'),
  getTripayChannels: () => api.get('/payments/tripay/channels'),
};

// Affiliate API
export const affiliateApi = {
  getMyAffiliate: () => api.get('/affiliate/me'),
  getEarnings: (params?: { page?: number }) =>
    api.get('/affiliate/earnings', { params }),
  requestWithdrawal: (data: {
    amount: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  }) => api.post('/affiliate/withdrawals', data),
  getWithdrawals: () => api.get('/affiliate/withdrawals'),
};
