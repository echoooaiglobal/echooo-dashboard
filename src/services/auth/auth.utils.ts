// src/services/auth/auth.utils.ts - HYDRATION-SAFE VERSION
import { User, Role, Company, DetailedRole } from '@/types/auth';

/**
 * Safely access localStorage (handles SSR and browser cases)
 * HYDRATION FIX: Always check window availability and handle gracefully
 */
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error(`Error getting ${key} from localStorage:`, e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error(`Error setting ${key} in localStorage:`, e);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing ${key} from localStorage:`, e);
    }
  }
};

/**
 * Get the stored auth token
 * HYDRATION FIX: Returns null during SSR
 */
export const getAuthToken = (): string | null => {
  return safeLocalStorage.getItem('accessToken');
};

/**
 * Store authentication data in localStorage with enhanced role support
 */
export const storeAuthData = (
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
  user: User,
  roles: Role[],
  company?: Company[]  
): void => {
  if (typeof window === 'undefined') return; // HYDRATION FIX
  
  const expiryTime = Date.now() + expiresIn * 1000;

  safeLocalStorage.setItem('accessToken', accessToken);
  safeLocalStorage.setItem('refreshToken', refreshToken);
  safeLocalStorage.setItem('tokenExpiry', expiryTime.toString());
  safeLocalStorage.setItem('user', JSON.stringify(user));
  safeLocalStorage.setItem('roles', JSON.stringify(roles));
  
  if (company) {
    safeLocalStorage.setItem('company', JSON.stringify(company));
  }

  // Store primary role for quick access
  if (roles && roles.length > 0) {
    safeLocalStorage.setItem('primaryRole', roles[0].name);
    safeLocalStorage.setItem('userType', getUserTypeFromRole(roles[0].name));
  }
};

/**
 * Clears all auth data from local storage
 * HYDRATION FIX: Safe during SSR
 */
export const clearAuthData = () => {
  if (typeof window === 'undefined') return;
  
  safeLocalStorage.removeItem('user');
  safeLocalStorage.removeItem('roles');
  safeLocalStorage.removeItem('accessToken');
  safeLocalStorage.removeItem('refreshToken');
  safeLocalStorage.removeItem('tokenExpiry');
  safeLocalStorage.removeItem('company');
  safeLocalStorage.removeItem('primaryRole');
  safeLocalStorage.removeItem('userType');
};

/**
 * Check if the auth token is expired
 * HYDRATION FIX: Returns true during SSR to be safe
 */
export const isTokenExpired = (): boolean => {
  if (typeof window === 'undefined') return true; // HYDRATION FIX: Safe default during SSR
  
  const expiry = safeLocalStorage.getItem('tokenExpiry');
  if (!expiry) return true;
  
  const isExpired = Date.now() > parseInt(expiry, 10);
  
  // Automatically clear auth data if token is expired
  if (isExpired) {
    clearAuthData();
  }
  
  return isExpired;
};

/**
 * Checks if the token will expire soon
 * HYDRATION FIX: Returns true during SSR to be safe
 * @param minutesThreshold Number of minutes before expiry to consider "soon"
 */
export const isTokenExpiringSoon = (minutesThreshold: number = 5): boolean => {
  if (typeof window === 'undefined') return true; // HYDRATION FIX: Safe default during SSR
  
  const expiry = localStorage.getItem('tokenExpiry');
  if (!expiry) return true;
  
  const expiryTime = parseInt(expiry, 10);
  const thresholdMs = minutesThreshold * 60 * 1000;
  
  return Date.now() > expiryTime - thresholdMs;
};

/**
 * Get the stored user data
 * HYDRATION FIX: Returns null during SSR
 */
export const getStoredUser = (): User | null => {
  const userData = safeLocalStorage.getItem('user');
  if (!userData) return null;
  if (userData === 'undefined') return null; // Handle case where userData is 'undefined' string
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    return null;
  }
};

/**
 * Get the stored company data
 * HYDRATION FIX: Returns null during SSR
 */
export const getStoredCompany = (): Company | null => {
  const companyData = safeLocalStorage.getItem('company');
  if (!companyData) return null;
  if (companyData === 'undefined') return null; // Handle case where companyData is 'undefined' string
  
  try {
    const parsed = JSON.parse(companyData);
    // Handle array case (from backend response)
    return Array.isArray(parsed) ? parsed[0] : parsed;
  } catch (error) {
    console.error('Error parsing stored company data:', error);
    return null;
  }
};

/**
 * Gets the stored roles from local storage
 * HYDRATION FIX: Returns empty array during SSR
 */
export const getStoredRoles = (): Role[] => {
  if (typeof window === 'undefined') return []; // HYDRATION FIX: Safe default during SSR
  
  const rolesString = localStorage.getItem('roles');
  if (!rolesString) return [];
  if (rolesString === 'undefined') return []; // Added this line to fix the issue
  
  try {
    const roles = JSON.parse(rolesString) as Role[];
    return roles;
  } catch (error) {
    console.error('Failed to parse roles from localStorage', error);
    return [];
  }
};

/**
 * Get the primary role from localStorage (quick access)
 * HYDRATION FIX: Returns null during SSR
 */
export const getStoredPrimaryRole = (): DetailedRole | null => {
  const primaryRole = safeLocalStorage.getItem('primaryRole');
  return primaryRole as DetailedRole || null;
};

/**
 * Get the user type from localStorage (quick access)
 * HYDRATION FIX: Returns null during SSR
 */
export const getStoredUserType = (): 'platform' | 'company' | 'influencer' | null => {
  const userType = safeLocalStorage.getItem('userType');
  return userType as 'platform' | 'company' | 'influencer' || null;
};

/**
 * Get user type from detailed role
 */
export const getUserTypeFromRole = (detailedRole: DetailedRole): 'platform' | 'company' | 'influencer' => {
  if (detailedRole.startsWith('platform_')) return 'platform';
  if (detailedRole.startsWith('company_')) return 'company';
  if (detailedRole.startsWith('influencer')) return 'influencer';
  throw new Error(`Unknown role: ${detailedRole}`);
};

/**
 * Check if the user has a specific role (legacy support)
 * HYDRATION FIX: Returns false during SSR
 */
export const hasRole = (roleName: string): boolean => {
  const roles = getStoredRoles();
  return roles.some(role => role.name === roleName);
};

/**
 * Check if the user has a specific detailed role
 * HYDRATION FIX: Returns false during SSR
 */
export const hasDetailedRole = (roleName: DetailedRole): boolean => {
  const roles = getStoredRoles();
  return roles.some(role => role.name === roleName);
};

/**
 * Checks if the user has any of the specified roles
 * HYDRATION FIX: Returns false during SSR
 * @param requiredRoles Array of detailed role names to check
 */
export const hasAnyRole = (requiredRoles: DetailedRole[]): boolean => {
  if (typeof window === 'undefined') return false; // HYDRATION FIX
  
  const roles = getStoredRoles();
  if (!roles.length) return false;
  
  const userRoleNames = roles.map(role => role.name);
  return requiredRoles.some(role => userRoleNames.includes(role));
};

/**
 * Checks if the user has any of the specified detailed roles
 * HYDRATION FIX: Returns false during SSR
 * @param requiredRoles Array of detailed role names to check
 */
export const hasAnyDetailedRole = (requiredRoles: DetailedRole[]): boolean => {
  if (typeof window === 'undefined') return false; // HYDRATION FIX
  
  const roles = getStoredRoles();
  if (!roles.length) return false;
  
  const userRoleNames = roles.map(role => role.name);
  return requiredRoles.some(role => userRoleNames.includes(role));
};

/**
 * Check if user is platform admin (highest level)
 * HYDRATION FIX: Returns false during SSR
 */
export const isPlatformAdmin = (): boolean => {
  return hasDetailedRole('platform_admin');
};

/**
 * Check if user is platform agent
 * HYDRATION FIX: Returns false during SSR
 */
export const isPlatformAgent = (): boolean => {
  return hasDetailedRole('platform_agent');
};

/**
 * Check if user is company admin
 * HYDRATION FIX: Returns false during SSR
 */
export const isCompanyAdmin = (): boolean => {
  return hasDetailedRole('company_admin');
};

/**
 * Check if user has platform-level access
 * HYDRATION FIX: Returns false during SSR
 */
export const hasPlatformAccess = (): boolean => {
  if (typeof window === 'undefined') return false; // HYDRATION FIX
  
  const primaryRole = getStoredPrimaryRole();
  return primaryRole ? primaryRole.startsWith('platform_') : false;
};

/**
 * Check if user has company-level access
 * HYDRATION FIX: Returns false during SSR
 */
export const hasCompanyAccess = (): boolean => {
  if (typeof window === 'undefined') return false; // HYDRATION FIX
  
  const primaryRole = getStoredPrimaryRole();
  return primaryRole ? primaryRole.startsWith('company_') : false;
};

/**
 * Check if user has influencer-level access
 * HYDRATION FIX: Returns false during SSR
 */
export const hasInfluencerAccess = (): boolean => {
  if (typeof window === 'undefined') return false; // HYDRATION FIX
  
  const primaryRole = getStoredPrimaryRole();
  return primaryRole ? primaryRole.startsWith('influencer') : false;
};

/**
 * Get role hierarchy level for permission checking
 * HYDRATION FIX: Returns 0 during SSR
 */
export const getRoleHierarchyLevel = (): number => {
  if (typeof window === 'undefined') return 0; // HYDRATION FIX
  
  const primaryRole = getStoredPrimaryRole();
  if (!primaryRole) return 0;

  const hierarchyMap: Record<DetailedRole, number> = {
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
  
  return hierarchyMap[primaryRole] || 0;
};

/**
 * Check if current user has higher hierarchy than target role
 * HYDRATION FIX: Returns false during SSR
 */
export const hasHigherHierarchyThan = (targetRole: DetailedRole): boolean => {
  if (typeof window === 'undefined') return false; // HYDRATION FIX
  
  const currentLevel = getRoleHierarchyLevel();
  const targetHierarchyMap: Record<DetailedRole, number> = {
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
  
  const targetLevel = targetHierarchyMap[targetRole] || 0;
  return currentLevel > targetLevel;
};

/**
 * Get appropriate dashboard route based on stored role
 * HYDRATION FIX: Returns safe default during SSR
 */
export const getDashboardRoute = (): string => {
  if (typeof window === 'undefined') return '/login'; // HYDRATION FIX: Safe default during SSR
  
  const userType = getStoredUserType();
  const primaryRole = getStoredPrimaryRole();
  
  if (!userType || !primaryRole) return '/login';
  
  // Special routing for company users
  if (userType === 'company') {
    return '/dashboard'; // CompanyDashboardPage will handle redirection to campaigns
  }
  
  return '/dashboard';
};

/**
 * Sets the user and roles in local storage (legacy support)
 */
export const setAuthData = (
  user: User, 
  roles: Role[], 
  token: string, 
  refreshToken: string, 
  expiresIn: number
) => {
  storeAuthData(token, refreshToken, expiresIn, user, roles);
};

/**
 * Validate stored auth data integrity
 * HYDRATION FIX: Returns false during SSR
 */
export const validateAuthData = (): boolean => {
  if (typeof window === 'undefined') return false; // HYDRATION FIX: Safe default during SSR
  
  const user = getStoredUser();
  const roles = getStoredRoles();
  const token = getAuthToken();
  
  // Check if all required data is present
  if (!user || !roles.length || !token) {
    clearAuthData();
    return false;
  }
  
  // Check if token is expired
  if (isTokenExpired()) {
    clearAuthData();
    return false;
  }
  
  // Check if role data is consistent
  const primaryRole = getStoredPrimaryRole();
  const userType = getStoredUserType();
  
  if (!primaryRole || !userType) {
    // Repair missing quick access data
    if (roles.length > 0) {
      safeLocalStorage.setItem('primaryRole', roles[0].name);
      safeLocalStorage.setItem('userType', getUserTypeFromRole(roles[0].name));
    } else {
      clearAuthData();
      return false;
    }
  }
  
  return true;
};

/**
 * Initialize auth state on app startup
 * HYDRATION FIX: Returns safe defaults during SSR
 */
export const initializeAuthState = (): {
  isAuthenticated: boolean;
  user: User | null;
  roles: Role[];
  primaryRole: DetailedRole | null;
  userType: 'platform' | 'company' | 'influencer' | null;
} => {
  if (typeof window === 'undefined') {
    // HYDRATION FIX: Return safe defaults during SSR
    return {
      isAuthenticated: false,
      user: null,
      roles: [],
      primaryRole: null,
      userType: null
    };
  }
  
  const isValid = validateAuthData();
  
  if (!isValid) {
    return {
      isAuthenticated: false,
      user: null,
      roles: [],
      primaryRole: null,
      userType: null
    };
  }
  
  return {
    isAuthenticated: true,
    user: getStoredUser(),
    roles: getStoredRoles(),
    primaryRole: getStoredPrimaryRole(),
    userType: getStoredUserType()
  };
};

/**
 * Debug function to log current auth state (development only)
 * HYDRATION FIX: Safe during SSR
 */
export const debugAuthState = () => {
  if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') return;
  
  console.group('🔐 Auth State Debug');
  console.log('User:', getStoredUser());
  console.log('Roles:', getStoredRoles());
  console.log('Primary Role:', getStoredPrimaryRole());
  console.log('User Type:', getStoredUserType());
  console.log('Token Valid:', !isTokenExpired());
  console.log('Hierarchy Level:', getRoleHierarchyLevel());
  console.groupEnd();
};