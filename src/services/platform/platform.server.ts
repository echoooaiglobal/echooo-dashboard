// src/services/platform/platform.server.ts
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';
import { Platform } from '@/types/platform';
import { ENDPOINTS } from '@/services/api/endpoints';

/**
 * Get all platforms (server-side)
 * Calls FastAPI backend from Next.js API route
 */
export async function getPlatformsServer(authToken?: string): Promise<Platform[]> {
  try {
    console.log('🔄 Fetching platforms from FastAPI backend...');
    
    const response = await serverApiClient.get<Platform[]>(
      ENDPOINTS.PLATFORMS.LIST, // Using endpoint from endpoints file
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Error response from platforms API:', response.error);
      throw new Error(response.error.message);
    }
    
    console.log('✅ Platforms fetched successfully:', response.data?.length || 0, 'platforms');
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching platforms:', error);
    throw error;
  }
}

/**
 * Get a specific platform by ID (server-side)
 */
export async function getPlatformByIdServer(platformId: string, authToken?: string): Promise<Platform | null> {
  try {
    console.log(`🔄 Fetching platform with ID: ${platformId}`);
    
    const response = await serverApiClient.get<Platform>(
      ENDPOINTS.PLATFORMS.DETAIL(platformId), // Using endpoint from endpoints file
      {},
      authToken
    );
    
    if (response.error) {
      if (response.status === 404) {
        console.warn(`⚠️ Platform not found with ID ${platformId}`);
        return null;
      }
      throw new Error(response.error.message);
    }
    
    console.log('✅ Platform fetched successfully:', response.data?.name);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching platform with ID ${platformId}:`, error);
    throw error;
  }
}

/**
 * Get platforms by status (active/inactive)
 */
export async function getPlatformsByStatusServer(status: string, authToken?: string): Promise<Platform[]> {
  try {
    console.log(`🔄 Fetching platforms with status: ${status}`);
    
    const response = await serverApiClient.get<Platform[]>(
      ENDPOINTS.PLATFORMS.BY_STATUS(status), // Using endpoint from endpoints file
      {},
      authToken
    );
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    console.log(`✅ Platforms with status ${status} fetched:`, response.data?.length || 0);
    return response.data || [];
  } catch (error) {
    console.error(`❌ Error fetching platforms with status ${status}:`, error);
    throw error;
  }
}