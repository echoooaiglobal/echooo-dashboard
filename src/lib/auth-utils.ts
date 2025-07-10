// src/lib/auth-utils.ts - Utility for extracting Bearer tokens (if not already exists)
import { NextRequest } from 'next/server';

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization');
  
  if (!authorization) {
    return null;
  }
  
  // Check if it starts with 'Bearer '
  if (!authorization.startsWith('Bearer ')) {
    return null;
  }
  
  // Extract the token part (remove 'Bearer ' prefix)
  const token = authorization.substring(7);
  
  // Basic validation - token should not be empty
  if (!token.trim()) {
    return null;
  }
  
  return token;
}

/**
 * Create Authorization header with Bearer token
 */
export function createBearerHeader(token: string): string {
  return `Bearer ${token}`;
}

/**
 * Validate Bearer token format (basic validation)
 */
export function isValidBearerToken(token: string): boolean {
  // Basic validation - should be a non-empty string
  // You can add more sophisticated validation here
  return typeof token === 'string' && token.trim().length > 0;
}