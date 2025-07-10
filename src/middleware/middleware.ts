// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;
  
  // Handle CORS for public API routes
  if (path.startsWith('/api/v0/profile-analytics/public/')) {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Add CORS headers to actual requests
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }
  
  // Define public paths (including our new public report page)
  const isPublicPath = 
    path === '/' || 
    path === '/login' || 
    path === '/register' || 
    path === '/reset-password' ||
    path.startsWith('/profile-analytics-report/') || // Add public report path
    path.startsWith('/api/auth/') ||
    path.startsWith('/api/v0/profile-analytics/public/') || // Add public API path
    path.startsWith('/_next/') ||
    path.includes('.');
  
  // Get the token from cookies
  const token = request.cookies.get('accessToken')?.value;
  
  // If path requires authentication and no token exists, redirect to login
  if (!isPublicPath && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', path);
    return NextResponse.redirect(loginUrl);
  }
  
  // Redirect authenticated users away from auth pages
  if (token && (path === '/login' || path === '/register' || path === '/reset-password')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth routes
     * 2. /_next (Next.js internals)
     * 3. Static files
     */
    '/((?!api/auth|_next/static|_next/image|public|favicon.ico|.*\\.).*)',
  ],
};