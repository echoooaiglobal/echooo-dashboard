// src/services/auth/auth.service.ts
import { post } from '../api';
import { ENDPOINTS } from '../api/endpoints';
import { API_CONFIG, HttpMethod } from '@/services/api/config';
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  ResetPasswordRequest,
  ConfirmResetPasswordRequest,
} from '@/types/auth';
import { storeAuthData, clearAuthData } from './auth.utils';
import { 
  AuthError, 
  InvalidCredentialsError, 
  AccountInactiveError,
  isAuthError
} from './auth.errors';

/**
 * Login user with username and password
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { username, password } = credentials;
  
  try {
    // Create FormData for the request
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await fetch(`${API_CONFIG.baseUrl}${ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      body: formData
    });
    
    // Parse the response data
    const responseText = await response.text();
    let data;
    
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.warn('Failed to parse response as JSON:', responseText);
      throw new AuthError('Invalid response from server');
    }
    
    // If response is not OK, throw appropriate custom error
    if (!response.ok) {
      const errorMessage = data.detail || 'Login failed';
      
      // Map specific error messages to custom error types
      if (errorMessage.includes('not active')) {
        throw new AccountInactiveError(errorMessage);
      } else if (errorMessage.includes('Incorrect email or password')) {
        throw new InvalidCredentialsError(errorMessage);
      } else {
        throw new AuthError(errorMessage);
      }
    }
    
    // Store auth data in localStorage
    const { access_token, refresh_token, expires_in, user, roles } = data;
    storeAuthData(access_token, refresh_token, expires_in, user, roles);
    
    return data;
  } catch (error) {
    // Only log unexpected errors, not our custom AuthErrors
    if (!isAuthError(error)) {
      console.error('Unexpected error during login:', error);
    }
    
    // Re-throw the error for the caller to handle
    throw error;
  }
}

/**
 * Register a new user
 */
export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const response = await post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, credentials, { auth: false });
  
  if (response.error) {
    throw response.error;
  }
  
  if (!response.data) {
    throw new Error('No data received from server');
  }
  
  // Store auth data in localStorage if registration auto-logs in
  const { access_token, refresh_token, expires_in, user, roles } = response.data;
  storeAuthData(access_token, refresh_token, expires_in, user, roles);
  
  return response.data;
};

/**
 * Refresh the access token
 */
export const refreshToken = async (token: string): Promise<AuthResponse> => {
  const response = await post<AuthResponse>(
    ENDPOINTS.AUTH.REFRESH_TOKEN,
    { refresh_token: token },
    { auth: false }
  );
  
  if (response.error) {
    throw response.error;
  }
  
  if (!response.data) {
    throw new Error('No data received from server');
  }
  
  // Update stored auth data
  const { access_token, refresh_token, expires_in, user, roles } = response.data;
  storeAuthData(access_token, refresh_token, expires_in, user, roles);
  
  return response.data;
};

/**
 * Logout the current user
 */
export const logout = async (): Promise<void> => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (refreshToken) {
    try {
      await post(ENDPOINTS.AUTH.LOGOUT, { refresh_token: refreshToken });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
  
  // Clear auth data regardless of API success
  clearAuthData();
};

/**
 * Request a password reset
 */
export const requestPasswordReset = async (data: ResetPasswordRequest): Promise<void> => {
  const response = await post<{ message: string }>(
    ENDPOINTS.AUTH.RESET_PASSWORD,
    data,
    { auth: false }
  );
  
  if (response.error) {
    throw response.error;
  }
};

/**
 * Confirm password reset with token
 */
export const confirmPasswordReset = async (data: ConfirmResetPasswordRequest): Promise<void> => {
  const response = await post<{ message: string }>(
    `${ENDPOINTS.AUTH.RESET_PASSWORD}/confirm`,
    data,
    { auth: false }
  );
  
  if (response.error) {
    throw response.error;
  }
};

/**
 * Verify email address
 */
export const verifyEmail = async (token: string): Promise<void> => {
  const response = await post<{ message: string }>(
    ENDPOINTS.AUTH.VERIFY_EMAIL,
    { token },
    { auth: false }
  );
  
  if (response.error) {
    throw response.error;
  }
};