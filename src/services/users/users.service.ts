// src/services/users/users.service.ts
// Updated with profile and password endpoints

'use client';

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { User } from '@/types/auth';
import { 
  UserDetail,
  UpdateUserRequest,
  GetUserResponse,
  UpdateUserResponse,
  UserListResponse,
  UserStatsResponse,
  UserSearchParams,
  UserStatusUpdate,
  UserRoleUpdate,
  AdminPasswordReset,
  PasswordChangeRequest,
  PasswordChangeResponse
} from '@/types/users';

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<UserDetail> {
  try {
    console.log('🚀 Client Service: Starting getCurrentUser call');
    
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('getCurrentUser can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const endpoint = `/api/v0/auth/me`;
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
      throw new Error(response.data?.error || 'Failed to get current user');
    }
    
    console.log('✅ Client Service: Successfully fetched current user');
    return response.data.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getCurrentUser:', error);
    throw error;
  }
}

/**
 * Update current user profile
 */
export async function updateCurrentUser(updateData: UpdateUserRequest): Promise<User> {
  try {
    console.log('🚀 Client Service: Starting updateCurrentUser call');
    console.log('📋 Client Service: Update data:', updateData);
    
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('updateCurrentUser can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const endpoint = `/api/v0/auth/me`;
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
      throw new Error(response.data?.error || 'Failed to update profile');
    }
    
    console.log('✅ Client Service: Successfully updated current user profile');
    return response.data.data;
  } catch (error) {
    console.error('💥 Client Service: Error in updateCurrentUser:', error);
    throw error;
  }
}

/**
 * Change current user password
 */
export async function changePassword(passwordData: PasswordChangeRequest): Promise<PasswordChangeResponse> {
  try {
    console.log('🚀 Client Service: Starting changePassword call');
    
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('changePassword can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const endpoint = `/api/v0/auth/password`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.put<PasswordChangeResponse>(endpoint, passwordData);
    
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
    
    if (!response.data || !response.data.success) {
      console.warn('⚠️ Client Service: Password change failed');
      throw new Error(response.data?.error || 'Failed to change password');
    }
    
    console.log('✅ Client Service: Successfully changed password');
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in changePassword:', error);
    throw error;
  }
}

/**
 * Get user by ID
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
    return response.data.data;
  } catch (error) {
    console.error('💥 Client Service: Error in updateUser:', error);
    throw error;
  }
}

/**
 * Get all users
 */
export async function getUsers(params?: UserSearchParams): Promise<UserDetail[]> {
  try {
    console.log('🚀 Client Service: Starting getUsers call');
    console.log('📋 Client Service: Search params:', params);
    
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
    
    const response = await nextjsApiClient.get<UserDetail[]>(endpoint);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      dataLength: Array.isArray(response.data) ? response.data.length : 'Not array'
    });
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No users data received');
      return [];
    }
    
    console.log(`✅ Client Service: Successfully fetched ${response.data.length} users`);
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getUsers:', error);
    throw error;
  }
}