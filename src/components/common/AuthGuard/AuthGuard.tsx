import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store/store';
import { login as loginAction } from '../../../store/slices/authSlice';
import { getCurrentUser } from '../../../services/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Verificar si hay usuario almacenado al cargar y cuando cambie el estado
  useEffect(() => {
    const currentUser = getCurrentUser();
    
    if (currentUser && currentUser.user) {
      // Siempre actualizar con los datos más recientes de localStorage
      if (!user || 
          user.id !== currentUser.user.id || 
          user.username !== currentUser.user.username || 
          user.email !== currentUser.user.email) {
        dispatch(loginAction(currentUser.user));
      }
    }
  }, [dispatch, isAuthenticated, user]);

  // También escuchar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        dispatch(loginAction(currentUser.user));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch]);

  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
};

export default AuthGuard;
