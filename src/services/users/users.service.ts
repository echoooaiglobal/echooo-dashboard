// src/services/users/users.service.ts
// Client-side service for calling Next.js API routes

import { nextjsApiClient } from '@/lib/nextjs-api';
import { 
  User,
  UserDetail,
  UpdateUserRequest,
  UpdateUserResponse,
  GetUserResponse,
  UserListResponse,
  UserStatsResponse,
  UserSearchParams,
  UserStatusUpdate,
  UserRoleUpdate,
  AdminPasswordReset
} from '@/types/users';

/**
 * Get all users with optional filtering and pagination
 */
export async function getUsers(params?: UserSearchParams): Promise<UserDetail[]> {
  try {
    console.log('🚀 Client Service: Starting getUsers call');
    
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('getUsers can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `/api/v0/users?${queryString}`
      : '/api/v0/users';

    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<UserListResponse>(endpoint);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status
    });
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No valid users data received');
      throw new Error('Failed to get users');
    }
    
    console.log(`✅ Client Service: Successfully fetched ${response.data.users?.length || 0} users`);
    return response.data.users || [];
  } catch (error) {
    console.error('💥 Client Service: Error in getUsers:', error);
    throw error;
  }
}

/**
 * Get a user by ID
 */
export async function getUser(userId: string): Promise<UserDetail> {
  try {
    console.log(`🚀 Client Service: Starting getUser call for ${userId}`);
    
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('getUser can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const endpoint = `/api/v0/users/${userId}`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<GetUserResponse>(endpoint);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status,
      success: response.data?.success
    });
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success || !response.data.data) {
      console.warn('⚠️ Client Service: No valid user data received');
      throw new Error(response.data?.error || 'Failed to get user');
    }
    
    console.log('✅ Client Service: Successfully fetched user');
    return response.data.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getUser:', error);
    throw error;
  }
}

/**
 * Update user profile information
 */
export async function updateUser(userId: string, updateData: UpdateUserRequest): Promise<User> {
  try {
    console.log(`🚀 Client Service: Starting updateUser call for ${userId}`);
    console.log('📋 Client Service: Update data:', updateData);
    
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('updateUser can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const endpoint = `/api/v0/users/${userId}`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.put<UpdateUserResponse>(endpoint, updateData);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status,
      success: response.data?.success
    });
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success || !response.data.data) {
      console.warn('⚠️ Client Service: No valid user data received');
      throw new Error(response.data?.error || 'Failed to update user');
    }
    
    console.log('✅ Client Service: Successfully updated user');
    console.log('📊 Client Service: Updated user data:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('💥 Client Service: Error in updateUser:', error);
    throw error;
  }
}

/**
 * Get user statistics (admin only)
 */
export async function getUserStats(): Promise<UserStatsResponse> {
  try {
    console.log('🚀 Client Service: Starting getUserStats call');
    
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('getUserStats can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const endpoint = '/api/v0/users/stats';
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<UserStatsResponse>(endpoint);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status
    });
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No valid user stats data received');
      throw new Error('Failed to get user stats');
    }
    
    console.log('✅ Client Service: Successfully fetched user stats');
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getUserStats:', error);
    throw error;
  }
}

/**
 * Update user status (admin only)
 */
export async function updateUserStatus(userId: string, status: string): Promise<void> {
  try {
    console.log(`🚀 Client Service: Starting updateUserStatus call for ${userId}`);
    
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('updateUserStatus can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const endpoint = `/api/v0/users/${userId}/status`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.put(endpoint, { status });
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    console.log('✅ Client Service: Successfully updated user status');
  } catch (error) {
    console.error('💥 Client Service: Error in updateUserStatus:', error);
    throw error;
  }
}

/**
 * Get users by type
 */
export async function getUsersByType(userType: 'platform' | 'b2c' | 'influencer'): Promise<UserDetail[]> {
  try {
    console.log(`🚀 Client Service: Starting getUsersByType call for ${userType}`);
    
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('getUsersByType can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    let endpoint: string;
    switch (userType) {
      case 'platform':
        endpoint = '/api/v0/users/platform-users';
        break;
      case 'b2c':
        endpoint = '/api/v0/users/b2c-users';
        break;
      case 'influencer':
        endpoint = '/api/v0/users/influencers';
        break;
      default:
        throw new Error(`Invalid user type: ${userType}`);
    }

    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<UserDetail[]>(endpoint);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status
    });
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No valid users data received');
      return [];
    }
    
    console.log(`✅ Client Service: Successfully fetched ${response.data.length} ${userType} users`);
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getUsersByType:', error);
    throw error;
  }
}