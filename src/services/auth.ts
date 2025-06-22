import axios from 'axios';
import { AuthResponse, AuthCredentials } from '../types/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
  // Login local
  if (
    (credentials.username === DEMO_USER.email || credentials.username === DEMO_USER.username) &&
    credentials.password === DEMO_PASSWORD
  ) {
    localStorage.setItem('token', DEMO_TOKEN);
    localStorage.setItem('user', JSON.stringify(DEMO_USER));
    return { token: DEMO_TOKEN, user: DEMO_USER };
  }
  // Para migrar a API real, descomentar:
  /*
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Login failed');
    }
    throw new Error('Login failed');
  }
  */
  throw new Error('Login failed');
};

export const register = async (credentials: AuthCredentials & { email: string }): Promise<AuthResponse> => {
  // Registro local: solo permite el usuario demo
  if (
    credentials.email === DEMO_USER.email &&
    credentials.username === DEMO_USER.username &&
    credentials.password === DEMO_PASSWORD
  ) {
    localStorage.setItem('token', DEMO_TOKEN);
    localStorage.setItem('user', JSON.stringify(DEMO_USER));
    return { token: DEMO_TOKEN, user: DEMO_USER };
  }
  // Para migrar a API real, descomentar:
  /*
  try {
    const response = await axios.post(`${API_URL}/auth/register`, credentials);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Registration failed');
    }
    throw new Error('Registration failed');
  }
  */
  throw new Error('Registration failed');
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
  
  if (token && user) {
    return {
      token,
      user: JSON.parse(user)
    };
  }
  
  return null;
};