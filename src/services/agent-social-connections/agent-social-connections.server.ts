// src/services/agent-social-connections/agent-social-connections.server.ts
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  AgentSocialConnection,
  AgentSocialConnectionCreate,
  AgentSocialConnectionUpdate,
  AgentSocialConnectionsPaginatedResponse,
  UserPlatformConnectionsStatus,
  TokenValidationResponse,
  AutomationStatusResponse,
  ConnectionHealthCheck,
  PlatformConnectionRequest,
  OAuthInitiateRequest,
  OAuthInitiateResponse,
  OAuthStatusResponse
} from '@/services/agent-social-connections/agent-social-connections.service';


/**
 * Initiate OAuth connection from FastAPI backend (server-side)
 */
export async function initiateOAuthConnectionServer(
  initiateRequest: OAuthInitiateRequest,
  authToken?: string
): Promise<OAuthInitiateResponse> {
  try {
    console.log('Server: Initiating OAuth connection');
    console.log('Server: Initiate request:', initiateRequest);
    
    const endpoint = ENDPOINTS.AGENT_SOCIAL_CONNECTIONS.INITIATE_CONNECTION;
    
    const response = await serverApiClient.post<{ data: OAuthInitiateResponse }>(
      endpoint,
      initiateRequest,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error initiating OAuth connection:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No OAuth initiation data received from FastAPI');
      throw new Error('No OAuth initiation data received');
    }
    
    console.log('Server: OAuth connection initiated successfully:', response.data.data.platform);
    return response.data.data;
  } catch (error) {
    console.error('Server: Error initiating OAuth connection:', error);
    throw error;
  }
}

/**
 * Check OAuth connection status from FastAPI backend (server-side)
 */
export async function checkOAuthStatusServer(
  platform: string,
  state: string,
  authToken?: string
): Promise<OAuthStatusResponse> {
  try {
    console.log(`Server: Checking OAuth status for ${platform} with state ${state}`);
    
    const params = new URLSearchParams({ state });
    const endpoint = `${ENDPOINTS.AGENT_SOCIAL_CONNECTIONS.OAUTH_STATUS(platform)}?${params.toString()}`;
    
    const response = await serverApiClient.get<{ data: OAuthStatusResponse }>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error checking OAuth status:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No OAuth status data received from FastAPI');
      throw new Error('No OAuth status data received');
    }
    
    console.log('Server: OAuth status checked successfully:', response.data.data.status);
    return response.data.data;
  } catch (error) {
    console.error(`Server: Error checking OAuth status for ${platform}:`, error);
    throw error;
  }
}

/**
 * Create a new social media connection from FastAPI backend (server-side)
 */
export async function createSocialConnectionServer(
  connectionData: AgentSocialConnectionCreate,
  authToken?: string
): Promise<AgentSocialConnection> {
  try {
    console.log('Server: Creating social connection');
    console.log('Server: Connection data:', connectionData);
    
    const endpoint = ENDPOINTS.AGENT_SOCIAL_CONNECTIONS.CREATE;
    
    const response = await serverApiClient.post<AgentSocialConnection>(
      endpoint,
      connectionData,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error creating social connection:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No social connection data received from FastAPI');
      throw new Error('No social connection data received');
    }
    
    console.log('Server: Social connection created successfully:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('Server: Error creating social connection:', error);
    throw error;
  }
}

/**
 * Get a specific social connection by ID from FastAPI backend (server-side)
 */
export async function getSocialConnectionServer(
  connectionId: string,
  authToken?: string
): Promise<AgentSocialConnection> {
  try {
    console.log(`Server: Fetching social connection ${connectionId}`);
    
    const endpoint = ENDPOINTS.AGENT_SOCIAL_CONNECTIONS.GET(connectionId);
    
    const response = await serverApiClient.get<AgentSocialConnection>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching social connection:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No social connection data received from FastAPI');
      throw new Error('No social connection data received');
    }
    
    console.log('Server: Social connection fetched successfully:', response.data.id);
    return response.data;
  } catch (error) {
    console.error(`Server: Error fetching social connection ${connectionId}:`, error);
    throw error;
  }
}

/**
 * Get user social connections from FastAPI backend (server-side)
 */
export async function getUserSocialConnectionsServer(
  userId?: string,
  platformId?: string,
  activeOnly: boolean = true,
  authToken?: string
): Promise<AgentSocialConnection[]> {
  try {
    console.log('Server: Fetching user social connections');
    
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (platformId) params.append('platform_id', platformId);
    params.append('active_only', activeOnly.toString());
    
    const endpoint = `${ENDPOINTS.AGENT_SOCIAL_CONNECTIONS.USER_CONNECTIONS}?${params.toString()}`;
    
    const response = await serverApiClient.get<AgentSocialConnection[]>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching user social connections:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No user social connections data received from FastAPI');
      return [];
    }
    
    console.log('Server: User social connections fetched successfully:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('Server: Error fetching user social connections:', error);
    throw error;
  }
}

/**
 * Get paginated social connections from FastAPI backend (server-side)
 */
export async function getSocialConnectionsPaginatedServer(
  page: number = 1,
  pageSize: number = 10,
  userId?: string,
  platformId?: string,
  activeOnly: boolean = true,
  search?: string,
  authToken?: string
): Promise<AgentSocialConnectionsPaginatedResponse> {
  try {
    console.log('Server: Fetching paginated social connections');
    
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      active_only: activeOnly.toString()
    });
    
    if (userId) params.append('user_id', userId);
    if (platformId) params.append('platform_id', platformId);
    if (search) params.append('search', search);
    
    const endpoint = `${ENDPOINTS.AGENT_SOCIAL_CONNECTIONS.LIST}?${params.toString()}`;
    
    const response = await serverApiClient.get<AgentSocialConnectionsPaginatedResponse>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching paginated social connections:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No paginated social connections data received from FastAPI');
      throw new Error('No paginated social connections data received');
    }
    
    console.log('Server: Paginated social connections fetched successfully:', response.data.total);
    return response.data;
  } catch (error) {
    console.error('Server: Error fetching paginated social connections:', error);
    throw error;
  }
}

/**
 * Update social connection from FastAPI backend (server-side)
 */
export async function updateSocialConnectionServer(
  connectionId: string,
  updateData: AgentSocialConnectionUpdate,
  authToken?: string
): Promise<AgentSocialConnection> {
  try {
    console.log(`Server: Updating social connection ${connectionId}`);
    console.log('Server: Update data:', updateData);
    
    const endpoint = ENDPOINTS.AGENT_SOCIAL_CONNECTIONS.UPDATE(connectionId);
    
    const response = await serverApiClient.put<AgentSocialConnection>(
      endpoint,
      updateData,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error updating social connection:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No updated social connection data received from FastAPI');
      throw new Error('No updated social connection data received');
    }
    
    console.log('Server: Social connection updated successfully:', response.data.id);
    return response.data;
  } catch (error) {
    console.error(`Server: Error updating social connection ${connectionId}:`, error);
    throw error;
  }
}

/**
 * Delete social connection from FastAPI backend (server-side)
 */
export async function deleteSocialConnectionServer(
  connectionId: string,
  authToken?: string
): Promise<{ message: string }> {
  try {
    console.log(`Server: Deleting social connection ${connectionId}`);
    
    const endpoint = ENDPOINTS.AGENT_SOCIAL_CONNECTIONS.DELETE(connectionId);
    
    const response = await serverApiClient.delete<{ message: string }>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error deleting social connection:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No delete response data received from FastAPI');
      throw new Error('No delete response data received');
    }
    
    console.log('Server: Social connection deleted successfully');
    return response.data;
  } catch (error) {
    console.error(`Server: Error deleting social connection ${connectionId}:`, error);
    throw error;
  }
}

/**
 * Get user platform connections status from FastAPI backend (server-side)
 */
export async function getUserPlatformConnectionsStatusServer(
  userId?: string,
  authToken?: string
): Promise<UserPlatformConnectionsStatus> {
  try {
    console.log('Server: Fetching user platform connections status');
    
    const params = userId ? `?user_id=${userId}` : '';
    const endpoint = `${ENDPOINTS.AGENT_SOCIAL_CONNECTIONS.PLATFORM_STATUS}${params}`;
    
    const response = await serverApiClient.get<UserPlatformConnectionsStatus>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching platform connections status:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No platform connections status data received from FastAPI');
      throw new Error('No platform connections status data received');
    }
    
    console.log('Server: Platform connections status fetched successfully');
    return response.data;
  } catch (error) {
    console.error('Server: Error fetching platform connections status:', error);
    throw error;
  }
}

/**
 * Connect platform account from FastAPI backend (server-side)
 */
export async function connectPlatformAccountServer(
  platformRequest: PlatformConnectionRequest,
  authToken?: string
): Promise<AgentSocialConnection> {
  try {
    console.log('Server: Connecting platform account');
    console.log('Server: Platform request:', platformRequest);
    
    const endpoint = ENDPOINTS.AGENT_SOCIAL_CONNECTIONS.CONNECT;
    
    const response = await serverApiClient.post<AgentSocialConnection>(
      endpoint,
      platformRequest,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error connecting platform account:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No platform connection data received from FastAPI');
      throw new Error('No platform connection data received');
    }
    
    console.log('Server: Platform account connected successfully:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('Server: Error connecting platform account:', error);
    throw error;
  }
}

/**
 * Disconnect platform account from FastAPI backend (server-side)
 */
export async function disconnectPlatformAccountServer(
  connectionId: string,
  authToken?: string
): Promise<{ message: string }> {
  try {
    console.log(`Server: Disconnecting platform account ${connectionId}`);
    
    const endpoint = ENDPOINTS.AGENT_SOCIAL_CONNECTIONS.DISCONNECT(connectionId);
    
    const response = await serverApiClient.post<{ message: string }>(
      endpoint,
      {},
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error disconnecting platform account:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No disconnect response data received from FastAPI');
      throw new Error('No disconnect response data received');
    }
    
    console.log('Server: Platform account disconnected successfully');
    return response.data;
  } catch (error) {
    console.error(`Server: Error disconnecting platform account ${connectionId}:`, error);
    throw error;
  }
}

/**
 * Validate connection token from FastAPI backend (server-side)
 */
export async function validateConnectionTokenServer(
  connectionId: string,
  authToken?: string
): Promise<TokenValidationResponse> {
  try {
    console.log(`Server: Validating connection token ${connectionId}`);
    
    const endpoint = ENDPOINTS.AGENT_SOCIAL_CONNECTIONS.VALIDATE_TOKEN;
    
    const response = await serverApiClient.post<TokenValidationResponse>(
      endpoint,
      { connection_id: connectionId },
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error validating connection token:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No token validation data received from FastAPI');
      throw new Error('No token validation data received');
    }
    
    console.log('Server: Connection token validated successfully');
    return response.data;
  } catch (error) {
    console.error(`Server: Error validating connection token ${connectionId}:`, error);
    throw error;
  }
}

/**
 * Refresh connection token from FastAPI backend (server-side)
 */
export async function refreshConnectionTokenServer(
  connectionId: string,
  authToken?: string
): Promise<TokenValidationResponse> {
  try {
    console.log(`Server: Refreshing connection token ${connectionId}`);
    
    const endpoint = ENDPOINTS.AGENT_SOCIAL_CONNECTIONS.REFRESH_TOKEN(connectionId);
    
    const response = await serverApiClient.post<TokenValidationResponse>(
      endpoint,
      {},
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error refreshing connection token:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No token refresh data received from FastAPI');
      throw new Error('No token refresh data received');
    }
    
    console.log('Server: Connection token refreshed successfully');
    return response.data;
  } catch (error) {
    console.error(`Server: Error refreshing connection token ${connectionId}:`, error);
    throw error;
  }
}

/**
 * Toggle automation for connection from FastAPI backend (server-side)
 */
export async function toggleConnectionAutomationServer(
  connectionId: string,
  enabled: boolean,
  authToken?: string
): Promise<AutomationStatusResponse> {
  try {
    console.log(`Server: Toggling automation for connection ${connectionId}`);
    
    const endpoint = ENDPOINTS.AGENT_SOCIAL_CONNECTIONS.TOGGLE_AUTOMATION;
    
    const response = await serverApiClient.post<AutomationStatusResponse>(
      endpoint,
      { connection_id: connectionId, enabled },
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error toggling automation:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No automation toggle data received from FastAPI');
      throw new Error('No automation toggle data received');
    }
    
    console.log('Server: Automation toggled successfully');
    return response.data;
  } catch (error) {
    console.error(`Server: Error toggling automation for connection ${connectionId}:`, error);
    throw error;
  }
}

/**
 * Get automation status for connection from FastAPI backend (server-side)
 */
export async function getAutomationStatusServer(
  connectionId: string,
  authToken?: string
): Promise<AutomationStatusResponse> {
  try {
    console.log(`Server: Getting automation status for connection ${connectionId}`);
    
    const endpoint = ENDPOINTS.AGENT_SOCIAL_CONNECTIONS.AUTOMATION_STATUS(connectionId);
    
    const response = await serverApiClient.get<AutomationStatusResponse>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error getting automation status:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No automation status data received from FastAPI');
      throw new Error('No automation status data received');
    }
    
    console.log('Server: Automation status retrieved successfully');
    return response.data;
  } catch (error) {
    console.error(`Server: Error getting automation status for connection ${connectionId}:`, error);
    throw error;
  }
}

/**
 * Check connection health from FastAPI backend (server-side)
 */
export async function checkConnectionHealthServer(
  connectionId: string,
  authToken?: string
): Promise<ConnectionHealthCheck> {
  try {
    console.log(`Server: Checking connection health ${connectionId}`);
    
    const endpoint = ENDPOINTS.AGENT_SOCIAL_CONNECTIONS.HEALTH_CHECK(connectionId);
    
    const response = await serverApiClient.get<ConnectionHealthCheck>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error checking connection health:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No connection health data received from FastAPI');
      throw new Error('No connection health data received');
    }
    
    console.log('Server: Connection health checked successfully');
    return response.data;
  } catch (error) {
    console.error(`Server: Error checking connection health ${connectionId}:`, error);
    throw error;
  }
}

/**
 * Get connection statistics from FastAPI backend (server-side)
 */
export async function getConnectionStatisticsServer(
  authToken?: string
): Promise<Record<string, any>> {
  try {
    console.log('Server: Fetching connection statistics');
    
    const endpoint = ENDPOINTS.AGENT_SOCIAL_CONNECTIONS.STATISTICS;
    
    const response = await serverApiClient.get<Record<string, any>>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching connection statistics:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No connection statistics data received from FastAPI');
      throw new Error('No connection statistics data received');
    }
    
    console.log('Server: Connection statistics fetched successfully');
    return response.data;
  } catch (error) {
    console.error('Server: Error fetching connection statistics:', error);
    throw error;
  }
}