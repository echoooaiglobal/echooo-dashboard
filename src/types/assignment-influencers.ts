// src/types/assignment-influencers.ts

export interface AssignmentInfluencerStatus {
  id: string;
  name: string;
  model: string;
}

export interface CampaignInfluencerStatus {
  id: string;
  name: string;
  model: string;
}

export interface SocialAccount {
  id: string;
  full_name: string;
  platform_id: string;
  account_handle: string;
  followers_count: number;
  is_verified: boolean;
  profile_pic_url: string;
  account_url: string;
}

export interface CampaignInfluencer {
  id: string;
  campaign_list_id: string;
  social_account_id: string;
  status_id: string;
  status: CampaignInfluencerStatus;
  total_contact_attempts: number;
  currency: string | null;
  collaboration_price: number | null;
  is_ready_for_onboarding: boolean;
  created_at: string;
  social_account: SocialAccount;
  notes: string | null;
}

export interface AssignmentInfluencer {
  id: string;
  campaign_influencer_id: string;
  agent_assignment_id: string;
  type: string;
  status_id: string;
  attempts_made: number;
  last_contacted_at: string | null;
  next_contact_at: string | null;
  responded_at: string | null;
  assigned_at: string;
  archived_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  campaign_influencer: CampaignInfluencer;
  status: AssignmentInfluencerStatus;
}

export interface AssignmentInfluencersPagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface AssignmentInfluencersResponse {
  influencers: AssignmentInfluencer[];
  pagination: AssignmentInfluencersPagination;
}

// Legacy types for backward compatibility
export interface AssignmentMemberStatus {
  id: string;
  name: string;
}

export interface AssignmentMemberPlatform {
  id: string;
  name: string;
  logo_url?: string;
}

export interface AssignmentMemberSocialAccount {
  id: string;
  full_name: string;
  platform_id: string;
  account_handle: string;
  followers_count: number;
  platform_account_id: string;
  is_verified: boolean;
  profile_pic_url: string;
  account_url: string;
  is_private: boolean;
  is_business: boolean;
  media_count: number | null;
  following_count: number | null;
  subscribers_count: number | null;
  likes_count: number | null;
}

export interface AssignmentMember {
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
  status: AssignmentMemberStatus;
  platform: AssignmentMemberPlatform;
  social_account: AssignmentMemberSocialAccount;
}

export interface AssignmentMembersPagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface AssignmentMembersResponse {
  members: AssignmentMember[];
  pagination: AssignmentMembersPagination;
}

export type ContactStatus = 'discovered' | 'contacted' | 'responded' | 'declined' | 'accepted' | 'onboarded';