// src/utils/role-utils.ts - Role checking utilities with permission infrastructure
import { User, Role, UserType, DetailedRole, RoleCheckResult, PlatformRole, CompanyRole, InfluencerRole } from '@/types/auth';

/**
 * Get the user's primary detailed role
 */
export const getPrimaryRole = (roles: Role[]): DetailedRole | null => {
  if (!roles || roles.length === 0) return null;
  return roles[0].name;
};

/**
 * Get the user type from detailed role
 */
export const getUserTypeFromRole = (detailedRole: DetailedRole): UserType => {
  if (detailedRole.startsWith('platform_')) return 'platform';
  if (detailedRole.startsWith('b2c_')) return 'company';
  if (detailedRole.startsWith('influencer')) return 'influencer';
  throw new Error(`Unknown role: ${detailedRole}`);
};

/**
 * Check if user has a specific detailed role
 */
export const hasDetailedRole = (roles: Role[], targetRole: DetailedRole): boolean => {
  return roles.some(role => role.name === targetRole);
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyDetailedRole = (roles: Role[], targetRoles: DetailedRole[]): boolean => {
  return roles.some(role => targetRoles.includes(role.name));
};

/**
 * Check if user is platform role
 */
export const isPlatformRole = (role: DetailedRole): role is PlatformRole => {
  return role.startsWith('platform_');
};

/**
 * Check if user is company role
 */
export const isCompanyRole = (role: DetailedRole): role is CompanyRole => {
  return role.startsWith('company_');
};

/**
 * Check if user is influencer role
 */
export const isInfluencerRole = (role: DetailedRole): role is InfluencerRole => {
  return role.startsWith('influencer');
};

/**
 * Get appropriate dashboard route based on user role
 */
export const getDashboardRouteForRole = (user: User | null, roles: Role[]): string => {
  if (!user || !roles.length) return '/login';
  
  const primaryRole = getPrimaryRole(roles);
  if (!primaryRole) return '/login';
  
  const userType = getUserTypeFromRole(primaryRole);
  
  // For company users, redirect to campaigns if they exist
  if (userType === 'company') {
    return '/dashboard'; // Will be handled by CompanyDashboardPage to redirect to campaigns
  }
  
  return '/dashboard';
};

/**
 * Get role hierarchy level (for future permission inheritance)
 */
export const getRoleHierarchyLevel = (role: DetailedRole): number => {
  const hierarchyMap: Record<string, number> = {
    // Platform hierarchy
    'platform_admin': 100,
    'platform_manager': 80,
    'platform_developer': 75,
    'platform_user': 60,
    'platform_accountant': 50,
    'platform_customer_support': 40,
    'platform_content_moderator': 35,
    'platform_agent': 30,
    
    // Company hierarchy
    'company_admin': 100,
    'company_manager': 80,
    'company_marketer': 60,
    'company_accountant': 50,
    'company_content_creator': 40,
    'company_user': 30,
    
    // Influencer hierarchy
    'influencer_manager': 80,
    'influencer': 50,
  };
  
  return hierarchyMap[role] || 0;
};

/**
 * Check if role has higher hierarchy than target role
 */
export const hasHigherHierarchy = (userRole: DetailedRole, targetRole: DetailedRole): boolean => {
  return getRoleHierarchyLevel(userRole) > getRoleHierarchyLevel(targetRole);
};

/**
 * Get navigation items based on role
 */
export const getNavigationItemsForRole = (role: DetailedRole) => {
  const baseItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'Home' }
  ];

  switch (role) {
    case 'platform_admin':
      return [
        ...baseItems,
        { name: 'Users', href: '/users', icon: 'Users' },
        { name: 'Companies', href: '/companies', icon: 'Briefcase' },
        { name: 'Campaigns', href: '/campaigns', icon: 'Award' },
        { name: 'Analytics', href: '/analytics', icon: 'BarChart2' },
        { name: 'Reports', href: '/reports', icon: 'FileText' },
        { name: 'Settings', href: '/settings', icon: 'Settings' },
      ];
      
    case 'platform_agent':
      return [
        ...baseItems,
        { name: 'Assigned Lists', href: '/assigned-lists', icon: 'List' },
        { name: 'Messages', href: '/messages', icon: 'MessageSquare' },
        { name: 'Reports', href: '/reports', icon: 'FileText' },
      ];
      
    case 'platform_manager':
      return [
        ...baseItems,
        { name: 'Teams', href: '/teams', icon: 'Users' },
        { name: 'Campaigns', href: '/campaigns', icon: 'Award' },
        { name: 'Analytics', href: '/analytics', icon: 'BarChart2' },
        { name: 'Reports', href: '/reports', icon: 'FileText' },
      ];
      
    case 'b2c_company_owner':
      return [
        ...baseItems,
        { name: 'Discover', href: '/discover', icon: 'Compass' },
        { name: 'Campaigns', href: '/campaigns', icon: 'Award' },
        { name: 'Influencers', href: '/influencers', icon: 'Users' },
        { name: 'Analytics', href: '/analytics', icon: 'BarChart2' },
        { name: 'Settings', href: '/settings', icon: 'Settings' },
      ];
      
    default:
      return baseItems;
  }
};

/**
 * Check comprehensive role information
 */
export const checkRoleAccess = (user: User | null, roles: Role[]): RoleCheckResult => {
  if (!user || !roles.length) {
    return {
      hasRole: false,
      userType: null,
      detailedRole: null,
      dashboardRoute: '/login'
    };
  }
  
  const primaryRole = getPrimaryRole(roles);
  const userType = primaryRole ? getUserTypeFromRole(primaryRole) : null;
  const dashboardRoute = getDashboardRouteForRole(user, roles);
  
  return {
    hasRole: !!primaryRole,
    userType,
    detailedRole: primaryRole,
    dashboardRoute
  };
};

// Permission system infrastructure (for future implementation)
export interface PermissionCheck {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  context?: Record<string, any>;
}

/**
 * Future permission checking function (placeholder)
 * This will be implemented when we add the permission system
 */
export const hasPermission = (
  roles: Role[], 
  check: PermissionCheck
): boolean => {
  // TODO: Implement permission checking logic
  // For now, return true as we're focusing on role-based access
  return true;
};

/**
 * Future permission checking hook (placeholder)
 */
export const usePermissions = () => {
  // TODO: Implement permission hook
  return {
    hasPermission: (check: PermissionCheck) => true,
    checkMultiple: (checks: PermissionCheck[]) => checks.map(() => true)
  };
};

/**
 * Role-based component access control (ready for permission integration)
 */
export const canAccessComponent = (
  roles: Role[], 
  componentName: string,
  requiredRoles?: DetailedRole[],
  requiredPermissions?: PermissionCheck[]
): boolean => {
  // Check role-based access
  if (requiredRoles && !hasAnyDetailedRole(roles, requiredRoles)) {
    return false;
  }
  
  // Check permission-based access (future implementation)
  if (requiredPermissions) {
    return requiredPermissions.every(permission => hasPermission(roles, permission));
  }
  
  return true;
};