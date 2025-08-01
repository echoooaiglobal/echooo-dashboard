// src/services/platform/platform.service.ts
'use client';

import { nextjsApiClient } from '@/lib/nextjs-api';

export interface Platform {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  category: string;
  status: string;
  url?: string;
  work_platform_id?: string;
  products?: {
    income?: { is_supported: boolean };
    switch?: { is_supported: boolean };
    activity?: { is_supported: boolean };
    identity?: { 
      audience?: { is_supported: boolean };
      is_supported: boolean;
    };
    engagement?: {
      audience?: { is_supported: boolean };
      is_supported: boolean;
    };
    publish_content?: { is_supported: boolean };
  };
  created_at: string;
  updated_at: string;
}

export interface PlatformsResponse {
  success: boolean;
  data: Platform[];
  total: number;
}

/**
 * Get all platforms
 */
export async function getPlatforms(status?: string): Promise<Platform[]> {
  try {
    console.log('🚀 Client Service: Getting platforms');
    
    const params = status ? `?status=${status}` : '';
    const endpoint = `/api/v0/platforms${params}`;
    
    const response = await nextjsApiClient.get<PlatformsResponse>(endpoint);
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success) {
      console.warn('⚠️ Client Service: No response data received or request failed');
      return [];
    }
    
    const platforms = response.data.data || [];
    console.log('✅ Client Service: Successfully retrieved platforms:', platforms.length);
    return platforms;
  } catch (error) {
    console.error('💥 Client Service: Error in getPlatforms:', error);
    throw error;
  }
}

/**
 * Get platform by ID
 */
export async function getPlatformById(platformId: string): Promise<Platform | null> {
  try {
    console.log(`🚀 Client Service: Getting platform ${platformId}`);
    
    const endpoint = `/api/v0/platforms/${platformId}`;
    const response = await nextjsApiClient.get<{ success: boolean; data: Platform }>(endpoint);
    
    if (response.error) {
      if (response.status === 404) {
        console.warn(`⚠️ Platform not found: ${platformId}`);
        return null;
      }
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success) {
      console.warn('⚠️ Client Service: No response data received or request failed');
      return null;
    }
    
    console.log('✅ Client Service: Successfully retrieved platform');
    return response.data.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getPlatformById:', error);
    throw error;
  }
}

/**
 * Get platform by name
 */
export async function getPlatformByName(name: string): Promise<Platform | null> {
  try {
    console.log(`🚀 Client Service: Getting platform by name: ${name}`);
    
    const platforms = await getPlatforms('ACTIVE'); // Only get active platforms
    const platform = platforms.find(p => p.name.toLowerCase() === name.toLowerCase());
    
    if (!platform) {
      console.warn(`⚠️ Platform not found with name: ${name}`);
      return null;
    }
    
    console.log(`✅ Client Service: Found platform: ${platform.name} (${platform.id})`);
    return platform;
  } catch (error) {
    console.error(`💥 Client Service: Error getting platform by name ${name}:`, error);
    throw error;
  }
}

/**
 * Get active platforms only
 */
export async function getActivePlatforms(): Promise<Platform[]> {
  return getPlatforms('ACTIVE');
}

/**
 * Check if a platform supports a specific feature
 */
export function platformSupportsFeature(platform: Platform, feature: string): boolean {
  if (!platform.products) return false;
  
  switch (feature) {
    case 'identity':
      return platform.products.identity?.is_supported || false;
    case 'engagement':
      return platform.products.engagement?.is_supported || false;
    case 'publish_content':
      return platform.products.publish_content?.is_supported || false;
    case 'income':
      return platform.products.income?.is_supported || false;
    case 'activity':
      return platform.products.activity?.is_supported || false;
    case 'switch':
      return platform.products.switch?.is_supported || false;
    default:
      return false;
  }
}