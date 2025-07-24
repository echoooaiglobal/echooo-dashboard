// src/types/bulk-assignments.ts

export interface BulkAssignmentRequest {
  campaign_list_id: string;
  strategy: 'round_robin' | 'load_balanced' | 'manual';
  preferred_agent_ids?: string[] | null;
  max_influencers_per_agent: number;
  force_new_assignments: boolean;
}

export interface BulkAssignmentResponse {
  success: boolean;
  message: string;
  total_influencers: number;
  total_agents: number;
  assignments_created: number;
  assignment_details: {
    agent_id: string;
    agent_name?: string;
    assigned_influencers: number;
    assignment_id: string;
  }[];
}

export interface BulkAssignmentError {
  success: false;
  error: string;
  details?: any;
}