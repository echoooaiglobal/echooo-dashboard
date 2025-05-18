// src/services/auth/auth.utils.ts - full updated file

import { User, Role } from '@/types/auth';

/**
 * Safely access localStorage (handles SSR and browser cases)
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
 */
export const getAuthToken = (): string | null => {
  return safeLocalStorage.getItem('accessToken');
};

/**
 * Store authentication data in localStorage
 */
export const storeAuthData = (
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
  user: User,
  roles: Role[]
): void => {
  const expiryTime = Date.now() + expiresIn * 1000;
  
  safeLocalStorage.setItem('accessToken', accessToken);
  safeLocalStorage.setItem('refreshToken', refreshToken);
  safeLocalStorage.setItem('tokenExpiry', expiryTime.toString());
  safeLocalStorage.setItem('user', JSON.stringify(user));
  safeLocalStorage.setItem('roles', JSON.stringify(roles));
};

/**
 * Clears all auth data from local storage
 */
export const clearAuthData = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('user');
  localStorage.removeItem('roles');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiry');
};

/**
 * Check if the auth token is expired
 */
export const isTokenExpired = (): boolean => {
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
 * @param minutesThreshold Number of minutes before expiry to consider "soon"
 */
export const isTokenExpiringSoon = (minutesThreshold: number = 5): boolean => {
  if (typeof window === 'undefined') return true;
  
  const expiry = localStorage.getItem('tokenExpiry');
  if (!expiry) return true;
  
  const expiryTime = parseInt(expiry, 10);
  const thresholdMs = minutesThreshold * 60 * 1000;
  
  return Date.now() > expiryTime - thresholdMs;
};

/**
 * Get the stored user data
 */
export const getStoredUser = (): User | null => {
  const userData = safeLocalStorage.getItem('user');
  if (!userData) return null;
  if(userData === 'undefined') return null; // Handle case where userData is 'undefined' string
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    return null;
  }
};

/**
 * Gets the stored roles from local storage
 */
export const getStoredRoles = (): Role[] => {
  if (typeof window === 'undefined') return [];
  
  const rolesString = localStorage.getItem('roles');
  if (!rolesString) return [];
  
  try {
    const roles = JSON.parse(rolesString) as Role[];
    return roles;
  } catch (error) {
    console.error('Failed to parse roles from localStorage', error);
    return [];
  }
};

/**
 * Check if the user has a specific role
 */
export const hasRole = (roleName: string): boolean => {
  const roles = getStoredRoles();
  return roles.some(role => role.name === roleName);
};

/**
 * Checks if the user has any of the specified roles
 * @param requiredRoles Array of role names to check
 */
export const hasAnyRole = (requiredRoles: string[]): boolean => {
  const roles = getStoredRoles();
  if (!roles.length) return false;
  
  const userRoleNames = roles.map(role => role.name);
  return requiredRoles.some(role => userRoleNames.includes(role));
};

/**
 * Sets the user and roles in local storage
 */
export const setAuthData = (user: User, roles: Role[], token: string, refreshToken: string, expiresIn: number) => {
  if (typeof window === 'undefined') return;
  
  // Store user and roles
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('roles', JSON.stringify(roles));
  
  // Store tokens
  localStorage.setItem('accessToken', token);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('tokenExpiry', (Date.now() + expiresIn * 1000).toString());
};

