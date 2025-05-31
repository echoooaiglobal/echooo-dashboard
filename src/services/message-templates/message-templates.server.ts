// src/services/message-templates/message-templates.server.ts
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';

export interface MessageTemplate {
  id: string;
  subject: string;
  content: string;
  company_id: string;
  campaign_id: string;
  is_global: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMessageTemplateRequest {
  subject: string;
  content: string;
  company_id: string;
  campaign_id: string;
  is_global?: boolean;
  auto_assign_agent?:boolean;
  target_list_id:string;
}

/**
 * Get message templates for a specific company (server-side)
 * Calls FastAPI backend from Next.js API route
 */
export async function getMessageTemplatesByCompanyServer(companyId: string, authToken?: string): Promise<MessageTemplate[]> {
  try {
    const response = await serverApiClient.get<MessageTemplate[]>(
      `/message-templates/company/${companyId}`,
      {},
      authToken
    );
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching message templates for company ${companyId}:`, error);
    throw error;
  }
}

/**
 * Create a new message template (server-side)
 * Calls FastAPI backend from Next.js API route
 */
export async function createMessageTemplateServer(data: CreateMessageTemplateRequest, authToken?: string): Promise<MessageTemplate> {
  try {
    const requestData = {
      ...data,
      is_global: data.is_global ?? true
    };
    
    const response = await serverApiClient.post<MessageTemplate>(
      '/message-templates',
      requestData,
      {},
      authToken
    );
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error creating message template:', error);
    throw error;
  }
}

/**
 * Get a specific message template by ID (server-side)
 */
export async function getMessageTemplateByIdServer(templateId: string, authToken?: string): Promise<MessageTemplate | null> {
  try {
    const response = await serverApiClient.get<MessageTemplate>(
      `/message-templates/${templateId}`,
      {},
      authToken
    );
    
    if (response.error) {
      if (response.status === 404) {
        console.warn(`Message template not found with ID ${templateId}`);
        return null;
      }
      throw new Error(response.error.message);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching message template with ID ${templateId}:`, error);
    throw error;
  }
}