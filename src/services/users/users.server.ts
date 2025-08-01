// src/services/users/users.server.ts
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  User,
  UserDetail,
  UpdateUserRequest,
  UserListResponse,
  UserStatsResponse,
  UserSearchParams
} from '@/types/users';

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
      console.warn('⚠️ Server: No user data received from FastAPI');
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
 * Get user statistics from FastAPI backend (server-side)
 */
export async function getUserStatsServer(
  authToken?: string
): Promise<UserStatsResponse> {
  try {
    console.log('🚀 Server: Starting getUserStatsServer call');
    
    const endpoint = '/users/stats'; // Based on the backend endpoint
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
      throw new Error('Failed to get user stats');
    }
    
    console.log('✅ Server: Successfully fetched user stats');
    return response.data;
  } catch (error) {
    console.error('💥 Server: Error in getUserStatsServer:', error);
    throw error;
  }
}

/**
 * Update user status from FastAPI backend (server-side)
 */
export async function updateUserStatusServer(
  userId: string,
  status: string,
  authToken?: string
): Promise<void> {
  try {
    console.log(`🚀 Server: Starting updateUserStatusServer call for ${userId}`);
    
    const endpoint = `/users/${userId}/status`;
    console.log(`📞 Server: Making API call to ${endpoint}`);
    
    const response = await serverApiClient.put(
      endpoint,
      { status },
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error updating user status:', response.error);
      throw new Error(response.error.message);
    }
    
    console.log('✅ Server: Successfully updated user status');
  } catch (error) {
    console.error(`💥 Server: Error in updateUserStatusServer for ${userId}:`, error);
    throw error;
  }
}

/**
 * Get users by type from FastAPI backend (server-side)
 */
export async function getUsersByTypeServer(
  userType: 'platform' | 'b2c' | 'influencer',
  authToken?: string
): Promise<UserDetail[]> {
  try {
    console.log(`🚀 Server: Starting getUsersByTypeServer call for ${userType}`);
    
    let endpoint: string;
    switch (userType) {
      case 'platform':
        endpoint = '/users/platform-users';
        break;
      case 'b2c':
        endpoint = '/users/b2c-users';
        break;
      case 'influencer':
        endpoint = '/users/influencers';
        break;
      default:
        throw new Error(`Invalid user type: ${userType}`);
    }
    
    console.log(`📞 Server: Making API call to ${endpoint}`);
    
    const response = await serverApiClient.get<UserDetail[]>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error fetching users by type:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Server: No users data received from FastAPI');
      return [];
    }
    
    console.log(`✅ Server: Successfully fetched ${response.data.length} ${userType} users`);
    return response.data;
  } catch (error) {
    console.error(`💥 Server: Error in getUsersByTypeServer for ${userType}:`, error);
    throw error;
  }
}