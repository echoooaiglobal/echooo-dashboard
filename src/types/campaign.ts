// src/types/campaign.ts - Add these types for campaign list management
export interface CampaignListMember {
  id: string;
  list_id: string;
  platform_id: string;
  social_data: {
    id: string;
    username: string;
    name: string;
    profileImage?: string;
    followers: string;
    isVerified: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface AddToListRequest {
  list_id: string;
  platform_id: string;
  social_data: {
    id: string;
    username: string;
    name: string;
    profileImage?: string;
    followers: string;
    isVerified: boolean;
  };
}

export interface AddToListResponse {
  success: boolean;
  message?: string;
  data?: CampaignListMember;
}