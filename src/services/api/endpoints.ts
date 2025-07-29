// src/services/api/endpoints.ts
// Updated to include order tracking endpoints

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  
  OAUTH: {
    PROVIDERS: '/auth/oauth/providers',
    LOGIN: (provider: string) => `/auth/oauth/${provider}/login`,
    LINK: (provider: string) => `/auth/oauth/${provider}/link`,
    CALLBACK: (provider: string) => `/auth/oauth/callback/${provider}`,
    ACCOUNTS: '/auth/oauth/accounts',
    UNLINK: (accountId: string) => `/auth/oauth/accounts/${accountId}`,
    REFRESH: (accountId: string) => `/auth/oauth/refresh/${accountId}`,
    HEALTH: '/auth/oauth/health',
  },
  CAMPAIGNS: {
    LIST: '/campaigns',
    CREATE: '/campaigns',
    DETAIL: (id: string) => `/campaigns/${id}`,
    UPDATE: (id: string) => `/campaigns/${id}`,
    DELETE: (id: string) => `/campaigns/${id}`,
    RESTORE: (id: string) => `/campaigns/${id}/restore`,
    METRICS: (id: string) => `/campaigns/${id}/metrics`,
    // Company-specific campaign endpoints
    COMPANY: (companyId: string) => `/campaigns/company/${companyId}`,
    COMPANY_DELETED: (companyId: string) => `/campaigns/company/${companyId}/deleted`,
    // Global deleted campaigns (if needed)
    DELETED: '/campaigns/deleted',
  },
  //need to shift to CAMPAIGN_INFLUENCERS
  CAMPAIGN_LISTS: {
    LIST_MEMBERS: (id: string) => `/campaign-influencers`,
    LIST_MEMBER_DETAIL: (id: string) => `/campaign-influencers/${id}`,
    LIST_MEMBER_DELETE: (id: string) => `/campaign-influencers/${id}`,
    LIST_MEMBER_CREATE: '/campaign-influencers',
  },
  // CAMPAIGN_LIST_MEMBERS: {
  //   DETAIL: (id: string) => `/campaign-influencers/${id}`,
  //   UPDATE: (id: string) => `/campaign-influencers/${id}`,
  //   DELETE: (id: string) => `/campaign-influencers/${id}`,
  //   LIST: '/campaign-influencers',
  //   CREATE: '/campaign-influencers',
  // },

  // Campaign Influencer endpoints
  // Need to shift CAMPAIGN_LISTS and CAMPAIGN_LIST_MEMBERS to this section
  CAMPAIGN_INFLUENCERS: {
    LIST: (id: string) => `/campaign-influencers`,
    UPDATE: (id: string) => `/campaign-influencers/${id}`,
    UPDATE_STATUS: (id: string) => `/campaign-influencers/${id}/status`,
    UPDATE_NOTES: (id: string) => `/campaign-influencers/${id}/notes`,
    UPDATE_PRICE: (id: string) => `/campaign-influencers/${id}/price`,
    DETAIL: (id: string) => `/campaign-influencers/${id}`,
    DELETE: (id: string) => `/campaign-influencers/${id}`,
    CREATE: '/campaign-influencers',
    MARK_ONBOARDED: '/campaign-influencers/mark-onboarded',
    REMOVE_ONBOARDED: '/campaign-influencers/remove-onboarded',
    // BASE: '/campaign-influencers',
    // BY_ID: (id: string) => `/campaign-influencers/${id}`,
    // CONTACT_ATTEMPTS: (influencerId: string) => `/campaign-influencers/${influencerId}/contact-attempts`
  },

  BULK_ASSIGNMENTS: {
    EXECUTE: '/bulk-assignments/execute',
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
    LIST: '/agent-assignments',
    INFLUENCERS_LIST: (id: string) => `/assigned-influencers/agent-assignment/${id}`,
  },

  ASSIGNED_INFLUENCERS: {
    UPDATE_STATUS: (id: string) => `/assigned-influencers/${id}/status`,
    RECORD_CONTACT_ATTEMPT: (assignedInfluencerId: string) => `/assigned-influencers/${assignedInfluencerId}/record-contact`
    // LIST: '/assigned-influencers',
    // DETAIL: (id: string) => `/assigned-influencers/${id}`,
    // BY_ASSIGNMENT: (assignmentId: string) => `/assigned-influencers/assignment/${assignmentId}`,
    // BY_AGENT: (agentId: string) => `/assigned-influencers/agent/${agentId}`,
    // BY_STATUS: (status: string) => `/assigned-influencers?status=${status}`,
    // UPDATE_STATUS: (id: string) => `/assigned-influencers/${id}/status`,
    // UPDATE_ALL_BY_ASSIGNMENT: (assignmentId: string) => `/assigned-influencers/assignment/${assignmentId}/update-all`,
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

  // 📦 ORDER TRACKING ENDPOINTS - NEW SECTION
  ORDERS: {
    // Public endpoints (no authentication required)
    BY_DISCOUNT_CODE: (discountCode: string) => `/orders/discount/${encodeURIComponent(discountCode)}`,
    WEBHOOK_SHOPIFY: '/orders/webhooks/shopify',
    
    // Protected endpoints (authentication required)
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    BY_SHOPIFY_ID: (shopifyOrderId: string) => `/orders/shopify/${shopifyOrderId}`,
    SEARCH: (searchTerm: string) => `/orders/search/${encodeURIComponent(searchTerm)}`,
    BY_CUSTOMER_EMAIL: (email: string) => `/orders/customer/${encodeURIComponent(email)}`,
    RECENT_WEEK: '/orders/recent/week',
    ANALYTICS_STATS: '/orders/analytics/stats',
  },
};