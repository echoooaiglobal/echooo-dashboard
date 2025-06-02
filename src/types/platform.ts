// src/types/platform.ts

export interface PlatformProducts {
  income: {
    is_supported: boolean;
  };
  switch: {
    is_supported: boolean;
  };
  activity: {
    is_supported: boolean;
  };
  identity: {
    audience: {
      is_supported: boolean;
    };
    is_supported: boolean;
  };
  engagement: {
    audience: {
      is_supported: boolean;
    };
    is_supported: boolean;
  };
  publish_content: {
    is_supported: boolean;
  };
}

export interface Platform {
  id: string;
  name: string;
  description: string | null;
  logo_url: string;
  category: string;
  status: string; // "ACTIVE" | "INACTIVE"
  url: string;
  work_platform_id: string;
  products: PlatformProducts;
  created_at: string;
  updated_at: string;
}

export interface PlatformResponse {
  success: boolean;
  data: Platform[];
  total?: number;
  message?: string;
}