export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'user'; // <-- Añadido campo de rol
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'user'; // <-- Añadido campo de rol
  } | null;
  loading: boolean;
  error: string | null;
}