// Environment configuration for API
export const API_CONFIG = {
  // Set to 'mock' for development without backend, 'api' for real backend
  MODE: process.env.REACT_APP_API_MODE || 'mock',
  
  // Backend API URL
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5096/api',
  
  // Request timeout
  TIMEOUT: 10000,
  
  // Mock delay to simulate network latency
  MOCK_DELAY: 300,
};

// Check if we're in mock mode
export const isMockMode = () => API_CONFIG.MODE === 'mock';

// Console logging for development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Configuration:', {
    mode: API_CONFIG.MODE,
    baseUrl: API_CONFIG.API_BASE_URL,
    isMock: isMockMode(),
  });
}
