// src/lib/auth-utils.ts
// Utility functions for handling authentication in API routes

import { NextRequest } from 'next/server';

/**
 * Extract Bearer token from request headers
 * @param request Next.js request object
 * @returns Bearer token or null if not found
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  console.log('Auth header received:', authHeader ? 'Header present' : 'No auth header');
  
  if (!authHeader) {
    return null;
  }
  
  // Check if it's a Bearer token
  if (!authHeader.startsWith('Bearer ')) {
    console.log('Auth header does not start with "Bearer "');
    return null;
  }
  
  // Extract the token part
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  console.log('Extracted token:', token ? 'Token extracted successfully' : 'Empty token');
  
  return token || null;
}

/**
 * Validate that a Bearer token is present
 * @param request Next.js request object
 * @returns Bearer token or throws error if not found
 */
export function requireBearerToken(request: NextRequest): string {
  const token = extractBearerToken(request);
  
  if (!token) {
    throw new Error('Bearer token is required');
  }
  
  return token;
}