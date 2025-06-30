// src/context/AuthContext.tsx - ENHANCED VERSION with OAuth support
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AuthState, 
  LoginCredentials, 
  User, 
  Role,
  DetailedRole,
  UserType,
  RoleCheckResult
} from '@/types/auth';
import { 
  login as loginService,
  logout as logoutService,
  refreshToken as refreshTokenService,
} from '@/services/auth/auth.service';
import { 
  getStoredUser,
  getStoredRoles,
  getStoredCompany,
  isTokenExpired,
  isTokenExpiringSoon,
  clearAuthData,
  validateAuthData 
} from '@/services/auth/auth.utils';
import { 
  isAuthError, 
  AccountInactiveError, 
  InvalidCredentialsError 
} from '@/services/auth/auth.errors';
import { 
  checkRoleAccess, 
  getPrimaryRole, 
  getUserTypeFromRole,
  hasDetailedRole,
  hasAnyDetailedRole,
  canAccessComponent,
  PermissionCheck
} from '@/utils/role-utils';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserSession: () => Promise<boolean>;
  loadAuthFromStorage: () => void;
  
  getPrimaryRole: () => DetailedRole | null;
  getUserType: () => UserType | null;
  hasRole: (role: DetailedRole) => boolean;
  hasAnyRole: (roles: DetailedRole[]) => boolean;
  checkRoleAccess: () => RoleCheckResult;
  canAccess: (componentName: string, requiredRoles?: DetailedRole[], requiredPermissions?: PermissionCheck[]) => boolean;
  isUserType: (type: UserType) => boolean;
}

const initialState: AuthState = {
  user: null,
  roles: [],
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  const [isClient, setIsClient] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // ENHANCED: loadAuthFromStorage with better logging and OAuth support
  const loadAuthFromStorage = () => {
    if (!isClient) {
      console.log('🚫 AuthContext: Not in client environment, skipping loadAuthFromStorage');
      return false;
    }
    
    try {
      console.log('🔄 AuthContext: Loading auth data from localStorage...');
      
      const user = getStoredUser();
      const roles = getStoredRoles();
      const token = localStorage.getItem('accessToken');
      
      console.log('📊 AuthContext: Auth data check:', {
        hasUser: !!user,
        hasRoles: !!(roles && roles.length > 0),
        hasToken: !!token,
        tokenExpired: isTokenExpired()
      });
      
      if (user && roles && roles.length > 0 && token && !isTokenExpired()) {
        console.log('✅ AuthContext: Valid auth data found, updating state', {
          userId: user.id,
          userType: user.user_type,
          rolesCount: roles.length,
          primaryRole: roles[0]?.name
        });
        
        const newAuthState = {
          user,
          roles,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        };
        
        setAuthState(newAuthState);
        setHasInitialized(true);
        return true;
      }
      
      console.log('❌ AuthContext: Invalid or missing auth data, clearing');
      clearAuthData();
      setAuthState({
        user: null,
        roles: [],
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      setHasInitialized(true);
      return false;
    } catch (error) {
      console.error('💥 AuthContext: Error loading auth from storage:', error);
      clearAuthData();
      setAuthState({
        user: null,
        roles: [],
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      setHasInitialized(true);
      return false;
    }
  };
  
  useEffect(() => {
    if (!isClient) return;
    
    console.log('🚀 AuthContext: Initializing auth state...');
    const success = loadAuthFromStorage();
    
    if (!success) {
      console.log('🔄 AuthContext: No valid auth data on initialization');
      setHasInitialized(true);
    }
    
    // Listen for storage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' || e.key === 'user' || e.key === 'roles') {
        console.log('🔄 AuthContext: Storage change detected, reloading auth data');
        loadAuthFromStorage();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isClient]);

  // Token refresh interval
  useEffect(() => {
    if (!authState.isAuthenticated || !isClient) return;
    
    const intervalId = setInterval(async () => {
      if (isTokenExpiringSoon(5)) {
        console.log('⏰ AuthContext: Token expiring soon, refreshing...');
        await refreshUserSession();
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [authState.isAuthenticated, isClient]);

  const handleLogout = async (callApi = true) => {
    try {
      console.log('🚪 AuthContext: Logging out...');
      if (callApi && isClient) {
        await logoutService();
      }
    } catch (error) {
      console.error('⚠️ AuthContext: Logout API call failed:', error);
    } finally {
      setAuthState({ 
        user: null, 
        roles: [], 
        isAuthenticated: false, 
        isLoading: false, 
        error: null 
      });
      setHasInitialized(true);
      
      if (isClient) {
        clearAuthData();
        router.push('/login');
      }
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      console.log('🔑 AuthContext: Starting login process...');
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const authData = await loginService(credentials);
      
      console.log('✅ AuthContext: Login successful');
      setAuthState({
        user: authData.user,
        roles: authData.roles,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      setHasInitialized(true);
      
    } catch (error) {
      console.error('❌ AuthContext: Login failed:', error);
      
      if (isClient) {
        clearAuthData();
      }
      
      let errorMessage: string;
      
      if (isAuthError(error)) {
        errorMessage = error.message;
        if (error instanceof AccountInactiveError) {
          errorMessage = `${error.message}. Please contact your administrator.`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Login failed. Please check your credentials.';
      }
      
      setAuthState(prev => ({ 
        ...prev, 
        user: null,
        roles: [],
        isAuthenticated: false,
        isLoading: false, 
        error: errorMessage
      }));
      setHasInitialized(true);
      
      throw error;
    }
  };

  const refreshUserSession = async (): Promise<boolean> => {
    if (!isClient) {
      console.log('🚫 AuthContext: Not in client environment, cannot refresh');
      return false;
    }
    
    try {
      console.log('🔄 AuthContext: Refreshing user session...');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      
      if (!storedRefreshToken) {
        console.log('❌ AuthContext: No refresh token available');
        return false;
      }
      
      const authData = await refreshTokenService(storedRefreshToken);
      
      console.log('✅ AuthContext: Session refreshed successfully');
      setAuthState({
        user: authData.user,
        roles: authData.roles,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      setHasInitialized(true);
      
      return true;
    } catch (error) {
      console.error('❌ AuthContext: Session refresh failed:', error);
      clearAuthData();
      
      setAuthState({
        user: null,
        roles: [],
        isAuthenticated: false,
        isLoading: false,
        error: 'Your session has expired. Please log in again.',
      });
      setHasInitialized(true);
      
      return false;
    }
  };

  // Role checking methods
  const getPrimaryRoleMethod = (): DetailedRole | null => {
    if (!isClient || !hasInitialized) return null;
    return getPrimaryRole(authState.roles);
  };

  const getUserTypeMethod = (): UserType | null => {
    if (!isClient || !hasInitialized) return null;
    const primaryRole = getPrimaryRole(authState.roles);
    return primaryRole ? getUserTypeFromRole(primaryRole) : null;
  };

  const hasRoleMethod = (role: DetailedRole): boolean => {
    if (!isClient || !hasInitialized) return false;
    return hasDetailedRole(authState.roles, role);
  };

  const hasAnyRoleMethod = (roles: DetailedRole[]): boolean => {
    if (!isClient || !hasInitialized) return false;
    return hasAnyDetailedRole(authState.roles, roles);
  };

  const checkRoleAccessMethod = (): RoleCheckResult => {
    if (!isClient || !hasInitialized) {
      return {
        hasRole: false,
        userType: null,
        detailedRole: null,
        dashboardRoute: '/login'
      };
    }
    return checkRoleAccess(authState.user, authState.roles);
  };

  const canAccessMethod = (
    componentName: string, 
    requiredRoles?: DetailedRole[], 
    requiredPermissions?: PermissionCheck[]
  ): boolean => {
    if (!isClient || !hasInitialized) return false;
    return canAccessComponent(authState.roles, componentName, requiredRoles, requiredPermissions);
  };

  const isUserTypeMethod = (type: UserType): boolean => {
    if (!isClient || !hasInitialized) return false;
    const userType = getUserTypeMethod();
    return userType === type;
  };

  // ENHANCED: Better state management for SSR/hydration
  const safeAuthState = isClient && hasInitialized ? authState : {
    ...initialState,
    isLoading: !hasInitialized
  };

  const value = {
    ...safeAuthState,
    login,
    logout: () => handleLogout(true),
    refreshUserSession,
    loadAuthFromStorage, // This is the key method for OAuth callback
    getPrimaryRole: getPrimaryRoleMethod,
    getUserType: getUserTypeMethod,
    hasRole: hasRoleMethod,
    hasAnyRole: hasAnyRoleMethod,
    checkRoleAccess: checkRoleAccessMethod,
    canAccess: canAccessMethod,
    isUserType: isUserTypeMethod,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}