// src/services/auth/register.service.ts
import { API_CONFIG } from '../api/config';
import { ENDPOINTS } from '../api/endpoints';

export interface RegistrationData {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  user_type: 'influencer' | 'company';
  role_name: string,
  company_name?: string;
  company_domain?: string;
}

export async function registerUser(data: RegistrationData) {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${ENDPOINTS.AUTH.REGISTER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.detail || 'Registration failed');
    }
    
    return responseData;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}