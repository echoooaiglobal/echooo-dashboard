import { NextResponse } from 'next/server';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  console.log('✅ API Route Hit: /api/discover/influencers');

  // const authKey = process.env.IMAI_API_AUTH_KEY;
  // if (!authKey) {
  //   return NextResponse.json(
  //     { error: "API authentication key not configured" },
  //     { status: 500 }
  //   );
  // }

  try {
    const filters: InfluencerSearchFilter = await request.json();

    const apiUrl = 'https://api.sandbox.insightiq.ai/v1/social/creators/profiles/search';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(apiUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic NGUyZmVmYzQtYjczZC00YWNhLTg4MjUtNWVhM2VhYTBmYjM2OjMzN2UxNjliLWZkYjYtNDdkNS04NmVjLWE3MDJkZjYyN2JiMw=='
      },
      next: { revalidate: 36000 },
      body: JSON.stringify(filters),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return NextResponse.json(
        { 
          error: "external_api_error",
          status: response.status,
          message: errorText
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    // console.log('API Response:', data);

    // Transform response
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
      gender:item.gender,
      introduction: item.introduction,
      language: item.language,
      livestream_metrics: item.livestream_metrics,
      platform_account_type: item.platform_account_type,
      subscriber_count: item.subscriber_count,
      url: item.url,
      work_platform: {
        id: item.work_platform.id,
        name: item.work_platform.name,
        logo_url: item.work_platform.logo_url
      }
    })) || [];

    return NextResponse.json({
      influencers,
      metadata: data.metadata,
    });

  } catch (error: any) {
    console.error('Route Error:', error);
    return NextResponse.json(
      { 
        error: "internal_error",
        message: error.message || "Unknown error occurred"
      },
      { status: 500 }
    );
  }
}

function formatNumber(num: number): string {
  if (!num) return "0";
  if (num >= 1000000) return `${(num/1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num/1000).toFixed(1)}K`;
  return num.toString();
}