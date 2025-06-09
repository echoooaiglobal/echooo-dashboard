// src/lib/nextjs-api.ts
// API client specifically for calling Next.js API routes (internal routes)

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface NextJSApiRequestOptions extends RequestInit {
  auth?: boolean;
  timeout?: number;
}

interface NextJSApiResponse<T> {
  data: T | null;
  error: Error | null;
  status: number;
}

/**
 * API client for making requests to Next.js API routes
 */
class NextJSApiClient {
  private static instance: NextJSApiClient;
  
  private constructor() {}

  /**
   * Get the singleton instance of NextJSApiClient
   */
  public static getInstance(): NextJSApiClient {
    if (!NextJSApiClient.instance) {
      NextJSApiClient.instance = new NextJSApiClient();
    }
    return NextJSApiClient.instance;
  }

  /**
   * Make a request to Next.js API routes
   * @param endpoint API endpoint (e.g., '/api/v0/assignments')
   * @param options Request options
   * @returns API response
   */
  public async request<T>(
    endpoint: string,
    options: NextJSApiRequestOptions = {}
  ): Promise<NextJSApiResponse<T>> {
    const {
      auth = true,
      timeout = 30000,
      ...fetchOptions
    } = options;

    // For Next.js API routes, we use relative URLs
    const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const headers = new Headers(fetchOptions.headers);

    // Set content type if not already set and not FormData
    if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    // Set auth header if needed
    if (auth) {
      const token = this.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    try {
      // Create an AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      console.log(`📞 NextJS API Client: Making ${fetchOptions.method || 'GET'} request to ${url}`);
      
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log(`📦 NextJS API Client: Response status ${response.status} for ${url}`);

      // Parse the response
      let data: T | null = null;
      let error: Error | null = null;
      
      if (response.status !== 204) { // No content
        try {
          const responseText = await response.text();
          
          // Only try to parse as JSON if there's actual content
          if (responseText.trim()) {
            try {
              data = JSON.parse(responseText) as T;
              console.log(`✅ NextJS API Client: Successfully parsed response data`);
            } catch (e) {
              console.error('NextJS API Client: Error parsing response as JSON:', e);
              console.log('NextJS API Client: Response text that failed to parse:', responseText);
              error = new Error('Failed to parse response');
            }
          }
        } catch (e) {
          console.error('NextJS API Client: Error reading response text:', e);
          error = new Error('Failed to read response');
        }
      }

      // Handle error responses
      if (!response.ok) {
        let errorMessage = 'Request failed';
        
        if (data && typeof data === 'object') {
          // Handle common API error formats
          if ('detail' in data) {
            errorMessage = data.detail as string;
          } else if ('message' in data) {
            errorMessage = data.message as string;
          } else if ('error' in data) {
            errorMessage = data.error as string;
          }
        }
        
        error = new Error(
          typeof errorMessage === 'string' 
            ? errorMessage 
            : JSON.stringify(errorMessage)
        );
        
        data = null;
        console.error(`❌ NextJS API Client: Request failed with status ${response.status}:`, errorMessage);
      }

      return {
        data,
        error,
        status: response.status,
      };
    } catch (error) {
      // Handle network errors, timeouts, etc.
      const isAbortError = error instanceof DOMException && error.name === 'AbortError';
      
      console.error(`💥 NextJS API Client: Network error for ${url}:`, error);
      
      return {
        data: null,
        error: new Error(isAbortError ? 'Request timeout' : (error as Error).message),
        status: isAbortError ? 408 : 0, // 408 Request Timeout
      };
    }
  }

  /**
   * Make a GET request
   */
  public async get<T>(endpoint: string, options: Omit<NextJSApiRequestOptions, 'method' | 'body'> = {}): Promise<NextJSApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * Make a POST request
   */
  public async post<T>(
    endpoint: string,
    data: unknown,
    options: Omit<NextJSApiRequestOptions, 'method' | 'body'> = {}
  ): Promise<NextJSApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  /**
   * Make a PUT request
   */
  public async put<T>(
    endpoint: string,
    data: unknown,
    options: Omit<NextJSApiRequestOptions, 'method' | 'body'> = {}
  ): Promise<NextJSApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  /**
   * Make a PATCH request
   */
  public async patch<T>(
    endpoint: string,
    data: unknown,
    options: Omit<NextJSApiRequestOptions, 'method' | 'body'> = {}
  ): Promise<NextJSApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  /**
   * Make a DELETE request
   */
  public async delete<T>(
    endpoint: string,
    options: Omit<NextJSApiRequestOptions, 'method'> = {}
  ): Promise<NextJSApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Get the access token from localStorage
   */
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }
}

// Export a singleton instance
export const nextjsApiClient = NextJSApiClient.getInstance();

// Convenience functions for Next.js API routes
export const nextjsGet = <T>(endpoint: string, options?: Omit<NextJSApiRequestOptions, 'method' | 'body'>) => 
  nextjsApiClient.get<T>(endpoint, options);

export const nextjsPost = <T>(endpoint: string, data: unknown, options?: Omit<NextJSApiRequestOptions, 'method' | 'body'>) => 
  nextjsApiClient.post<T>(endpoint, data, options);

export const nextjsPut = <T>(endpoint: string, data: unknown, options?: Omit<NextJSApiRequestOptions, 'method' | 'body'>) => 
  nextjsApiClient.put<T>(endpoint, data, options);

export const nextjsPatch = <T>(endpoint: string, data: unknown, options?: Omit<NextJSApiRequestOptions, 'method' | 'body'>) => 
  nextjsApiClient.patch<T>(endpoint, data, options);

export const nextjsDelete = <T>(endpoint: string, options?: Omit<NextJSApiRequestOptions, 'method'>) => 
  nextjsApiClient.delete<T>(endpoint, options);