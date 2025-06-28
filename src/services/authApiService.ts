// Auth API service
import { apiRequest, ApiResponse } from './apiClient';
import { UserDto } from './userApiService';

// Auth DTOs based on the API definition
export interface LoginDto {
  email: string | null;
  password: string | null;
}

export interface LoginResponseDto {
  token: string | null;
  user: UserDto;
}

// Auth service functions
export const authService = {
  // Login user
  login: (credentials: LoginDto): Promise<ApiResponse<LoginResponseDto>> => {
    return apiRequest.post<LoginResponseDto>('/Users/login', credentials);
  },

  // Logout user (client-side only)
  logout: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // Get current user from localStorage
  getCurrentUser: (): UserDto | null => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        return JSON.parse(userStr) as UserDto;
      } catch {
        return null;
      }
    }
    return null;
  },

  // Save auth data to localStorage
  saveAuthData: (loginResponse: LoginResponseDto): void => {
    if (loginResponse.token) {
      localStorage.setItem('authToken', loginResponse.token);
    }
    localStorage.setItem('currentUser', JSON.stringify(loginResponse.user));
  },
};

export default authService;
