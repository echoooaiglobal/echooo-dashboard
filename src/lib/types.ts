// For discovered influencers (3rd party API)
export interface DiscoverInfluencer {
  id: string;
  username: string;
  name: string;
  profileImage?: string;
  followers: string;
  engagements: string;
  engagementRate: string;
  isVerified: boolean;
  isOnPlatform: boolean;
  match: {
    gender: string;
    country: string;
  };
}

export interface DiscoverApiResponse {
  influencers: DiscoverInfluencer[];
  totalResults: number;
}
  
  // For platform-registered influencers
  export interface PlatformInfluencer {
    id: string; // Our internal ID
    username: string;
    name: string;
    email: string;
    // ... other platform-specific fields
  }


  export interface DiscoverSearchParams {
    audience_source: string;
    sort: {
      field: string;
      direction: 'asc' | 'desc';
    };
    filter: {
      ads_brands: string[];
      age: {
        left_number: string;
        right_number: string;
      };
      audience_age: string[];
      audience_brand: string[];
      audience_brand_category: string[];
      audience_gender: {
        code: string;
        weight: number;
      };
      audience_geo: Array<{
        id: number;
        weight: number;
      }>;
      audience_lang: Record<string, unknown>;
      audience_race: {
        code: string;
        weight: number;
      };
      brand: string[];
      brand_category: string[];
      engagement_rate: {
        operator: string;
        value: number | null;
      };
      engagements: {
        left_number: string;
        right_number: string;
      };
      followers: {
        left_number: string;
        right_number: string;
      };
      reels_plays: {
        left_number: string;
        right_number: string;
      };
      gender: {
        code: string;
        weight: number;
      };
      geo: Array<{
        id: number;
        weight: number;
      }>;
      keywords: string;
      lang: Record<string, unknown>;
      last_posted: string | null;
      relevance: {
        value: string;
        weight: string;
      };
      text: string;
      views: {
        left_number: string;
        right_number: string;
      };
      with_contact: string[];
      saves: {
        left_number: string;
        right_number: string;
      };
      shares: {
        left_number: string;
        right_number: string;
      };
      account_type: string[];
    };
    paging: {
      skip: number;
      limit: number;
    };
  }


export interface Location {
  id: number;
  name: string;
  title: string;
  type: 'city' | 'country';
  country: {
    id: number;
    code: string;
    name: string;
  };
  city: {
    id: number;
    code: string;
  }
}

