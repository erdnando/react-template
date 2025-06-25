import { useDispatch, useSelector } from 'react-redux';
import * as authService from '../services/auth';
import { login as loginAction, logout as logoutAction, setLoading, setError } from '../store/slices/authSlice';
import { RootState } from '../store/store';
import { AuthCredentials } from '../types/auth';

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);

  const login = async (email: string, password: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    
    try {
      const credentials: AuthCredentials = { email: email, password };
      const response = await authService.login(credentials);
      dispatch(loginAction(response.user));
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const register = async (email: string, username: string, password: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    
    try {
      const credentials = { username, password, email };
      const response = await authService.register(credentials);
      dispatch(loginAction(response.user));
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = async () => {
    dispatch(setLoading(true));
    
    try {
      await authService.logout();
      dispatch(logoutAction());
    } catch (err) {
      console.error('Logout error:', err);
      // Aún así, limpiar el estado local
      dispatch(logoutAction());
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    ...authState,
    login,
    register,
    logout
  };
};