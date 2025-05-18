// src/services/campaign/campaign.service.ts
import { apiClient } from '@/services/api';
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

export interface Campaign {
  id: string;
  name: string;
  brand_name: string;
  category_id: string;
  category: CampaignCategory[]
  audience_age_group: string;
  budget: string;
  status_id: string;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
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
    
    return response.data as Campaign;
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
    const response = await apiClient.get<Campaign>(ENDPOINTS.CAMPAIGNS.DETAIL(id));
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.data;
  } catch (error) {
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