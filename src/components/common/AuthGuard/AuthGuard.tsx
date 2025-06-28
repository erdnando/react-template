import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store/store';
import { login as loginAction } from '../../../store/slices/authSlice';
import { authService } from '../../../services/authApiService';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Verificar si hay usuario almacenado al cargar y cuando cambie el estado
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const isAuthenticatedFromStorage = authService.isAuthenticated();
    
    if (currentUser && isAuthenticatedFromStorage) {
      // Convert UserDto to the format expected by the auth slice
      const user = {
        id: currentUser.id.toString(),
        username: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email || '',
        email: currentUser.email || ''
      };
      
      // Always update with the most recent data from localStorage
      if (!user || 
          user.id !== currentUser.id.toString() || 
          user.username !== (`${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email || '') || 
          user.email !== (currentUser.email || '')) {
        dispatch(loginAction(user));
      }
    }
  }, [dispatch, isAuthenticated, user]);

  // También escuchar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const currentUser = authService.getCurrentUser();
      const isAuthenticatedFromStorage = authService.isAuthenticated();
      
      if (currentUser && isAuthenticatedFromStorage) {
        // Convert UserDto to the format expected by the auth slice
        const user = {
          id: currentUser.id.toString(),
          username: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email || '',
          email: currentUser.email || ''
        };
        dispatch(loginAction(user));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch]);

  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
};

export default AuthGuard;
