// src/lib/server-api.ts
// Server-side API client for calling FastAPI backend from Next.js API routes

interface ServerApiRequestOptions extends RequestInit {
  timeout?: number;
  baseUrl?: string;
}

interface ServerApiResponse<T> {
  data: T | null;
  error: Error | null;
  status: number;
}

/**
 * Server-side API client for calling FastAPI backend
 */
class ServerApiClient {
  private static instance: ServerApiClient;
  private baseUrl: string;
  
  private constructor() {
    // Get FastAPI backend URL from environment variables
    this.baseUrl = process.env.FASTAPI_BASE_URL || 'http://localhost:8000';
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): ServerApiClient {
    if (!ServerApiClient.instance) {
      ServerApiClient.instance = new ServerApiClient();
    }
    return ServerApiClient.instance;
  }

  /**
   * Make a request to the FastAPI backend
   */
  public async request<T>(
    endpoint: string,
    options: ServerApiRequestOptions = {},
    authToken?: string
  ): Promise<ServerApiResponse<T>> {
    const {
      timeout = 30000,
      baseUrl,
      ...fetchOptions
    } = options;

    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${baseUrl || this.baseUrl}${endpoint}`;
    
    const headers = new Headers(fetchOptions.headers);

    // Set content type if not already set and not FormData
    if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    // Add Bearer token if provided
    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`);
    }

    // Fallback: Add server-side API key if configured
    if (!authToken && process.env.FASTAPI_API_KEY) {
      headers.set('Authorization', `Bearer ${process.env.FASTAPI_API_KEY}`);
    }

    try {
      // Create an AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      // Parse the response
      let data: T | null = null;
      let error: Error | null = null;
      
      if (response.status !== 204) { // No content
        try {
          const responseText = await response.text();
          
          if (responseText.trim()) {
            try {
              data = JSON.parse(responseText) as T;
            } catch (e) {
              console.error('Error parsing response as JSON:', e);
              console.log('Response text that failed to parse:', responseText);
              error = new Error('Failed to parse response');
            }
          }
        } catch (e) {
          console.error('Error reading response text:', e);
          error = new Error('Failed to read response');
        }
      }

      // Handle error responses
      if (!response.ok) {
        let errorMessage = 'Request failed';
        
        if (data && typeof data === 'object') {
          // Handle FastAPI error formats
          if ('detail' in data) {
            errorMessage = Array.isArray(data.detail) 
              ? (data.detail as any[]).map(err => err.msg || err).join(', ')
              : data.detail as string;
          } else if ('message' in data) {
            errorMessage = data.message as string;
          } else if ('error' in data) {
            errorMessage = data.error as string;
          }
        }
        
        error = new Error(errorMessage);
        data = null;
      }

      return {
        data,
        error,
        status: response.status,
      };
    } catch (error) {
      // Handle network errors, timeouts, etc.
      const isAbortError = error instanceof DOMException && error.name === 'AbortError';
      
      return {
        data: null,
        error: new Error(isAbortError ? 'Request timeout' : (error as Error).message),
        status: isAbortError ? 408 : 0,
      };
    }
  }

  /**
   * Make a GET request
   */
  public async get<T>(
    endpoint: string, 
    options: Omit<ServerApiRequestOptions, 'method' | 'body'> = {},
    authToken?: string
  ): Promise<ServerApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' }, authToken);
  }

  /**
   * Make a POST request
   */
  public async post<T>(
    endpoint: string,
    data: unknown,
    options: Omit<ServerApiRequestOptions, 'method' | 'body'> = {},
    authToken?: string
  ): Promise<ServerApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }, authToken);
  }

  /**
   * Make a PUT request
   */
  public async put<T>(
    endpoint: string,
    data: unknown,
    options: Omit<ServerApiRequestOptions, 'method' | 'body'> = {},
    authToken?: string
  ): Promise<ServerApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }, authToken);
  }

  /**
   * Make a PATCH request
   */
  public async patch<T>(
    endpoint: string,
    data: unknown,
    options: Omit<ServerApiRequestOptions, 'method' | 'body'> = {},
    authToken?: string
  ): Promise<ServerApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }, authToken);
  }

  /**
   * Make a DELETE request
   */
  public async delete<T>(
    endpoint: string,
    options: Omit<ServerApiRequestOptions, 'method'> = {},
    authToken?: string
  ): Promise<ServerApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' }, authToken);
  }
}

// Export singleton instance for server-side use
export const serverApiClient = ServerApiClient.getInstance();

// Convenience functions for server-side use
export const serverGet = <T>(endpoint: string, options?: Omit<ServerApiRequestOptions, 'method' | 'body'>, authToken?: string) => 
  serverApiClient.get<T>(endpoint, options, authToken);

export const serverPost = <T>(endpoint: string, data: unknown, options?: Omit<ServerApiRequestOptions, 'method' | 'body'>, authToken?: string) => 
  serverApiClient.post<T>(endpoint, data, options, authToken);

export const serverPut = <T>(endpoint: string, data: unknown, options?: Omit<ServerApiRequestOptions, 'method' | 'body'>, authToken?: string) => 
  serverApiClient.put<T>(endpoint, data, options, authToken);

export const serverPatch = <T>(endpoint: string, data: unknown, options?: Omit<ServerApiRequestOptions, 'method' | 'body'>, authToken?: string) => 
  serverApiClient.patch<T>(endpoint, data, options, authToken);

export const serverDelete = <T>(endpoint: string, options?: Omit<ServerApiRequestOptions, 'method'>, authToken?: string) => 
  serverApiClient.delete<T>(endpoint, options, authToken);