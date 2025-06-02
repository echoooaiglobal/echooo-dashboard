// src/app/api/v0/discover/search/route.ts
import { NextResponse } from 'next/server';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';

export const dynamic = 'force-dynamic';

/**
 * Formats a number into a readable string format
 * @param num - The number to format
 * @returns Formatted string (e.g., "1.2M", "15.3K", "500")
 */
function formatNumber(num: number): string {
  if (!num) return "0";
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Creates a Base64 encoded Basic Authentication header
 * @param username - Client ID for authentication
 * @param password - Client Secret for authentication
 * @returns Base64 encoded authentication string
 */
function createBasicAuthHeader(username: string, password: string): string {
  const credentials = `${username}:${password}`;
  return Buffer.from(credentials).toString('base64');
}

/**
 * POST /api/v0/discover/search
 * Searches for influencers based on provided filters
 */
export async function POST(request: Request) {
  console.log('✅ API Route Hit: /api/v0/discover/search');

  try {
    const filters: InfluencerSearchFilter = await request.json();
    // console.log('filters00001: ', filters)
    // Environment variables
    const apiUrl = process.env.INSIGHTIQ_BASE_URL;
    const clientId = process.env.INSIGHTIQ_CLIENT_ID;
    const clientSecret = process.env.INSIGHTIQ_CLIENT_SECRET;

    // Validate required environment variables
    if (!apiUrl || !clientId || !clientSecret) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { 
          error: "configuration_error",
          message: "Missing required API configuration"
        },
        { status: 500 }
      );
    }

    // Construct API endpoint
    const endpoint = `${apiUrl}/social/creators/profiles/search`;

    // Create dynamic Basic Auth header
    const basicAuth = createBasicAuthHeader(clientId, clientSecret);

    // Set up request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`
        },
        next: { revalidate: 36000 },
        body: JSON.stringify(filters),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('External API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });

        return NextResponse.json(
          { 
            error: "external_api_error",
            status: response.status,
            message: errorText || `HTTP ${response.status}: ${response.statusText}`
          },
          { status: 502 }
        );
      }

      const data = await response.json();

      // Transform and normalize response data
      const influencers = data.data?.map((item: any) => ({
        id: item?.external_id,
        username: item.platform_username,
        name: item.full_name,
        profileImage: item.image_url,
        followers: formatNumber(item.follower_count),
        engagements: formatNumber(item?.engagements),
        engagementRate: item.engagement_rate,
        isVerified: item.is_verified || false,
        age_group: item.age_group,
        average_likes: item.average_likes,
        average_views: item.average_views,
        contact_details: item.contact_details,
        content_count: item.content_count,
        creator_locations: item.creator_locations,
        external_id: item.external_id,
        gender: item.gender,
        introduction: item.introduction,
        language: item.language,
        livestream_metrics: item.livestream_metrics,
        platform_account_type: item.platform_account_type,
        subscriber_count: item.subscriber_count,
        url: item.url,
        work_platform: {
          id: item.work_platform?.id,
          name: item.work_platform?.name,
          logo_url: item.work_platform?.logo_url
        }
      })) || [];

      return NextResponse.json({
        success: true,
        influencers,
        metadata: data.metadata,
        total: influencers.length
      });

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('Request timeout');
        return NextResponse.json(
          { 
            error: "timeout_error",
            message: "Request timed out after 10 seconds"
          },
          { status: 408 }
        );
      }
      
      throw fetchError;
    }

  } catch (error: any) {
    console.error('Route Handler Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return NextResponse.json(
      { 
        error: "internal_error",
        message: error.message || "An unexpected error occurred"
      },
      { status: 500 }
    );
  }
}