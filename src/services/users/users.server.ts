// src/services/users/users.server.ts
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { User } from '@/types/auth';
import { 
  UserDetail,
  UpdateUserRequest,
  UserListResponse,
  UserStatsResponse,
  UserSearchParams,
  PasswordChangeRequest,
  PasswordChangeResponse
} from '@/types/users';


/**
 * Get current user profile from FastAPI backend (server-side)
 */
export async function getCurrentUserServer(authToken?: string): Promise<UserDetail> {
  try {
    console.log('🚀 Server: Starting getCurrentUserServer call');
    
    const endpoint = ENDPOINTS.AUTH.ME;
    console.log(`📞 Server: Making API call to ${endpoint}`);
    
    const response = await serverApiClient.get<UserDetail>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error fetching current user:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Server: No current user data received from FastAPI');
      throw new Error('Current user not found');
    }
    
    console.log('✅ Server: Successfully fetched current user');
    return response.data;
  } catch (error) {
    console.error('💥 Server: Error in getCurrentUserServer:', error);
    throw error;
  }
}

/**
 * Update current user profile from FastAPI backend (server-side)
 * Uses FormData for all requests to maintain consistency
 */
export async function updateCurrentUserServer(
  updateData: UpdateUserRequest,
  authToken?: string
): Promise<User> {
  try {
    console.log('🚀 Server: Starting updateCurrentUserServer call');
    console.log('📋 Server: Update data:', {
      hasFirstName: !!updateData.first_name,
      hasLastName: !!updateData.last_name,
      hasFullName: !!updateData.full_name,
      hasPhoneNumber: !!updateData.phone_number,
      hasProfileImage: !!updateData.profile_image_url,
      fields: Object.keys(updateData)
    });
    
    const endpoint = ENDPOINTS.AUTH.ME;
    console.log(`📞 Server: Making API call to ${endpoint}`);
    
    // Always use FormData for consistency
    const formData = new FormData();
    
    // Add all text fields
    if (updateData.first_name !== undefined) {
      formData.append('first_name', updateData.first_name || '');
    }
    if (updateData.last_name !== undefined) {
      formData.append('last_name', updateData.last_name || '');
    }
    if (updateData.full_name !== undefined) {
      formData.append('full_name', updateData.full_name || '');
    }
    if (updateData.phone_number !== undefined) {
      formData.append('phone_number', updateData.phone_number || '');
    }
    if (updateData.language !== undefined) {
      formData.append('language', updateData.language || '');
    }
    
    // Handle profile image if present
    if (updateData.profile_image_url && updateData.profile_image_url.startsWith('data:image/')) {
      console.log('🖼️ Server: Profile image detected, converting from base64');
      try {
        const base64Data = updateData.profile_image_url;
        const arr = base64Data.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = Buffer.from(arr[1], 'base64');
        
        // Create a Blob and then File
        const blob = new Blob([bstr], { type: mime });
        const file = new File([blob], 'profile-image.jpg', { type: mime });
        
        formData.append('profile_image', file);
        console.log('✅ Server: Profile image converted and added to FormData');
      } catch (error) {
        console.error('❌ Server: Error converting base64 to file:', error);
        // Continue without image rather than failing completely
        console.log('⚠️ Server: Continuing update without profile image');
      }
    }
    
    // Use serverApiClient with FormData - handles everything consistently
    const response = await serverApiClient.put<User>(
      endpoint,
      formData,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error updating current user:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Server: No updated user data received from FastAPI');
      throw new Error('Failed to update current user profile');
    }
    
    console.log('✅ Server: Successfully updated current user profile');
    return response.data;
  } catch (error) {
    console.error('💥 Server: Error in updateCurrentUserServer:', error);
    throw error;
  }
}

/**
 * Change current user password from FastAPI backend (server-side)
 */
export async function changePasswordServer(
  passwordData: PasswordChangeRequest,
  authToken?: string
): Promise<PasswordChangeResponse> {
  try {
    console.log('🚀 Server: Starting changePasswordServer call');
    
    const endpoint = ENDPOINTS.AUTH.PASSWORD;
    console.log(`📞 Server: Making API call to ${endpoint}`);
    
    // Send all three fields to match backend schema
    const requestData = {
      current_password: passwordData.current_password,
      new_password: passwordData.new_password,
      confirm_password: passwordData.confirm_password
    };
    
    const response = await serverApiClient.put<PasswordChangeResponse>(
      endpoint,
      requestData,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error changing password:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Server: No password change response received from FastAPI');
      throw new Error('Failed to change password');
    }
    
    console.log('✅ Server: Successfully changed password');
    return response.data;
  } catch (error) {
    console.error('💥 Server: Error in changePasswordServer:', error);
    throw error;
  }
}

/**
 * Get all users from FastAPI backend (server-side)
 */
export async function getUsersServer(
  params?: UserSearchParams,
  authToken?: string
): Promise<UserDetail[]> {
  try {
    console.log('🚀 Server: Starting getUsersServer call');
    console.log('📋 Server: Search params:', params);
    
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
      ? `${ENDPOINTS.USERS.List}?${queryString}`
      : ENDPOINTS.USERS.List;
    
    console.log(`📞 Server: Making API call to ${endpoint}`);
    
    const response = await serverApiClient.get<UserDetail[]>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error fetching users:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Server: No users data received from FastAPI');
      return [];
    }
    
    console.log(`✅ Server: Successfully fetched ${response.data.length} users`);
    return response.data;
  } catch (error) {
    console.error('💥 Server: Error in getUsersServer:', error);
    throw error;
  }
}

/**
 * Get a user by ID from FastAPI backend (server-side)
 */
export async function getUserServer(
  userId: string,
  authToken?: string
): Promise<UserDetail> {
  try {
    console.log(`🚀 Server: Starting getUserServer call for ${userId}`);
    
    const endpoint = ENDPOINTS.USERS.DETAIL(userId);
    console.log(`📞 Server: Making API call to ${endpoint}`);
    
    const response = await serverApiClient.get<UserDetail>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error fetching user:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Server: No user data received from FastAPI');
      throw new Error('User not found');
    }
    
    console.log('✅ Server: Successfully fetched user');
    return response.data;
  } catch (error) {
    console.error(`💥 Server: Error in getUserServer for ${userId}:`, error);
    throw error;
  }
}

/**
 * Update user from FastAPI backend (server-side)
 */
export async function updateUserServer(
  userId: string,
  updateData: UpdateUserRequest,
  authToken?: string
): Promise<User> {
  try {
    console.log(`🚀 Server: Starting updateUserServer call for ${userId}`);
    console.log('📋 Server: Update data:', updateData);
    
    const endpoint = ENDPOINTS.USERS.UPDATE(userId);
    console.log(`📞 Server: Making API call to ${endpoint}`);
    
    const response = await serverApiClient.put<User>(
      endpoint,
      updateData,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error updating user:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Server: No updated user data received from FastAPI');
      throw new Error('Failed to update user');
    }
    
    console.log('✅ Server: Successfully updated user');
    return response.data;
  } catch (error) {
    console.error(`💥 Server: Error in updateUserServer for ${userId}:`, error);
    throw error;
  }
}

/**
 * Delete user from FastAPI backend (server-side)
 */
export async function deleteUserServer(
  userId: string,
  authToken?: string
): Promise<void> {
  try {
    console.log(`🚀 Server: Starting deleteUserServer call for ${userId}`);
    
    const endpoint = ENDPOINTS.USERS.DELETE(userId);
    console.log(`📞 Server: Making API call to ${endpoint}`);
    
    const response = await serverApiClient.delete(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error deleting user:', response.error);
      throw new Error(response.error.message);
    }
    
    console.log('✅ Server: Successfully deleted user');
  } catch (error) {
    console.error(`💥 Server: Error in deleteUserServer for ${userId}:`, error);
    throw error;
  }
}

/**
 * Get user statistics from FastAPI backend (server-side)
 */
export async function getUserStatsServer(authToken?: string): Promise<UserStatsResponse> {
  try {
    console.log('🚀 Server: Starting getUserStatsServer call');
    
    const endpoint = '/admin/users/stats';
    console.log(`📞 Server: Making API call to ${endpoint}`);
    
    const response = await serverApiClient.get<UserStatsResponse>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error fetching user stats:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Server: No user stats data received from FastAPI');
      throw new Error('Failed to get user statistics');
    }
    
    console.log('✅ Server: Successfully fetched user statistics');
    return response.data;
  } catch (error) {
    console.error('💥 Server: Error in getUserStatsServer:', error);
    throw error;
  }
}