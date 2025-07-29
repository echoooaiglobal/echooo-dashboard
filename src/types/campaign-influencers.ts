// src/types/campaign-influencers.ts - Updated with onboarding types

export interface UpdateCampaignInfluencerRequest {
  status_id?: string;
  contact_attempts?: number;
  last_contacted_at?: string;
  next_contact_at?: string;
  responded_at?: string;
  collaboration_price?: number | null;
  currency?: string;
  notes?: string;
}

export interface CampaignListMemberStatus {
  id: string;
  name: string;
}

export interface CampaignListMemberPlatform {
  id: string;
  name: string;
}

export interface CampaignListMemberSocialAccount {
  id: string;
  full_name: string;
  platform_id: string;
  account_handle: string;
  followers_count: number;
  platform_account_id: string;
  is_verified: boolean;
  profile_pic_url: string;
  is_private: boolean;
  is_business: boolean;
  media_count: number | null;
  following_count: number | null;
  subscribers_count: number | null;
  likes_count: number | null;
  additional_metrics?: Record<string, string | number | boolean | null>;
}

export interface CampaignListMember {
  id: string;
  list_id?: string; // Made optional for backward compatibility
  campaign_list_id?: string; // Alternative field name
  social_account_id: string;
  platform_id: string;
  status_id: string;
  contact_attempts: number;
  next_contact_at: string | null;
  collaboration_price: number | null;
  collaboration_currency?: string; // Added currency field
  last_contacted_at: string | null;
  responded_at: string | null;
  ready_to_onboard?: boolean; // Made optional
  onboarded_at: string | null;
  notes?: string | null; // Made optional
  created_at: string;
  updated_at: string;
  status: CampaignListMemberStatus;
  platform: CampaignListMemberPlatform;
  social_account: CampaignListMemberSocialAccount;
  // Additional fields from migrated types
  currency?: string; // Added for collaboration currency

  success?: boolean;
  message?: string;
  username?: string;
  name?: string;
  profileImage?: string;
  followers?: string;
  isVerified?: boolean;
  engagement_rate?: number;
  avg_likes?: number;
  avg_comments?: number;
}

export interface UpdateCampaignInfluencerResponse {
  success: boolean;
  data?: CampaignListMember;
  error?: string;
}

// New response types for specific endpoints
export interface UpdateStatusResponse {
  success: boolean;
  message: string;
  influencer_id: string;
}

export interface UpdatePriceResponse {
  success: boolean;
  message: string;
  influencer_id: string;
}

// ============ ONBOARDING TYPES ============

export interface MarkOnboardedRequest {
  campaign_list_id: string;
  influencer_ids: string[];
}

export interface MarkOnboardedResponse {
  success: boolean;
  message: string;
}

export interface RemoveOnboardedRequest {
  campaign_list_id: string;
  influencer_ids: string[];
}

export interface RemoveOnboardedResponse {
  success: boolean;
  message: string;
}

// ============ MIGRATED TYPES FROM campaign-list.service.ts ============

// Define the campaign list ID type
export type CampaignListId = string;

// Define the request body for adding an influencer to a campaign list
export interface AddToCampaignListRequest {
  campaign_list_id: CampaignListId;
  platform_id: string;
  social_data: {
    id: string;
    username: string;
    name: string;
    profileImage?: string;
    followers: string;
    isVerified?: boolean;
    account_url?: string;
    additional_metrics?: Record<string, string | number | boolean | null>;
  };
}

export interface Platform {
  id: string;
  name: string;
  logo_url: string;
}

export interface PaginationInfo {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface CampaignInfluencersResponse {
  success: boolean;
  influencers: CampaignListMember[];
  pagination: PaginationInfo;
  message?: string;
}

// Legacy type alias for backward compatibility
export interface CampaignListMembersResponse extends CampaignInfluencersResponse {}

// Status grouping for Outreach Tab
export interface CampaignInfluencersByStatus {
  discovered: CampaignListMember[];
  unreachable: CampaignListMember[];
  contacted: CampaignListMember[];
  responded: CampaignListMember[];
  info_requested: CampaignListMember[];
  completed: CampaignListMember[];
  declined: CampaignListMember[];
  inactive: CampaignListMember[];
}