// src/services/message-templates/message-templates.server.ts
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';

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
  auto_assign_agent?: boolean;
  target_list_id: string;
}

export interface UpdateMessageTemplateRequest {
  subject?: string;
  content?: string;
  is_global?: boolean;
  auto_assign_agent?: boolean;
  target_list_id?: string;
}

/**
 * Get message templates for a specific company (server-side)
 * Calls FastAPI backend from Next.js API route
 */
export async function getMessageTemplatesByCompanyServer(companyId: string, authToken?: string): Promise<MessageTemplate[]> {
  try {
    console.log(`Server: Fetching message templates for company ${companyId}`);
    
    const response = await serverApiClient.get<MessageTemplate[]>(
      ENDPOINTS.MESSAGE_TEMPLATES.BY_COMPANY(companyId),
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching message templates:', response.error);
      throw new Error(response.error.message);
    }
    
    console.log('Server: Message templates fetched successfully:', response.data);
    return response.data || [];
  } catch (error) {
    console.error(`Server: Error fetching message templates for company ${companyId}:`, error);
    throw error;
  }
}

/**
 * Create a new message template (server-side)
 * Calls FastAPI backend from Next.js API route
 */
export async function createMessageTemplateServer(data: CreateMessageTemplateRequest, authToken?: string): Promise<MessageTemplate> {
  try {
    console.log('Server: Creating message template with data:', data);
    
    const requestData = {
      ...data,
      is_global: data.is_global ?? true
    };
    
    const response = await serverApiClient.post<MessageTemplate>(
      ENDPOINTS.MESSAGE_TEMPLATES.CREATE,
      requestData,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error creating message template:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('No data received from FastAPI server');
    }
    
    console.log('Server: Message template created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Server: Error creating message template:', error);
    throw error;
  }
}

/**
 * Get a specific message template by ID (server-side)
 */
export async function getMessageTemplateByIdServer(templateId: string, authToken?: string): Promise<MessageTemplate | null> {
  try {
    console.log(`Server: Fetching message template ${templateId}`);
    
    const response = await serverApiClient.get<MessageTemplate>(
      ENDPOINTS.MESSAGE_TEMPLATES.DETAIL(templateId),
      {},
      authToken
    );
    
    if (response.error) {
      if (response.status === 404) {
        console.warn(`Message template not found with ID ${templateId}`);
        return null;
      }
      console.error('Server: FastAPI Error fetching message template:', response.error);
      throw new Error(response.error.message);
    }
    
    console.log('Server: Message template fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Server: Error fetching message template with ID ${templateId}:`, error);
    throw error;
  }
}