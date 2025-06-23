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
  CAMPAIGNS: {
    LIST: '/campaigns',
    CREATE: '/campaigns',
    DETAIL: (id: string) => `/campaigns/${id}`,
    METRICS: (id: string) => `/campaigns/${id}/metrics`,
    COMPANY: (companyId: string) => `/campaigns/company/${companyId}`,
  },
  CAMPAIGN_LISTS: {
    LIST_MEMBERS: (id: string) => `/campaign-list-members`,
    LIST_MEMBER_DETAIL: (id: string) => `/campaign-list-members/${id}`,
    LIST_MEMBER_DELETE: (id: string) => `/campaign-list-members/${id}`,
    LIST_MEMBER_CREATE: '/campaign-list-members',
  },
  CAMPAIGN_LIST_MEMBERS: {
    DETAIL: (id: string) => `/campaign-list-members/${id}`,
    UPDATE: (id: string) => `/campaign-list-members/${id}`,
    DELETE: (id: string) => `/campaign-list-members/${id}`,
    LIST: '/campaign-list-members',
    CREATE: '/campaign-list-members',
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
  INFLUENCER_CONTACTS: {
    CREATE: '/influencer-contacts',
    BY_SOCIAL_ACCOUNT: (socialAccountId: string) => `/influencer-contacts/social-account/${socialAccountId}`,
    DETAIL: (id: string) => `/influencer-contacts/${id}`,
    UPDATE: (id: string) => `/influencer-contacts/${id}`,
    DELETE: (id: string) => `/influencer-contacts/${id}`,
    LIST: '/influencer-contacts',
  },
  PROFILE_ANALYTICS: {
    EXISTS: (platformAccountId: string) => `/profile-analytics/exists/${platformAccountId}`,
    BY_HANDLE: (platformAccountId: string) => `/profile-analytics/by-handle/${platformAccountId}`,
    WITH_SOCIAL_ACCOUNT: '/profile-analytics/with-social-account',
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
  MESSAGE_TEMPLATES: {
    CREATE: '/message-templates',
    BY_COMPANY: (companyId: string) => `/message-templates/company/${companyId}`,
    DETAIL: (templateId: string) => `/message-templates/${templateId}`,
  },
  LIST_ASSIGNMENTS: {
    CREATE: '/list-assignments',
    LIST: '/list-assignments',
    DETAIL: (id: string) => `/list-assignments/${id}`,
    UPDATE_STATUS: (id: string) => `/list-assignments/${id}/status`,
    BY_LIST: (listId: string) => `/list-assignments/list/${listId}`,
    BY_AGENT: (agentId: string) => `/list-assignments/agent/${agentId}`,
    BY_STATUS: (status: string) => `/list-assignments?status=${status}`,
  },
  PLATFORMS: {
    LIST: '/platforms',
    DETAIL: (id: string) => `/platforms/${id}`,
    BY_STATUS: (status: string) => `/platforms?status=${status}`,
  },

  //Platform Agent
  ASSIGNMENTS: {
    LIST: '/assignments',
    INFLUENCERS_LIST: (id: string) => `/assignments/${id}/members`,
  },

  // Statuses
  STATUSES: {
    LIST: '/statuses',
    BY_MODEL: (model: string) => `/statuses/model/${model}`,
    DETAIL: (id: string) => `/statuses/${id}`,
  },


  // Video Results
  RESULTS: {
    LIST: '/results',
    CREATE: '/results',
    DETAIL: (id: string) => `/results/${id}`,
    UPDATE: (id: string) => `/results/${id}`,
    DELETE: (id: string) => `/results/${id}`,
    BY_CAMPAIGN: (campaignId: string) => `/results/campaign/${campaignId}`,
    UPDATE_ALL_BY_CAMPAIGN: (campaignId: string) => `/results/campaign/${campaignId}/update-all`,
  },
};