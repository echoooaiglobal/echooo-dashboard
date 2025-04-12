import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', // FastAPI backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth tokens (if needed)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Example: Get token from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error?.response?.data || error?.message);
    return Promise.reject(error);
  }
);

export default api;