import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { AdminUtils as AdminUtilsComponent } from '../../components/AdminUtils';
import './AdminUtils.css';

const AdminUtils: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  // Check if user is an admin
  useEffect(() => {
    // If user is not admin, redirect to home
    if (user && user.email !== 'admin@sistema.com') {
      navigate('/');
    }
  }, [user, navigate]);

  // Only render for admin users
  if (!user || user.email !== 'admin@sistema.com') {
    return (
      <div className="admin-utils-page">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-utils-page">
      <AdminUtilsComponent />
    </div>
  );
};

export default AdminUtils;
