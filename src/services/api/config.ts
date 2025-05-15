// src/services/api/config.ts
export const API_CONFIG = {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v0',
    timeout: 30000, // 30 seconds
    retryAttempts: 1,
    tokenRefreshEndpoint: '/auth/refresh',
};
  
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';