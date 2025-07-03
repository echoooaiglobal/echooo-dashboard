// src/services/video-results/public-video-results.ts

import { VideoResult } from '@/types/user-detailed-info';

/**
 * Public video results service for shared campaign analytics
 * This service fetches campaign data without requiring user authentication
 */

interface PublicVideoResultsResponse {
  results: VideoResult[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Get video results for public sharing (no authentication required)
 */
export async function getPublicVideoResults(
  campaignId: string, 
  page: number = 1, 
  limit: number = 200
): Promise<VideoResult[]> {
  try {
    console.log(`🔍 Fetching public video results for campaign: ${campaignId}`);
    
    const response = await fetch(`/api/v0/public/campaign/${campaignId}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // No authorization header for public access
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Public API Error:', response.status, errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch public campaign data`);
    }

    const data: { success: boolean; results: VideoResult[]; total: number } = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Public API returned unsuccessful response');
    }

    console.log(`✅ Successfully fetched ${data.results?.length || 0} public video results`);
    return data.results || [];
    
  } catch (error) {
    console.error('💥 Error fetching public video results:', error);
    throw error;
  }
}

/**
 * Server-side version for Next.js API routes
 */
export async function getPublicVideoResultsServer(
  campaignId: string,
  page: number = 1,
  limit: number = 200
): Promise<PublicVideoResultsResponse> {
  try {
    console.log(`🔍 Server: Fetching public video results for campaign: ${campaignId}`);
    
    // Get the base URL for the current environment
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/v0/public/campaign/${campaignId}?page=${page}&limit=${limit}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Server Public API Error:', response.status, errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch public campaign data`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Public API returned unsuccessful response');
    }

    console.log(`✅ Server: Successfully fetched ${data.results?.length || 0} public video results`);
    
    return {
      results: data.results || [],
      total: data.total || 0,
      page: data.page || page,
      limit: data.limit || limit
    };
    
  } catch (error) {
    console.error('💥 Server error fetching public video results:', error);
    throw error;
  }
}