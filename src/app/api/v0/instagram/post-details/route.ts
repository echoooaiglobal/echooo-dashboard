// src/app/api/instagram/post-details/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  extractInstagramPostCode, 
  fetchInstagramPostDetails 
} from '@/services/ensembledata/user-detailed-info/instagram.server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API Route: Starting Instagram post details fetch');
    
    // Parse request body
    const body = await request.json();
    const { url, code } = body;

    // Validate input
    if (!url && !code) {
      console.log('❌ API Route: Missing required input');
      return NextResponse.json(
        { success: false, message: 'Either URL or post code must be provided' },
        { status: 400 }
      );
    }

    let postCode: string;

    // Extract post code from URL or use direct code
    if (url) {
      try {
        postCode = extractInstagramPostCode(url);
        console.log('🔑 API Route: Extracted post code from URL:', postCode);
      } catch (error) {
        console.log('❌ API Route: Invalid URL format:', url);
        return NextResponse.json(
          { success: false, message: 'Invalid Instagram URL format' },
          { status: 400 }
        );
      }
    } else {
      postCode = code;
      console.log('🔑 API Route: Using direct post code:', postCode);
    }

    // Validate post code format
    if (!postCode || postCode.length < 5 || !/^[a-zA-Z0-9_-]+$/.test(postCode)) {
      console.log('❌ API Route: Invalid post code format:', postCode);
      return NextResponse.json(
        { success: false, message: 'Invalid post code format' },
        { status: 400 }
      );
    }

    console.log('🚀 API Route: Calling Instagram server handler...');

    // Call server handler to fetch from 3rd party API
    const processedData = await fetchInstagramPostDetails(postCode);
    
    if (!processedData.success) {
      console.log('❌ API Route: Failed to fetch Instagram data:', processedData.message);
      return NextResponse.json(
        { success: false, message: processedData.message || 'Failed to fetch Instagram data' },
        { status: 422 }
      );
    }

    console.log('✅ API Route: Successfully fetched and processed Instagram data');
    console.log('📊 API Route: User:', processedData.user.username, 'Post:', processedData.post.post_id);

    return NextResponse.json(processedData);

  } catch (error) {
    console.error('💥 API Route: Unexpected error:', error);
    
    let errorMessage = 'Internal server error';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle specific error types with appropriate status codes
      if (error.message.includes('timeout')) {
        statusCode = 408; // Request Timeout
        errorMessage = 'Request timed out while fetching Instagram data';
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        statusCode = 503; // Service Unavailable
        errorMessage = 'Instagram service temporarily unavailable';
      } else if (error.message.includes('token') || error.message.includes('auth')) {
        statusCode = 500; // Internal Server Error (don't expose auth details)
        errorMessage = 'Service configuration error';
      } else if (error.message.includes('JSON')) {
        statusCode = 400; // Bad Request
        errorMessage = 'Invalid request format';
      }
    }
    
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: statusCode }
    );
  }
}