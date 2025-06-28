// API Client configuration and base utilities
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Response wrapper type
export interface ApiResponse<T> {
  success: boolean;
  message?: string | null;
  data: T;
  errors?: string[] | null;
}

// API Configuration
const API_BASE_URL = 'http://localhost:5096/api';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API methods
export const apiRequest = {
  get: <T>(url: string): Promise<ApiResponse<T>> => {
    console.log('API GET:', `${API_BASE_URL}${url}`);
    return apiClient.get(url).then((response) => {
      console.log('API GET Response:', response.data);
      return response.data;
    });
  },
  
  post: <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    console.log('API POST:', `${API_BASE_URL}${url}`, data);
    return apiClient.post(url, data).then((response) => {
      console.log('API POST Response:', response.data);
      return response.data;
    }).catch((error) => {
      console.error('API POST Error:', error.response?.data || error.message);
      throw error;
    });
  },
  
  put: <T>(url: string, data?: unknown): Promise<ApiResponse<T>> =>
    apiClient.put(url, data).then((response) => response.data),
  
  delete: <T>(url: string): Promise<ApiResponse<T>> =>
    apiClient.delete(url).then((response) => response.data),
  
  patch: <T>(url: string, data?: unknown): Promise<ApiResponse<T>> =>
    apiClient.patch(url, data).then((response) => response.data),
};

export default apiClient;
