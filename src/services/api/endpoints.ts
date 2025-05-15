// src/services/api/endpoints.ts
export const ENDPOINTS = {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH_TOKEN: '/auth/refresh',
      LOGOUT: '/auth/logout',
      RESET_PASSWORD: '/auth/reset-password',
      VERIFY_EMAIL: '/auth/verify-email',
    },
    INFLUENCERS: {
      LIST: '/influencers',
      DETAIL: (id: string) => `/influencers/${id}`,
      ANALYTICS: (id: string) => `/influencers/${id}/analytics`,
      SEARCH: '/influencers/search',
    },
    CLIENTS: {
      LIST: '/clients',
      DETAIL: (id: string) => `/clients/${id}`,
      CAMPAIGNS: (id: string) => `/clients/${id}/campaigns`,
    },
    CAMPAIGNS: {
      LIST: '/campaigns',
      DETAIL: (id: string) => `/campaigns/${id}`,
      METRICS: (id: string) => `/campaigns/${id}/metrics`,
    },
    ANALYTICS: {
      DASHBOARD: '/analytics/dashboard',
      REPORTS: '/analytics/reports',
      EXPORT: '/analytics/export',
    },
  };