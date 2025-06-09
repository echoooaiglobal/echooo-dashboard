// src/types/campaign-list-members.ts

export interface UpdateCampaignListMemberRequest {
  status_id?: string;
  contact_attempts?: number;
  last_contacted_at?: string;
  next_contact_at?: string;
  responded_at?: string;
  collaboration_price?: number;
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
}

export interface CampaignListMember {
  id: string;
  list_id: string;
  social_account_id: string;
  platform_id: string;
  status_id: string;
  contact_attempts: number;
  next_contact_at: string | null;
  collaboration_price: number | null;
  last_contacted_at: string | null;
  responded_at: string | null;
  ready_to_onboard: boolean;
  onboarded_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  status: CampaignListMemberStatus;
  platform: CampaignListMemberPlatform;
  social_account: CampaignListMemberSocialAccount;
}

export interface UpdateCampaignListMemberResponse {
  success: boolean;
  data?: CampaignListMember;
  error?: string;
}