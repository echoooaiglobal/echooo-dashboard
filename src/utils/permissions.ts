// src/utils/permissions.ts - NEW FILE
import { Role } from '@/types/auth';
import { DetailedRole, PermissionCheck } from '@/types/auth';

// Role-Permission mappings based on your backend permissions
export const ROLE_PERMISSIONS: Record<DetailedRole, string[]> = {
  // ========== PLATFORM ROLES ==========
  platform_super_admin: ['*:*'], // Full access to everything
  
  platform_admin: [
    // User & Role Management
    'user:*', 'role:*', 'permission:*',
    // Company Management  
    'company:*', 'company_user:*', 'company_contact:*',
    // Campaign Management
    'campaign:*', 'campaign_list:*', 'campaign_influencer:*',
    // System & Data
    'system_setting:*', 'data:*', 'system:*',
    // Analytics & Reports
    'analytics:*', 'report:*',
    // API & Webhooks
    'api:*', 'webhook:*',
    // Notifications
    'notification:*'
  ],

  platform_manager: [
    // User Management (limited)
    'user:read', 'user:update', 'user:change_status',
    // Company Management
    'company:read', 'company:update', 'company_user:read', 'company_user:update',
    // Campaign Oversight
    'campaign:read', 'campaign:update', 'campaign_list:read',
    // Analytics & Reports
    'analytics:dashboard', 'analytics:real_time', 'report:campaign_performance', 'report:agent_performance',
    // System Monitoring
    'system:monitor', 'system:alerts'
  ],

  platform_developer: [
    // System & Technical
    'system:*', 'api:*', 'webhook:*',
    // Data Management
    'data:backup', 'data:restore', 'data:audit',
    // Limited user access for debugging
    'user:read', 'company:read', 'campaign:read'
  ],

  platform_customer_support: [
    // User Support
    'user:read', 'user:update', 'user:verify', 'user:reset_password',
    // Company Support
    'company:read', 'company_user:read', 'company_contact:read',
    // Campaign Support
    'campaign:read', 'campaign_list:read', 'influencer:read',
    // Notifications
    'notification:*'
  ],

  platform_account_manager: [
    // Company Relationship Management
    'company:read', 'company:update', 'company_user:read', 'company_user:invite',
    // Campaign Oversight
    'campaign:read', 'campaign_list:read',
    // Analytics for client reporting
    'analytics:dashboard', 'report:campaign_performance', 'report:financial'
  ],

  platform_financial_manager: [
    // Financial Operations
    'order:*', 'report:financial',
    // Company & User info for billing
    'company:read', 'user:read',
    // System settings related to payments
    'system_setting:read'
  ],

  platform_content_moderator: [
    // Content Moderation
    'campaign:read', 'influencer:read', 'influencer:verify', 'influencer:ban',
    // Social Account Verification
    'social_account:read', 'social_account:verify',
    // Message Templates
    'message_template:read'
  ],

  platform_data_analyst: [
    // Analytics & Reporting
    'analytics:*', 'report:*',
    // Profile Analytics
    'profile_analytics:*', 'result:read',
    // Read access to core entities
    'campaign:read', 'influencer:read', 'company:read'
  ],

  platform_operations_manager: [
    // Operational Oversight
    'outreach_agent:*', 'agent_social_connection:*', 'agent_assignment:*',
    // Automation Management
    'automation_session:*', 'assignment_history:*',
    // Performance Monitoring
    'system:monitor', 'analytics:dashboard', 'report:agent_performance'
  ],

  platform_agent: [
    // Core Agent Functions
    'assigned_influencer:read', 'assigned_influencer:update', 'assigned_influencer:transfer',
    // Outreach Management
    'influencer_outreach:*', 'automation_session:read', 'automation_session:monitor',
    // Agent Assignments
    'agent_assignment:read', 'agent_assignment:update',
    // Contact Management
    'influencer_contact:*',
    // Communication
    'message_template:read', 'message_template:create', 'communication_channel:read',
    // Social Accounts
    'social_account:read', 'social_account:update',
    // Limited campaign access
    'campaign:read', 'campaign_list:read', 'campaign_influencer:read',
    // Performance tracking
    'assignment_history:read', 'assignment_history:stats',
    // Profile settings
    'user:update', 'notification:read', 'notification:update'
  ],

  // ========== COMPANY ROLES ==========
  b2c_company_owner: [
    // Full company control
    'company:update', 'company_user:*', 'company_contact:*',
    // Campaign Management
    'campaign:*', 'campaign_list:*', 'campaign_influencer:*',
    // Influencer Management
    'influencer:read', 'influencer:export', 'social_account:read',
    // Analytics & Reports
    'analytics:*', 'report:*', 'profile_analytics:*',
    // Templates & Categories
    'message_template:*', 'category:read',
    // Orders & Results
    'order:*', 'result:*'
  ],

  b2c_company_admin: [
    // Company Management
    'company:read', 'company:update', 'company_user:*', 'company_contact:*',
    // Campaign Management
    'campaign:*', 'campaign_list:*', 'campaign_influencer:*',
    // Influencer Access
    'influencer:read', 'social_account:read',
    // Analytics
    'analytics:dashboard', 'analytics:real_time', 'report:campaign_performance',
    // Templates
    'message_template:*'
  ],

  b2c_marketing_director: [
    // Strategic Campaign Management
    'campaign:*', 'campaign_list:*', 'campaign_influencer:*',
    // Influencer Research
    'influencer:read', 'influencer:export', 'social_account:read',
    // Analytics & Performance
    'analytics:*', 'report:campaign_performance', 'report:influencer_performance',
    // Content & Templates
    'message_template:*', 'category:read'
  ],

  b2c_campaign_manager: [
    // Campaign Operations
    'campaign:*', 'campaign_list:*', 'campaign_influencer:*',
    // Influencer Management
    'influencer:read', 'social_account:read', 'influencer_contact:read',
    // Analytics
    'analytics:dashboard', 'report:campaign_performance',
    // Templates
    'message_template:read', 'message_template:create'
  ],

  b2c_campaign_executive: [
    // Campaign Execution
    'campaign:read', 'campaign:update', 'campaign_list:*', 'campaign_influencer:*',
    // Influencer Interaction
    'influencer:read', 'influencer_contact:*',
    // Basic Analytics
    'analytics:dashboard', 'profile_analytics:read'
  ],

  b2c_social_media_manager: [
    // Social Media Focus
    'campaign:read', 'campaign:update', 'campaign_influencer:*',
    // Influencer Relations
    'influencer:read', 'social_account:read', 'influencer_contact:*',
    // Content & Templates
    'message_template:*',
    // Basic Analytics
    'analytics:dashboard'
  ],

  b2c_content_creator: [
    // Content Creation
    'campaign:read', 'message_template:*',
    // Research
    'influencer:read', 'social_account:read',
    // Basic campaign support
    'campaign_list:read'
  ],

  b2c_brand_manager: [
    // Brand Protection
    'campaign:read', 'campaign:update', 'influencer:read',
    // Template Management
    'message_template:*',
    // Performance Monitoring
    'analytics:dashboard', 'report:campaign_performance'
  ],

  b2c_performance_analyst: [
    // Analytics Focus
    'analytics:*', 'report:*', 'profile_analytics:*',
    // Campaign Data
    'campaign:read', 'campaign_influencer:read', 'result:*',
    // Influencer Performance
    'influencer:read', 'social_account:read'
  ],

  b2c_finance_manager: [
    // Financial Operations
    'order:*', 'report:financial',
    // Campaign Budget Oversight
    'campaign:read', 'campaign_influencer:read',
    // Company Financial Data
    'company:read'
  ],

  b2c_account_coordinator: [
    // Coordination Tasks
    'campaign:read', 'campaign:update', 'campaign_influencer:read', 'campaign_influencer:update',
    // Communication
    'influencer_contact:read', 'message_template:read',
    // Basic Analytics
    'analytics:dashboard'
  ],

  b2c_viewer: [
    // Read-only Access
    'campaign:read', 'campaign_list:read', 'campaign_influencer:read',
    'influencer:read', 'analytics:dashboard'
  ],

  // ========== INFLUENCER ROLES ==========
  influencer: [
    // Profile Management
    'social_account:read', 'social_account:update', 'profile_analytics:read',
    // Campaign Participation
    'campaign:read', 'campaign_influencer:read', 'result:create', 'result:update',
    // Orders & Payments
    'order:read', 'order:update',
    // Profile settings
    'user:update', 'notification:read', 'notification:update'
  ],

  influencer_manager: [
    // Extended Influencer Management
    'influencer:read', 'influencer:update', 'social_account:*',
    // Campaign Oversight
    'campaign:read', 'campaign_influencer:*', 'result:*',
    // Analytics
    'analytics:dashboard', 'profile_analytics:*',
    // Communication
    'influencer_contact:*'
  ]
};

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (roles: Role[], check: PermissionCheck): boolean => {
  if (!roles.length) return false;

  const permissionString = `${check.resource}:${check.action}`;
  const wildcardPermission = `${check.resource}:*`;

  return roles.some(role => {
    const rolePermissions = ROLE_PERMISSIONS[role.name as DetailedRole] || [];
    return rolePermissions.includes(permissionString) || 
           rolePermissions.includes(wildcardPermission) ||
           rolePermissions.includes('*:*'); // Super admin wildcard
  });
};

/**
 * Check if user can access a specific resource with action
 */
export const canAccessResource = (roles: Role[], resource: string, action: string): boolean => {
  return hasPermission(roles, { resource, action });
};