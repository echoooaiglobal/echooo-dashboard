// src/types/assignments.ts

export interface Agent {
  id: string;
  name: string;
  platform_id: string;
  is_available: boolean;
  status_id: string | null;
}

export interface CampaignList {
  id: string;
  campaign_id: string;
  name: string;
  description: string;
  message_template_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  company_id: string;
  brand_name: string;
  description: string | null;
  status_id: string;
  start_date: string | null;
  end_date: string | null;
}

export interface AssignmentStatus {
  id: string;
  name: string;
}

export interface Assignment {
  id: string;
  list_id: string;
  agent_id: string;
  status_id: string;
  created_at: string;
  updated_at: string;
  agent: Agent;
  campaign_list: CampaignList;
  campaign: Campaign;
  status: AssignmentStatus;
}

export interface AssignmentsResponse {
  assignments: Assignment[];
  total_assignments: number;
  agent_info: any | null;
}