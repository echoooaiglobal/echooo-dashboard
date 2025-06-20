// src/types/profile-analytics.ts
export interface ProfileAnalyticsExistsResponse {
  exists: boolean;
  platform_account_id: string;
  platform_id: string | null;
  social_account_id: string;
  analytics_count: number;
  latest_analytics_date: string;
}

export interface CheckProfileAnalyticsExistsResponse {
  success: boolean;
  data?: ProfileAnalyticsExistsResponse;
  error?: string;
}