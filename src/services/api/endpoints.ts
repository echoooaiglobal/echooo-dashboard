export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  CAMPAIGNS: {
    LIST: '/campaigns',
    CREATE: '/campaigns',  // Assuming this is your create endpoint
    DETAIL: (id: string) => `/campaigns/${id}`,
    METRICS: (id: string) => `/campaigns/${id}/metrics`,
    COMPANY: (companyId: string) => `/campaigns/company/${companyId}`  // Add this new endpoint
  },
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id: string) => `/categories/${id}`,
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
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    REPORTS: '/analytics/reports',
    EXPORT: '/analytics/export',
  },
  
};