// src/services/campaign/campaign.service.ts - Updated with unified API client

import { apiClient } from '@/lib/api';
import { ENDPOINTS } from '@/services/api/endpoints';

export interface CreateCampaignRequest {
  name: string;
  brand_name: string;
  category_id: string;
  audience_age_group: string;
  budget: number;
  currency_code: string;
  company_id: string;
}

export interface CampaignStatus {
  id: string;
  name: string;
}

export interface CampaignCategory {
  id: string;
  name: string;
}

export interface CampaignLists {
  id: string;
  name: string;
  description: string;
}

export interface CampaignTemplates {
  id: string;
  subject: string;
  content: string;
  company_id: string;
  campaign_id: string;
  is_global: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Status {
  id: string;
  name: string;
}

export interface ListAssignments {
  id: string;
  list_id: string;
  agent_id: string;
  status_id: string;
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  brand_name: string;
  category_id: string;
  category: CampaignCategory | null;
  audience_age_group: string;
  budget: string;
  status_id: string;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
  campaign_lists: CampaignLists[];
  message_templates: CampaignTemplates[];
  list_assignments: ListAssignments[];
  company_id: string;
}

/**
 * Create a new campaign
 */
export async function createCampaign(data: CreateCampaignRequest): Promise<Campaign> {
  try {
    const response = await apiClient.post<Campaign>(ENDPOINTS.CAMPAIGNS.CREATE, data);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
}

/**
 * Get a campaign by ID
 */
export async function getCampaignById(id: string): Promise<Campaign | null> {
  try {
    // Basic UUID validation before making the API call
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    // Alternative for non-hyphenated UUIDs: /^[0-9a-f]{32}$/i
    
    // If the ID doesn't match a valid UUID pattern, return null immediately
    if (!uuidRegex.test(id)) {
      console.warn(`Invalid UUID format for campaign ID: ${id}`);
      return null;
    }
    
    const response = await apiClient.get<Campaign>(ENDPOINTS.CAMPAIGNS.DETAIL(id));
    
    if (response.error) {
      // Handle specific error cases
      if (response.error.message && response.error.message.includes('UUID')) {
        console.warn(`Invalid UUID format: ${id}`);
        return null;
      }
      
      // For other errors, throw normally
      throw new Error(response.error.message);
    }
    
    return response.data;
  } catch (error) {
    // Check if it's a UUID parsing error from the server
    if (error instanceof Error && 
        (error.message.includes('UUID') || 
         error.message.includes('uuid') || 
         error.message.includes('expected length 32'))) {
      console.warn(`UUID parsing error for ID ${id}:`, error);
      return null; // Return null for invalid UUID instead of throwing
    }
    
    // For 404 errors (not found), return null instead of throwing
    if (error instanceof Error && error.message.includes('404')) {
      console.warn(`Campaign not found with ID ${id}`);
      return null;
    }
    
    // Log other errors but don't expose them to the UI
    console.error(`Error fetching campaign with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Get campaigns for a specific company
 */
export async function getCompanyCampaigns(companyId: string): Promise<Campaign[]> {
  try {
    const response = await apiClient.get<Campaign[]>(ENDPOINTS.CAMPAIGNS.COMPANY(companyId));
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching campaigns for company ${companyId}:`, error);
    throw error;
  }
}

/**
 * Get all campaigns
 */
export async function getCampaigns(): Promise<Campaign[]> {
  try {
    const response = await apiClient.get<Campaign[]>(ENDPOINTS.CAMPAIGNS.LIST);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.data || [];
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
}