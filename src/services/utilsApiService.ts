// Utils API service for admin operations
import { apiRequest, ApiResponse } from './apiClient';

// DTOs based on the backend UtilsController
export interface UtilsResetPasswordAttemptsRequestDto {
  email: string;
}

export interface UtilsResetPasswordAttemptsResponseDto {
  success: boolean;
  message: string;
  tokensDeleted: number;
  userEmail: string;
}

export interface UtilsPasswordResetStatsDto {
  totalUsers: number;
  usersWithActiveTokens: number;
  totalActiveTokens: number;
  usersAtLimit: number;
  recentResetRequests: number;
  resetStats: {
    userEmail: string;
    activeTokens: number;
    isAtLimit: boolean;
    lastResetAttempt: string | null;
  }[];
}

export interface CleanupExpiredTokensResponseDto {
  success: boolean;
  message: string;
  expiredTokensDeleted: number;
}

export interface SystemConfigDto {
  maxResetRequestsPerDay: number;
  tokenExpirationMinutes: number;
  systemVersion: string;
  environment: string;
}

export interface SystemHealthDto {
  status: string;
  timestamp: string;
  databaseConnection: boolean;
  apiVersion: string;
  uptime: string;
}

// Utils service functions - Only for admin users
export const utilsService = {
  // Reset password attempts for a specific user
  resetPasswordAttempts: (data: UtilsResetPasswordAttemptsRequestDto): Promise<ApiResponse<UtilsResetPasswordAttemptsResponseDto>> => {
    return apiRequest.post<UtilsResetPasswordAttemptsResponseDto>('/Utils/reset-password-attempts', data)
      .then(response => {
        // Ensure we have a valid response structure
        if (!response.data) {
          response.data = { 
            success: true, 
            message: 'Reset completed', 
            tokensDeleted: 0,
            userEmail: data.email
          };
        }
        return response;
      })
      .catch(error => {
        console.error('API - Error resetting password attempts:', error);
        return {
          success: false,
          message: error.message || 'Error resetting password attempts',
          data: { 
            success: false, 
            message: 'Error occurred', 
            tokensDeleted: 0,
            userEmail: data.email
          }
        };
      });
  },

  // Get password reset statistics
  getPasswordResetStats: (): Promise<ApiResponse<UtilsPasswordResetStatsDto>> => {
    return apiRequest.get<UtilsPasswordResetStatsDto>('/Utils/password-reset-stats');
  },

  // Cleanup expired tokens
  cleanupExpiredTokens: (): Promise<ApiResponse<CleanupExpiredTokensResponseDto>> => {
    return apiRequest.post<CleanupExpiredTokensResponseDto>('/Utils/cleanup-expired-tokens', {})
      .then(response => {
        // Ensure we have a valid response structure
        if (!response.data) {
          response.data = { 
            success: true, 
            message: 'Operation completed with no tokens deleted', 
            expiredTokensDeleted: 0 
          };
        }
        return response;
      })
      .catch(error => {
        console.error('API - Error cleaning up expired tokens:', error);
        return {
          success: false,
          message: error.message || 'Error cleaning up expired tokens',
          data: { 
            success: false, 
            message: 'Error occurred', 
            expiredTokensDeleted: 0 
          }
        };
      });
  },

  // Get system configuration
  getSystemConfig: (): Promise<ApiResponse<SystemConfigDto>> => {
    return apiRequest.get<SystemConfigDto>('/Utils/system-config');
  },

  // Get system health status
  getSystemHealth: (): Promise<ApiResponse<SystemHealthDto>> => {
    return apiRequest.get<SystemHealthDto>('/Utils/system-health');
  },

  // Check if user exists (utility function)
  checkUserExists: (email: string): Promise<ApiResponse<{ exists: boolean; userEmail: string }>> => {
    return apiRequest.get<{ exists: boolean; userEmail: string }>(`/Utils/user-exists?email=${encodeURIComponent(email)}`);
  },
  
  // Search users by partial email (for autocomplete)
  searchUsersByEmail: (partialEmail: string): Promise<ApiResponse<{ users: string[] }>> => {
    if (!partialEmail || partialEmail.length < 2) {
      return Promise.resolve({
        success: true,
        message: 'Search term too short',
        data: { users: [] }
      });
    }

    return apiRequest.get<{ users: string[] }>(`/Utils/search-users?email=${encodeURIComponent(partialEmail)}`)
      .catch(error => {
        console.error('API - Error searching users:', error);
        return {
          success: false,
          message: error.message || 'Error searching users',
          data: { users: [] }
        };
      });
  },
};

export default utilsService;

// Named exports for convenience
export const searchUsers = utilsService.searchUsersByEmail;
export const resetPasswordAttempts = utilsService.resetPasswordAttempts;
export const getPasswordResetStats = utilsService.getPasswordResetStats;
export const cleanupExpiredTokens = utilsService.cleanupExpiredTokens;
export const getSystemConfig = utilsService.getSystemConfig;
export const getSystemHealth = utilsService.getSystemHealth;
export const checkUserExists = utilsService.checkUserExists;
