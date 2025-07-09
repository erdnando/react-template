import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../services/authApiService';
import { login as loginAction, logout as logoutAction, setLoading, setError } from '../store/slices/authSlice';
import { RootState } from '../store/store';

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);

  const login = async (email: string, password: string) => {
    // Starting login process
    dispatch(setLoading(true));
    dispatch(setError(null));
    
    try {
      const credentials = { email, password };
      // Calling login API with credentials
      
      const response = await authService.login(credentials);
      // Login API response received
      
      if (response.success && response.data) {
        // Save auth data to localStorage
        authService.saveAuthData(response.data);
        
        // Convert UserDto to the format expected by the auth slice
        const user = {
          id: response.data.user.id.toString(),
          username: `${response.data.user.firstName || ''} ${response.data.user.lastName || ''}`.trim() || response.data.user.email || '',
          email: response.data.user.email || '',
          role: response.data.user.role?.name === 'admin' ? 'admin' as const : 'user' as const, // Forzar tipo literal
        };
        
        // Login successful, setting user data
        dispatch(loginAction(user));
        return response.data;
      } else {
        console.error('useAuth: Login failed:', response);
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('useAuth: Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = async () => {
    dispatch(setLoading(true));
    
    try {
      authService.logout();
      dispatch(logoutAction());
    } catch (err) {
      console.error('Logout error:', err);
      // Still clean local state
      dispatch(logoutAction());
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    ...authState,
    login,
    logout
  };
};