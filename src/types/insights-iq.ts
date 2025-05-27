//src/types/insights-iq.ts

// Contact details type
export interface ContactDetail {
  type: string;
  value: string;
}

// Work platform type
export interface WorkPlatform {
  id: string;
  name: string;
  logo_url: string;
}

// Main influencer type
export interface Influencer {
  id: string | null;
  username: string;
  name: string;
  age_group: string | null;
  average_likes: number;
  average_views: number | null;
  contact_details: ContactDetail[];
  content_count: number | null;
  engagementRate: string;
  engagements: string;
  external_id: string | null;
  followers: string;
  gender: string | null;
  introduction: string;
  isVerified: boolean;
  language: string;
  livestream_metrics: any | null; // You might want to define this more specifically if you know the structure
  platform_account_type: string;
  profileImage: string;
  subscriber_count: number | null;
  url: string;
  work_platform: WorkPlatform;
}

// Metadata type for pagination/search results
export interface Metadata {
  limit: number;
  offset: number;
  total_results: number;
}

// Main wrapper type for discovered creators results
export interface DiscoveredCreatorsResults {
  influencers: Influencer[];
  metadata: Metadata;
}