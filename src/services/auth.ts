import axios from 'axios';
import { AuthResponse, AuthCredentials } from '../types/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5096/api';

// Configurar interceptor para incluir token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Usuario demo local
const DEMO_USER = {
  id: '1',
  username: 'demo',
  email: 'demo@example.com',
};
const DEMO_PASSWORD = 'demo123';
const DEMO_TOKEN = 'mock-token';

export const login = async (credentials: AuthCredentials): Promise<AuthResponse> => {
  // Intentar login con API real primero
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  } catch (error: unknown) {
    console.warn('API login failed, trying demo user...', error);
    
    // Fallback: Login local con usuario demo
    if (
      credentials.email === DEMO_USER.email &&
      credentials.password === DEMO_PASSWORD
    ) {
      localStorage.setItem('token', DEMO_TOKEN);
      localStorage.setItem('user', JSON.stringify(DEMO_USER));
      return { token: DEMO_TOKEN, user: DEMO_USER };
    }
    
    // Si ni la API ni el demo funcionan, lanzar error
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Login failed');
    }
    throw new Error('Login failed');
  }
};

export const register = async (credentials: AuthCredentials & { email: string }): Promise<AuthResponse> => {
  // Intentar registro con API real primero
  try {
    const response = await axios.post(`${API_URL}/auth/register`, credentials);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  } catch (error: unknown) {
    console.warn('API register failed, trying demo user...', error);
    
    // Fallback: Registro local solo permite el usuario demo
    if (
      credentials.email === DEMO_USER.email &&
      credentials.password === DEMO_PASSWORD
    ) {
      localStorage.setItem('token', DEMO_TOKEN);
      localStorage.setItem('user', JSON.stringify(DEMO_USER));
      return { token: DEMO_TOKEN, user: DEMO_USER };
    }
    
    // Si ni la API ni el demo funcionan, lanzar error
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Registration failed');
    }
    throw new Error('Registration failed');
  }
};

export const logout = async (): Promise<void> => {
  try {
    await axios.post(`${API_URL}/auth/logout`);
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  // localStorage.getItem returns null when the key doesn't exist, not undefined
  if (token && user && user !== 'null') {
    try {
      return {
        token,
        user: JSON.parse(user)
      };
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      // Clear invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  }
  
  return null;
};