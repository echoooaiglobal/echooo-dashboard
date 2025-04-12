import { NextResponse } from 'next/server';
import { DiscoverSearchParams } from '@/lib/types';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const authKey = process.env.INFLUENCER_API_AUTH_KEY;
  if (!authKey) {
    return NextResponse.json(
      { error: "API authentication key not configured" },
      { status: 500 }
    );
  }

  try {
    const body: DiscoverSearchParams = await request.json();
    
    // Construct the EXACT payload structure that works in Postman
    const apiPayload = {
      audience_source: body.audience_source || "any",
      sort: {
        field: body.sort?.field || "followers",
        direction: body.sort?.direction || "desc"
      },
      filter: {
        ...body.filter,
        // Only provide defaults if the field is completely missing
        ...(!('followers' in body.filter) && {
          followers: {
            left_number: "5000",
            right_number: "1000000"
          }
        }),
        ...(!('gender' in body.filter) && {
          gender: {
            code: "",
            weight: 0.3
          }
        }),
        ...(!('geo' in body.filter) && {
          geo: []
        })
      },
      paging: {
        skip: body.paging?.skip || 0,
        limit: body.paging?.limit || 10
      }
    };

    // Construct the URL with query parameters
    const apiUrl = new URL(`${process.env.IMAI_BASE_API}/search/newv1?platform=instagram&n=${apiPayload.paging.skip}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(apiUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': authKey
      },
      body: JSON.stringify(apiPayload),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
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
    
    // Transform response to match your frontend needs
    const influencers = data.accounts?.map((item: any) => ({
      id: item.account?.user_profile?.user_id,
      username: item.account?.user_profile?.username,
      name: item.account?.user_profile?.fullname,
      profileImage: item.account?.user_profile?.picture,
      followers: formatNumber(item.account?.user_profile?.followers),
      engagements: formatNumber(item.account?.user_profile?.engagements),
      engagementRate: `${(item.account?.user_profile?.engagement_rate * 100).toFixed(2)}%`,
      isVerified: item.account?.user_profile?.is_verified || false,
      match: {
        gender: item.match?.user_profile?.gender,
        country: item.match?.user_profile?.geo?.country?.name
      }
    })) || [];

    return NextResponse.json({
      influencers,
      totalResults: data.total || 0,
      data,
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

// Helper function to format numbers
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num/1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num/1000).toFixed(1)}K`;
  return num.toString();
}