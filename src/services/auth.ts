import axios from 'axios';
import { AuthResponse, AuthCredentials } from '../types/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

// Tipo para el usuario crudo recibido del backend
interface RawUser {
  id?: string | number;
  userId?: string | number;
  username?: string;
  name?: string;
  userName?: string;
  displayName?: string;
  email?: string;
  emailAddress?: string;
  mail?: string;
  role?: { name?: string } | string;
}

// Función para normalizar los datos del usuario desde el backend
const normalizeUser = (rawUser: RawUser): { id: string; username: string; email: string; role: 'admin' | 'user' } => {
  if (!rawUser) {
    return {
      id: '1',
      username: 'Usuario',
      email: 'correo@ejemplo.com',
      role: 'user',
    };
  }
  
  // Extraer valores reales, evitar usar fallbacks si hay datos válidos
  const id = String(rawUser.id || rawUser.userId || '1');
  const username = String(
    rawUser.username || rawUser.name || rawUser.userName || rawUser.displayName || 'Usuario'
  );
  const email = String(
    rawUser.email || rawUser.emailAddress || rawUser.mail || 'correo@ejemplo.com'
  );
  
  // Mapear el rol del backend a 'admin' | 'user'
  let role: 'admin' | 'user' = 'user';
  if (typeof rawUser.role === 'object' && rawUser.role && typeof rawUser.role.name === 'string') {
    role = rawUser.role.name.toLowerCase() === 'admin' ? 'admin' : 'user';
  } else if (typeof rawUser.role === 'string') {
    role = rawUser.role.toLowerCase() === 'admin' ? 'admin' : 'user';
  }
  
  return { id, username, email, role };
};

export const login = async (credentials: AuthCredentials): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/Users/login`, credentials);
  
  // El backend devuelve { success, message, data: { token, user } }
  const { token, user: rawUser } = response.data.data;
  
  // Normalizar el usuario para asegurar que siempre tenga username, email y role
  const user = normalizeUser(rawUser);
  
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  return { token, user };
};

export const register = async (credentials: AuthCredentials & { email: string }): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/auth/register`, credentials);
  
  // El backend devuelve { success, message, data: { token, user } }
  const { token, user: rawUser } = response.data.data;
  
  // Normalizar el usuario para asegurar que siempre tenga username, email y role
  const user = normalizeUser(rawUser);
  
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  return { token, user };
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
  
  if (token && user && user !== 'null') {
    try {
      const rawUser = JSON.parse(user);
      
      // Normalizar el usuario en caso de que tenga datos inconsistentes
      const normalizedUser = normalizeUser(rawUser);
      
      return {
        token,
        user: normalizedUser
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