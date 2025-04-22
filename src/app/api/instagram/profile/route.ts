// src/app/api/instagram/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { InstagramProfileResponse } from '@/types/instagram';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const proxyImage = searchParams.get('proxyImage');

  if (!userId) {
    return NextResponse.json(
      { error: 'userId parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Validate API configuration
    if (!process.env.IMAI_BASE_API || !process.env.INFLUENCER_API_AUTH_KEY) {
      return NextResponse.json(
        { error: 'Instagram API configuration is missing' },
        { status: 500 }
      );
    }

    // Fetch Instagram profile data
    const response = await fetch(`${process.env.IMAI_BASE_API}/raw/ig/user/info/?url=${encodeURIComponent(userId)}`, {
      headers: {
        'authkey': process.env.INFLUENCER_API_AUTH_KEY
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Instagram API error:', errorData);
      throw new Error(`Instagram API responded with status: ${response.status}`);
    }

    const data: InstagramProfileResponse = await response.json();

    // If proxyImage=true, modify the response to use a local proxy for the image
    if (proxyImage === 'true' && data.user?.profile_pic_url_hd) {
      const proxiedData = {
        ...data,
        user: {
          ...data.user,
          profile_pic_url_hd: `/api/instagram/image-proxy?url=${encodeURIComponent(data.user.profile_pic_url_hd)}`,
          profile_pic_url: `/api/instagram/image-proxy?url=${encodeURIComponent(data.user.profile_pic_url)}`,
        }
      };
      return NextResponse.json(proxiedData);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Instagram profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Instagram profile details. Check server logs for details.' },
      { status: 500 }
    );
  }
}