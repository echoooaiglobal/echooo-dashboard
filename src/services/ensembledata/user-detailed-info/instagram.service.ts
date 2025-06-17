// src/services/ensembledata/user-detailed-info/instagram.service.ts

import { 
  ProcessedInstagramData,
  InstagramPostInput, 
  InstagramApiError,
  ThirdPartyApiResponse,
  InstagramUserInfo,
  InstagramPostInfo
} from '@/types/user-detailed-info';

/**
 * Extract Instagram post code from URL or return the code directly
 */
export function extractInstagramPostCode(input: string): string {
  // If it's already a code (no URL format), return as is
  if (!input.includes('/') && !input.includes('instagram.com')) {
    return input;
  }

  // Extract code from various Instagram URL formats
  const patterns = [
    /instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
    /instagram\.com\/reel\/([a-zA-Z0-9_-]+)/,
    /instagram\.com\/tv\/([a-zA-Z0-9_-]+)/,
    /\/p\/([a-zA-Z0-9_-]+)/,
    /\/reel\/([a-zA-Z0-9_-]+)/,
    /\/tv\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  throw new Error('Invalid Instagram URL or post code format');
}

/**
 * Safely extract nested data from API response
 */
function safeExtract(obj: any, path: string, defaultValue: any = null): any {
  try {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : defaultValue;
    }, obj);
  } catch {
    return defaultValue;
  }
}

/**
 * Extract user information from Instagram API response
 */
function extractUserInfo(response: ThirdPartyApiResponse): InstagramUserInfo {
  const owner = safeExtract(response, 'data.owner', {});
  
  return {
    user_ig_id: safeExtract(owner, 'id', ''),
    full_name: safeExtract(owner, 'full_name', ''),
    profile_pic_url: safeExtract(owner, 'profile_pic_url', ''),
    username: safeExtract(owner, 'username', ''),
    followers_count: safeExtract(owner, 'edge_followed_by.count'),
    following_count: undefined, // Not available in this response
    posts_count: safeExtract(owner, 'edge_owner_to_timeline_media.count'),
    is_verified: safeExtract(owner, 'is_verified', false),
    is_private: safeExtract(owner, 'is_private', false),
    biography: undefined, // Not available in this response
  };
}

/**
 * Extract post information from Instagram API response
 */
function extractPostInfo(response: ThirdPartyApiResponse): InstagramPostInfo {
  const data = safeExtract(response, 'data', {});
  const caption = safeExtract(data, 'edge_media_to_caption.edges.0.node.text', '');
  
  return {
    post_id: safeExtract(data, 'id', ''),
    shortcode: safeExtract(data, 'shortcode', ''),
    caption: caption,
    created_at: safeExtract(data, 'taken_at_timestamp') 
      ? new Date(safeExtract(data, 'taken_at_timestamp') * 1000).toISOString()
      : new Date().toISOString(),
    video_url: safeExtract(data, 'video_url'),
    view_counts: safeExtract(data, 'video_view_count', 0),
    play_counts: safeExtract(data, 'video_play_count', 0),
    title: safeExtract(data, 'title', caption || ''),
    video_duration: safeExtract(data, 'video_duration'),
    media_preview: safeExtract(data, 'media_preview', ''),
    thumbnail_src: safeExtract(data, 'thumbnail_src', '') || safeExtract(data, 'display_url', ''),
    display_url: safeExtract(data, 'display_url', ''),
    comments_count: safeExtract(data, 'edge_media_to_comment.count', 0) || 
                   safeExtract(data, 'edge_media_to_parent_comment.count', 0),
    likes_count: safeExtract(data, 'edge_media_preview_like.count', 0),
    media_type: safeExtract(data, 'is_video', false) ? 'video' : 'image',
    is_video: safeExtract(data, 'is_video', false),
    has_audio: safeExtract(data, 'has_audio', false),
  };
}

/**
 * Process raw Instagram API response into our standardized format
 */
export function processInstagramResponse(response: ThirdPartyApiResponse): ProcessedInstagramData {
  try {
    console.log('🔄 Processing Instagram API response...');
    
    // Check if response has expected structure
    if (!response.data) {
      throw new Error('Invalid response structure: missing data field');
    }

    const user = extractUserInfo(response);
    const post = extractPostInfo(response);

    // Validate required fields
    if (!user.username || !post.post_id) {
      throw new Error('Missing required fields in API response');
    }

    console.log('✅ Instagram response processed successfully');
    console.log('📊 Extracted data:', { username: user.username, postId: post.post_id });

    return {
      user,
      post,
      success: true,
      raw_response: response, // Store full response for debugging
    };
  } catch (error) {
    console.error('💥 Error processing Instagram response:', error);
    
    return {
      user: {
        user_ig_id: '',
        full_name: '',
        profile_pic_url: '',
        username: '',
      },
      post: {
        post_id: '',
        shortcode: '',
        created_at: new Date().toISOString(),
        comments_count: 0,
        likes_count: 0,
        media_type: 'image',
        is_video: false,
      },
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process response',
      raw_response: response,
    };
  }
}

/**
 * Get Instagram post details using 3rd party API
 */
export async function getInstagramPostDetails(
  input: InstagramPostInput
): Promise<ProcessedInstagramData> {
  try {
    console.log('🔍 Instagram Service: Starting post details fetch');
    console.log('📝 Instagram Service: Input:', input);

    let postCode: string;

    // Extract post code from URL or use direct code
    if (input.url) {
      postCode = extractInstagramPostCode(input.url);
    } else if (input.code) {
      postCode = input.code;
    } else {
      throw new Error('Either URL or post code must be provided');
    }

    console.log('🔑 Instagram Service: Extracted post code:', postCode);

    // Import the EDClient dynamically to avoid potential SSR issues
    const { EDClient } = await import('ensembledata');
    
    // Initialize client with token from environment
    const token = process.env.NEXT_PUBLIC_ENSEMBLEDATA_AUTH_TOKEN;
    console.log('🔑 Instagram Service: Using', token)
    if (!token) {
      throw new Error('Instagram API token not configured');
    }

    const client = new EDClient({ token });
    console.log('🚀 Instagram Service: Calling 3rd party API...');

    // Call 3rd party API
    const rawResponse = await client.instagram.postInfoAndComments({
      code: postCode,
    });

    console.log('📦 Instagram Service: Raw API response received');
    console.log('✅ Instagram Service: API call successful');

    // Process the raw response into our standardized format
    const processedData = processInstagramResponse(rawResponse);
    
    if (!processedData.success) {
      throw new Error(processedData.message || 'Failed to process Instagram data');
    }

    return processedData;
  } catch (error) {
    console.error('💥 Instagram Service: Error fetching post details:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Return error response in consistent format
    return {
      user: {
        user_ig_id: '',
        full_name: '',
        profile_pic_url: '',
        username: '',
      },
      post: {
        post_id: '',
        shortcode: '',
        created_at: new Date().toISOString(),
        comments_count: 0,
        likes_count: 0,
        media_type: 'image',
        is_video: false,
      },
      success: false,
      message: errorMessage,
    };
  }
}

/**
 * Map processed Instagram data to backend API format
 */
export function mapToBackendFormat(
  processed: ProcessedInstagramData, 
  campaignId: string
): any {
  if (!processed.success) {
    throw new Error('Cannot map failed Instagram data to backend format');
  }

  return {
    campaign_id: campaignId,
    user_ig_id: processed.user.user_ig_id,
    full_name: processed.user.full_name,
    influencer_username: processed.user.username,
    profile_pic_url: processed.user.profile_pic_url,
    post_id: processed.post.post_id,
    title: processed.post.title || processed.post.caption || '',
    view_counts: processed.post.view_counts || 0,
    play_counts: processed.post.play_counts || 0,
    comment_counts: processed.post.comments_count,
    media_preview: processed.post.media_preview || '',
    duration: processed.post.video_duration || 0,
    thumbnail: processed.post.thumbnail_src || processed.post.display_url || '',
    post_created_at: processed.post.created_at,
    post_result_obj: processed.raw_response || {}, // Full response for backend
  };
}

/**
 * Validate Instagram post URL format
 */
export function validateInstagramUrl(url: string): boolean {
  const instagramPatterns = [
    /^https?:\/\/(www\.)?instagram\.com\/p\/[a-zA-Z0-9_-]+\/?.*$/,
    /^https?:\/\/(www\.)?instagram\.com\/reel\/[a-zA-Z0-9_-]+\/?.*$/,
    /^https?:\/\/(www\.)?instagram\.com\/tv\/[a-zA-Z0-9_-]+\/?.*$/,
  ];

  return instagramPatterns.some(pattern => pattern.test(url));
}
