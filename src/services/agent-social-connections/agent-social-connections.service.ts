// src/services/agent-social-connections/agent-social-connections.service.ts
'use client';

import { nextjsApiClient } from '@/lib/nextjs-api';

export interface PlatformConnectionRequest {
  platform_id: string;
  oauth_code?: string;
  oauth_state?: string;
  platform_specific_data?: Record<string, any>;
}
// Types based on your backend schemas
export interface AgentSocialConnectionCreate {
  user_id: string;
  platform_id: string;
  platform_user_id: string;
  platform_username: string;
  display_name?: string;
  profile_image_url?: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  scope?: string;
  instagram_business_account_id?: string;
  facebook_page_id?: string;
  facebook_page_access_token?: string;
  facebook_page_name?: string;
  automation_capabilities?: Record<string, any>;
  additional_data?: Record<string, any>;
}

export interface AgentSocialConnectionUpdate {
  platform_username?: string;
  display_name?: string;
  profile_image_url?: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  scope?: string;
  instagram_business_account_id?: string;
  facebook_page_id?: string;
  facebook_page_access_token?: string;
  facebook_page_name?: string;
  automation_capabilities?: Record<string, any>;
  playwright_session_data?: Record<string, any>;
  automation_error_count?: number;
  last_error_message?: string;
  is_active?: boolean;
  additional_data?: Record<string, any>;
  status_id?: string;
}

export interface AgentSocialConnection {
  id: string;
  user_id: string;
  platform_id: string;
  platform_user_id: string;
  platform_username: string;
  display_name?: string;
  profile_image_url?: string;
  expires_at?: string;
  last_oauth_check_at?: string;
  scope?: string;
  instagram_business_account_id?: string;
  facebook_page_id?: string;
  facebook_page_name?: string;
  automation_capabilities?: Record<string, any>;
  last_automation_use_at?: string;
  automation_error_count: number;
  last_error_message?: string;
  last_error_at?: string;
  is_active: boolean;
  additional_data?: Record<string, any>;
  status_id?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
  };
  platform?: {
    id: string;
    name: string;
    logo_url?: string;
    category?: string;
  };
  agent?: {
    id: string;
    assigned_user_id: string;
    is_automation_enabled: boolean;
  };
  status?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface AgentSocialConnectionsPaginatedResponse {
  connections: AgentSocialConnection[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PlatformConnectionStatus {
  platform_id: string;
  platform_name: string;
  is_connected: boolean;
  connection_count: number;
  active_connections: number;
  last_connected?: string;
}

export interface UserPlatformConnectionsStatus {
  user_id: string;
  platforms: PlatformConnectionStatus[];
  total_connections: number;
  active_connections: number;
}

export interface TokenValidationResponse {
  connection_id: string;
  is_valid: boolean;
  expires_at?: string;
  expires_in_hours?: number;
  needs_renewal: boolean;
  last_check: string;
}

export interface AutomationStatusResponse {
  connection_id: string;
  is_automation_enabled: boolean;
  automation_capabilities?: Record<string, any>;
  last_automation_use?: string;
  error_count: number;
  last_error?: string;
}

export interface ConnectionHealthCheck {
  connection_id: string;
  platform_name: string;
  is_healthy: boolean;
  last_successful_operation?: string;
  issues: string[];
  recommendations: string[];
}

// Types for OAuth flow
export interface OAuthInitiateRequest {
  platform_id: string;
  additional_scopes?: string[];
  redirect_url?: string;
}

export interface OAuthInitiateResponse {
  authorization_url: string;
  state: string;
  platform: string;
  expires_in: number;
  instructions: string;
}

export interface OAuthStatusResponse {
  status: 'pending' | 'completed' | 'failed' | 'expired';
  connection_id?: string;
  platform: string;
  created_at?: string;
  error_message?: string;
}

/**
 * Initiate OAuth connection flow
 */
export async function initiateOAuthConnection(
  request: OAuthInitiateRequest
): Promise<OAuthInitiateResponse> {
  try {
    console.log('🚀 Client Service: Initiating OAuth connection');
    
    const endpoint = '/api/v0/agent-social-connections/initiate-connection';
    const response = await nextjsApiClient.post<{ data: OAuthInitiateResponse }>(endpoint, request);
    console.log('responseresponse: ', response)
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No response data received');
      throw new Error('No response data received');
    }
    
    console.log('✅ Client Service: Successfully initiated OAuth connection');
    return response.data.data;
  } catch (error) {
    console.error('💥 Client Service: Error in initiateOAuthConnection:', error);
    throw error;
  }
}

/**
 * Check OAuth connection status
 */
export async function checkOAuthStatus(
  state: string,
  platform: string
): Promise<OAuthStatusResponse> {
  try {
    console.log('🚀 Client Service: Checking OAuth status');
    
    const endpoint = `/api/v0/agent-social-connections/oauth-status/${platform}?state=${encodeURIComponent(state)}`;
    const response = await nextjsApiClient.get<{ data: OAuthStatusResponse }>(endpoint);
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No response data received');
      throw new Error('No response data received');
    }
    
    console.log('✅ Client Service: Successfully checked OAuth status');
    return response.data.data;
  } catch (error) {
    console.error('💥 Client Service: Error in checkOAuthStatus:', error);
    throw error;
  }
}

/**
 * Create a new social media connection for an agent
 */
export async function createSocialConnection(
  connectionData: AgentSocialConnectionCreate
): Promise<AgentSocialConnection> {
  try {
    console.log('🚀 Client Service: Creating social connection');
    
    const endpoint = '/api/v0/agent-social-connections';
    const response = await nextjsApiClient.post<{ data: AgentSocialConnection }>(endpoint, connectionData);
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No response data received');
      throw new Error('No response data received');
    }
    
    console.log('✅ Client Service: Successfully created social connection');
    return response.data.data;
  } catch (error) {
    console.error('💥 Client Service: Error in createSocialConnection:', error);
    throw error;
  }
}

/**
 * Get a specific social connection by ID
 */
export async function getSocialConnection(connectionId: string): Promise<AgentSocialConnection> {
  try {
    console.log(`🚀 Client Service: Getting social connection ${connectionId}`);
    
    const endpoint = `/api/v0/agent-social-connections/${connectionId}`;
    const response = await nextjsApiClient.get<{ data: AgentSocialConnection }>(endpoint);
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No response data received');
      throw new Error('No response data received');
    }
    
    console.log('✅ Client Service: Successfully retrieved social connection');
    return response.data.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getSocialConnection:', error);
    throw error;
  }
}

/**
 * Get all social connections for the current user
 */
export async function getUserSocialConnections(
  platformId?: string,
  activeOnly: boolean = true
): Promise<AgentSocialConnection[]> {
  try {
    console.log('🚀 Client Service: Getting user social connections');
    
    const params = new URLSearchParams();
    if (platformId) params.append('platform_id', platformId);
    params.append('active_only', activeOnly.toString());
    
    const endpoint = `/api/v0/agent-social-connections/user/connections?${params.toString()}`;
    const response = await nextjsApiClient.get<{ data: AgentSocialConnection[] }>(endpoint);
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No response data received');
      return [];
    }
    
    // Handle the API response structure: {"data": [...]}
    const connections = response.data.data || [];
    console.log('✅ Client Service: Successfully retrieved user social connections:', connections.length);
    return connections;
  } catch (error) {
    console.error('💥 Client Service: Error in getUserSocialConnections:', error);
    throw error;
  }
}

/**
 * Get paginated social connections with filters
 */
export async function getSocialConnectionsPaginated(
  page: number = 1,
  pageSize: number = 10,
  userId?: string,
  platformId?: string,
  activeOnly: boolean = true,
  search?: string
): Promise<AgentSocialConnectionsPaginatedResponse> {
  try {
    console.log('🚀 Client Service: Getting paginated social connections');
    
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      active_only: activeOnly.toString()
    });
    
    if (userId) params.append('user_id', userId);
    if (platformId) params.append('platform_id', platformId);
    if (search) params.append('search', search);
    
    const endpoint = `/api/v0/agent-social-connections?${params.toString()}`;
    const response = await nextjsApiClient.get<AgentSocialConnectionsPaginatedResponse>(endpoint);
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No response data received');
      throw new Error('No response data received');
    }
    
    console.log('✅ Client Service: Successfully retrieved paginated social connections');
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getSocialConnectionsPaginated:', error);
    throw error;
  }
}

/**
 * Update a social connection
 */
export async function updateSocialConnection(
  connectionId: string,
  updateData: AgentSocialConnectionUpdate
): Promise<AgentSocialConnection> {
  try {
    console.log(`🚀 Client Service: Updating social connection ${connectionId}`);
    
    const endpoint = `/api/v0/agent-social-connections/${connectionId}`;
    const response = await nextjsApiClient.put<AgentSocialConnection>(endpoint, updateData);
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No response data received');
      throw new Error('No response data received');
    }
    
    console.log('✅ Client Service: Successfully updated social connection');
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in updateSocialConnection:', error);
    throw error;
  }
}

/**
 * Delete a social connection
 */
export async function deleteSocialConnection(connectionId: string): Promise<{ message: string }> {
  try {
    console.log(`🚀 Client Service: Deleting social connection ${connectionId}`);
    
    const endpoint = `/api/v0/agent-social-connections/${connectionId}`;
    const response = await nextjsApiClient.delete<{ message: string }>(endpoint);
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No response data received');
      throw new Error('No response data received');
    }
    
    console.log('✅ Client Service: Successfully deleted social connection');
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in deleteSocialConnection:', error);
    throw error;
  }
}

/**
 * Get platform connection status for current user
 */
export async function getUserPlatformConnectionsStatus(
  userId?: string
): Promise<UserPlatformConnectionsStatus> {
  try {
    console.log('🚀 Client Service: Getting user platform connections status');
    
    const params = userId ? `?user_id=${userId}` : '';
    const endpoint = `/api/v0/agent-social-connections/user/platforms/status${params}`;
    const response = await nextjsApiClient.get<UserPlatformConnectionsStatus>(endpoint);
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No response data received');
      throw new Error('No response data received');
    }
    
    console.log('✅ Client Service: Successfully retrieved platform connections status');
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getUserPlatformConnectionsStatus:', error);
    throw error;
  }
}

/**
 * Connect a platform account
 */
export async function connectPlatformAccount(
  platformRequest: PlatformConnectionRequest
): Promise<AgentSocialConnection> {
  try {
    console.log('🚀 Client Service: Connecting platform account');
    
    const endpoint = '/api/v0/agent-social-connections/connect';
    const response = await nextjsApiClient.post<{ data: AgentSocialConnection }>(endpoint, platformRequest);
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No response data received');
      throw new Error('No response data received');
    }
    
    console.log('✅ Client Service: Successfully connected platform account');
    return response.data.data;
  } catch (error) {
    console.error('💥 Client Service: Error in connectPlatformAccount:', error);
    throw error;
  }
}

/**
 * Disconnect a platform account
 */
export async function disconnectPlatformAccount(connectionId: string): Promise<{ message: string }> {
  try {
    console.log(`🚀 Client Service: Disconnecting platform account ${connectionId}`);
    
    const endpoint = `/api/v0/agent-social-connections/${connectionId}/disconnect`;
    const response = await nextjsApiClient.post<{ message: string }>(endpoint, {});
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No response data received');
      throw new Error('No response data received');
    }
    
    console.log('✅ Client Service: Successfully disconnected platform account');
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in disconnectPlatformAccount:', error);
    throw error;
  }
}

/**
 * Validate connection token
 */
export async function validateConnectionToken(connectionId: string): Promise<TokenValidationResponse> {
  try {
    console.log(`🚀 Client Service: Validating connection token ${connectionId}`);
    
    const endpoint = '/api/v0/agent-social-connections/validate-token';
    const response = await nextjsApiClient.post<TokenValidationResponse>(endpoint, { connection_id: connectionId });
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No response data received');
      throw new Error('No response data received');
    }
    
    console.log('✅ Client Service: Successfully validated connection token');
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in validateConnectionToken:', error);
    throw error;
  }
}

/**
 * Refresh connection token
 */
export async function refreshConnectionToken(connectionId: string): Promise<TokenValidationResponse> {
  try {
    console.log(`🚀 Client Service: Refreshing connection token ${connectionId}`);
    
    const endpoint = `/api/v0/agent-social-connections/${connectionId}/refresh-token`;
    const response = await nextjsApiClient.post<TokenValidationResponse>(endpoint, {});
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No response data received');
      throw new Error('No response data received');
    }
    
    console.log('✅ Client Service: Successfully refreshed connection token');
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in refreshConnectionToken:', error);
    throw error;
  }
}

/**
 * Toggle automation for a connection
 */
export async function toggleConnectionAutomation(
  connectionId: string,
  enabled: boolean
): Promise<AutomationStatusResponse> {
  try {
    console.log(`🚀 Client Service: Toggling automation for connection ${connectionId}`);
    
    const endpoint = '/api/v0/agent-social-connections/automation/toggle';
    const response = await nextjsApiClient.post<AutomationStatusResponse>(endpoint, {
      connection_id: connectionId,
      enabled
    });
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No response data received');
      throw new Error('No response data received');
    }
    
    console.log('✅ Client Service: Successfully toggled automation');
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in toggleConnectionAutomation:', error);
    throw error;
  }
}

/**
 * Get automation status for a connection
 */
export async function getAutomationStatus(connectionId: string): Promise<AutomationStatusResponse> {
  try {
    console.log(`🚀 Client Service: Getting automation status for connection ${connectionId}`);
    
    const endpoint = `/api/v0/agent-social-connections/${connectionId}/automation/status`;
    const response = await nextjsApiClient.get<AutomationStatusResponse>(endpoint);
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No response data received');
      throw new Error('No response data received');
    }
    
    console.log('✅ Client Service: Successfully retrieved automation status');
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getAutomationStatus:', error);
    throw error;
  }
}

/**
 * Check connection health
 */
export async function checkConnectionHealth(connectionId: string): Promise<ConnectionHealthCheck> {
  try {
    console.log(`🚀 Client Service: Checking connection health for ${connectionId}`);
    
    const endpoint = `/api/v0/agent-social-connections/${connectionId}/health`;
    const response = await nextjsApiClient.get<ConnectionHealthCheck>(endpoint);
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No response data received');
      throw new Error('No response data received');
    }
    
    console.log('✅ Client Service: Successfully checked connection health');
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in checkConnectionHealth:', error);
    throw error;
  }
}

/**
 * Get connection statistics for current user
 */
export async function getConnectionStatistics(): Promise<Record<string, any>> {
  try {
    console.log('🚀 Client Service: Getting connection statistics');
    
    const endpoint = '/api/v0/agent-social-connections/statistics';
    const response = await nextjsApiClient.get<Record<string, any>>(endpoint);
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No response data received');
      throw new Error('No response data received');
    }
    
    console.log('✅ Client Service: Successfully retrieved connection statistics');
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getConnectionStatistics:', error);
    throw error;
  }
}