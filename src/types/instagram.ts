// src/types/instagram.ts

export interface InstagramUser {
    pk: number;
    id: string;
    username: string;
    full_name: string;
    strong_id__: string;
    profile_pic_url: string;
    is_private: boolean;
    is_verified: boolean;
    social_context: string | null;
  }
  
  export interface InstagramSearchResponse {
    num_results: number;
    users: InstagramUser[];
  }
  
  export interface InstagramUserDetails {
    pk: number;
    username: string;
    full_name: string;
    profile_pic_url: string;
    profile_pic_url_hd: string;
    is_business: boolean;
    is_private: boolean;
    is_verified: boolean;
    media_count: number;
    follower_count: number;
    following_count: number;
    biography: string;
    external_url: string;
    category?: string;
    has_highlight_reels: boolean;
    has_clips: boolean;
    has_guides: boolean;
    has_channel: boolean;
    total_igtv_videos: number;
    bio_links: any[];
  }
  
  export interface InstagramProfileResponse {
    status: string;
    user: InstagramUserDetails;
  }