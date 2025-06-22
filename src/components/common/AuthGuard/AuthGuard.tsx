import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
};

export default AuthGuard;
